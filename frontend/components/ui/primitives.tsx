import { cn } from "@/lib/utils";
import { decisionMeta, severityMeta } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn("rounded-xl border p-5", className)}
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sublabel,
  accent,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  accent?: string;
}) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <p
        className="font-mono text-3xl font-semibold mt-2 tabular-nums"
        style={{ color: accent || "var(--text-primary)" }}
      >
        {value}
      </p>
      {sublabel && (
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          {sublabel}
        </p>
      )}
    </Card>
  );
}

export function DecisionBadge({ decision }: { decision: string }) {
  const meta = decisionMeta(decision);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ color: meta.color, background: meta.bg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
      {meta.label}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const meta = severityMeta(severity);
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide"
      style={{ color: meta.color, background: meta.bg }}
    >
      {severity}
    </span>
  );
}

export function RiskLevelBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    low: "var(--accent-emerald)",
    medium: "var(--accent-amber)",
    high: "var(--accent-red)",
  };
  const color = map[level?.toLowerCase()] || "var(--text-muted)";
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide border"
      style={{ color, borderColor: color + "55" }}
    >
      {level}
    </span>
  );
}

export function Button({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" }) {
  const styles: Record<string, string> = {
    primary: "bg-[var(--accent-blue)] text-white hover:brightness-110",
    secondary: "bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-strong)] hover:bg-[var(--surface-hover)]",
    danger: "bg-[var(--accent-red)] text-white hover:brightness-110",
    ghost: "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        styles[variant],
        className
      )}
      {...props}
    />
  );
}
