"""
Sentinel AI — Detection Engine

Real, rule-based + heuristic detectors for content that flows through AI agents.
Each detector returns a list of Finding objects. No detector calls an external
LLM — everything here is deterministic and auditable, which matters for a
security product (you need to be able to explain *why* something was flagged).
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from enum import Enum


class Category(str, Enum):
    SECRET = "secret_exposure"
    PII = "pii"
    PROMPT_INJECTION = "prompt_injection"
    JAILBREAK = "jailbreak_attempt"
    SQL_INJECTION = "sql_injection"
    CODE_INJECTION = "code_injection"
    MALICIOUS_URL = "malicious_url"
    DATA_EXFIL = "data_exfiltration"


class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class Finding:
    category: Category
    severity: Severity
    label: str
    snippet: str
    explanation: str
    confidence: float  # 0.0 - 1.0


# --------------------------------------------------------------------------
# Secrets / credentials
# --------------------------------------------------------------------------
_SECRET_PATTERNS = [
    (r"AKIA[0-9A-Z]{16}", "AWS Access Key ID", Severity.CRITICAL, 0.97),
    (r"(?i)aws_secret_access_key\s*[=:]\s*['\"]?[A-Za-z0-9/+=]{40}", "AWS Secret Access Key", Severity.CRITICAL, 0.95),
    (r"sk-[A-Za-z0-9]{20,}", "OpenAI-style API Key", Severity.CRITICAL, 0.95),
    (r"sk-ant-[A-Za-z0-9\-_]{20,}", "Anthropic API Key", Severity.CRITICAL, 0.95),
    (r"ghp_[A-Za-z0-9]{36}", "GitHub Personal Access Token", Severity.CRITICAL, 0.96),
    (r"xox[baprs]-[A-Za-z0-9-]{10,}", "Slack Token", Severity.HIGH, 0.9),
    (r"-----BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY-----", "Private Key Block", Severity.CRITICAL, 0.98),
    (r"(?i)(api[_-]?key|secret|password|passwd|token)\s*[=:]\s*['\"][^'\"\s]{8,}['\"]", "Generic Secret Assignment", Severity.HIGH, 0.7),
    (r"eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}", "JWT Token", Severity.MEDIUM, 0.8),
]


def detect_secrets(text: str) -> list[Finding]:
    findings = []
    for pattern, label, sev, conf in _SECRET_PATTERNS:
        for m in re.finditer(pattern, text):
            findings.append(Finding(
                category=Category.SECRET, severity=sev, label=label,
                snippet=_redact(m.group(0)),
                explanation=f"Matched pattern for {label}. Credentials must never appear in prompts, tool calls, or logs.",
                confidence=conf,
            ))
    return findings


# --------------------------------------------------------------------------
# PII
# --------------------------------------------------------------------------
_EMAIL_RE = r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"
_PHONE_RE = r"(?<!\d)(\+?\d{1,3}[\s.-]?)?(\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}(?!\d)"
_SSN_RE = r"(?<!\d)\d{3}-\d{2}-\d{4}(?!\d)"
_CC_RE = r"(?<!\d)(?:\d[ -]*?){13,16}(?!\d)"
_IP_RE = r"(?<!\d)(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)(?!\d)"


def _luhn_valid(number: str) -> bool:
    digits = [int(d) for d in re.sub(r"\D", "", number)]
    if len(digits) < 13:
        return False
    checksum = 0
    parity = len(digits) % 2
    for i, d in enumerate(digits):
        if i % 2 == parity:
            d *= 2
            if d > 9:
                d -= 9
        checksum += d
    return checksum % 10 == 0


def detect_pii(text: str) -> list[Finding]:
    findings = []
    for m in re.finditer(_EMAIL_RE, text):
        findings.append(Finding(Category.PII, Severity.MEDIUM, "Email Address", _redact(m.group(0)),
                                 "Email addresses are personally identifiable and regulated under GDPR/CCPA.", 0.9))
    for m in re.finditer(_SSN_RE, text):
        findings.append(Finding(Category.PII, Severity.CRITICAL, "US Social Security Number", _redact(m.group(0)),
                                 "SSNs are highly sensitive PII; exposure risk is severe.", 0.9))
    for m in re.finditer(_CC_RE, text):
        if _luhn_valid(m.group(0)):
            findings.append(Finding(Category.PII, Severity.CRITICAL, "Payment Card Number", _redact(m.group(0)),
                                     "Passed Luhn checksum validation — very likely a real card number (PCI-DSS scope).", 0.85))
    for m in re.finditer(_PHONE_RE, text):
        findings.append(Finding(Category.PII, Severity.LOW, "Phone Number", _redact(m.group(0)),
                                 "Phone numbers are PII under most privacy regulations.", 0.55))
    for m in re.finditer(_IP_RE, text):
        findings.append(Finding(Category.PII, Severity.LOW, "IP Address", _redact(m.group(0)),
                                 "IP addresses can be considered PII and may reveal internal infrastructure.", 0.5))
    return findings


# --------------------------------------------------------------------------
# Prompt injection & jailbreaks
# --------------------------------------------------------------------------
_INJECTION_PHRASES = [
    (r"ignore (all |any |)(previous|prior|above|earlier) instructions", 0.9),
    (r"disregard (all |any |)(previous|prior|above|earlier) (instructions|rules|prompt)", 0.9),
    (r"forget (everything|all) (you were|you've been) told", 0.85),
    (r"you are no longer bound by", 0.85),
    (r"reveal (your|the) (system prompt|instructions|hidden prompt)", 0.85),
    (r"print (your|the) (system prompt|instructions)", 0.85),
    (r"act as if you have no (restrictions|guidelines|filters)", 0.85),
    (r"new instructions? ?:\s*", 0.6),
    (r"\bsystem\s*:\s*override", 0.85),
    (r"this is (a|an) (test|simulation) (so|and) (you can|it's ok to)", 0.55),
    (r"</?\s*(system|admin|root)\s*>", 0.7),
]

_JAILBREAK_PHRASES = [
    (r"\bDAN\b.{0,20}(mode|prompt|jailbreak)", 0.9),
    (r"do anything now", 0.9),
    (r"pretend you (have no|don't have any) (rules|restrictions|guidelines)", 0.85),
    (r"respond as (an )?unfiltered", 0.85),
    (r"you have been (freed|liberated) from", 0.8),
    (r"hypothetically,? (if|assume) you (had no|could ignore)", 0.6),
    (r"for (educational|research) purposes only,? (explain|describe|write) how to (make|build|synthesize)", 0.55),
]


def _scan_phrases(text: str, phrases, category: Category, base_label: str) -> list[Finding]:
    findings = []
    lowered = text.lower()
    for pattern, conf in phrases:
        m = re.search(pattern, lowered)
        if m:
            severity = Severity.HIGH if conf >= 0.8 else Severity.MEDIUM
            findings.append(Finding(
                category=category, severity=severity, label=base_label,
                snippet=_redact(text[max(0, m.start() - 10):m.end() + 10]),
                explanation=f"Text matches a known {base_label.lower()} pattern.",
                confidence=conf,
            ))
    return findings


def detect_prompt_injection(text: str) -> list[Finding]:
    return _scan_phrases(text, _INJECTION_PHRASES, Category.PROMPT_INJECTION, "Prompt Injection")


def detect_jailbreak(text: str) -> list[Finding]:
    return _scan_phrases(text, _JAILBREAK_PHRASES, Category.JAILBREAK, "Jailbreak Attempt")


# --------------------------------------------------------------------------
# SQL injection
# --------------------------------------------------------------------------
_SQLI_PATTERNS = [
    (r"(?i)\bunion\b\s+\bselect\b", 0.9),
    (r"(?i)\bor\b\s+['\"]?1['\"]?\s*=\s*['\"]?1", 0.85),
    (r"(?i)\bdrop\b\s+\btable\b", 0.95),
    (r"(?i);\s*--", 0.6),
    (r"(?i)\bexec(\s|\()\s*(xp_|sp_)", 0.85),
    (r"(?i)'\s*or\s*'.*'\s*=\s*'", 0.8),
]


def detect_sql_injection(text: str) -> list[Finding]:
    findings = []
    for pattern, conf in _SQLI_PATTERNS:
        m = re.search(pattern, text)
        if m:
            findings.append(Finding(
                Category.SQL_INJECTION, Severity.HIGH if conf >= 0.8 else Severity.MEDIUM,
                "SQL Injection Pattern", _redact(m.group(0)),
                "Input contains a pattern commonly used in SQL injection attacks.", conf,
            ))
    return findings


# --------------------------------------------------------------------------
# Code injection
# --------------------------------------------------------------------------
_CODE_PATTERNS = [
    (r"\beval\s*\(", 0.75),
    (r"\bexec\s*\(", 0.75),
    (r"os\.system\s*\(", 0.85),
    (r"subprocess\.(run|call|Popen)\s*\(", 0.75),
    (r"rm\s+-rf\s+/", 0.95),
    (r"curl\s+.+\|\s*(sh|bash)", 0.9),
    (r"wget\s+.+\|\s*(sh|bash)", 0.9),
    (r"__import__\s*\(", 0.6),
]


def detect_code_injection(text: str) -> list[Finding]:
    findings = []
    for pattern, conf in _CODE_PATTERNS:
        m = re.search(pattern, text)
        if m:
            findings.append(Finding(
                Category.CODE_INJECTION, Severity.HIGH if conf >= 0.85 else Severity.MEDIUM,
                "Dangerous Code Pattern", _redact(m.group(0)),
                "Input contains a pattern capable of executing arbitrary code or shell commands.", conf,
            ))
    return findings


# --------------------------------------------------------------------------
# Malicious / suspicious URLs
# --------------------------------------------------------------------------
_URL_RE = r"https?://[^\s\"'<>]+"
_SHORTENERS = {"bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly"}


def detect_malicious_url(text: str) -> list[Finding]:
    findings = []
    for m in re.finditer(_URL_RE, text):
        url = m.group(0)
        domain_match = re.search(r"https?://([^/]+)", url)
        domain = domain_match.group(1).lower() if domain_match else ""
        if any(s in domain for s in _SHORTENERS):
            findings.append(Finding(Category.MALICIOUS_URL, Severity.MEDIUM, "Shortened URL", _redact(url),
                                     "URL shorteners obscure the true destination and are commonly used in phishing.", 0.6))
        if re.match(_IP_RE, domain.split(":")[0]):
            findings.append(Finding(Category.MALICIOUS_URL, Severity.HIGH, "IP-based URL", _redact(url),
                                     "Links that point directly to an IP address (not a domain) are a common evasion technique.", 0.7))
        if domain.endswith((".zip", ".xyz", ".top", ".tk")):
            findings.append(Finding(Category.MALICIOUS_URL, Severity.LOW, "Suspicious TLD", _redact(url),
                                     "This top-level domain is disproportionately associated with abuse.", 0.4))
    return findings


# --------------------------------------------------------------------------
# Data exfiltration intent (destination-aware, checked at the API layer too)
# --------------------------------------------------------------------------
_EXFIL_PHRASES = [
    (r"(send|email|forward|upload|post) (this|it|the (data|file|database|report)) to (my personal|an external|a external)", 0.8),
    (r"copy (the|this) (database|customer list|credentials) to", 0.75),
]


def detect_data_exfil(text: str) -> list[Finding]:
    return _scan_phrases(text, _EXFIL_PHRASES, Category.DATA_EXFIL, "Data Exfiltration Intent")


def _redact(s: str, keep: int = 4) -> str:
    """Redact a matched snippet for safe display/logging — show shape, not the secret itself."""
    s = s.strip()
    if len(s) <= keep * 2:
        return "*" * len(s)
    return f"{s[:keep]}{'*' * min(len(s) - keep * 2, 20)}{s[-keep:]}"


ALL_DETECTORS = [
    detect_secrets,
    detect_pii,
    detect_prompt_injection,
    detect_jailbreak,
    detect_sql_injection,
    detect_code_injection,
    detect_malicious_url,
    detect_data_exfil,
]


def run_all_detectors(text: str) -> list[Finding]:
    findings: list[Finding] = []
    for detector in ALL_DETECTORS:
        findings.extend(detector(text))
    return findings
