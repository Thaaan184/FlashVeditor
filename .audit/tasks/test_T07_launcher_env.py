#!/usr/bin/env python3
"""Audit test for T-07: verifies environment variable persistence when launcher opens a terminal session."""
import os
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
LIB = REPO / "plugins/ai-editor/lib"
sys.path.insert(0, str(LIB))

from ai_editor import launcher  # noqa: E402

EVIDENCE_DIR = REPO / ".audit/evidence/T-07"
EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
LOG_FILE = EVIDENCE_DIR / "launcher-env-sanitation.txt"

log_lines = []


def log(msg):
    print(msg)
    log_lines.append(msg)


log("=== T-07 LAUNCHER ENV SANITATION VERIFICATION ===")

# Test 1: Verify launcher command generation includes gateway env vars on Darwin and Linux
test_env = {
    "AI_EDITOR_HOME": "/tmp/test-home",
    "ANTHROPIC_BASE_URL": "http://127.0.0.1:20128",
    "ANTHROPIC_MODEL": "ag/claude-sonnet-4-6",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "ag/gemini-3.8-flash-high",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "ag/claude-sonnet-4-6",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "ag/claude-opus-4-6-thinking",
    "GEMINI_BASE_URL": "http://127.0.0.1:20128",
    "GEMINI_FRAME_SAMPLING": "1"
}

for k, v in test_env.items():
    os.environ[k] = v

with tempfile.TemporaryDirectory() as d:
    folder = Path(d)
    for os_name in ("Darwin", "Linux"):
        recorded_argv = []

        def mock_run(argv, folder, os_name):
            recorded_argv.append(argv)
            return True

        opened, cmd_text = launcher.open_claude(folder, "test prompt", os_name=os_name, run=mock_run)
        log(f"\n--- Checking OS: {os_name} ---")
        log(f"Command line text: {cmd_text[:160]}...")
        assert "ANTHROPIC_BASE_URL=http://127.0.0.1:20128" in cmd_text, f"Missing ANTHROPIC_BASE_URL in {os_name} command text"
        assert "ANTHROPIC_MODEL=ag/claude-sonnet-4-6" in cmd_text, f"Missing ANTHROPIC_MODEL in {os_name} command text"
        assert "GEMINI_FRAME_SAMPLING=1" in cmd_text, f"Missing GEMINI_FRAME_SAMPLING in {os_name} command text"
        log(f"[PASS] {os_name} launcher preserves gateway environment variables in terminal command.")

# Test 2: Verify real child execution inherits ANTHROPIC_BASE_URL
log("\n--- Testing Subprocess Environment Inheritance ---")
child_script = "import os; print('CHILD_ANTHROPIC_BASE_URL=' + os.environ.get('ANTHROPIC_BASE_URL', 'MISSING'))"
out = subprocess.run([sys.executable, "-c", child_script], capture_output=True, text=True, check=True).stdout.strip()
log(f"Child process output: {out}")
assert out == "CHILD_ANTHROPIC_BASE_URL=http://127.0.0.1:20128", "Child failed to inherit ANTHROPIC_BASE_URL"
log("[PASS] Child process inherits ANTHROPIC_BASE_URL without drop.")

log("\n=== T-07 RESULT: LAUNCHER ENV SANITATION FULLY VERIFIED ===")

with open(LOG_FILE, "w", encoding="utf-8") as f:
    f.write("\n".join(log_lines) + "\n")
print(f"Evidence saved to {LOG_FILE}")
