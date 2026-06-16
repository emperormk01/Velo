import React from "react";
import { motion } from "motion/react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ReactNode;
  accentColor?: string;
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  icon,
  accentColor = "text-emerald-400",
  badge,
}) => {
  return (
    <motion.div
      whileHover={{ y: -2, borderColor: "#3B82F6" }}
      transition={{ duration: 0.2 }}
      className="relative flex flex-col justify-between p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md overflow-hidden"
    >
      <div className="absolute top-0 right-0 h-[80px] w-[80px] bg-gradient-to-br from-zinc-800/10 to-transparent rounded-bl-full pointer-events-none" />
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-mono text-zinc-400 tracking-wider uppercase">{title}</span>
        <div className={`p-2 rounded-lg bg-zinc-800/40 border border-zinc-800 ${accentColor}`}>
          {icon}
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-display font-semibold tracking-tight text-white">
            {value}
          </span>
          {badge && (
            <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/10">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-zinc-500 font-sans">{subtext}</p>
      </div>
    </motion.div>
  );
};
