#!/usr/bin/env python3
"""Audit test for T-09: verifies style-edit plan generation (plan.json) and local Remotion render (render.mp4)."""
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

def main():
    root = Path(__file__).resolve().parents[2]
    raw_sample = root / "plugins" / "ai-editor" / "presets" / "styles" / "sample-card-edit" / "example.mp4"
    if not raw_sample.exists():
        sys.exit(f"FAIL: sample video not found at {raw_sample}")
        
    cut_sk = root / "plugins" / "ai-editor" / "skills" / "cut" / "scripts"
    style_sk = root / "plugins" / "ai-editor" / "skills" / "style-edit" / "scripts"
    
    evidence_dir = root / ".audit" / "evidence" / "T-09"
    evidence_dir.mkdir(parents=True, exist_ok=True)
    log_file = evidence_dir / "style-render-evidence.txt"
    
    with tempfile.TemporaryDirectory(prefix="t09-style-") as td:
        work = Path(td)
        edit = work / "edits" / "take1"
        edit.mkdir(parents=True)
        
        # 1. Transcribe & fast cut
        subprocess.run([sys.executable, str(cut_sk / "transcribe.py"), str(raw_sample), str(edit / "words.raw.json"), "--engine", "whisper"],
                       capture_output=True, text=True, check=True)
        (edit / "spans.json").write_text(json.dumps([{"text": "a router", "kind": "retake"}]))
        subprocess.run([sys.executable, str(cut_sk / "build_timeline.py"), str(raw_sample), str(edit)],
                       capture_output=True, text=True, check=True)
        subprocess.run([sys.executable, str(cut_sk / "render.py"), str(raw_sample), str(edit)],
                       capture_output=True, text=True, check=True)
        
        # 2. Captions & Style setup
        words = json.loads((edit / "words.json").read_text(encoding="utf-8"))
        (edit / "captions.json").write_text(json.dumps(words, indent=2), encoding="utf-8")
        
        style = {
            "handle": "audit-style",
            "aspect": "9:16",
            "pace": {"max_pause_s": 0.2},
            "zoom": {"per_min": 15, "kind": "punch", "scale": 1.15, "on": "sentence_start"},
            "captions": {
                "present": True, "words_per_caption": 2, "y_pct": 70, "size_pct": 5,
                "case": "lower", "font_match": "Inter", "weight": 800, "color": "#FFFFFF", "stroke": True
            }
        }
        (work / "style.json").write_text(json.dumps(style, indent=2), encoding="utf-8")
        
        # 3. Generate plan.json
        r_plan = subprocess.run([sys.executable, str(style_sk / "plan.py"), str(work / "style.json"), str(edit / "captions.json")],
                                capture_output=True, text=True, cwd=work)
        if r_plan.returncode != 0:
            sys.exit(f"FAIL plan.py: {r_plan.stderr}")
            
        plan_json = edit / "plan.json"
        assert plan_json.exists(), "plan.json was not generated"
        plan_data = json.loads(plan_json.read_text(encoding="utf-8"))
        
        for k in ("video", "width", "height", "fps", "durationInFrames", "captions", "zooms"):
            assert k in plan_data, f"Required key {k} missing from plan.json"
            
        assert plan_data["width"] == 1080 and plan_data["height"] == 1920
        assert plan_data["durationInFrames"] > 0
        
        # 4. Local Remotion render (render.mp4)
        r_render = subprocess.run([sys.executable, str(style_sk / "edit.py"), "render", str(edit)],
                                  capture_output=True, text=True, cwd=work)
        if r_render.returncode != 0:
            sys.exit(f"FAIL edit.py render: {r_render.stderr}\n{r_render.stdout}")
            
        render_mp4 = edit / "render.mp4"
        assert render_mp4.exists(), "render.mp4 was not generated"
        
        dur_render = float(subprocess.check_output(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(render_mp4)]
        ).decode().strip())
        
        # Check video stream resolution
        vinfo = json.loads(subprocess.check_output(
            ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,codec_name", "-of", "json", str(render_mp4)]
        ).decode())["streams"][0]
        
        assert vinfo["width"] == 1080 and vinfo["height"] == 1920
        assert vinfo["codec_name"] == "h264"
        assert abs(dur_render - 11.63) < 0.5, f"Render duration unexpected: {dur_render}"
        
        log_content = (
            f"=== T-09 STYLE-EDIT & REMOTION RENDER PASS ===\n"
            f"plan.json generated: True\n"
            f"Plan keys: {list(plan_data.keys())}\n"
            f"Plan duration in frames: {plan_data['durationInFrames']} ({plan_data['fps']} fps)\n"
            f"render.mp4 generated: True ({render_mp4.stat().st_size} bytes)\n"
            f"render.mp4 duration: {dur_render:.3f} s\n"
            f"render.mp4 stream: {vinfo['codec_name']} {vinfo['width']}x{vinfo['height']}\n"
        )
        log_file.write_text(log_content, encoding="utf-8")
        print(log_content)
        print("T-09 audit test PASSED.")

if __name__ == "__main__":
    main()
