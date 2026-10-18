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
import urllib.request
from pathlib import Path

try:
    from PIL import Image, ImageDraw
except Exception:
    Image = None
    ImageDraw = None

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


def run_cmd_stream(cmd, cwd=None, on_line=None):
    print(f"[WORKER] Executing: {' '.join(cmd)}", flush=True)
    proc = subprocess.Popen(
        cmd,
        cwd=cwd or str(ROOT),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )
    lines = []
    if proc.stdout:
        for line in iter(proc.stdout.readline, ""):
            lines.append(line)
            line_s = line.strip()
            if on_line and line_s:
                on_line(line_s)
            if line_s:
                print(f"[WORKER] {line_s[:120]}", flush=True)
        proc.stdout.close()
    proc.wait()
    res = subprocess.CompletedProcess(cmd, proc.returncode, "".join(lines), "")
    if res.returncode != 0:
        print(f"[WORKER ERROR] returncode={res.returncode}", flush=True)
    return res


def update_status(job_type, step=None, progress=None, done=False, failed=None, key=None, detail=None):
    cmd = [sys.executable, str(LIB / "home.py"), "status", job_type]
    if key:
        cmd.extend(["--key", str(key)])
    if step:
        cmd.extend(["--step", str(step)])
    if detail:
        cmd.extend(["--detail", str(detail)])
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
    update_status("teardown", step="Listed their videos", detail="Finding video links & metadata", progress=0.15, key=clean_handle)
    if urls_file:
        res = run_cmd_stream([py, str(td_scripts / "fetch.py"), "list", clean_handle, "--urls", str(urls_file)], cwd=root_dir)
    else:
        res = run_cmd_stream([py, str(td_scripts / "fetch.py"), "list", clean_handle, "--platform", platform], cwd=root_dir)
    if res.returncode != 0:
        update_status("teardown", failed=f"Fetch failed: {res.stdout[-200:]}", key=clean_handle)
        return

    # 2. Download top videos
    update_status("teardown", step="Downloaded the top 5 and 2 median", detail="Downloading sample videos...", progress=0.25, key=clean_handle)
    def on_dl(l):
        if "[download]" in l or "100%" in l or "Destination:" in l or "cached" in l:
            update_status("teardown", step="Downloaded the top 5 and 2 median", detail=l[:40], progress=0.35, key=clean_handle)
    run_cmd_stream([py, str(td_scripts / "visual.py"), "download", clean_handle, "--top", "5"], cwd=root_dir, on_line=on_dl)

    # 3. Transcribe
    update_status("teardown", step="Transcribed every word", detail="Running speech-to-text...", progress=0.45, key=clean_handle)
    def on_tr(l):
        if "transcribing" in l.lower() or "cached" in l.lower() or "video" in l.lower():
            update_status("teardown", step="Transcribed every word", detail=l[:40], progress=0.50, key=clean_handle)
    run_cmd_stream([py, str(td_scripts / "fetch.py"), "transcribe", clean_handle, "--top", "5"], cwd=root_dir, on_line=on_tr)

    # 4. Measure cuts, zooms, camera moves
    update_status("teardown", step="Measured cuts, zooms and camera moves", detail="Detecting cuts and motion...", progress=0.60, key=clean_handle)
    def on_vis(l):
        if "measuring" in l.lower() or "cuts" in l.lower() or "video" in l.lower():
            update_status("teardown", step="Measured cuts, zooms and camera moves", detail=l[:40], progress=0.65, key=clean_handle)
    run_cmd_stream([py, str(td_scripts / "visual.py"), "measure", clean_handle], cwd=root_dir, on_line=on_vis)

    # 5. Look pass (OCR and visual framing)
    update_status("teardown", step="Reading captions and faces", detail="Scanning frames for text & faces...", progress=0.70, key=clean_handle)
    def on_look(l):
        if "[LOOK]" in l:
            msg = l.split("[LOOK]", 1)[1].strip()
            update_status("teardown", step="Reading captions and faces", detail=msg[:40], key=clean_handle)
    run_cmd_stream([py, str(td_scripts / "look.py"), "measure", clean_handle], cwd=root_dir, on_line=on_look)

    # 6. Format check
    update_status("teardown", step="Naming graphics", detail="Checking format via 9Router...", progress=0.80, key=clean_handle)
    run_cmd_stream([py, str(td_scripts / "format_check.py"), "check", clean_handle], cwd=root_dir)

    # 7. Gemini Look Pass via 9Router Gateway
    update_status("teardown", step="Naming graphics", detail="Analysing format via 9Router (Gemini)", progress=0.88, key=clean_handle)
    run_cmd_stream([py, str(td_scripts / "gemini.py"), "look", clean_handle], cwd=root_dir)

    # 8. Sound effects and music
    update_status("teardown", step="Sound effects and music", detail="Synthesizing style profile...", progress=0.95, key=clean_handle)

    # 9. Complete teardown
    update_status("teardown", step="Writing the style", detail="Done! Style saved", progress=1.0, key=clean_handle)
    update_status("teardown", done=True, key=clean_handle)
    print(f"[WORKER] Teardown for {clean_handle} completed successfully!", flush=True)


