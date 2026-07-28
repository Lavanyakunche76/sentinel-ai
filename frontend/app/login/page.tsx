"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/primitives";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("admin@sentinel.ai");
  const [password, setPassword] = useState("SentinelDemo123!");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch {
      setError("Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 mb-8">
          <ShieldCheck size={28} style={{ color: "var(--accent-blue)" }} />
          <span className="font-semibold text-lg">Sentinel AI</span>
        </div>

        <div className="rounded-xl border p-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <h1 className="text-lg font-medium mb-1">Sign in</h1>
          <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
            Demo credentials are pre-filled — just hit sign in.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm bg-transparent"
                style={{ borderColor: "var(--border-strong)" }}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm bg-transparent"
                style={{ borderColor: "var(--border-strong)" }}
              />
            </div>
            {error && <p className="text-xs" style={{ color: "var(--accent-red)" }}>{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "var(--text-muted)" }}>
          <Link href="/">← Back to homepage</Link>
        </p>
      </div>
    </div>
  );
}
