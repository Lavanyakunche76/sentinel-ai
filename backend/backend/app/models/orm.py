import uuid
import datetime as dt

from sqlalchemy import Column, String, Integer, Float, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship

from app.db import Base


def _uid() -> str:
    return str(uuid.uuid4())


class Agent(Base):
    __tablename__ = "agents"

    id = Column(String, primary_key=True, default=_uid)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)          # claude | gpt | gemini | custom | mcp | crewai | langgraph
    owner = Column(String, nullable=False)
    status = Column(String, default="active")      # active | paused | revoked
    risk_level = Column(String, default="medium")  # low | medium | high
    version = Column(String, default="1.0.0")
    permissions = Column(JSON, default=list)
    tools = Column(JSON, default=list)
    memory_enabled = Column(String, default="stateless")
    created_at = Column(DateTime, default=dt.datetime.utcnow)

    audit_logs = relationship("AuditLog", backref="agent")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=_uid)
    agent_id = Column(String, ForeignKey("agents.id"), nullable=True)
    agent_name = Column(String, nullable=True)
    action = Column(Text, nullable=False)
    tool = Column(String, nullable=True)
    destination = Column(String, nullable=True)
    risk_score = Column(Integer, default=0)
    decision = Column(String, default="allow")  # allow | require_approval | block
    findings = Column(JSON, default=list)
    reasons = Column(JSON, default=list)
    policy_hits = Column(JSON, default=list)
    tokens = Column(Integer, default=0)
    cost_usd = Column(Float, default=0.0)
    latency_ms = Column(Integer, default=0)
    model = Column(String, nullable=True)
    created_at = Column(DateTime, default=dt.datetime.utcnow)


class ApprovalRequest(Base):
    __tablename__ = "approval_requests"

    id = Column(String, primary_key=True, default=_uid)
    audit_log_id = Column(String, ForeignKey("audit_logs.id"))
    agent_name = Column(String, nullable=True)
    action_summary = Column(Text)
    risk_score = Column(Integer, default=0)
    status = Column(String, default="pending")  # pending | approved | rejected
    decided_by = Column(String, nullable=True)
    decision_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=dt.datetime.utcnow)
    decided_at = Column(DateTime, nullable=True)


class Policy(Base):
    __tablename__ = "policies"

    id = Column(String, primary_key=True, default=_uid)
    name = Column(String, nullable=False)
    description = Column(Text)
    rule_type = Column(String, default="custom")
    enabled = Column(String, default="true")
    created_at = Column(DateTime, default=dt.datetime.utcnow)
