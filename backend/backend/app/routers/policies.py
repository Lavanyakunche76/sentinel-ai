from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.orm import Policy
from app.models.schemas import PolicyCreate

router = APIRouter(prefix="/api/policies", tags=["policies"])


@router.get("")
def list_policies(db: Session = Depends(get_db)):
    items = db.query(Policy).order_by(Policy.created_at.desc()).all()
    return [
        {"id": p.id, "name": p.name, "description": p.description,
         "rule_type": p.rule_type, "enabled": p.enabled, "created_at": p.created_at.isoformat()}
        for p in items
    ]


@router.post("", status_code=201)
def create_policy(payload: PolicyCreate, db: Session = Depends(get_db)):
    p = Policy(**payload.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return {"id": p.id, "name": p.name}


@router.delete("/{policy_id}", status_code=204)
def delete_policy(policy_id: str, db: Session = Depends(get_db)):
    p = db.query(Policy).filter(Policy.id == policy_id).first()
    if not p:
        raise HTTPException(404, "Policy not found")
    db.delete(p)
    db.commit()
