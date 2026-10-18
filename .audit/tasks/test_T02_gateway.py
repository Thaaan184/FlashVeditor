#!/usr/bin/env python3
"""Audit test for T-02: verifies mock server gateway routing and real 9Router call."""
import http.server
import json
import os
import sqlite3
import subprocess
import sys
import tempfile
import threading
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
SCRIPTS = REPO / "plugins/creator-teardown/skills/creator-teardown/scripts"
sys.path.insert(0, str(SCRIPTS))

recorded_requests = []


class MockHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("content-length", 0))
        body = self.rfile.read(length) if length else b""
        recorded_requests.append({
            "path": self.path,
            "headers": dict(self.headers),
            "body_snippet": body[:120].decode(errors="replace")
        })
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        resp_data = {
            "candidates": [{
                "content": {
                    "parts": [{"text": json.dumps({
                        "font_class": "grotesk",
                        "closest_google_font": "Inter",
                        "font_confidence": "high",
                        "weight_class": "bold",
                        "caption_case": "upper",
                        "caption_animation": "pop",
                        "graphics_style": ["real screenshots"],
                        "motion_personality": "snappy",
                        "transitions": ["hard cut"],
                        "broll_types": ["screen recording"],
                        "not_generic": ["custom yellow highlight"]
                    })}]
                }
            }],
            "usageMetadata": {"promptTokenCount": 1234}
        }
        self.wfile.write(json.dumps(resp_data).encode())

    def log_message(self, format, *args):
        pass


def test_mock_gateway():
    print("=== TEST 1: MOCK SERVER GATEWAY ROUTING ===")
    orig_env = dict(os.environ)
    server = http.server.HTTPServer(("127.0.0.1", 0), MockHandler)
    port = server.server_address[1]
    th = threading.Thread(target=server.serve_forever, daemon=True)
    th.start()

    os.environ["GEMINI_BASE_URL"] = f"http://127.0.0.1:{port}/"  # test trailing slash strip
    os.environ["GEMINI_API_VERSION"] = "v1beta"
    os.environ["GEMINI_AUTH_MODE"] = "bearer"
    os.environ["GEMINI_MODEL"] = "test-model-audit"

    # Reload gemini module with new env vars
    if "gemini" in sys.modules:
        del sys.modules["gemini"]
    import gemini

    # Verify helper contracts
    assert gemini.BASE == f"http://127.0.0.1:{port}", f"Base was {gemini.BASE}"
    assert gemini.api_url("foo/bar") == f"http://127.0.0.1:{port}/v1beta/foo/bar"
    assert gemini.upload_url() == f"http://127.0.0.1:{port}/upload/v1beta/files"
    print(f"[OK] Base URL normalized: {gemini.BASE}")
    print(f"[OK] Upload URL: {gemini.upload_url()}")

    # Call post
    test_key = "test_bearer_token_xyz999"
    resp = gemini.post(test_key, {"prompt": "ping"})
    assert resp is not None, "Expected valid response from mock server"
    parsed, tokens = gemini.parse(resp)
    assert parsed["closest_google_font"] == "Inter"
    assert tokens == 1234

    # Verify recorded request
    assert len(recorded_requests) == 1, f"Recorded: {len(recorded_requests)}"
    req = recorded_requests[0]
    assert req["path"] == "/v1beta/models/test-model-audit:generateContent", f"Path was {req['path']}"
    assert next((v for k, v in req["headers"].items() if k.lower() == "authorization"), None) == f"Bearer {test_key}"
    print(f"[OK] Mock received path: {req['path']}")
    print(f"[OK] Mock received Auth header: {req['headers'].get('Authorization') or req['headers'].get('authorization')}")
    print(f"[OK] Mock parsed look output: {parsed['closest_google_font']}, font_confidence={parsed['font_confidence']}")
    server.shutdown()
    for k in ("GEMINI_BASE_URL", "GEMINI_API_VERSION", "GEMINI_AUTH_MODE", "GEMINI_MODEL", "GEMINI_FRAME_SAMPLING"):
        if k in orig_env:
            os.environ[k] = orig_env[k]
        else:
            os.environ.pop(k, None)
    print("MOCK TEST: PASSED")


def test_real_9router_call():
    print("\n=== TEST 2: REAL 9ROUTER GATEWAY CALL ===")
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        db_path = Path("/home/ids/.9router/db/data.sqlite")
        if db_path.exists():
            conn = sqlite3.connect(str(db_path))
            key = conn.cursor().execute("SELECT key FROM apiKeys WHERE name='Default Key';").fetchone()[0]
            conn.close()

    if not key:
        print("[SKIP] No 9Router key available for real test")
        return

    os.environ["GEMINI_BASE_URL"] = os.environ.get("GEMINI_BASE_URL", "http://localhost:20128")
    os.environ["GEMINI_API_VERSION"] = os.environ.get("GEMINI_API_VERSION", "v1beta")
    os.environ["GEMINI_AUTH_MODE"] = "bearer"
    os.environ["GEMINI_MODEL"] = os.environ.get("GEMINI_MODEL", "ag/gemini-3.8-flash-high")
    os.environ["GEMINI_FRAME_SAMPLING"] = "1"

    if "gemini" in sys.modules:
        del sys.modules["gemini"]
    import gemini

    # Generate a small 2-second vertical test clip
    with tempfile.TemporaryDirectory() as d:
        clip = Path(d) / "tiny.mp4"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "testsrc=s=480x854:d=2:r=30",
                        "-c:v", "libx264", "-pix_fmt", "yuv420p", str(clip)], check=True)
        raw_frames = gemini.video_bytes(clip)
        print(f"[INFO] Generated test video frames: {len(raw_frames)} frames")
        payload = gemini.body(raw_frames, fps=1.0)
        print(f"[INFO] Calling 9Router model {gemini.MODEL} at {gemini.API.format(m=gemini.MODEL)}...")
        resp, used_model = gemini.call(key, payload)
        print(f"[OK] 9Router responded with model: {used_model}")
        look, tokens = gemini.parse(resp)
        print(f"[OK] Parsed look dict from 9Router: font={look.get('closest_google_font')}, style={look.get('graphics_style')}, tokens={tokens}")
        print(f"[OK] Full parsed response keys: {list(look.keys())}")
        assert "font_class" in look
        assert "motion_personality" in look
        assert tokens > 0
    print("REAL 9ROUTER TEST: PASSED")


if __name__ == "__main__":
    test_mock_gateway()
    test_real_9router_call()
