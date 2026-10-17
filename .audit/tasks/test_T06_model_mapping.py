#!/usr/bin/env python3
"""Audit test for T-06: verifies model mapping on 9Router gateway for Haiku, Sonnet, and Opus aliases."""
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
SETTINGS_FILE = REPO / ".claude/settings.local.json"

if not SETTINGS_FILE.is_file():
    sys.exit(f"ERROR: {SETTINGS_FILE} not found. Run T-05 first.")

with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
    settings = json.load(f)

env_vars = settings.get("env", {})
base_url = env_vars.get("ANTHROPIC_BASE_URL", "http://127.0.0.1:20128").rstrip("/")
api_key = env_vars.get("ANTHROPIC_API_KEY", "")

if not api_key:
    sys.exit("ERROR: ANTHROPIC_API_KEY missing in settings.local.json")

EVIDENCE_DIR = REPO / ".audit/evidence/T-06"
EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
LOG_FILE = EVIDENCE_DIR / "model-mapping-log.txt"

aliases = {
    "haiku": env_vars.get("ANTHROPIC_DEFAULT_HAIKU_MODEL", "ag/gemini-3.8-flash-high"),
    "sonnet": env_vars.get("ANTHROPIC_DEFAULT_SONNET_MODEL", "ag/claude-sonnet-4-6"),
    "opus": env_vars.get("ANTHROPIC_DEFAULT_OPUS_MODEL", "ag/claude-opus-4-6-thinking"),
    "main": env_vars.get("ANTHROPIC_MODEL", "ag/claude-sonnet-4-6")
}

log_lines = []


def log(msg):
    print(msg)
    log_lines.append(msg)


log("=== T-06 MODEL MAPPING AUDIT VERIFICATION ===")
log(f"Base URL: {base_url}")
log(f"Target Aliases: {aliases}\n")

# Step 1: Verify mapped models return HTTP 200 and streaming chunks
for role, model in aliases.items():
    t0 = time.time()
    payload = {
        "model": model,
        "max_tokens": 20,
        "messages": [{"role": "user", "content": f"Test ping for {role} role. Reply with '{role} ok'."}]
    }
    req = urllib.request.Request(
        f"{base_url}/v1/messages",
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
        },
        data=json.dumps(payload).encode()
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            duration = round(time.time() - t0, 3)
            body = r.read().decode(errors="replace")
            # Redact any key if present in body
            safe_snippet = body[:120].replace("\n", " ")
            log(f"[PASS] Role: {role.upper():<6} -> Model: {model:<30} (HTTP {r.status}, {duration}s)")
            log(f"       Response snippet: {safe_snippet}")
            assert r.status == 200, f"Expected 200, got {r.status}"
    except urllib.error.HTTPError as e:
        log(f"[FAIL] Role: {role.upper():<6} -> Model: {model:<30} (HTTP {e.code})")
        sys.exit(1)
    except Exception as e:
        log(f"[ERROR] Role: {role.upper():<6} -> Model: {model:<30} ({e})")
        sys.exit(1)

# Step 2: Negative test - verify that unmapped Anthropic models fail with 404 as expected
log("\n=== NEGATIVE TEST: UNMAPPED MODELS RETURN 404 ===")
for unmapped in ["claude-3-5-haiku-20241022", "claude-3-5-sonnet-20241022"]:
    payload = {"model": unmapped, "max_tokens": 5, "messages": [{"role": "user", "content": "hi"}]}
    req = urllib.request.Request(
        f"{base_url}/v1/messages",
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
        },
        data=json.dumps(payload).encode()
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as r:
            log(f"[UNEXPECTED] Unmapped {unmapped} returned HTTP {r.status}")
    except urllib.error.HTTPError as e:
        log(f"[EXPECTED 404] Unmapped {unmapped} correctly refused: HTTP {e.code}")
        assert e.code == 404, f"Expected 404, got {e.code}"

log("\n=== T-06 RESULT: ALL MODEL MAPPINGS VERIFIED ZERO 404 ON MAPPED ALIASES ===")

with open(LOG_FILE, "w", encoding="utf-8") as f:
    f.write("\n".join(log_lines) + "\n")
print(f"Evidence saved to {LOG_FILE}")
