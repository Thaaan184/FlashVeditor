#!/usr/bin/env python3
"""Audit test for T-10: verifies creator-teardown visual look pass calling 9Router gateway."""
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

def main():
    root = Path(__file__).resolve().parents[2]
    gemini_sk = root / "plugins" / "creator-teardown" / "skills" / "creator-teardown" / "scripts"
    raw_sample = root / "plugins" / "ai-editor" / "presets" / "styles" / "sample-card-edit" / "example.mp4"
    
    if not raw_sample.exists():
        sys.exit(f"FAIL: sample video not found at {raw_sample}")
        
    evidence_dir = root / ".audit" / "evidence" / "T-10"
    evidence_dir.mkdir(parents=True, exist_ok=True)
    log_file = evidence_dir / "teardown-gateway-evidence.txt"
    
    # We will run gemini.py look in a controlled creator folder
    outdir = root / "creator-teardowns" / "audit-creator"
    (outdir / "video").mkdir(parents=True, exist_ok=True)
    
    try:
        shutil.copy(raw_sample, outdir / "video" / "sample.mp4")
        (outdir / "videos.json").write_text(json.dumps({"videos": [{"id": "sample", "view_count": 10000}]}), encoding="utf-8")
        
        gemini_script = gemini_sk / "gemini.py"
        r = subprocess.run([sys.executable, str(gemini_script), "look", "audit-creator", "--force"],
                           capture_output=True, text=True, cwd=root)
        
        if r.returncode != 0:
            sys.exit(f"FAIL gemini.py look: {r.stderr}\n{r.stdout}")
            
        look_file = outdir / "video" / "sample.look-ai.json"
        assert look_file.exists(), "sample.look-ai.json was not written"
        
        look_data = json.loads(look_file.read_text(encoding="utf-8"))
        assert look_data.get("_source") == "ag/gemini-3.8-flash-high", f"Unexpected source: {look_data.get('_source')}"
        tokens = look_data.get("_tokens", 0)
        assert tokens > 0, f"Token count must be > 0, got {tokens}"
        
        style_file = outdir / "style.json"
        assert style_file.exists(), "style.json was not written"
        style_data = json.loads(style_file.read_text(encoding="utf-8"))
        
        log_content = (
            f"=== T-10 CREATOR-TEARDOWN VISUAL LOOK PASS ===\n"
            f"Gateway Base URL: {os.environ.get('GEMINI_BASE_URL', 'http://127.0.0.1:20128')}\n"
            f"Model ID: {look_data.get('_source')}\n"
            f"Tokens spent: {tokens}\n"
            f"Closest Google Font: {look_data.get('closest_google_font')}\n"
            f"Caption entrance: {look_data.get('caption_animation')}\n"
            f"Motion personality: {look_data.get('motion_personality')}\n"
            f"Graphics style: {look_data.get('graphics_style')}\n"
            f"style.json generated: True (keys: {list(style_data.keys())})\n"
        )
        log_file.write_text(log_content, encoding="utf-8")
        print(log_content)
        print("T-10 audit test PASSED.")
    finally:
        shutil.rmtree(outdir, ignore_errors=True)

if __name__ == "__main__":
    main()
