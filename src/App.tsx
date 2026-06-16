/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { 
  BarChart, 
  Wallet, 
  Shield, 
  Cpu, 
  Rocket, 
  Search,
  RefreshCcw,
  LayoutDashboard,
  Gem
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  SessionData, 
  InteractResponse, 
  SpendingPolicy, 
  PublishedAgent 
} from "./types";
import { MetricCard } from "./components/MetricCard";
import { AgentHeader } from "./components/AgentHeader";
import { VoiceMode } from "./components/VoiceMode";
import { InteractionTerminal } from "./components/InteractionTerminal";
import { ThoughtStream } from "./components/ThoughtStream";
import { VaultView } from "./components/VaultView";
import { Marketplace } from "./components/Marketplace";
import { PolicySheet } from "./components/PolicySheet";

export default function App() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "marketplace" | "vault">("dashboard");
  const [isThinking, setIsThinking] = useState(false);
  const [lastResponse, setLastResponse] = useState<InteractResponse | null>(null);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/session");
      if (!res.ok) throw new Error("Link negotiation failed.");
      
      const data = await res.json();
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        setSession(data);
        setError(null);
      } else {
        throw new Error("Invalid intelligence data received.");
      }
    } catch (err) {
      console.error("Failed to fetch session", err);
      setError("Communication failure with Velo Corporate Intelligence.");
    }
  };

  const handleInteraction = async (prompt: string) => {
    setIsThinking(true);
    setError(null);
    setActiveTab("dashboard");
    
    try {
      const res = await fetch("/api/agent/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      
      if (data.success) {
        setLastResponse(data.result);
        setSession(data.session);
        // Scroll to results
        setTimeout(() => {
          scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        setError(data.error || "Autonomous reasoning failed.");
      }
    } catch (err) {
      setError("Network partition detected. Decision engine offline.");
    } finally {
      setIsThinking(false);
    }
  };

  const updatePolicy = async (policy: SpendingPolicy) => {
    try {
      const res = await fetch("/api/agent/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(policy),
      });
      const data = await res.json();
      if (data.success) setSession(data.session);
    } catch (err) {
      setError("Policy commit failed.");
    }
  };

  const publishAgent = async (agent: Partial<PublishedAgent>) => {
    try {
      const res = await fetch("/api/agent/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agent),
      });
      const data = await res.json();
      if (data.success) setSession(data.session);
    } catch (err) {
      setError("Agent deployment failed.");
    }
  };

  const simulateMarketHire = async (agentId: string) => {
    try {
      const res = await fetch("/api/agent/simulate-market-hire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });
      const data = await res.json();
      if (data.success) setSession(data.session);
    } catch (err) {
      setError("Market query simulation failed.");
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset the session? All simulated data will be cleared.")) return;
    try {
      const res = await fetch("/api/session/reset", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSession(data.session);
        setLastResponse(null);
        setActiveTab("dashboard");
      }
    } catch (err) {
      setError("System reset failed.");
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 font-mono text-sm relative">
        <div className="flex flex-col items-center">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-4"
          >
            <Cpu className="w-12 h-12 text-blue-500" />
          </motion.div>
          <span>Establishing Velo Secure Link...</span>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 max-w-xs text-center"
            >
              {error}
              <button 
                onClick={() => fetchSession()} 
                className="mt-2 block w-full py-2 bg-red-500 text-white rounded-lg text-xs font-bold"
              >
                RETRY CONNECTION
              </button>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-blue-500/30">
      {/* Policy Sidebar */}
      <PolicySheet 
        isOpen={isPolicyOpen} 
        onClose={() => setIsPolicyOpen(false)} 
        policy={session.identity.spendingPolicy}
        onSave={updatePolicy}
      />

      {/* Main Navigation Sidebar (Hidden on small screens) */}
      <nav className="fixed left-0 top-0 bottom-0 w-20 bg-zinc-900/50 border-r border-zinc-900 flex flex-col items-center py-8 z-40 hidden lg:flex">
        <div className="mb-12">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
            <Rocket className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="flex flex-col gap-8 flex-grow">
          {[
            { id: "dashboard", icon: LayoutDashboard },
            { id: "vault", icon: Shield },
            { id: "marketplace", icon: Search },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`p-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-zinc-800 text-blue-400 border border-zinc-700' 
                  : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              <item.icon className="w-6 h-6" />
            </button>
          ))}
        </div>

        <button 
          onClick={handleReset}
          className="p-3 text-zinc-700 hover:text-amber-500 transition-colors"
          title="Reset Session"
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="lg:ml-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <AgentHeader 
              identity={session.identity} 
              onOpenPolicies={() => setIsPolicyOpen(true)}
            />
            <VoiceMode />
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <MetricCard 
              title="Treasury Holdings" 
              value={`${session.identity.budget.toLocaleString()} CSPR`}
              subtext="Velo Operating Budget"
              icon={<Wallet className="w-5 h-5" />}
              accentColor="text-blue-400"
            />
            <MetricCard 
              title="Autonomous Revenue" 
              value={`${session.publishedAgents.reduce((s, a) => s + a.revenueEarnedCspr, 0).toFixed(1)}`}
              subtext="Across marketplace fleet"
              icon={<TrendingUpIcon className="w-5 h-5" />}
              accentColor="text-emerald-400"
              badge="+12%"
            />
            <MetricCard 
              title="M2M x402 Costs" 
              value={`${session.transactions.filter(t => t.type.includes('x402')).reduce((s, t) => s + t.amountCspr, 0).toFixed(1)} CSPR`}
              subtext="Net machine data spend"
              icon={<Cpu className="w-5 h-5" />}
              accentColor="text-purple-400"
            />
            <MetricCard 
              title="Strategy Vault" 
              value={session.nfts.length}
              subtext="Immutuable NFTs minted"
              icon={<Gem className="w-5 h-5" />}
              accentColor="text-amber-400"
            />
          </div>

          {/* Tab Content Rendering */}
          <div className="mt-12">
            <AnimatePresence mode="wait">
              {activeTab === "dashboard" && (
                <motion.div 
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 xl:grid-cols-5 gap-12"
                >
                  {/* Left Column: Command & Logic */}
                  <div className="xl:col-span-3 space-y-12">
                    <InteractionTerminal 
                      onInteract={handleInteraction} 
                      disabled={isThinking} 
                    />
                    
                    <div ref={scrollRef}>
                      <ThoughtStream 
                        thinking={isThinking} 
                        response={lastResponse} 
                      />
                    </div>
                  </div>

                  {/* Right Column: Mini Stats / Status Display */}
                  <div className="xl:col-span-2 space-y-8">
                    <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800">
                      <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-6">Execution Policy</h3>
                      <div className="space-y-4">
                        <PolicyRow label="Risk Tolerance" value={session.identity.spendingPolicy.riskAllowance} />
                        <PolicyRow label="Daily Limit" value={`${session.identity.spendingPolicy.dailyLimitCspr} CSPR`} />
                        <PolicyRow label="Allocated Gas" value={`${session.identity.spendingPolicy.gasPolicyCspr} CSPR`} />
                        <div className="pt-4 border-t border-zinc-800 mt-4">
                          <p className="text-[10px] text-zinc-600 font-mono uppercase mb-2">Active Multi-Agent Workforce</p>
                          <div className="flex gap-2">
                             <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-mono">RESEARCH</span>
                             <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">RISK</span>
                             <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-mono">EXECUTION</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-zinc-800">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest">Global Activity</h3>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                      </div>
                      <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
                        {session.transactions.slice(0, 5).map((tx) => (
                          <div key={tx.id} className="flex flex-col gap-1 pb-4 border-b border-zinc-800 last:border-0 last:pb-0">
                            <div className="flex justify-between text-xs">
                              <span className="text-zinc-200">{tx.type}</span>
                              <span className="text-zinc-500 font-mono">{tx.amountCspr} CSPR</span>
                            </div>
                            <span className="text-[10px] text-zinc-600 font-mono truncate">{tx.hash}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "vault" && (
                <motion.div 
                  key="vault"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <VaultView 
                    nfts={session.nfts} 
                    transactions={session.transactions} 
                  />
                </motion.div>
              )}

              {activeTab === "marketplace" && (
                <motion.div 
                  key="marketplace"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Marketplace 
                    marketAgents={session.marketAgents}
                    publishedAgents={session.publishedAgents}
                    onPublish={publishAgent}
                    onSimulateHire={simulateMarketHire}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl bg-red-500 text-white text-sm font-medium shadow-2xl flex items-center gap-3"
          >
            <ShieldAlertIcon className="w-5 h-5" />
            {error}
            <button onClick={() => setError(null)} className="ml-4 text-white/70 hover:text-white">Close</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PolicyRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-zinc-500 font-sans">{label}</span>
      <span className="text-zinc-200 font-mono font-medium">{value}</span>
    </div>
  );
}

// Internal icons
const TrendingUpIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
);

const ShieldAlertIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
);
