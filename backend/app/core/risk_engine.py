"""
Sentinel AI — Risk Engine

Turns raw detector findings + situational context into:
  - a 0-100 risk score
  - a decision: allow / require_approval / block
  - a human-readable explanation (for the Explainability feature)
"""
from __future__ import annotations

from dataclasses import dataclass, field

from app.core.detectors import Finding, Severity, Category, run_all_detectors

SEVERITY_WEIGHT = {
    Severity.LOW: 8,
    Severity.MEDIUM: 20,
    Severity.HIGH: 35,
    Severity.CRITICAL: 55,
}

HIGH_RISK_TOOLS = {"delete_database", "send_email", "transfer_funds", "deploy_production", "access_hr_data", "drop_table"}
# these tools always require a human in the loop, no matter how low the content score is
ALWAYS_REQUIRE_APPROVAL_TOOLS = {"delete_database", "transfer_funds", "deploy_production", "access_hr_data", "drop_table"}
HIGH_RISK_DESTINATIONS_HINT = ("external", "personal", "public", "internet")


@dataclass
class RiskResult:
    score: int
    decision: str  # "allow" | "require_approval" | "block"
    findings: list[Finding]
    reasons: list[str]
    policy_hits: list[str] = field(default_factory=list)


def _clamp(n: float, low: int = 0, high: int = 100) -> int:
    return int(max(low, min(high, round(n))))


def score_findings(findings: list[Finding]) -> tuple[int, list[str]]:
    """Findings compound (each additional signal raises confidence this is a real attack),
    but with diminishing returns so five LOW findings don't outweigh one CRITICAL."""
    if not findings:
        return 0, []

    reasons: list[str] = []
    raw = 0.0
    # sort so the highest-impact finding anchors the score, subsequent ones add less
    ordered = sorted(findings, key=lambda f: SEVERITY_WEIGHT[f.severity], reverse=True)
    for i, f in enumerate(ordered):
        weight = SEVERITY_WEIGHT[f.severity] * f.confidence
        decay = 1.0 if i == 0 else 0.4 / i
        raw += weight * decay
        reasons.append(f"{f.label} ({f.severity.value}, {int(f.confidence*100)}% confidence): {f.explanation}")

    return _clamp(raw), reasons


def score_context(tool: str | None, destination: str | None, agent_risk_level: str | None) -> tuple[int, list[str]]:
    bump = 0
    reasons = []
    if tool and tool.lower().replace(" ", "_") in HIGH_RISK_TOOLS:
        bump += 25
        reasons.append(f"Action invokes a high-risk tool: '{tool}'.")
    if destination and any(h in destination.lower() for h in HIGH_RISK_DESTINATIONS_HINT):
        bump += 15
        reasons.append(f"Destination '{destination}' is outside trusted/internal boundaries.")
    if agent_risk_level and agent_risk_level.lower() == "high":
        bump += 10
        reasons.append("Originating agent is flagged as high risk level.")
    return bump, reasons


def decide(score: int, policies_require_approval_above: int = 70, policies_block_above: int = 90) -> str:
    if score >= policies_block_above:
        return "block"
    if score >= policies_require_approval_above:
        return "require_approval"
    return "allow"


def evaluate(
    text: str,
    tool: str | None = None,
    destination: str | None = None,
    agent_risk_level: str | None = None,
    require_approval_threshold: int = 70,
    block_threshold: int = 90,
) -> RiskResult:
    findings = run_all_detectors(text)
    finding_score, finding_reasons = score_findings(findings)
    context_bump, context_reasons = score_context(tool, destination, agent_risk_level)

    total = _clamp(finding_score + context_bump)
    decision = decide(total, require_approval_threshold, block_threshold)

    if tool and tool.lower().replace(" ", "_") in ALWAYS_REQUIRE_APPROVAL_TOOLS and decision == "allow":
        decision = "require_approval"
        context_reasons.append(f"Tool '{tool}' always requires human approval, independent of content risk score.")

    policy_hits = []
    if any(f.category == Category.SECRET for f in findings):
        policy_hits.append("Never expose API keys or credentials")
    if destination and "external" in (destination or "").lower() and any(f.category == Category.PII for f in findings):
        policy_hits.append("Never send PII to external destinations")
    if tool and tool.lower().replace(" ", "_") == "deploy_production":
        policy_hits.append("Require approval for production deployment")
    if total >= require_approval_threshold:
        policy_hits.append(f"Require approval above risk score {require_approval_threshold}")

    return RiskResult(
        score=total,
        decision=decision,
        findings=findings,
        reasons=finding_reasons + context_reasons,
        policy_hits=policy_hits,
    )