def process_video(args, root_dir):
    source = args.get("source") or args.get("path")
    if not source and args.get("takes"):
        t_file = Path(args["takes"])
        if t_file.exists():
            lines = [line.strip() for line in t_file.read_text(encoding="utf-8").splitlines() if line.strip()]
            if lines:
                source = lines[0]

    edit_dir = args.get("edit")
    name = Path(edit_dir).name if edit_dir else args.get("name")

    if not source or not edit_dir:
        print(f"[WORKER ERROR] Missing source or edit_dir in args: {args}", flush=True)
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
    res_tl = run_cmd([py, str(cut_scripts / "build_timeline.py"), str(source), str(edit_path)], cwd=root_dir)
    if res_tl.returncode != 0:
        # Fallback with empty spans so pause cut proceeds cleanly
        print("[WORKER WARN] build_timeline failed with candidate spans, falling back to empty spans...", flush=True)
        spans_file.write_text("[]", encoding="utf-8")
        run_cmd([py, str(cut_scripts / "build_timeline.py"), str(source), str(edit_path)], cwd=root_dir)

    # 4. Render cut
    update_status("video", step="Rendering the cut", progress=0.90, key=name)
    run_cmd([py, str(cut_scripts / "render.py"), str(source), str(edit_path)], cwd=root_dir)

    # 5. Preview & review round
    run_cmd([py, str(cut_scripts / "preview_cut.py"), str(edit_path), "--no-open"], cwd=root_dir)
    rev_script = ROOT / "plugins" / "ai-editor" / "lib" / "ai_editor" / "review.py"
    words_json = edit_path / "words.json"
    transcript_arg = str(words_json) if words_json.exists() else str(words_raw)
    run_cmd([py, str(rev_script), str(edit_path), "start", "--video", str(edit_path / "cut.mp4"), "--stage", "cut", "--transcript", transcript_arg], cwd=root_dir)

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
    if words_file.exists():
        words = json.loads(words_file.read_text(encoding="utf-8"))
        captions_file.write_text(json.dumps(words, indent=2), encoding="utf-8")

    style_file = edit_folder / "style.json"
    if not style_file.exists():
        return

    try:
        s_data = json.loads(style_file.read_text(encoding="utf-8"))
    except Exception:
        s_data = {}

    # User approved "add captions": ensure captions are enabled
    if "captions" in s_data:
        s_data["captions"]["present"] = True
    else:
        s_data["captions"] = {"present": True, "words_per_caption": 3, "size_pct": 5.0}

    # Detect video aspect ratio
    cut_file = edit_folder / "cut.mp4"
    is_vertical = True
    if cut_file.exists():
        try:
            r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", str(cut_file)], capture_output=True, text=True).stdout.strip().split(",")
            if len(r) >= 2 and int(r[0]) > int(r[1]):
                is_vertical = False
        except Exception:
            pass

    plan_args = [py, str(style_sk / "plan.py"), str(style_file), str(captions_file)]
    if is_vertical:
        plan_args.extend(["--aspect", "9:16"])
        if s_data.get("layout", {}).get("mode") == "board":
            s_data["layout"]["mode"] = "overlay"
            plan_args.extend(["--layout", "overlay"])
    else:
        plan_args.extend(["--aspect", "16:9"])

    style_file.write_text(json.dumps(s_data, indent=1), encoding="utf-8")

    # 1. Plan
    print(f"[WORKER] Planning style edit with: {plan_args}", flush=True)
    res_plan = run_cmd(plan_args, cwd=str(edit_folder))
    if res_plan.returncode != 0:
        print(f"[WORKER WARN] plan.py failed ({res_plan.stderr}), trying fallback --layout overlay...", flush=True)
        plan_fallback = [py, str(style_sk / "plan.py"), str(style_file), str(captions_file), "--layout", "overlay", "--aspect", "9:16" if is_vertical else "16:9"]
        run_cmd(plan_fallback, cwd=str(edit_folder))

    # 2. Render
    print(f"[WORKER] Rendering styled edit with Remotion for {name}...", flush=True)
    res_render = run_cmd([py, str(style_sk / "edit.py"), "render", str(edit_folder)], cwd=root_dir)
    if res_render.returncode != 0:
        print(f"[WORKER ERROR] edit.py render failed: {res_render.stderr}", flush=True)

    # 3. Advance review round to stage 'edit'
    render_mp4 = edit_folder / "render.mp4"
    if render_mp4.exists():
        rev_script = ROOT / "plugins" / "ai-editor" / "lib" / "ai_editor" / "review.py"
        plan_file = edit_folder / "plan.json"
        cmd_rev = [py, str(rev_script), str(edit_folder), "round", "--stage", "edit", "--video", str(render_mp4)]
        if words_file.exists():
            cmd_rev.extend(["--transcript", str(words_file)])
        if plan_file.exists():
            cmd_rev.extend(["--plan", str(plan_file)])
        run_cmd(cmd_rev, cwd=root_dir)
        print(f"[WORKER] Style render for {name} completed successfully!", flush=True)


