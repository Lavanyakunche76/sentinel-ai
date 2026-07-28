"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/dashboard/topbar";
import { Card, Button } from "@/components/ui/primitives";
import { api, Approval } from "@/lib/api";
import { timeAgo, riskColor } from "@/lib/utils";
import { Check, X } from "lucide-react";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [reasonDrafts, setReasonDrafts] = useState<Record<string, string>>({});

  async function load() {
    setApprovals(await api.listApprovals());
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  async function decide(id: string, action: "approve" | "reject") {
    await api.decideApproval(id, action, reasonDrafts[id] || (action === "approve" ? "Approved after review" : "Rejected — insufficient justification"));
    load();
  }

  const pending = approvals.filter((a) => a.status === "pending");
  const decided = approvals.filter((a) => a.status !== "pending");

  return (
    <>
      <Topbar title="Approvals" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
            Pending ({pending.length})
          </h3>
          <div className="space-y-3">
            {pending.map((a) => (
              <Card key={a.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{a.agent_name || "Unknown agent"}</p>
                      <span
                        className="text-xs font-mono px-2 py-0.5 rounded-md"
                        style={{ color: riskColor(a.risk_score), background: "var(--surface-raised)" }}
                      >
                        risk {a.risk_score}
                      </span>
                    </div>
                    <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{a.action_summary}</p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{timeAgo(a.created_at)}</p>
                    <input
                      placeholder="Reason (optional)"
                      value={reasonDrafts[a.id] || ""}
                      onChange={(e) => setReasonDrafts({ ...reasonDrafts, [a.id]: e.target.value })}
                      className="mt-3 w-full max-w-md rounded-lg border px-3 py-1.5 text-sm bg-transparent"
                      style={{ borderColor: "var(--border-strong)" }}
                    />
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="secondary" onClick={() => decide(a.id, "reject")}>
                      <X size={14} /> Reject
                    </Button>
                    <Button onClick={() => decide(a.id, "approve")}>
                      <Check size={14} /> Approve
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {pending.length === 0 && (
              <Card>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Nothing pending — the queue is clear.</p>
              </Card>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
            History
          </h3>
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b" style={{ borderColor: "var(--border)" }}>
                  {["Agent", "Action", "Risk", "Status", "Decided By", "Reason"].map((h) => (
                    <th key={h} className="px-5 py-3 font-medium" style={{ color: "var(--text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {decided.map((a) => (
                  <tr key={a.id} className="border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                    <td className="px-5 py-3">{a.agent_name}</td>
                    <td className="px-5 py-3 max-w-sm truncate" style={{ color: "var(--text-secondary)" }}>{a.action_summary}</td>
                    <td className="px-5 py-3 font-mono">{a.risk_score}</td>
                    <td className="px-5 py-3">
                      <span style={{ color: a.status === "approved" ? "var(--accent-emerald)" : "var(--accent-red)" }}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{a.decided_by}</td>
                    <td className="px-5 py-3 text-xs max-w-xs truncate" style={{ color: "var(--text-muted)" }}>{a.decision_reason}</td>
                  </tr>
                ))}
                {decided.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center" style={{ color: "var(--text-muted)" }}>No decisions yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
      </main>
    </>
  );
}
