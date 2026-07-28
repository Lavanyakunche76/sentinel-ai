from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.core.risk_engine import evaluate
from app.models.orm import Agent, AuditLog, ApprovalRequest
from app.models.schemas import FirewallAnalyzeRequest, FirewallAnalyzeResponse, FindingOut

router = APIRouter(prefix="/api/firewall", tags=["firewall"])


@router.post("/analyze", response_model=FirewallAnalyzeResponse)
def analyze(payload: FirewallAnalyzeRequest, db: Session = Depends(get_db)):
    agent = None
    if payload.agent_id:
        agent = db.query(Agent).filter(Agent.id == payload.agent_id).first()

    result = evaluate(
        text=payload.action,
        tool=payload.tool,
        destination=payload.destination,
        agent_risk_level=agent.risk_level if agent else None,
    )

    log = AuditLog(
        agent_id=agent.id if agent else None,
        agent_name=agent.name if agent else payload.agent_name,
        action=payload.action,
        tool=payload.tool,
        destination=payload.destination,
        risk_score=result.score,
        decision=result.decision,
        findings=[f.__dict__ | {"category": f.category.value, "severity": f.severity.value} for f in result.findings],
        reasons=result.reasons,
        policy_hits=result.policy_hits,
        tokens=payload.tokens,
        cost_usd=round(payload.tokens * 0.000003, 6),
        latency_ms=payload.latency_ms,
        model=payload.model,
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    approval_id = None
    if result.decision == "require_approval":
        approval = ApprovalRequest(
            audit_log_id=log.id,
            agent_name=log.agent_name,
            action_summary=payload.action[:280],
            risk_score=result.score,
        )
        db.add(approval)
        db.commit()
        db.refresh(approval)
        approval_id = approval.id

    return FirewallAnalyzeResponse(
        audit_log_id=log.id,
        risk_score=result.score,
        decision=result.decision,
        findings=[FindingOut(category=f.category.value, severity=f.severity.value, label=f.label,
                              snippet=f.snippet, explanation=f.explanation, confidence=f.confidence)
                  for f in result.findings],
        reasons=result.reasons,
        policy_hits=result.policy_hits,
        approval_id=approval_id,
    )
