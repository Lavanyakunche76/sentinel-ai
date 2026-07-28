const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("sentinel_token");
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${body || res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: CurrentUser;
};

export type Agent = {
  id: string;
  name: string;
  type: string;
  owner: string;
  status: string;
  risk_level: string;
  version: string;
  permissions: string[];
  tools: string[];
  memory_enabled: string;
};

export type Finding = {
  category: string;
  severity: string;
  label: string;
  snippet: string;
  explanation: string;
  confidence: number;
};

export type AnalyzeResponse = {
  audit_log_id: string;
  risk_score: number;
  decision: "allow" | "require_approval" | "block";
  findings: Finding[];
  reasons: string[];
  policy_hits: string[];
  approval_id: string | null;
};

export type AuditEntry = {
  id: string;
  agent_name: string | null;
  action: string;
  tool: string | null;
  destination: string | null;
  risk_score: number;
  decision: string;
  policy_hits: string[];
  tokens: number;
  cost_usd: number;
  latency_ms: number;
  model: string | null;
  created_at: string;
};

export type Approval = {
  id: string;
  agent_name: string | null;
  action_summary: string;
  risk_score: number;
  status: string;
  decided_by: string | null;
  decision_reason: string | null;
  created_at: string;
  decided_at: string | null;
};

export type AuditSummary = {
  total_actions: number;
  blocked: number;
  pending_approval: number;
  avg_risk_score: number;
  total_cost_usd: number;
  total_tokens: number;
};

export type PolicyItem = {
  id: string;
  name: string;
  description: string;
  rule_type: string;
  enabled: string;
  created_at: string;
};

export const api = {
  login: (email: string, password: string) =>
    request<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (payload: { email: string; name: string; password: string; role?: string }) =>
    request<AuthResponse>("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request<CurrentUser>("/api/auth/me"),

  listAgents: () => request<Agent[]>("/api/agents"),
  createAgent: (payload: Partial<Agent>) =>
    request<Agent>("/api/agents", { method: "POST", body: JSON.stringify(payload) }),
  updateAgentStatus: (id: string, status: string) =>
    request(`/api/agents/${id}/status?status=${status}`, { method: "PATCH" }),
  deleteAgent: (id: string) => request(`/api/agents/${id}`, { method: "DELETE" }),

  analyze: (payload: {
    agent_name?: string;
    agent_id?: string;
    action: string;
    tool?: string;
    destination?: string;
    model?: string;
    tokens?: number;
    latency_ms?: number;
  }) => request<AnalyzeResponse>("/api/firewall/analyze", { method: "POST", body: JSON.stringify(payload) }),

  listAudit: (params?: { limit?: number; decision?: string }) => {
    const q = new URLSearchParams();
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.decision) q.set("decision", params.decision);
    return request<AuditEntry[]>(`/api/audit?${q.toString()}`);
  },
  auditSummary: () => request<AuditSummary>("/api/audit/stats/summary"),

  listApprovals: (status?: string) =>
    request<Approval[]>(`/api/approvals${status ? `?status=${status}` : ""}`),
  decideApproval: (id: string, action: "approve" | "reject", reason: string) =>
    request(`/api/approvals/${id}/${action}`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  listPolicies: () => request<PolicyItem[]>("/api/policies"),
  createPolicy: (payload: { name: string; description: string; rule_type?: string }) =>
    request("/api/policies", { method: "POST", body: JSON.stringify(payload) }),
};
