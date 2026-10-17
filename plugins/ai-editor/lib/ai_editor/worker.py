#!/usr/bin/env python3
"""FlashVeditor Auto-Worker Daemon.
Listens for queued jobs from home.py and automatically executes the pipeline
using the 9Router Gateway without requiring manual Claude terminal interaction.
"""
import json
import os
import re
import shlex
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
LIB = Path(__file__).resolve().parent
sys.path.insert(0, str(LIB))
import home


def run_cmd(cmd, cwd=None):
    print(f"[WORKER] Executing: {' '.join(cmd)}", flush=True)
    res = subprocess.run(cmd, cwd=cwd or str(ROOT), capture_output=True, text=True)
    if res.returncode != 0:
        print(f"[WORKER ERROR] {res.stderr[:500]}", flush=True)
    else:
        if res.stdout:
            print(f"[WORKER OUT] {res.stdout.strip().splitlines()[-1][:120]}", flush=True)
    return res


def update_status(job_type, step=None, progress=None, done=False, failed=None, key=None):
    cmd = [sys.executable, str(LIB / "home.py"), "status", job_type]
    if key:
        cmd.extend(["--key", str(key)])
    if step:
        cmd.extend(["--step", str(step)])
    if progress is not None:
        cmd.extend(["--progress", str(progress)])
    if done:
        cmd.append("--done")
    if failed:
        cmd.extend(["--failed", str(failed)])
    return run_cmd(cmd)


def process_teardown(args_dict, root_dir):
    handle = args_dict.get("handle", "unknown")
    urls_file = args_dict.get("urls")
    platform = args_dict.get("platform", "youtube")
    clean_handle = handle.lstrip("@")
    clean_handle = re.sub(r"[^a-z0-9._-]", "", clean_handle.lower())

    td_scripts = ROOT / "plugins" / "creator-teardown" / "skills" / "creator-teardown" / "scripts"
    py = sys.executable

    print(f"[WORKER] Starting teardown for {clean_handle} (root: {root_dir})...", flush=True)

    # 1. List videos
    update_status("teardown", step="Listed their videos", progress=0.15, key=clean_handle)
    if urls_file:
        res = run_cmd([py, str(td_scripts / "fetch.py"), "list", clean_handle, "--urls", str(urls_file)], cwd=root_dir)
    else:
        res = run_cmd([py, str(td_scripts / "fetch.py"), "list", clean_handle, "--platform", platform], cwd=root_dir)
    if res.returncode != 0:
        update_status("teardown", failed=f"Fetch failed: {res.stderr[:200]}", key=clean_handle)
        return

    # 2. Download top videos
    update_status("teardown", step="Downloaded the top 5 and 2 median", progress=0.35, key=clean_handle)
    run_cmd([py, str(td_scripts / "visual.py"), "download", clean_handle, "--top", "5"], cwd=root_dir)

    # 3. Transcribe
    update_status("teardown", step="Transcribed every word", progress=0.50, key=clean_handle)
    run_cmd([py, str(td_scripts / "fetch.py"), "transcribe", clean_handle, "--top", "5"], cwd=root_dir)

    # 4. Measure cuts, zooms, camera moves
    update_status("teardown", step="Measured cuts, zooms and camera moves", progress=0.65, key=clean_handle)
    run_cmd([py, str(td_scripts / "visual.py"), "measure", clean_handle], cwd=root_dir)

    # 5. Look pass (OCR and visual framing)
    update_status("teardown", step="Reading captions and faces", progress=0.75, key=clean_handle)
    run_cmd([py, str(td_scripts / "look.py"), "measure", clean_handle], cwd=root_dir)

    # 6. Format check
    run_cmd([py, str(td_scripts / "format_check.py"), "check", clean_handle], cwd=root_dir)

    # 7. Gemini Look Pass via 9Router Gateway
    update_status("teardown", step="Analysing format via 9Router (Gemini 3.8 Flash High)", progress=0.88, key=clean_handle)
    run_cmd([py, str(td_scripts / "gemini.py"), "look", clean_handle], cwd=root_dir)

    # 8. Complete teardown
    update_status("teardown", step="Writing the style", progress=1.0, key=clean_handle)
    update_status("teardown", done=True, key=clean_handle)
    print(f"[WORKER] Teardown for {clean_handle} completed successfully!", flush=True)


