import datetime as dt

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.orm import ApprovalRequest
from app.models.schemas import ApprovalDecision

router = APIRouter(prefix="/api/approvals", tags=["approvals"])


@router.get("")
def list_approvals(status: str | None = None, db: Session = Depends(get_db)):
    q = db.query(ApprovalRequest)
    if status:
        q = q.filter(ApprovalRequest.status == status)
    items = q.order_by(ApprovalRequest.created_at.desc()).all()
    return [
        {
            "id": a.id, "agent_name": a.agent_name, "action_summary": a.action_summary,
            "risk_score": a.risk_score, "status": a.status, "decided_by": a.decided_by,
            "decision_reason": a.decision_reason, "created_at": a.created_at.isoformat(),
            "decided_at": a.decided_at.isoformat() if a.decided_at else None,
        }
        for a in items
    ]


@router.post("/{approval_id}/approve")
def approve(approval_id: str, payload: ApprovalDecision, db: Session = Depends(get_db)):
    a = db.query(ApprovalRequest).filter(ApprovalRequest.id == approval_id).first()
    if not a:
        raise HTTPException(404, "Approval request not found")
    a.status = "approved"
    a.decided_by = payload.decided_by
    a.decision_reason = payload.reason
    a.decided_at = dt.datetime.utcnow()
    db.commit()
    return {"id": a.id, "status": a.status}


@router.post("/{approval_id}/reject")
def reject(approval_id: str, payload: ApprovalDecision, db: Session = Depends(get_db)):
    a = db.query(ApprovalRequest).filter(ApprovalRequest.id == approval_id).first()
    if not a:
        raise HTTPException(404, "Approval request not found")
    a.status = "rejected"
    a.decided_by = payload.decided_by
    a.decision_reason = payload.reason
    a.decided_at = dt.datetime.utcnow()
    db.commit()
    return {"id": a.id, "status": a.status}
