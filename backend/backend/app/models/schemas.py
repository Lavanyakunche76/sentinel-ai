from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, Field


class AgentCreate(BaseModel):
    name: str
    type: str = Field(description="claude | gpt | gemini | custom | mcp | crewai | langgraph")
    owner: str
    risk_level: str = "medium"
    permissions: list[str] = []
    tools: list[str] = []
    memory_enabled: str = "stateless"


class AgentOut(AgentCreate):
    id: str
    status: str
    version: str

    class Config:
        from_attributes = True


class FirewallAnalyzeRequest(BaseModel):
    agent_id: Optional[str] = None
    agent_name: Optional[str] = None
    action: str = Field(description="The prompt, output, or action content to analyze")
    tool: Optional[str] = None
    destination: Optional[str] = None
    model: Optional[str] = None
    tokens: int = 0
    latency_ms: int = 0


class FindingOut(BaseModel):
    category: str
    severity: str
    label: str
    snippet: str
    explanation: str
    confidence: float


class FirewallAnalyzeResponse(BaseModel):
    audit_log_id: str
    risk_score: int
    decision: str
    findings: list[FindingOut]
    reasons: list[str]
    policy_hits: list[str]
    approval_id: Optional[str] = None


class ApprovalDecision(BaseModel):
    decided_by: str
    reason: str


class PolicyCreate(BaseModel):
    name: str
    description: str
    rule_type: str = "custom"
