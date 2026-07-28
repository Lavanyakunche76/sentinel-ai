from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db import get_db
from app.models.orm import AuditLog

router = APIRouter(prefix="/api/audit", tags=["audit"])


@router.get("")
def list_audit_logs(
    limit: int = Query(50, le=500),
    decision: str | None = None,
    db: Session = Depends(get_db),
):
    q = db.query(AuditLog)
    if decision:
        q = q.filter(AuditLog.decision == decision)
    logs = q.order_by(AuditLog.created_at.desc()).limit(limit).all()
    return [
        {
            "id": l.id, "agent_name": l.agent_name, "action": l.action[:200],
            "tool": l.tool, "destination": l.destination, "risk_score": l.risk_score,
            "decision": l.decision, "policy_hits": l.policy_hits, "tokens": l.tokens,
            "cost_usd": l.cost_usd, "latency_ms": l.latency_ms, "model": l.model,
            "created_at": l.created_at.isoformat(),
        }
        for l in logs
    ]


@router.get("/{log_id}")
def get_audit_log(log_id: str, db: Session = Depends(get_db)):
    log = db.query(AuditLog).filter(AuditLog.id == log_id).first()
    if not log:
        raise HTTPException(404, "Audit log not found")
    return {
        "id": log.id, "agent_name": log.agent_name, "action": log.action,
        "tool": log.tool, "destination": log.destination, "risk_score": log.risk_score,
        "decision": log.decision, "findings": log.findings, "reasons": log.reasons,
        "policy_hits": log.policy_hits, "tokens": log.tokens, "cost_usd": log.cost_usd,
        "latency_ms": log.latency_ms, "model": log.model, "created_at": log.created_at.isoformat(),
    }


@router.get("/stats/summary")
def summary(db: Session = Depends(get_db)):
    total = db.query(func.count(AuditLog.id)).scalar() or 0
    blocked = db.query(func.count(AuditLog.id)).filter(AuditLog.decision == "block").scalar() or 0
    pending = db.query(func.count(AuditLog.id)).filter(AuditLog.decision == "require_approval").scalar() or 0
    avg_risk = db.query(func.avg(AuditLog.risk_score)).scalar() or 0
    total_cost = db.query(func.sum(AuditLog.cost_usd)).scalar() or 0
    total_tokens = db.query(func.sum(AuditLog.tokens)).scalar() or 0
    return {
        "total_actions": total,
        "blocked": blocked,
        "pending_approval": pending,
        "avg_risk_score": round(avg_risk, 1),
        "total_cost_usd": round(total_cost, 4),
        "total_tokens": total_tokens,
    }
