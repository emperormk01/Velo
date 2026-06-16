import React, { useState } from "react";
import { Send, Sparkles, MessageSquare, Mic } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface InteractionTerminalProps {
  onInteract: (prompt: string) => void;
  disabled: boolean;
}

export const InteractionTerminal: React.FC<InteractionTerminalProps> = ({ onInteract, disabled }) => {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !disabled) {
      onInteract(input);
      setInput("");
    }
  };

  const suggestions = [
    "Find best yield for 100 CSPR with low risk.",
    "Analyze market for USDC depeg insurance.",
    "Allocate 50% budget to liquidity pool.",
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2 text-zinc-500">
        <Sparkles className="w-4 h-4 text-emerald-400" />
        <span className="text-[10px] font-mono uppercase tracking-widest font-semibold">Autonomous Core Command</span>
      </div>

      <form 
        onSubmit={handleSubmit}
        className={`relative transition-all duration-300 ${isFocused ? 'ring-1 ring-blue-500/50' : ''}`}
      >
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <MessageSquare className="w-5 h-5 text-zinc-600" />
        </div>
        
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="e.g. 'Invest 200 CSPR in high-yield stable pools...'"
          disabled={disabled}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-5 pl-14 pr-32 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition-all text-sm font-sans"
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <button 
            type="button" 
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all"
            title="Voice Command"
          >
            <Mic className="w-5 h-5" />
          </button>
          
          <button
            type="submit"
            disabled={!input.trim() || disabled}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              input.trim() && !disabled 
                ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
          >
            Execute
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {!disabled && suggestions.map((suggestion, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => {
                setInput(suggestion);
                // Optionally auto-submit: onInteract(suggestion);
              }}
              className="px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800 text-[11px] text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 transition-all cursor-pointer select-none"
            >
              {suggestion}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {disabled && (
        <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <span className="text-[10px] uppercase font-mono tracking-wider text-blue-400">Processing Multi-Agent Negotiation...</span>
        </div>
      )}
    </div>
  );
};
