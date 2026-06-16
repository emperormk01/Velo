import React from "react";
import { 
  ShieldCheck, 
  Settings2, 
  TrendingUp, 
  Lock, 
  MoreVertical,
  Activity
} from "lucide-react";
import { AgentIdentity } from "../types";

interface AgentHeaderProps {
  identity: AgentIdentity;
  onOpenPolicies: () => void;
}

export const AgentHeader: React.FC<AgentHeaderProps> = ({ identity, onOpenPolicies }) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-zinc-800">
      <div className="flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-blue-500/20 p-1 bg-zinc-900">
            <img 
              src={identity.avatar} 
              alt="Agent Avatar" 
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-emerald-500 border-4 border-zinc-950">
            <ShieldCheck className="w-3 h-3 text-white" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-white leading-tight">
              {identity.name}
            </h1>
            <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider">
              Autonomous
            </span>
          </div>
          <p className="text-zinc-500 text-sm mt-1 max-w-sm">{identity.role}</p>
          
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-mono text-zinc-400">System Live</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-mono text-zinc-400">92% Precision</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-[10px] font-mono text-zinc-600 truncate w-24">
                {identity.publicKey}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenPolicies}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-sm font-medium transition-all"
        >
          <Settings2 className="w-4 h-4" />
          Spending Policies
        </button>
        <button className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
