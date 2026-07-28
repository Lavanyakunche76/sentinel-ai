"use client";

import { riskColor } from "@/lib/utils";

export function RiskPulse({
  score,
  label = "Fleet Risk",
  size = 220,
}: {
  score: number;
  label?: string;
  size?: number;
}) {
  const radius = size / 2 - 18;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const dash = circumference * pct;
  const color = riskColor(score);

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={10}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: "stroke-dasharray 900ms cubic-bezier(0.4,0,0.2,1), stroke 500ms" }}
        />
      </svg>

      {/* radar sweep */}
      <div
        className="absolute rounded-full animate-sweep pointer-events-none"
        style={{
          width: size - 24,
          height: size - 24,
          background: `conic-gradient(from 0deg, transparent 0deg, ${color}22 40deg, transparent 90deg)`,
        }}
      />

      <div className="absolute flex flex-col items-center">
        <span className="font-mono text-4xl font-semibold tabular-nums" style={{ color }}>
          {Math.round(score)}
        </span>
        <span className="text-xs uppercase tracking-wider mt-1" style={{ color: "var(--text-muted)" }}>
          {label}
        </span>
      </div>
    </div>
  );
}
