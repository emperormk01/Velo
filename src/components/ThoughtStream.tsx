import React from "react";
import { 
  Terminal, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Settings, 
  ChevronRight,
  Database,
  Users
} from "lucide-react";
import { motion } from "motion/react";
import { InteractResponse, DataFeedPurchase, MultiAgentDeal, DebateStatement } from "../types";

interface ThoughtStreamProps {
  thinking: boolean;
  response: InteractResponse | null;
}

export const ThoughtStream: React.FC<ThoughtStreamProps> = ({ thinking, response }) => {
  if (!thinking && !response) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
        <div className="p-4 rounded-full bg-zinc-800/50 mb-4">
          <Terminal className="w-8 h-8 text-zinc-600" />
        </div>
        <h3 className="text-zinc-400 font-display font-medium">System Idle</h3>
        <p className="text-sm text-zinc-600 max-w-xs mt-1">
          Awaiting natural language instructions to coordinate Casper machines and market agents.
        </p>
      </div>
    );
  }

  if (thinking) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            className="h-24 rounded-xl bg-zinc-800/30 border border-zinc-800/50"
          />
        ))}
        <div className="flex items-center justify-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Cpu className="w-10 h-10 text-blue-500/50" />
          </motion.div>
          <span className="ml-3 text-sm font-mono text-zinc-500 animate-pulse">
            Analyzing consensus thresholds...
          </span>
        </div>
      </div>
    );
  }

  if (!response) return null;

  return (
    <div className="space-y-6">
      {/* x402 Negotiation Section */}
      {response.dataFeedsPurchased.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-blue-400">
            <Database className="w-4 h-4" />
            <h4 className="text-xs font-mono uppercase tracking-widest">x402 Data Acquisitions</h4>
          </div>
          <div className="space-y-3">
            {response.dataFeedsPurchased.map((feed: DataFeedPurchase, idx: number) => (
              <div key={idx} className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h5 className="text-sm font-medium text-blue-100">{feed.feedName}</h5>
                    <p className="text-[10px] text-zinc-500 font-mono">{feed.provider}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-emerald-400">-{feed.negotiatedPriceCspr} CSPR</div>
                    <div className="text-[10px] text-zinc-600 line-through">orig: {feed.initialPriceCspr}</div>
                  </div>
                </div>
                
                <div className="bg-zinc-950/50 rounded-lg p-3 space-y-2 border border-zinc-900">
                  <p className="text-[10px] font-mono text-zinc-400 uppercase mb-1">M2M Negotiation Log</p>
                  {feed.negotiationTranscript.map((line, lIdx) => (
                    <div key={lIdx} className="text-[11px] leading-relaxed">
                      <span className={line.speaker.includes('Velo') ? 'text-blue-400' : 'text-zinc-500'}>
                        {line.speaker}:
                      </span>{" "}
                      <span className="text-zinc-300">{line.message}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-400 italic">
                  "{feed.dataFetched}"
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Multi-Agent Hiring Section */}
      {response.multiAgentDeals.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-purple-400">
            <Users className="w-4 h-4" />
            <h4 className="text-xs font-mono uppercase tracking-widest">Autonomous Hires</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {response.multiAgentDeals.map((deal: MultiAgentDeal, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Zap className="w-3 h-3 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-[11px] text-zinc-400 leading-none mb-1">From: {deal.fromAgent}</div>
                    <div className="text-xs font-medium text-zinc-100">Hired: {deal.toAgent}</div>
                  </div>
                </div>
                <div className="text-xs font-mono text-emerald-400">-{deal.paymentCspr} CSPR</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Committee Debate Section */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-zinc-400">
          <ShieldCheck className="w-4 h-4" />
          <h4 className="text-xs font-mono uppercase tracking-widest">Consensus Committee</h4>
        </div>
        <div className="space-y-3">
          {response.committeeDebate.map((statement: DebateStatement, idx: number) => (
            <div key={idx} className="relative pl-4 border-l-2 border-zinc-800 py-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-zinc-200">{statement.speaker}</span>
                <span className={`text-[9px] px-1.5 rounded-full border ${
                  statement.stance === 'Bullish' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                  statement.stance.includes('Skeptical') ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  {statement.stance}
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                {statement.argument}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-zinc-500 uppercase">Consensus Score</span>
            <span className="text-lg font-display text-emerald-400 font-bold">{response.consensusScore}/100</span>
          </div>
          <div className="w-full bg-zinc-900 rounded-full h-1.5 h-1 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${response.consensusScore}%` }}
              className="h-full bg-emerald-500" 
            />
          </div>
        </div>
      </section>

      {/* Final Decision / Execution Section */}
      <section className="p-5 rounded-2xl bg-gradient-to-br from-blue-600/20 to-zinc-900 border border-blue-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-20">
          <Settings className="w-12 h-12" />
        </div>
        <h4 className="text-xs font-mono text-blue-400 uppercase tracking-widest mb-4">Transaction Authorized</h4>
        
        <h3 className="text-xl font-display font-bold text-white mb-2">{response.finalDecision.yieldStrategy}</h3>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-tighter">Est. Annual Return</span>
            <div className="text-lg font-semibold text-emerald-400">{response.finalDecision.estimatedApy} APY</div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-tighter">Risk Assessment</span>
            <div className="text-lg font-semibold text-zinc-200">{response.finalDecision.riskRating}</div>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-black/40 font-mono text-[11px] border border-white/5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-zinc-500">Casper Smart Contract</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px]">Verified On-Chain</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-zinc-600">Entrypoint:</span>
              <span className="text-blue-300">{response.finalDecision.casperContractDetails.entrypoint}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Gas Limit:</span>
              <span className="text-zinc-400">{response.finalDecision.casperContractDetails.gasLimitCspr} CSPR</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Invocation Params:</span>
              <span className="text-zinc-500 truncate ml-4 max-w-[150px]">{response.finalDecision.casperContractDetails.args}</span>
            </div>
          </div>
        </div>

        <button className="w-full mt-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors flex items-center justify-center gap-2 group">
          Signature Verified - Deploying to Casper
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </section>
    </div>
  );
};
