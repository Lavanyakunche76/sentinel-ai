"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/dashboard/topbar";
import { Card, DecisionBadge } from "@/components/ui/primitives";
import { api, AuditEntry } from "@/lib/api";
import { timeAgo } from "@/lib/utils";

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [filter, setFilter] = useState<string>("");

  async function load() {
    setLogs(await api.listAudit({ limit: 100, decision: filter || undefined }));
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  return (
    <>
      <Topbar title="Audit Log" />
      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="flex items-center gap-2">
          {["", "allow", "require_approval", "block"].map((d) => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className="text-xs px-3 py-1.5 rounded-full border capitalize"
              style={{
                borderColor: filter === d ? "var(--accent-blue)" : "var(--border-strong)",
                color: filter === d ? "var(--accent-blue)" : "var(--text-secondary)",
              }}
            >
              {d === "" ? "All" : d.replace("_", " ")}
            </button>
          ))}
        </div>

        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b" style={{ borderColor: "var(--border)" }}>
                {["Time", "Agent", "Action", "Tool", "Risk", "Decision", "Cost"].map((h) => (
                  <th key={h} className="px-5 py-3 font-medium whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b last:border-0 align-top" style={{ borderColor: "var(--border)" }}>
                  <td className="px-5 py-3 whitespace-nowrap text-xs" style={{ color: "var(--text-muted)" }}>{timeAgo(l.created_at)}</td>
                  <td className="px-5 py-3 whitespace-nowrap">{l.agent_name || "—"}</td>
                  <td className="px-5 py-3 max-w-md truncate" style={{ color: "var(--text-secondary)" }} title={l.action}>{l.action}</td>
                  <td className="px-5 py-3 font-mono text-xs whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{l.tool || "—"}</td>
                  <td className="px-5 py-3 font-mono">{l.risk_score}</td>
                  <td className="px-5 py-3"><DecisionBadge decision={l.decision} /></td>
                  <td className="px-5 py-3 font-mono text-xs whitespace-nowrap" style={{ color: "var(--text-muted)" }}>${l.cost_usd.toFixed(5)}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center" style={{ color: "var(--text-muted)" }}>
                    No audit entries match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </main>
    </>
  );
}