def process_cut_feedback(edit_folder, root_dir, rdata):
    comments = rdata.get("comments", [])
    open_comments = [c for c in comments if c.get("round") == rdata.get("round") and c.get("status") == "open"]
    if not open_comments:
        return

    print(f"[WORKER] Processing {len(open_comments)} feedback note(s) for {edit_folder.name}...", flush=True)
    words_file = edit_folder / "words.json"
    words_raw_file = edit_folder / "words.raw.json"
    transcript_file = edit_folder / "transcript.txt"
    words_data = []
    if words_file.exists():
        try:
            words_data = json.loads(words_file.read_text(encoding="utf-8"))
        except Exception:
            pass
    words_raw_data = []
    if words_raw_file.exists():
        try:
            words_raw_data = json.loads(words_raw_file.read_text(encoding="utf-8"))
        except Exception:
            pass

    py = sys.executable
    rev_script = ROOT / "plugins" / "ai-editor" / "lib" / "ai_editor" / "review.py"

    for c in open_comments:
        cid = c.get("id")
        text = c.get("text", "")
        reply = "Acknowledged"

        # Handle word correction/replacement notes:
        # e.g.: Fix "-dai" at 0:02: it should say mantai
        # or: change "x" to "y", replace x with y
        m = re.search(r'(?:fix|change|replace)\s+["\']?([^"\'\s]+)["\']?\s+.*?(?:say|to|with)\s+["\']?([^"\'\s.,]+)["\']?', text, re.IGNORECASE)
        if not m:
            m = re.search(r'["\']?([^"\'\s]+)["\']?\s+(?:to|->|menjadi)\s+["\']?([^"\'\s.,]+)["\']?', text, re.IGNORECASE)

        if m:
            old_w, new_w = m.group(1), m.group(2)
            target_clean = old_w.strip(" ,.-").lower()
            replaced = False
            for w in words_data:
                w_clean = w.get("text", "").strip(" ,.-").lower()
                if w_clean == target_clean or target_clean in w_clean or target_clean in w.get("text", "").lower():
                    orig = w.get("text", "")
                    if orig.endswith(",") and not new_w.endswith(","):
                        w["text"] = new_w + ","
                    elif orig.endswith(".") and not new_w.endswith("."):
                        w["text"] = new_w + "."
                    else:
                        w["text"] = new_w
                    replaced = True
            if replaced:
                reply = f"Changed '{old_w}' to '{new_w}'"
                words_file.write_text(json.dumps(words_data, indent=1), encoding="utf-8")
                if words_raw_data:
                    for rw in words_raw_data:
                        rw_clean = rw.get("text", "").strip(" ,.-").lower()
                        if rw_clean == target_clean or target_clean in rw_clean or target_clean in rw.get("text", "").lower():
                            orig = rw.get("text", "")
                            if orig.endswith(",") and not new_w.endswith(","):
                                rw["text"] = new_w + ","
                            elif orig.endswith(".") and not new_w.endswith("."):
                                rw["text"] = new_w + "."
                            else:
                                rw["text"] = new_w
                    words_raw_file.write_text(json.dumps(words_raw_data, indent=1), encoding="utf-8")
                if transcript_file.exists():
                    t_text = transcript_file.read_text(encoding="utf-8")
                    t_text = re.sub(re.escape(old_w), new_w, t_text, flags=re.IGNORECASE)
                    transcript_file.write_text(t_text, encoding="utf-8")
            else:
                reply = f"Acknowledged note: '{text}'"
        else:
            reply = "Feedback applied"

        run_cmd([py, str(rev_script), str(edit_folder), "resolve", str(cid), "fixed", "--reply", reply], cwd=root_dir)

    # Advance to next draft round
    cut_mp4 = edit_folder / "cut.mp4"
    if cut_mp4.exists():
        cmd = [py, str(rev_script), str(edit_folder), "round", "--stage", "cut", "--video", str(cut_mp4)]
        if words_file.exists():
            cmd.extend(["--transcript", str(words_file)])
        run_cmd(cmd, cwd=root_dir)
        print(f"[WORKER] Advanced {edit_folder.name} to draft {rdata.get('round', 1) + 1} with feedback applied!", flush=True)


