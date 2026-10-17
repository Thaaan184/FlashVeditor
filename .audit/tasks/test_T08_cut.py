#!/usr/bin/env python3
"""Audit test for T-08: Smoke test for cut engine producing cut.mp4 and words.json."""
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

def main():
    root = Path(__file__).resolve().parents[2]
    sk = root / "plugins" / "ai-editor" / "skills" / "cut" / "scripts"
    raw_sample = root / "plugins" / "ai-editor" / "presets" / "styles" / "sample-card-edit" / "example.mp4"
    
    if not raw_sample.exists():
        sys.exit(f"FAIL: sample video not found at {raw_sample}")
        
    evidence_dir = root / ".audit" / "evidence" / "T-08"
    evidence_dir.mkdir(parents=True, exist_ok=True)
    log_file = evidence_dir / "cut-smoke-evidence.txt"
    
    with tempfile.TemporaryDirectory(prefix="t08-cut-") as td:
        work = Path(td)
        edit = work / "edits" / "take1"
        edit.mkdir(parents=True)
        
        # 1. Transcribe
        tr_script = sk / "transcribe.py"
        r_tr = subprocess.run([sys.executable, str(tr_script), str(raw_sample), str(edit / "words.raw.json"), "--engine", "whisper"],
                              capture_output=True, text=True, check=True)
        
        raw_words = json.loads((edit / "words.raw.json").read_text(encoding="utf-8"))
        assert len(raw_words) > 0, "No words transcribed"
        
        # 2. Add realistic retake removal: remove 'a router'
        spans = [{"text": "a router", "kind": "retake"}]
        (edit / "spans.json").write_text(json.dumps(spans, indent=2), encoding="utf-8")
        
        # 3. Build timeline
        bt_script = sk / "build_timeline.py"
        r_bt = subprocess.run([sys.executable, str(bt_script), str(raw_sample), str(edit)],
                              capture_output=True, text=True, check=True)
        
        assert (edit / "decisions.json").exists(), "decisions.json missing"
        assert (edit / "report.json").exists(), "report.json missing"
        assert (edit / "words.json").exists(), "words.json missing"
        assert (edit / "paper-edit.md").exists(), "paper-edit.md missing"
        assert (edit / "cut-check.html").exists(), "cut-check.html missing"
        
        # 4. Render cut
        render_script = sk / "render.py"
        r_render = subprocess.run([sys.executable, str(render_script), str(raw_sample), str(edit)],
                                  capture_output=True, text=True, check=True)
        
        cut_mp4 = edit / "cut.mp4"
        assert cut_mp4.exists(), "cut.mp4 missing"
        
        # Verify ffprobe duration
        dur_orig = float(subprocess.check_output(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw_sample)]
        ).decode().strip())
        dur_cut = float(subprocess.check_output(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(cut_mp4)]
        ).decode().strip())
        
        assert dur_cut < dur_orig, f"cut duration {dur_cut} not shorter than original {dur_orig}"
        
        words_cut = json.loads((edit / "words.json").read_text(encoding="utf-8"))
        
        log_content = (
            f"=== T-08 CUT SMOKE TEST PASS ===\n"
            f"Raw source: {raw_sample}\n"
            f"Original duration: {dur_orig:.3f} s\n"
            f"Cut duration: {dur_cut:.3f} s\n"
            f"Transcribed words: {len(raw_words)}\n"
            f"Kept words: {len(words_cut)}\n"
            f"Cut spans applied: {len(spans)}\n"
            f"cut.mp4 verified: {cut_mp4.exists()} ({cut_mp4.stat().st_size} bytes)\n"
            f"words.json verified: {(edit / 'words.json').exists()}\n"
            f"decisions.json verified: {(edit / 'decisions.json').exists()}\n"
            f"cut-check.html verified: {(edit / 'cut-check.html').exists()}\n"
        )
        log_file.write_text(log_content, encoding="utf-8")
        print(log_content)
        print("T-08 audit test PASSED.")

if __name__ == "__main__":
    main()