def process_video(args, root_dir):
    source = args.get("source") or args.get("path")
    edit_dir = args.get("edit")
    name = Path(edit_dir).name if edit_dir else args.get("name")

    if not source or not edit_dir:
        return

    edit_path = Path(edit_dir)
    edit_path.mkdir(parents=True, exist_ok=True)

    cut_scripts = ROOT / "plugins" / "ai-editor" / "skills" / "cut" / "scripts"
    py = sys.executable

    print(f"[WORKER] Starting video cut pipeline for {name} (source: {source})...", flush=True)

    # 1. Transcribe
    update_status("video", step="Writing down every word", progress=0.25, key=name)
    words_raw = edit_path / "words.raw.json"
    run_cmd([py, str(cut_scripts / "transcribe.py"), str(source), str(words_raw), "--engine", "whisper"], cwd=root_dir)

    # 2. Propose cuts & retakes
    update_status("video", step="Finding retakes and pauses", progress=0.50, key=name)
    run_cmd([py, str(cut_scripts / "retakes.py"), "propose", str(edit_path)], cwd=root_dir)

    # Build spans.json from candidates.md
    spans_file = edit_path / "spans.json"
    if not spans_file.exists():
        cands_file = edit_path / "candidates.md"
        spans = []
        if cands_file.exists():
            text = cands_file.read_text(encoding="utf-8")
            for m in re.finditer(r'`(false_start|retake)`\s+"([^"]+)"', text):
                kind, cut_text = m.group(1), m.group(2)
                spans.append({"text": cut_text, "kind": kind, "occurrence": 1})
        spans_file.write_text(json.dumps(spans, indent=2), encoding="utf-8")

    # 3. Build timeline
    update_status("video", step="Cutting out the mistakes", progress=0.75, key=name)
    run_cmd([py, str(cut_scripts / "build_timeline.py"), str(source), str(edit_path)], cwd=root_dir)

    # 4. Render cut
    update_status("video", step="Rendering the cut", progress=0.90, key=name)
    run_cmd([py, str(cut_scripts / "render.py"), str(source), str(edit_path)], cwd=root_dir)

    # 5. Preview & review round
    run_cmd([py, str(cut_scripts / "preview_cut.py"), str(edit_path), "--no-open"], cwd=root_dir)
    rev_script = ROOT / "plugins" / "ai-editor" / "lib" / "ai_editor" / "review.py"
    run_cmd([py, str(rev_script), str(edit_path), "start", "--video", str(edit_path / "cut.mp4"), "--stage", "cut", "--transcript", str(edit_path / "words.json")], cwd=root_dir)

    # 6. Complete video cut pass
    update_status("video", done=True, key=name)
    print(f"[WORKER] Video cut pipeline for {name} completed successfully!", flush=True)


def process_style_edit(edit_folder, root_dir):
    py = sys.executable
    style_sk = ROOT / "plugins" / "ai-editor" / "skills" / "style-edit" / "scripts"
    name = edit_folder.name
    print(f"[WORKER] Starting style render pipeline for {name}...", flush=True)

    words_file = edit_folder / "words.json"
    captions_file = edit_folder / "captions.json"
    if words_file.exists() and not captions_file.exists():
        words = json.loads(words_file.read_text(encoding="utf-8"))
        captions_file.write_text(json.dumps(words, indent=2), encoding="utf-8")

    style_file = edit_folder / "style.json"
    if not style_file.exists():
        return

    # Plan
    run_cmd([py, str(style_sk / "plan.py"), str(style_file), str(captions_file)], cwd=str(edit_folder))

    # Render
    run_cmd([py, str(style_sk / "edit.py"), "render", str(edit_folder)], cwd=root_dir)

    # Update review round 2
    render_mp4 = edit_folder / "render.mp4"
    if render_mp4.exists():
        rev_script = ROOT / "plugins" / "ai-editor" / "lib" / "ai_editor" / "review.py"
        run_cmd([py, str(rev_script), str(edit_folder), "start", "--video", str(render_mp4), "--stage", "edit", "--transcript", str(words_file)], cwd=root_dir)
        print(f"[WORKER] Style render for {name} completed successfully!", flush=True)


def check_approved_cuts(root_dir):
    lib_edits = Path(root_dir) / "edits"
    if not lib_edits.exists():
        return
    for edit_folder in lib_edits.iterdir():
        if not edit_folder.is_dir():
            continue
        rj = edit_folder / "review.json"
        if not rj.exists():
            continue
        try:
            rdata = json.loads(rj.read_text(encoding="utf-8"))
            events = rdata.get("events", [])
            has_approve = any(e.get("type") == "approve" and e.get("stage") == "cut" for e in events)
            has_edit_render = (edit_folder / "render.mp4").exists()
            if has_approve and not has_edit_render:
                process_style_edit(edit_folder, root_dir)
        except Exception:
            pass


def parse_job_line(line):
    parts = shlex.split(line)
    if len(parts) < 2 or parts[0] != "JOB":
        return None, {}
    jtype = parts[1]
    args = {}
    for p in parts[2:]:
        if p.startswith("@"):
            args["handle"] = p[1:]
        elif "=" in p:
            k, v = p.split("=", 1)
            args[k] = v
        else:
            args[p] = True
    return jtype, args


def run_loop():
    print("[WORKER] FlashVeditor Auto-Worker running. Waiting for jobs...", flush=True)
    home_py = LIB / "home.py"
    py = sys.executable

    while True:
        try:
            res = subprocess.run([py, str(home_py), "wait"], capture_output=True, text=True)
            out = res.stdout.strip()
            if not out or out == "ALREADY":
                time.sleep(2)
                continue

            for line in out.splitlines():
                if line.startswith("JOB "):
                    print(f"[WORKER] Picked up: {line}", flush=True)
                    jtype, args = parse_job_line(line)
                    root_dir = args.get("root", "/library")
                    if jtype == "teardown":
                        process_teardown(args, root_dir)
                    elif jtype == "video":
                        process_video(args, root_dir)
                    elif jtype == "setup":
                        setup_py = ROOT / "plugins" / "ai-editor" / "skills" / "setup" / "scripts" / "setup.py"
                        run_cmd([py, str(setup_py), "install-all"], cwd=root_dir)
                        update_status("setup", done=True)

            check_approved_cuts("/library")
        except Exception as e:
            print(f"[WORKER ERROR] Loop exception: {e}", flush=True)
            time.sleep(2)


if __name__ == "__main__":
    run_loop()