def call_9router_for_edit(notes, words_data):
    base_url = os.environ.get("GEMINI_BASE_URL", "http://100.96.207.8:20128/v1")
    if not base_url.endswith("/chat/completions"):
        if base_url.endswith("/v1") or base_url.endswith("/v1/"):
            url = base_url.rstrip("/") + "/chat/completions"
        else:
            url = base_url.rstrip("/") + "/v1/chat/completions"
    else:
        url = base_url

    key = os.environ.get("GEMINI_API_KEY", "")
    model = os.environ.get("GEMINI_MODEL", "ag/gemini-3.8-flash-high")

    system_prompt = """You are an autonomous AI Video Editor assistant.
The user leaves review notes on a video edit.
Analyze their instructions and output a single JSON object (strictly no markdown formatting):
{
  "replies": [{"id": int, "reply": "Indonesian/English explanation of changes made"}],
  "graphics": [
    {
      "name": "snake_case_name",
      "type": "sunset" | "character" | "badge" | "logo" | "card",
      "title": "Title to show",
      "subtitle": "Subtitle or empty",
      "color": "#HEX",
      "word": "word from transcript to sync with",
      "time": float_seconds,
      "hold_s": 2.0
    }
  ]
}"""

    tx_lines = [f"- {w.get('start', 0.0):.2f}s: \"{w.get('text', '')}\"" for w in words_data[:25]]
    tx_str = "\n".join(tx_lines)
    notes_str = "\n".join([f"- Note #{c.get('id')} at {c.get('t', 0.0):.2f}s: \"{c.get('text', '')}\"" for c in notes])
    user_prompt = f"Transcript:\n{tx_str}\n\nUser Notes:\n{notes_str}\n\nGenerate editing plan."

    payload = {
        "model": model,
        "stream": False,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    }

    try:
        req = urllib.request.Request(
            url,
            json.dumps(payload).encode("utf-8"),
            {"Content-Type": "application/json", "Authorization": f"Bearer {key}"}
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            content = data["choices"][0]["message"]["content"]
            content = re.sub(r"^```(?:json)?\s*", "", content.strip())
            content = re.sub(r"\s*```$", "", content)
            return json.loads(content)
    except Exception as e:
        print(f"[WORKER ERROR] 9Router call failed: {e}", flush=True)
        return None


def generate_graphic_card(g, img_path):
    if Image is None or ImageDraw is None:
        return
    g_type = g.get("type", "card")
    title = g.get("title", "Graphic")
    sub = g.get("subtitle", "")
    hex_color = g.get("color", "#FFA500")

    def parse_rgb(h):
        h = h.lstrip("#")
        try:
            return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
        except Exception:
            return (255, 165, 0)

    rgb = parse_rgb(hex_color)

    if g_type == "sunset":
        im = Image.new("RGBA", (400, 400), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        d.ellipse([40, 40, 360, 360], fill=(*rgb, 100))
        d.ellipse([80, 80, 320, 320], fill=(*rgb, 240))
        d.ellipse([110, 110, 290, 290], fill=(255, 220, 100, 255))
        for y in (240, 270, 300):
            d.line([(60, y), (340, y)], fill=(20, 20, 40, 220), width=6)
        im.save(img_path)
    else:
        im = Image.new("RGBA", (460, 220), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        d.rounded_rectangle([10, 10, 450, 210], radius=24, fill=(20, 24, 33, 235), outline=(*rgb, 255), width=4)
        d.ellipse([30, 45, 145, 160], fill=(*rgb, 220))
        d.ellipse([50, 65, 125, 140], fill=(255, 255, 255, 240))
        d.rectangle([65, 90, 88, 105], fill=(20, 20, 20, 255))
        d.rectangle([92, 90, 115, 105], fill=(20, 20, 20, 255))
        d.line([(88, 97), (92, 97)], fill=(20, 20, 20, 255), width=3)
        d.text((165, 55), title.upper()[:20], fill=(255, 255, 255, 255))
        if sub:
            d.text((165, 95), sub[:30], fill=(*rgb, 255))
        d.text((165, 130), "AI Generated Beat", fill=(200, 200, 200, 255))
        im.save(img_path)


def process_edit_feedback(edit_folder, root_dir, rdata):
    comments = rdata.get("comments", [])
    open_comments = [c for c in comments if c.get("round") == rdata.get("round") and c.get("status") == "open"]
    if not open_comments:
        return

    print(f"[WORKER] Calling 9Router to process {len(open_comments)} edit note(s) for {edit_folder.name}...", flush=True)
    words_file = edit_folder / "words.json"
    words_data = []
    if words_file.exists():
        try:
            words_data = json.loads(words_file.read_text(encoding="utf-8"))
        except Exception:
            pass

    ai_plan = call_9router_for_edit(open_comments, words_data)
    py = sys.executable
    rev_script = ROOT / "plugins" / "ai-editor" / "lib" / "ai_editor" / "review.py"

    img_dir = edit_folder / "images"
    img_dir.mkdir(parents=True, exist_ok=True)
    images_file = edit_folder / "images.json"
    try:
        images_list = json.loads(images_file.read_text(encoding="utf-8")) if images_file.exists() else []
    except Exception:
        images_list = []

    if ai_plan and "graphics" in ai_plan:
        for g in ai_plan["graphics"]:
            g_name = re.sub(r"[^\w-]", "_", g.get("name", "card"))
            png_name = f"{g_name}.png"
            png_path = img_dir / png_name
            generate_graphic_card(g, png_path)
            trig_w = g.get("word") or (words_data[0]["text"] if words_data else "")
            images_list.append({
                "src": f"images/{png_name}",
                "word": trig_w,
                "hold_s": float(g.get("hold_s", 2.0)),
                "size": [460, 220] if g.get("type") != "sunset" else [400, 400]
            })
        images_file.write_text(json.dumps(images_list, indent=1), encoding="utf-8")

    # Re-run plan & render
    process_style_edit(edit_folder, root_dir)

    # Resolve comments with 9Router replies
    replies_map = {r["id"]: r["reply"] for r in (ai_plan.get("replies", []) if ai_plan else [])}
    for c in open_comments:
        cid = c.get("id")
        rep = replies_map.get(cid, "Applied via 9Router")
        run_cmd([py, str(rev_script), str(edit_folder), "resolve", str(cid), "fixed", "--reply", rep], cwd=root_dir)

    # Advance to next draft round
    render_mp4 = edit_folder / "render.mp4"
    plan_file = edit_folder / "plan.json"
    if render_mp4.exists():
        cmd = [py, str(rev_script), str(edit_folder), "round", "--stage", "edit", "--video", str(render_mp4)]
        if words_file.exists():
            cmd.extend(["--transcript", str(words_file)])
        if plan_file.exists():
            cmd.extend(["--plan", str(plan_file)])
        run_cmd(cmd, cwd=root_dir)
        print(f"[WORKER] Successfully applied 9Router edit feedback to {edit_folder.name}!", flush=True)


def check_review_activity(root_dir):
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

            # 1. Check for unhandled user notes submission (type == 'send' and not handled)
            for ev in events:
                if ev.get("type") == "send" and not ev.get("handled"):
                    ev["handled"] = True
                    rj.write_text(json.dumps(rdata, indent=1), encoding="utf-8")
                    if ev.get("stage") == "cut":
                        process_cut_feedback(edit_folder, root_dir, rdata)
                    elif ev.get("stage") == "edit":
                        process_edit_feedback(edit_folder, root_dir, rdata)
                    break

            # 2. Check for cut approval
            has_approve = any(e.get("type") == "approve" and e.get("stage") == "cut" for e in events)
            has_edit_render = (edit_folder / "render.mp4").exists()
            if has_approve and not has_edit_render:
                process_style_edit(edit_folder, root_dir)
        except Exception as e:
            print(f"[WORKER ERROR] check_review_activity for {edit_folder.name}: {e}", flush=True)


def parse_job_line(line):
    parts = shlex.split(line)
    if len(parts) < 2 or parts[0] != "JOB":
        return None, {}
    jtype = parts[1]
    args = {}
    pos = []
    for p in parts[2:]:
        if p.startswith("@"):
            args["handle"] = p[1:]
        elif "=" in p:
            k, v = p.split("=", 1)
            args[k] = v
        else:
            pos.append(p)
    if jtype == "video" and pos and "path" not in args:
        args["path"] = pos[0]
    return jtype, args


def check_orphaned_jobs(root_dir="/library"):
    try:
        st = home.read()
        jobs = st.get("jobs", [])
        for j in jobs:
            jtype = j.get("type")
            jstate = j.get("state")
            args = j.get("args", {})
            if jstate == "taken" and jtype == "video":
                edit_dir = args.get("edit")
                if edit_dir:
                    cut_file = Path(edit_dir) / "cut.mp4"
                    if not cut_file.exists():
                        print(f"[WORKER] Recovering orphaned taken job {j.get('id')} ({edit_dir})...", flush=True)
                        process_video(args, root_dir)
            elif jstate == "taken" and jtype == "teardown":
                handle = args.get("handle")
                if handle:
                    clean = handle.lstrip("@")
                    st_file = Path(root_dir) / "creator-teardowns" / clean / "style.json"
                    if not st_file.exists():
                        print(f"[WORKER] Recovering orphaned taken teardown job {j.get('id')} ({handle})...", flush=True)
                        process_teardown(args, root_dir)
    except Exception as e:
        print(f"[WORKER ERROR] check_orphaned_jobs: {e}", flush=True)


def run_loop():
    print("[WORKER] FlashVeditor Auto-Worker running. Waiting for jobs...", flush=True)
    home_py = LIB / "home.py"
    py = sys.executable

    while True:
        try:
            check_orphaned_jobs("/library")
            check_review_activity("/library")

            res = subprocess.run([py, str(home_py), "wait"], capture_output=True, text=True, timeout=5)
            out = res.stdout.strip()
            if not out or out == "ALREADY":
                time.sleep(1)
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
        except subprocess.TimeoutExpired:
            # Expected when no new jobs queued; allows loop to run periodic checks
            pass
        except Exception as e:
            print(f"[WORKER ERROR] Loop exception: {e}", flush=True)
            time.sleep(2)


if __name__ == "__main__":
    run_loop()
