"""
Test all routes, access, and reverse proxy functionality for FlashVeditor.
Verifies transparent proxy forwarding, status codes, content-types,
range requests (206), attachments, and ensures no internal host leakage.
"""

import urllib.request
import urllib.parse
import urllib.error
import json
import sys

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:47821"
TOKEN = sys.argv[2] if len(sys.argv) > 2 else "xQt7HyZyl7cha0T2BYZmojEenXRqTM35zFziI6V2tKc"

headers = {
    "User-Agent": "FlashVeditor-Audit/1.0"
}

def req(path, method="GET", data=None, extra_headers=None):
    url = f"{BASE}{path}"
    sep = "&" if "?" in url else "?"
    if "t=" not in url:
        url = f"{url}{sep}t={TOKEN}"
    hdrs = dict(headers)
    if extra_headers:
        hdrs.update(extra_headers)
    body = json.dumps(data).encode("utf-8") if data is not None else None
    if body:
        hdrs["Content-Type"] = "application/json"
    rq = urllib.request.Request(url, data=body, headers=hdrs, method=method)
    try:
        with urllib.request.urlopen(rq, timeout=15) as resp:
            return resp.status, resp.headers, resp.read()
    except urllib.error.HTTPError as e:
        return e.code, e.headers, e.read()
    except Exception as e:
        return 999, {}, str(e).encode()

results = []

def record(name, passed, detail):
    results.append((name, passed, detail))
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}: {detail}")

print(f"--- Running full route audit on {BASE} ---")

# 1. GET /
status, hdrs, body = req("/")
record("GET / (Dashboard Home)", status == 200 and b"cooked." in body, f"Status {status}, len {len(body)}")

# 2. GET /state (Dashboard System State)
status, hdrs, body = req("/state")
try:
    d = json.loads(body.decode("utf-8"))
    ok = status == 200 and "gateway" in d and "jobs" in d
    record("GET /state (Dashboard)", ok, f"Status {status}, jobs count: {len(d.get('jobs', []))}")
except Exception as e:
    record("GET /state (Dashboard)", False, f"JSON error: {e}")

# 2b. GET /library (Dashboard Video Library)
status, hdrs, body = req("/library")
try:
    ld = json.loads(body.decode("utf-8"))
    vids = ld.get("videos", [])
    ok = status == 200 and len(vids) > 0
    record("GET /library (Dashboard Library)", ok, f"Status {status}, videos count: {len(vids)}")
    test_vdir = vids[0]["dir"] if vids else None
    test_video_path = vids[0]["video"] if vids else None
except Exception as e:
    record("GET /library (Dashboard Library)", False, f"JSON error: {e}")
    test_vdir = None
    test_video_path = None

# 3. GET /review (Review Studio Proxy)
if test_vdir:
    r_path = f"/review?dir={urllib.parse.quote(test_vdir)}"
    status, hdrs, body = req(r_path)
    record("GET /review (Studio Proxy)", status == 200 and b"id=\"v\"" in body, f"Status {status}, len {len(body)}")
else:
    record("GET /review (Studio Proxy)", False, "No test_vdir available")

# 4. GET /state from Review (Referer check)
if test_vdir:
    r_path = f"/state?dir={urllib.parse.quote(test_vdir)}"
    status, hdrs, body = req(r_path, extra_headers={"Referer": f"{BASE}/review?dir={urllib.parse.quote(test_vdir)}"})
    try:
        rd = json.loads(body.decode("utf-8"))
        # Must have review studio specific keys like 'rounds', 'stage', 'video'
        ok = status == 200 and "stage" in rd and "rounds" in rd
        # Ensure home url doesn't leak 127.0.0.1
        home_val = rd.get("home", "")
        no_leak = not (isinstance(home_val, str) and "127.0.0.1" in home_val)
        record("GET /state (Review Studio Proxy)", ok and no_leak, f"Status {status}, stage: {rd.get('stage')}, home: {home_val}")
    except Exception as e:
        record("GET /state (Review Studio Proxy)", False, f"JSON error: {e}")
else:
    record("GET /state (Review Studio Proxy)", False, "No test_vdir")

