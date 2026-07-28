from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import Base, engine, SessionLocal
from app.models.orm import Agent, Policy
from app.routers import agents, firewall, audit, approvals, policies

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sentinel AI",
    description="The Safety Operating System for Autonomous AI — monitors, secures, audits, and governs AI agent actions.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(agents.router)
app.include_router(firewall.router)
app.include_router(audit.router)
app.include_router(approvals.router)
app.include_router(policies.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "sentinel-ai-backend"}


@app.get("/")
def root():
    return {"message": "Sentinel AI API — see /docs for OpenAPI documentation."}


def seed():
    db = SessionLocal()
    try:
        if db.query(Agent).count() == 0:
            db.add_all([
                Agent(name="Support Copilot", type="claude", owner="cs-team@company.com", risk_level="medium",
                      permissions=["read_tickets", "send_email"], tools=["email", "crm"], version="2.1.0"),
                Agent(name="DevOps Orchestrator", type="langgraph", owner="platform@company.com", risk_level="high",
                      permissions=["deploy", "read_logs", "restart_service"], tools=["kubectl", "terraform"], version="1.4.2"),
                Agent(name="Sales Research Agent", type="gpt", owner="sales@company.com", risk_level="low",
                      permissions=["web_search", "read_crm"], tools=["web_search"], version="3.0.0"),
                Agent(name="Data Pipeline Agent", type="crewai", owner="data@company.com", risk_level="high",
                      permissions=["query_db", "export_data"], tools=["sql", "s3"], version="1.0.1"),
            ])
        if db.query(Policy).count() == 0:
            db.add_all([
                Policy(name="Never expose API keys", description="Block any action containing API keys, tokens, or credentials.", rule_type="secret"),
                Policy(name="Never email external domains without approval", description="Require human approval before sending email outside the company domain.", rule_type="destination"),
                Policy(name="Never delete production data", description="Block any tool call to delete_database or drop_table against production.", rule_type="tool"),
                Policy(name="Require approval above risk score 70", description="Any action scoring 70+ is routed to a human for approval.", rule_type="threshold"),
                Policy(name="Block prompts containing secrets", description="Immediately block requests where detected secrets exceed critical severity.", rule_type="secret"),
            ])
        db.commit()
    finally:
        db.close()


seed()
