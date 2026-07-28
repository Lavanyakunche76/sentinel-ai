"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/dashboard/topbar";
import { Card, Button } from "@/components/ui/primitives";
import { api, PolicyItem } from "@/lib/api";
import { Plus, FileCog } from "lucide-react";

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<PolicyItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  async function load() {
    setPolicies(await api.listPolicies());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await api.createPolicy(form);
    setForm({ name: "", description: "" });
    setShowForm(false);
    load();
  }

  return (
    <>
      <Topbar title="Policy Engine" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm max-w-xl" style={{ color: "var(--text-muted)" }}>
            Rules the Risk Engine enforces automatically — e.g. blocking secret exposure or requiring
            approval above a risk threshold.
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} /> New Policy
          </Button>
        </div>

        {showForm && (
          <Card>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                required
                placeholder="Policy name, e.g. Never email external domains"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent"
                style={{ borderColor: "var(--border-strong)" }}
              />
              <textarea
                required
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent"
                style={{ borderColor: "var(--border-strong)" }}
              />
              <div className="flex gap-2">
                <Button type="submit">Save policy</Button>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((p) => (
            <Card key={p.id}>
              <div className="flex items-start gap-3">
                <FileCog size={16} style={{ color: "var(--accent-purple)" }} className="mt-0.5" />
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{p.description}</p>
                  <span
                    className="inline-block mt-2 text-[11px] px-2 py-0.5 rounded-md uppercase tracking-wide"
                    style={{ color: "var(--accent-emerald)", background: "var(--accent-emerald-dim)" }}
                  >
                    enabled
                  </span>
                </div>
              </div>
            </Card>
          ))}
          {policies.length === 0 && (
            <Card>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No policies configured yet.</p>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