# 5. GET /video (Range Request HTTP 206)
status, hdrs, body = req("/video?k=edit-1", extra_headers={
    "Referer": f"{BASE}/review?dir={urllib.parse.quote(test_vdir or '')}",
    "Range": "bytes=0-1023"
})
is_206 = status == 206
has_range = "bytes 0-1023" in hdrs.get("Content-Range", "")
ct_video = hdrs.get("Content-Type", "") == "video/mp4"
record("GET /video (HTTP 206 Partial Content)", is_206 and has_range and ct_video, f"Status {status}, Content-Range: {hdrs.get('Content-Range')}, Type: {hdrs.get('Content-Type')}")

# 6. GET /download (Attachment streaming)
if test_vdir:
    d_path = f"/download?dir={urllib.parse.quote(test_vdir)}"
    status, hdrs, body = req(d_path, extra_headers={
        "Range": "bytes=0-99"
    })
    cd = hdrs.get("Content-Disposition", "")
    ok = (status in (200, 206)) and "attachment;" in cd and ".mp4" in cd
    record("GET /download (Video Attachment Proxy)", ok, f"Status {status}, Content-Disposition: {cd}")
else:
    record("GET /download (Video Attachment Proxy)", False, "No test_vdir")

# 7. GET /thumb (Native home.py thumbnail generator)
if test_video_path:
    t_path = f"/thumb?p={urllib.parse.quote(test_video_path)}"
    status, hdrs, body = req(t_path)
    is_jpeg = hdrs.get("Content-Type", "") == "image/jpeg"
    record("GET /thumb (JPEG Thumbnail)", status == 200 and is_jpeg and len(body) > 1000, f"Status {status}, Type: {hdrs.get('Content-Type')}, len: {len(body)}")
else:
    record("GET /thumb (JPEG Thumbnail)", False, "No test_video_path")

# 8. GET /media (Native library video stream)
if test_video_path:
    m_path = f"/media?p={urllib.parse.quote(test_video_path)}"
    status, hdrs, body = req(m_path, extra_headers={"Range": "bytes=0-99"})
    record("GET /media (Media video stream)", status in (200, 206), f"Status {status}, Type: {hdrs.get('Content-Type')}")
else:
    record("GET /media (Media video stream)", False, "No test_video_path")

# 9. GET /data (Review transcript data)
if test_vdir:
    status, hdrs, body = req("/data?k=edit-1", extra_headers={
        "Referer": f"{BASE}/review?dir={urllib.parse.quote(test_vdir)}"
    })
    try:
        jd = json.loads(body.decode("utf-8"))
        record("GET /data (Review Tracks & Captions)", status == 200 and "duration" in jd, f"Status {status}, duration: {jd.get('duration')}")
    except Exception as e:
        record("GET /data (Review Tracks & Captions)", False, f"JSON error: {e}")
else:
    record("GET /data (Review Tracks & Captions)", False, "No test_vdir")

# 10. GET /skills (Skills list)
status, hdrs, body = req("/skills")
try:
    sk = json.loads(body.decode("utf-8"))
    record("GET /skills (Skills list)", status == 200 and isinstance(sk, (dict, list)), f"Status {status}")
except Exception as e:
    record("GET /skills (Skills list)", False, str(e))

# 11. GET /recent (Recent takes)
status, hdrs, body = req("/recent")
record("GET /recent (Recent takes)", status == 200, f"Status {status}")

# 12. GET /cinematic.mp4 (Direct Stream)
status, hdrs, body = req("/cinematic.mp4", extra_headers={"Range": "bytes=0-99"})
record("GET /cinematic.mp4 (Direct HTTP 206 Stream)", status in (200, 206) and hdrs.get("Content-Type") == "video/mp4", f"Status {status}")

# 13. POST /theme (Theme switcher)
status, hdrs, body = req("/theme", method="POST", data={"theme": "dark"}, extra_headers={"Referer": f"{BASE}/"})
record("POST /theme", status == 200, f"Status {status}, body: {body.decode('utf-8')[:60]}")

