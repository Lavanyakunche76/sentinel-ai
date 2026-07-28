"use client";

import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import { Topbar } from "@/components/dashboard/topbar";
import { RiskPulse } from "@/components/dashboard/risk-pulse";
import { Card, StatCard, DecisionBadge } from "@/components/ui/primitives";
import { api, AuditEntry, AuditSummary, Agent } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import { AlertTriangle, Ban, Activity } from "lucide-react";

export default function OverviewPage() {
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [s, l, a] = await Promise.all([
          api.auditSummary(),
          api.listAudit({ limit: 30 }),
          api.listAgents(),
        ]);
        if (!alive) return;
        setSummary(s);
        setLogs(l);
        setAgents(a);
        setError(null);
      } catch (e) {
        if (alive) setError("Can't reach the Sentinel backend. Is the FastAPI server running on :8000?");
      }
    }
    load();
    const id = setInterval(load, 5000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const chartData = [...logs]
    .reverse()
    .map((l, i) => ({ i, score: l.risk_score, name: l.agent_name || "unknown" }));

  const decisionCounts = logs.reduce(
    (acc, l) => {
      acc[l.decision] = (acc[l.decision] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const pieData = [
    { name: "Allowed", value: decisionCounts["allow"] || 0, color: "var(--accent-emerald)" },
    { name: "Pending", value: decisionCounts["require_approval"] || 0, color: "var(--accent-amber)" },
    { name: "Blocked", value: decisionCounts["block"] || 0, color: "var(--accent-red)" },
  ];

  return (
    <>
      <Topbar title="Overview" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {error && (
          <Card className="border-[color:var(--accent-amber)]">
            <p className="text-sm" style={{ color: "var(--accent-amber)" }}>{error}</p>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1 flex items-center justify-center">
            <RiskPulse score={summary?.avg_risk_score ?? 0} label="Avg Risk Score" />
          </Card>

          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Total Actions" value={summary?.total_actions ?? 0} sublabel="Analyzed by firewall" />
            <StatCard
              label="Blocked"
              value={summary?.blocked ?? 0}
              accent="var(--accent-red)"
              sublabel="Critical risk actions"
            />
            <StatCard
              label="Pending Approval"
              value={summary?.pending_approval ?? 0}
              accent="var(--accent-amber)"
              sublabel="Awaiting human review"
            />
            <StatCard
              label="Token Cost"
              value={`$${(summary?.total_cost_usd ?? 0).toFixed(4)}`}
              accent="var(--accent-blue)"
              sublabel={`${summary?.total_tokens ?? 0} tokens`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Risk Score Timeline
              </h3>
              <Activity size={14} style={{ color: "var(--text-muted)" }} />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-blue)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--accent-blue)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="i" hide />
                <YAxis domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--surface-raised)", border: "1px solid var(--border-strong)", borderRadius: 8, fontSize: 12 }}
                  labelFormatter={() => ""}
                />
                <Area type="monotone" dataKey="score" stroke="var(--accent-blue)" fill="url(#riskFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h3 className="text-sm font-medium mb-4" style={{ color: "var(--text-secondary)" }}>
              Decisions Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={4}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--surface-raised)", border: "1px solid var(--border-strong)", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2 text-xs">
              {pieData.map((p) => (
                <div key={p.name} className="flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                  <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                  {p.name}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Recent Activity</h3>
              <AlertTriangle size={14} style={{ color: "var(--text-muted)" }} />
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {logs.slice(0, 8).map((l) => (
                <div key={l.id} className="flex items-start justify-between gap-3 pb-3 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                  <div className="min-w-0">
                    <p className="text-sm truncate">{l.agent_name || "Unknown agent"}</p>
                    <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{l.action}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <DecisionBadge decision={l.decision} />
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{timeAgo(l.created_at)}</span>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  No actions analyzed yet — try the AI Firewall playground.
                </p>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Registered Agents</h3>
              <Ban size={14} style={{ color: "var(--text-muted)" }} />
            </div>
            <div className="space-y-3">
              {agents.map((a) => (
                <div key={a.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">{a.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{a.type} · {a.owner}</p>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-md border"
                    style={{
                      color: a.risk_level === "high" ? "var(--accent-red)" : a.risk_level === "medium" ? "var(--accent-amber)" : "var(--accent-emerald)",
                      borderColor: "var(--border-strong)",
                    }}
                  >
                    {a.risk_level}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}
