"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Bot, ArrowRight, Ban, CheckCircle2, Clock } from "lucide-react";

export function HeroVisual() {
  return (
    <div className="relative w-full max-w-3xl mx-auto h-[280px] flex items-center justify-center">
      <div className="flex items-center gap-4 sm:gap-8 w-full">
        {/* Agent action */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-2 shrink-0"
        >
          <div
            className="h-14 w-14 rounded-2xl border flex items-center justify-center"
            style={{ background: "var(--surface-raised)", borderColor: "var(--border-strong)" }}
          >
            <Bot size={22} style={{ color: "var(--accent-purple)" }} />
          </div>
          <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>Agent Action</span>
        </motion.div>

        {/* traveling packet */}
        <div className="relative flex-1 h-px" style={{ background: "var(--border-strong)" }}>
          <motion.div
            className="absolute -top-1.5 h-3 w-3 rounded-full"
            style={{ background: "var(--accent-blue)", boxShadow: "0 0 12px var(--accent-blue)" }}
            animate={{ left: ["0%", "92%"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Sentinel firewall node */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center gap-2 shrink-0 relative"
        >
          <div className="absolute inset-0 -m-3 rounded-full animate-pulse-ring" style={{ background: "var(--accent-blue)" }} />
          <div
            className="h-20 w-20 rounded-2xl border-2 flex items-center justify-center relative z-10"
            style={{ background: "var(--bg)", borderColor: "var(--accent-blue)", boxShadow: "0 0 30px -5px var(--accent-blue)" }}
          >
            <ShieldCheck size={30} style={{ color: "var(--accent-blue)" }} />
          </div>
          <span className="text-xs font-mono" style={{ color: "var(--accent-blue)" }}>Sentinel Firewall</span>
        </motion.div>

        {/* branching outcomes */}
        <div className="flex-1 flex flex-col gap-3 shrink-0 min-w-[140px]">
          {[
            { icon: CheckCircle2, label: "Allowed", color: "var(--accent-emerald)", delay: 0.4 },
            { icon: Clock, label: "Needs Approval", color: "var(--accent-amber)", delay: 0.55 },
            { icon: Ban, label: "Blocked", color: "var(--accent-red)", delay: 0.7 },
          ].map((o) => (
            <motion.div
              key={o.label}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: o.delay }}
              className="flex items-center gap-2 rounded-lg border px-3 py-1.5"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <o.icon size={14} style={{ color: o.color }} />
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{o.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ArrowIcon() {
  return <ArrowRight size={16} />;
}
