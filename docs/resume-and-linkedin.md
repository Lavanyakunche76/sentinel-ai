# Resume & LinkedIn copy

## Resume bullet (one-liner)

> Built Sentinel AI, an AI-agent governance platform (Next.js/FastAPI) that intercepts agent actions in real time — detecting prompt injection, credential leaks, and PII exposure via a custom rule-based risk engine, with a human approval workflow for high-stakes actions.

## Resume project description (short form)

**Sentinel AI — The Safety Operating System for Autonomous AI**
*Personal project · Next.js, TypeScript, FastAPI, SQLAlchemy*

- Designed and built a full-stack security platform that sits between AI agents and the actions they take, scoring every action 0–100 for risk using a custom deterministic detection engine (prompt injection, jailbreak, secrets/PII, SQL/code injection, malicious URLs).
- Implemented an approval workflow that routes high-stakes tool calls (production deploys, fund transfers) to human review, independent of content score.
- Shipped a real-time dashboard (Next.js, Recharts, Framer Motion) with an audit trail, policy engine, and agent registry.
- Covered the risk engine and detectors with a 14-test pytest suite; wired up GitHub Actions CI to lint, test, and build both services on every push.

## LinkedIn post draft

Shipped a project I've been building: **Sentinel AI** — a governance layer for AI agents.

The problem: teams are giving AI agents real permissions — send email, deploy to prod, touch customer data — with no interception layer before the action happens. Most "AI safety" tooling today reviews things *after* the fact.

Sentinel sits in front of the action. Every prompt, tool call, and output gets scored in real time against a rule-based detection engine (prompt injection, leaked credentials, PII, SQL/code injection) and a risk engine that decides: allow, route to a human for approval, or block outright — with an explanation for every decision, not a black box.

Stack: Next.js + TypeScript on the frontend, FastAPI + SQLAlchemy on the backend, Docker + GitHub Actions for CI/CD.

Repo: [link once pushed] — feedback welcome, especially from anyone running agents in production today.

#AI #AgentSafety #FastAPI #NextJS #BuildInPublic
