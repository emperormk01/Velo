import React from "react";
import { 
  History, 
  Wallet, 
  ExternalLink, 
  Shield, 
  Image as ImageIcon,
  CheckCircle2,
  Clock
} from "lucide-react";
import { motion } from "motion/react";
import { NftMemory, Transaction } from "../types";

interface VaultViewProps {
  nfts: NftMemory[];
  transactions: Transaction[];
}

export const VaultView: React.FC<VaultViewProps> = ({ nfts, transactions }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* NFT Strategy Receipt Vault */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-white">Strategy Vault</h2>
              <p className="text-xs text-zinc-500 font-sans">Verifiable Memory NFTs on Casper</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-zinc-800 text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
            {nfts.length} Assets
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-[600px] overflow-y-auto pr-2 no-scrollbar">
          {nfts.map((nft) => (
            <motion.div
              key={nft.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              className="group flex flex-col p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-purple-500/30 transition-all cursor-default"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-4 shadow-2xl">
                <img 
                  src={nft.image} 
                  alt={nft.tokenName} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <span className="text-[10px] font-mono text-white/70 truncate">{nft.strategyHash}</span>
                </div>
                <div className="absolute top-2 right-2">
                  <div className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-emerald-400">
                    {nft.apy}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-semibold text-zinc-100 leading-tight pr-4">{nft.tokenName}</h3>
                <span className="text-[10px] font-mono text-purple-400 font-bold">{nft.symbol}</span>
              </div>
              
              <p className="text-[11px] text-zinc-500 font-sans line-clamp-3 mb-4">
                {nft.narrative}
              </p>

              <div className="mt-auto pt-4 border-t border-zinc-800 flex justify-between items-center text-[10px] font-mono">
                <span className="text-zinc-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {new Date(nft.timestamp).toLocaleDateString()}
                </span>
                <button className="text-zinc-400 hover:text-white transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
          
          {nfts.length === 0 && (
            <div className="col-span-full py-20 text-center text-zinc-600">
              <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-mono text-xs uppercase tracking-widest">No minted memories yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Transaction Records */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <History className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-white">Registry Log</h2>
              <p className="text-xs text-zinc-500 font-sans">Autonomous transaction stream</p>
            </div>
          </div>
          <button className="text-xs text-zinc-400 hover:text-white underline decoration-zinc-800 underline-offset-4">
            Export JSON
          </button>
        </div>

        <div className="space-y-3 h-[600px] overflow-y-auto pr-2 no-scrollbar">
          {transactions.map((tx) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="group p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:bg-zinc-800/40 transition-all flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`p-2.5 rounded-xl border ${
                  tx.type.includes('Inbound') 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                }`}>
                   <Wallet className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-medium text-zinc-200 truncate">{tx.type}</h4>
                  <p className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                    To: {tx.recipient} • {tx.id}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className={`text-sm font-mono font-bold ${tx.type.includes('Inbound') ? 'text-emerald-400' : 'text-zinc-200'}`}>
                  {tx.type.includes('Inbound') ? '+' : '-'}{tx.amountCspr.toLocaleString()} <span className="text-[10px]">CSPR</span>
                </div>
                <div className="flex items-center justify-end gap-1.5 mt-1">
                   <CheckCircle2 className="w-3 h-3 text-emerald-500/50" />
                   <span className="text-[10px] font-mono text-zinc-600 uppercase">Finalized</span>
                </div>
              </div>
            </motion.div>
          ))}
          
          {transactions.length === 0 && (
            <div className="py-20 text-center text-zinc-600">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-mono text-xs uppercase tracking-widest">No activity recorded</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
