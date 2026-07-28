"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/dashboard/topbar";
import { Card, Button, RiskLevelBadge } from "@/components/ui/primitives";
import { api, Agent } from "@/lib/api";
import { Plus, Bot, X } from "lucide-react";

const AGENT_TYPES = ["claude", "gpt", "gemini", "custom", "mcp", "crewai", "langgraph"];

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", type: "claude", owner: "", risk_level: "medium" });
  const [busy, setBusy] = useState(false);

  async function load() {
    setAgents(await api.listAgents());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.createAgent({ ...form, permissions: [], tools: [], memory_enabled: "stateless" });
      setForm({ name: "", type: "claude", owner: "", risk_level: "medium" });
      setShowForm(false);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function toggleStatus(a: Agent) {
    const next = a.status === "active" ? "paused" : "active";
    await api.updateAgentStatus(a.id, next);
    load();
  }

  return (
    <>
      <Topbar title="Agent Registry" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Every AI agent operating in your environment, with its permissions, tools, and risk posture.
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} /> Register Agent
          </Button>
        </div>

        {showForm && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Register a new agent</h3>
              <button onClick={() => setShowForm(false)}>
                <X size={16} style={{ color: "var(--text-muted)" }} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                required
                placeholder="Agent name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-lg border px-3 py-2 text-sm bg-transparent"
                style={{ borderColor: "var(--border-strong)" }}
              />
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="rounded-lg border px-3 py-2 text-sm bg-transparent"
                style={{ borderColor: "var(--border-strong)" }}
              >
                {AGENT_TYPES.map((t) => (
                  <option key={t} value={t} style={{ background: "var(--surface)" }}>
                    {t}
                  </option>
                ))}
              </select>
              <input
                required
                placeholder="Owner email"
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
                className="rounded-lg border px-3 py-2 text-sm bg-transparent"
                style={{ borderColor: "var(--border-strong)" }}
              />
              <select
                value={form.risk_level}
                onChange={(e) => setForm({ ...form, risk_level: e.target.value })}
                className="rounded-lg border px-3 py-2 text-sm bg-transparent"
                style={{ borderColor: "var(--border-strong)" }}
              >
                <option value="low" style={{ background: "var(--surface)" }}>low</option>
                <option value="medium" style={{ background: "var(--surface)" }}>medium</option>
                <option value="high" style={{ background: "var(--surface)" }}>high</option>
              </select>
              <div className="sm:col-span-4">
                <Button type="submit" disabled={busy}>{busy ? "Registering…" : "Register agent"}</Button>
              </div>
            </form>
          </Card>
        )}

        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b" style={{ borderColor: "var(--border)" }}>
                {["Agent", "Type", "Owner", "Risk", "Version", "Status", ""].map((h) => (
                  <th key={h} className="px-5 py-3 font-medium" style={{ color: "var(--text-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agents.map((a) => (
                <tr key={a.id} className="border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Bot size={14} style={{ color: "var(--accent-blue)" }} />
                      {a.name}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs" style={{ color: "var(--text-secondary)" }}>{a.type}</td>
                  <td className="px-5 py-3" style={{ color: "var(--text-secondary)" }}>{a.owner}</td>
                  <td className="px-5 py-3"><RiskLevelBadge level={a.risk_level} /></td>
                  <td className="px-5 py-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{a.version}</td>
                  <td className="px-5 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-md"
                      style={{
                        color: a.status === "active" ? "var(--accent-emerald)" : "var(--text-muted)",
                        background: a.status === "active" ? "var(--accent-emerald-dim)" : "var(--surface-raised)",
                      }}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button variant="ghost" onClick={() => toggleStatus(a)}>
                      {a.status === "active" ? "Pause" : "Activate"}
                    </Button>
                  </td>
                </tr>
              ))}
              {agents.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center" style={{ color: "var(--text-muted)" }}>
                    No agents registered yet.
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
