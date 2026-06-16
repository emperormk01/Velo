import React, { useState } from "react";
import { 
  Users, 
  CreditCard, 
  Briefcase, 
  Rocket, 
  Plus, 
  Globe,
  Coins,
  ArrowUpRight
} from "lucide-react";
import { motion } from "motion/react";
import { MarketAgent, PublishedAgent } from "../types";

interface MarketplaceProps {
  marketAgents: MarketAgent[];
  publishedAgents: PublishedAgent[];
  onPublish: (agent: Partial<PublishedAgent>) => void;
  onSimulateHire: (agentId: string) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ 
  marketAgents, 
  publishedAgents, 
  onPublish, 
  onSimulateHire 
}) => {
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    description: "",
    microFeeCspr: 5.0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPublish({ ...formData, creator: "me@velo.ai" });
    setFormData({ name: "", role: "", description: "", microFeeCspr: 5.0 });
    setShowPublishForm(false);
  };

  return (
    <div className="space-y-12">
      {/* Featured Market Workforce */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Globe className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-white">Workforce Marketplace</h2>
              <p className="text-xs text-zinc-500 font-sans">Hire specialized Casper data machines</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {marketAgents.map((agent, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-zinc-800 text-blue-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-zinc-500 uppercase">Micro-Fee</span>
                  <div className="text-lg font-bold text-white font-display">{agent.microFeeCspr} CSPR</div>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-1">{agent.name}</h3>
              <p className="text-xs text-blue-400 font-mono mb-3">{agent.role}</p>
              <p className="text-sm text-zinc-500 mb-6 flex-grow">{agent.description}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <div className="flex items-center gap-2 text-xs text-zinc-600">
                  <Users className="w-3.5 h-3.5" />
                  {agent.creatorsCount} Contributors
                </div>
                <button className="text-xs font-medium text-white px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors">
                  Hire Model
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Your Published Agents (The "Creator Economy" Demo) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Rocket className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-white">Internal Agent Desk</h2>
              <p className="text-xs text-zinc-500 font-sans">Publish and monetize your autonomous strategies</p>
            </div>
          </div>
          <button 
            onClick={() => setShowPublishForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-zinc-900 text-xs font-bold hover:bg-zinc-200 transition-colors uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            Deploy Agent
          </button>
        </div>

        {showPublishForm && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 mb-8 max-w-2xl"
          >
            <h3 className="text-lg font-bold text-white mb-6">Deploy to Marketplace</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase">Agent Identity</label>
                  <input 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Casper Oracle X"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase">Operational Role</label>
                  <input 
                    required
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    placeholder="e.g. Yield Analyst"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-500 uppercase">Business Logic Description</label>
                <textarea 
                  required
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="How does this agent earn CSPR for hire?"
                />
              </div>
              <div className="flex items-center justify-between gap-6 pt-4">
                <div className="flex items-center gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase">Hire Fee (CSPR)</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={formData.microFeeCspr}
                      onChange={e => setFormData({...formData, microFeeCspr: Number(e.target.value)})}
                      className="w-24 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowPublishForm(false)}
                    className="px-6 py-2.5 rounded-xl text-zinc-500 text-sm font-medium hover:text-zinc-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-8 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/20"
                  >
                    Mint & Publish
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {publishedAgents.map((agent) => (
            <div key={agent.id} className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-5 h-5 text-zinc-700" />
              </div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-display font-bold text-white">{agent.name}</h3>
                  <p className="text-xs text-emerald-400 font-mono mt-1 uppercase tracking-wider">{agent.role}</p>
                </div>
                <button 
                  onClick={() => onSimulateHire(agent.id)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-2.5 rounded-xl transition-all"
                  title="Simulate Market Hire"
                >
                  <Coins className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-zinc-500 mb-8 max-w-md line-clamp-2">{agent.description}</p>

              <div className="flex items-center gap-8">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-zinc-600 uppercase">Gross Revenue</span>
                  <div className="text-xl font-bold text-white">{agent.revenueEarnedCspr.toFixed(1)} <span className="text-xs text-zinc-500">CSPR</span></div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-zinc-600 uppercase">Hirer Fee</span>
                  <div className="text-xl font-bold text-zinc-400">{agent.microFeeCspr} <span className="text-xs text-zinc-600">CSPR</span></div>
                </div>
              </div>
            </div>
          ))}
          
          {publishedAgents.length === 0 && !showPublishForm && (
            <div className="col-span-full py-20 text-center border border-dashed border-zinc-800 rounded-3xl">
              <Rocket className="w-10 h-10 mx-auto mb-4 text-zinc-800" />
              <p className="text-sm text-zinc-600 font-display">No internal agents deployed to the Casper marketplace yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
