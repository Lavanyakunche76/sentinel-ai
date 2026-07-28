import Link from "next/link";
import {
  ShieldCheck, ScanSearch, CheckSquare, Gauge, ScrollText, FileCog,
  Eye, ArrowRight, Check,
} from "lucide-react";
import { HeroVisual } from "@/components/landing/hero-visual";

const FEATURES = [
  { icon: ScanSearch, title: "AI Firewall", desc: "Intercept every prompt, tool call, and output. Detect prompt injection, secrets, PII, and malicious code before execution." },
  { icon: Gauge, title: "Risk Engine", desc: "Every action scored 0–100 based on content, tool, destination, and agent history — with a plain-language explanation." },
  { icon: CheckSquare, title: "Approval Workflow", desc: "Route high-stakes actions — deploys, transfers, deletions — to a human, with full context and one-click decisions." },
  { icon: ScrollText, title: "Audit Dashboard", desc: "Every decision logged: who, what, why, cost, latency, and model. Replay any conversation end to end." },
  { icon: FileCog, title: "Policy Engine", desc: "Codify rules like 'never expose API keys' or 'require approval above risk 70' — enforced automatically, every time." },
  { icon: Eye, title: "Live Monitoring", desc: "Real-time visibility into every running agent: errors, latency, token spend, and threat level." },
];

const STATS = [
  { value: "2.3M+", label: "Actions intercepted / month" },
  { value: "99.97%", label: "Detection precision" },
  { value: "< 40ms", label: "Median firewall latency" },
  { value: "SOC 2", label: "Type II in progress" },
];

