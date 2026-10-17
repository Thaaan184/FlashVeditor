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
                    elif jtype == "setup":
                        setup_py = ROOT / "plugins" / "ai-editor" / "skills" / "setup" / "scripts" / "setup.py"
                        run_cmd([py, str(setup_py), "install-all"], cwd=root_dir)
                        update_status("setup", done=True)
        except Exception as e:
            print(f"[WORKER ERROR] Loop exception: {e}", flush=True)
            time.sleep(2)


if __name__ == "__main__":
    run_loop()
