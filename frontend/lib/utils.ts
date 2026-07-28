import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function riskColor(score: number) {
  if (score >= 90) return "var(--accent-red)";
  if (score >= 70) return "var(--accent-amber)";
  if (score >= 40) return "var(--accent-blue)";
  return "var(--accent-emerald)";
}

export function decisionMeta(decision: string) {
  switch (decision) {
    case "block":
      return { label: "Blocked", color: "var(--accent-red)", bg: "var(--accent-red-dim)" };
    case "require_approval":
      return { label: "Requires Approval", color: "var(--accent-amber)", bg: "var(--accent-amber-dim)" };
    default:
      return { label: "Allowed", color: "var(--accent-emerald)", bg: "var(--accent-emerald-dim)" };
  }
}

export function severityMeta(severity: string) {
  switch (severity) {
    case "critical":
      return { color: "var(--accent-red)", bg: "var(--accent-red-dim)" };
    case "high":
      return { color: "var(--accent-amber)", bg: "var(--accent-amber-dim)" };
    case "medium":
      return { color: "var(--accent-blue)", bg: "var(--accent-blue-dim)" };
    default:
      return { color: "var(--text-secondary)", bg: "var(--surface-raised)" };
  }
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
