import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Volume2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function VoiceMode() {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const toggleVoiceMode = async () => {
    if (isActive) {
      cleanup();
      setIsActive(false);
      return;
    }

    try {
      setIsConnecting(true);
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/live`);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "start" }));
        setIsConnecting(false);
        setIsActive(true);
        startMic();
      };

      ws.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "audio") {
          playAudio(msg.data);
        } else if (msg.type === "interrupted") {
          // Clear audio queue if needed
          setIsSpeaking(false);
        }
      };

      ws.onerror = (err) => {
        console.error("Voice WebSocket error:", err);
        cleanup();
      };

      ws.onclose = () => {
        cleanup();
      };

    } catch (err) {
      console.error("Failed to start voice mode:", err);
      setIsConnecting(false);
    }
  };

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inputCtx = new AudioContext({ sampleRate: 16000 });
      inputCtxRef.current = inputCtx;

      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(inputCtx.destination);

      processor.onaudioprocess = (e) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const pcm = floatTo16BitPCM(e.inputBuffer.getChannelData(0));
          const base64 = btoa(String.fromCharCode(...new Uint8Array(pcm.buffer)));
          wsRef.current.send(JSON.stringify({ type: "audio", data: base64 }));
        }
      };
    } catch (err) {
      console.error("Mic access denied:", err);
    }
  };

  const playAudio = async (base64: string) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext({ sampleRate: 24000 });
    }
    const ctx = audioCtxRef.current;
    setIsSpeaking(true);

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    
    // Convert 16-bit PCM to Float32
    const pcm16 = new Int16Array(bytes.buffer);
    const f32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) f32[i] = pcm16[i] / 32768;

    const buffer = ctx.createBuffer(1, f32.length, 24000);
    buffer.getChannelData(0).set(f32);
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => setIsSpeaking(false);
    source.start();
  };

  const floatTo16BitPCM = (output: Float32Array) => {
    const len = output.length;
    const buffer = new ArrayBuffer(len * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < len; i++) {
        const s = Math.max(-1, Math.min(1, output[i]));
        view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return new Int16Array(buffer);
  };

  const cleanup = () => {
    wsRef.current?.close();
    processorRef.current?.disconnect();
    inputCtxRef.current?.close();
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    setIsActive(false);
    setIsConnecting(false);
    setIsSpeaking(false);
  };

  useEffect(() => {
    return () => cleanup();
  }, []);

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
      <div className="flex flex-col">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Autonomous Voice Engine</span>
        <span className="text-xs font-medium text-zinc-300">
          {isActive ? (isSpeaking ? "Gemini is speaking..." : "Listening...") : "Voice Mode Inactive"}
        </span>
      </div>
      
      <button
        onClick={toggleVoiceMode}
        disabled={isConnecting}
        className={`p-3 rounded-xl transition-all relative ${
          isActive 
            ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
            : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-blue-400'
        }`}
      >
        {isConnecting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isActive ? (
          <>
            <Mic className="w-5 h-5" />
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-red-400/20 rounded-xl"
            />
          </>
        ) : (
          <MicOff className="w-5 h-5" />
        )}
      </button>

      {isActive && isSpeaking && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="p-2 bg-blue-500/20 rounded-full"
        >
          <Volume2 className="w-4 h-4 text-blue-400 animate-pulse" />
        </motion.div>
      )}
    </div>
  );
}