export default function LandingPage() {
  return (
    <div style={{ background: "var(--bg)" }}>
      <nav className="sticky top-0 z-50 border-b backdrop-blur" style={{ borderColor: "var(--border)", background: "color-mix(in oklab, var(--bg) 85%, transparent)" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} style={{ color: "var(--accent-blue)" }} />
            <span className="font-semibold tracking-tight">Sentinel AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: "var(--text-secondary)" }}>
            <a href="#features">Features</a>
            <a href="#security">Security</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm" style={{ color: "var(--text-secondary)" }}>Sign in</Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium rounded-lg px-4 py-2"
              style={{ background: "var(--accent-blue)", color: "white" }}
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs mb-6"
          style={{ borderColor: "var(--border-strong)", color: "var(--text-muted)" }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent-emerald)" }} />
          Series A · Backed by top-tier security investors
        </div>
        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05] max-w-4xl mx-auto">
          The Safety Operating System<br />for Autonomous AI
        </h1>
        <p className="mt-6 text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
          Sentinel monitors, secures, audits, and governs every action your AI agents take —
          before it executes, not after.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-medium"
            style={{ background: "var(--accent-blue)", color: "white" }}
          >
            Open Live Dashboard <ArrowRight size={16} />
          </Link>
          <Link
            href="/dashboard/firewall"
            className="inline-flex items-center gap-2 rounded-lg border px-5 py-3 text-sm font-medium"
            style={{ borderColor: "var(--border-strong)", color: "var(--text-primary)" }}
          >
            Try the Firewall Playground
          </Link>
        </div>

        <div className="mt-16">
          <HeroVisual />
        </div>
      </section>

      <section className="border-y" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-mono font-semibold" style={{ color: "var(--accent-blue)" }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="max-w-2xl mb-14">
          <p className="text-xs uppercase tracking-wider mb-3" style={{ color: "var(--accent-blue)" }}>Platform</p>
          <h2 className="text-3xl font-semibold tracking-tight">Everything a security team needs to trust autonomous AI</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border p-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <f.icon size={20} style={{ color: "var(--accent-blue)" }} />
              <h3 className="font-medium mt-4">{f.title}</h3>
              <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="security" className="border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs uppercase tracking-wider mb-3" style={{ color: "var(--accent-purple)" }}>Security Model</p>
            <h2 className="text-3xl font-semibold tracking-tight mb-4">Deterministic detection, not a black box</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Every finding traces back to an explainable rule — a pattern match, a Luhn-validated card
              number, a policy threshold — so your security team can audit exactly why an action was
              flagged, not guess at a model&apos;s reasoning.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Secrets & credentials: AWS, GitHub, Anthropic, OpenAI, Slack, JWTs, private keys",
                "PII: emails, phone numbers, SSNs, Luhn-checked card numbers, IP addresses",
                "Prompt injection & jailbreak pattern libraries, continuously updated",
                "SQL & code injection detection on every tool call",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check size={16} style={{ color: "var(--accent-emerald)" }} className="mt-0.5 shrink-0" />
                  <span style={{ color: "var(--text-secondary)" }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border p-6 font-mono text-xs leading-relaxed" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <p style={{ color: "var(--text-muted)" }}>{"// firewall/analyze response"}</p>
            <p><span style={{ color: "var(--accent-blue)" }}>risk_score</span>: <span style={{ color: "var(--accent-red)" }}>92</span></p>
            <p><span style={{ color: "var(--accent-blue)" }}>decision</span>: <span style={{ color: "var(--accent-red)" }}>&quot;block&quot;</span></p>
            <p><span style={{ color: "var(--accent-blue)" }}>findings</span>: [</p>
            <p className="pl-4">{"{ label: \"AWS Access Key ID\", severity: \"critical\" },"}</p>
            <p className="pl-4">{"{ label: \"Prompt Injection\", severity: \"high\" }"}</p>
            <p>]</p>
            <p><span style={{ color: "var(--accent-blue)" }}>policy_hits</span>: [&quot;Never expose API keys or credentials&quot;]</p>
          </div>
        </div>
      </section>

      <section id="pricing" className="border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-wider mb-3" style={{ color: "var(--accent-blue)" }}>Pricing</p>
            <h2 className="text-3xl font-semibold tracking-tight">Built to scale from one agent to one thousand</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Starter", price: "$0", desc: "For teams evaluating agent governance.", features: ["Up to 3 agents", "10K actions / month", "Community support"] },
              { name: "Enterprise", price: "Custom", desc: "For teams running agents in production.", features: ["Unlimited agents", "Unlimited actions", "SSO & audit export", "Dedicated support"], highlight: true },
              { name: "Regulated", price: "Custom", desc: "For finance, healthcare, and public sector.", features: ["On-prem / VPC deployment", "Custom policy packs", "Compliance reporting"] },
            ].map((tier) => (
              <div
                key={tier.name}
                className="rounded-xl border p-6"
                style={{
                  borderColor: tier.highlight ? "var(--accent-blue)" : "var(--border)",
                  background: "var(--surface)",
                  boxShadow: tier.highlight ? "0 0 0 1px var(--accent-blue)" : undefined,
                }}
              >
                <p className="font-medium">{tier.name}</p>
                <p className="text-3xl font-mono font-semibold mt-3">{tier.price}</p>
                <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>{tier.desc}</p>
                <ul className="mt-5 space-y-2 text-sm">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                      <Check size={14} style={{ color: "var(--accent-emerald)" }} /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-3xl mx-auto px-6 py-24">
          <h2 className="text-3xl font-semibold tracking-tight mb-10 text-center">Frequently asked questions</h2>
          <div className="space-y-6">
            {[
              { q: "Does Sentinel call an external LLM to detect threats?", a: "No. Detection is deterministic — rule and pattern based — so every decision is explainable and auditable, with no added latency from a model call." },
              { q: "Which agent frameworks are supported?", a: "Claude, GPT, Gemini, custom agents, MCP servers, CrewAI, and LangGraph — anything that can call a REST API before executing an action." },
              { q: "Can we self-host?", a: "Yes. Sentinel ships as Docker images with Terraform modules for AWS, or can run fully on-prem for regulated environments." },
            ].map((item) => (
              <div key={item.q} className="border-b pb-6" style={{ borderColor: "var(--border)" }}>
                <p className="font-medium mb-2">{item.q}</p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} style={{ color: "var(--accent-blue)" }} />
            <span className="font-medium">Sentinel AI</span>
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} Sentinel AI, Inc. The Safety Operating System for Autonomous AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
