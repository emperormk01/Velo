import React, { useState } from "react";
import { 
  X, 
  ShieldAlert, 
  BarChart4, 
  Zap, 
  Layers,
  Save,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SpendingPolicy } from "../types";

interface PolicySheetProps {
  isOpen: boolean;
  onClose: () => void;
  policy: SpendingPolicy;
  onSave: (policy: SpendingPolicy) => void;
}

export const PolicySheet: React.FC<PolicySheetProps> = ({ isOpen, onClose, policy, onSave }) => {
  const [localPolicy, setLocalPolicy] = useState<SpendingPolicy>(policy);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localPolicy);
    onClose();
  };

  const risks = ["Low", "Low to Moderate", "Moderate", "Aggressive"];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-hidden"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-zinc-950 border-l border-zinc-800 z-[60] shadow-2xl flex flex-col no-scrollbar"
          >
            <div className="flex justify-between items-center p-6 border-b border-zinc-900">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-display font-bold text-white">Governance Policies</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-zinc-900 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-8 no-scrollbar">
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CreditCardIcon className="w-4 h-4 text-zinc-500" />
                    <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Daily Spending Limit</label>
                  </div>
                  <div className="relative">
                    <input 
                      type="number"
                      value={localPolicy.dailyLimitCspr}
                      onChange={e => setLocalPolicy({...localPolicy, dailyLimitCspr: Number(e.target.value)})}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 text-lg font-mono text-white focus:outline-none focus:border-blue-500"
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-600">CSPR</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-zinc-500" />
                    <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Max Gas Allowance</label>
                  </div>
                  <div className="relative">
                    <input 
                      type="number"
                      value={localPolicy.gasPolicyCspr}
                      onChange={e => setLocalPolicy({...localPolicy, gasPolicyCspr: Number(e.target.value)})}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 text-lg font-mono text-white focus:outline-none focus:border-blue-500"
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-600">CSPR</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BarChart4 className="w-4 h-4 text-zinc-500" />
                    <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Risk Allocation</label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {risks.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setLocalPolicy({...localPolicy, riskAllowance: r})}
                        className={`px-4 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                          localPolicy.riskAllowance === r 
                            ? 'bg-blue-500/10 border-blue-500 text-blue-400' 
                            : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-zinc-500" />
                    <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Whitelist Contracts</label>
                  </div>
                  <div className="space-y-2">
                    {localPolicy.allowedSmartContracts.map((contract, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input 
                          value={contract}
                          onChange={e => {
                            const newContracts = [...localPolicy.allowedSmartContracts];
                            newContracts[i] = e.target.value;
                            setLocalPolicy({...localPolicy, allowedSmartContracts: newContracts});
                          }}
                          className="flex-grow bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-300 font-mono focus:outline-none focus:border-blue-500"
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            setLocalPolicy({
                              ...localPolicy, 
                              allowedSmartContracts: localPolicy.allowedSmartContracts.filter((_, idx) => idx !== i)
                            });
                          }}
                          className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button 
                      type="button"
                      onClick={() => setLocalPolicy({
                        ...localPolicy, 
                        allowedSmartContracts: [...localPolicy.allowedSmartContracts, ""]
                      })}
                      className="w-full py-2 border border-dashed border-zinc-800 rounded-xl text-[10px] uppercase font-mono text-zinc-600 hover:text-zinc-400 hover:border-zinc-600 transition-all"
                    >
                      + Add Contract Hash
                    </button>
                  </div>
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-zinc-900 bg-zinc-950/50">
              <button 
                onClick={handleSubmit}
                className="w-full py-4 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Commit Policy Changes
              </button>
              <p className="mt-3 text-[10px] text-zinc-600 text-center font-mono uppercase tracking-tighter">
                Signatures required from multi-sig controllers
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Internal icon shim
const CreditCardIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
);