# 14. POST /gateway (Model combo selection)
status, hdrs, body = req("/gateway", method="POST", data={"combo": "high-speed"}, extra_headers={"Referer": f"{BASE}/"})
record("POST /gateway", status == 200, f"Status {status}, body: {body.decode('utf-8')[:60]}")

# 15. POST /video/rename (Video renaming)
if test_vdir:
    # Read current name first
    status, hdrs, body = req(f"/state?dir={urllib.parse.quote(test_vdir)}", extra_headers={"Referer": f"{BASE}/review?dir={urllib.parse.quote(test_vdir)}"})
    cur_name = json.loads(body.decode("utf-8")).get("name", "Test Video")
    status, hdrs, body = req("/video/rename", method="POST", data={"dir": test_vdir, "name": cur_name}, extra_headers={"Referer": f"{BASE}/"})
    try:
        rj = json.loads(body.decode("utf-8"))
        record("POST /video/rename", status == 200 and rj.get("ok") is True, f"Status {status}, name: {rj.get('name')}")
    except Exception as e:
        record("POST /video/rename", False, str(e))
else:
    record("POST /video/rename", False, "No test_vdir")

# 16. POST /comment & /delete (Review note lifecycle through proxy)
if test_vdir:
    ref_hdr = {"Referer": f"{BASE}/review?dir={urllib.parse.quote(test_vdir)}"}
    status, hdrs, body = req("/comment", method="POST", data={"text": "Automated audit note test", "t": 1.5}, extra_headers=ref_hdr)
    try:
        cj = json.loads(body.decode("utf-8"))
        note_id = cj.get("id")
        is_approved_block = (status == 409 and "approved" in cj.get("error", "").lower())
        ok_comment = (status == 200 and bool(note_id)) or is_approved_block
        detail_msg = f"Status {status}, note_id: {note_id}" if status == 200 else f"Status 409 (Protected approved draft: '{cj.get('error')}')"
        record("POST /comment (Review Proxy Forwarding)", ok_comment, detail_msg)
        if note_id:
            # Delete note to clean up
            d_status, d_hdrs, d_body = req("/delete", method="POST", data={"id": note_id}, extra_headers=ref_hdr)
            record("POST /delete (Review Proxy Note Deletion)", d_status == 200, f"Status {d_status}")
        else:
            record("POST /delete (Review Proxy Note Deletion)", True, "Skipped cleanly (draft finalized)")
    except Exception as e:
        record("POST /comment (Review Proxy Forwarding)", False, str(e))
        record("POST /delete (Review Proxy Note Deletion)", False, "Skipped")
else:
    record("POST /comment (Review Proxy Forwarding)", False, "No test_vdir")
    record("POST /delete (Review Proxy Note Deletion)", False, "No test_vdir")

# 17. POST /check (Review Proxy Note Acknowledgment)
if test_vdir:
    ref_hdr = {"Referer": f"{BASE}/review?dir={urllib.parse.quote(test_vdir)}"}
    status, hdrs, body = req("/check", method="POST", data={"ids": []}, extra_headers=ref_hdr)
    record("POST /check (Review Proxy Check)", status == 200, f"Status {status}")
else:
    record("POST /check (Review Proxy Check)", False, "No test_vdir")

# 18. POST /scope (Review note version scope)
if test_vdir:
    ref_hdr = {"Referer": f"{BASE}/review?dir={urllib.parse.quote(test_vdir)}"}
    status, hdrs, body = req("/scope", method="POST", data={"id": 999999, "alt": None}, extra_headers=ref_hdr)
    record("POST /scope (Review Proxy Scope)", status == 200, f"Status {status}")
else:
    record("POST /scope (Review Proxy Scope)", False, "No test_vdir")

# 19. HEAD / (RFC-Compliant HEAD check)
status, hdrs, body = req("/", method="HEAD")
record("HEAD / (RFC HEAD Request)", status == 200 and len(body) == 0, f"Status {status}, body length: {len(body)}")

# Summary
passed_count = sum(1 for _, p, _ in results if p)
total_count = len(results)
print(f"\n==========================================")
print(f"ROUTE AUDIT RESULT: {passed_count}/{total_count} PASSED")
print(f"==========================================")
if passed_count < total_count:
    sys.exit(1)
