# Change Document: T-18 Download Route Proxy and Client Fallback Fix

## Objective
Fix the review studio and dashboard Download button so that clicking Download triggers an immediate, seamless video file download instead of stalling or returning a 404 error through reverse proxy tunnels.

## Root Cause Analysis
1. In `plugins/ai-editor/lib/ai_editor/home.py`, `is_review_route` did not include `/download`. Requests to `/download` routed to the home server fallback handler, returning HTTP 404.
2. In `home.py`, the proxy stream branch (`path_only in ("/video", "/cut.mp4")`) did not include `/download`, preventing large binary responses and `Content-Disposition` headers from being streamed directly to the browser.
3. In `plugins/ai-editor/lib/ai_editor/review.html`, `$('dl').href` was built without passing query parameters (`dir` and `t`). When `fetch()` or `location.href` requested `/download`, target project context was missing in environments with strict referer policies.
4. In `review.html`, download availability was artificially constrained to `fin` only, preventing downloading the rendered draft in edit stage before manual approval.
5. In `plugins/ai-editor/lib/ai_editor/home.html`, the video card 3-dots menu restricted Download to `v.status === 'done'`, omitting ready drafts that have valid `media` available.

## Technical Implementation
- `plugins/ai-editor/lib/ai_editor/home.py`:
  - Added `/download` to `is_review_route`.
  - Added `/download` to streaming file proxy paths (`path_only in ("/video", "/cut.mp4", "/download")`).
- `plugins/ai-editor/lib/ai_editor/review.html`:
  - Ensured `$('dl').href` includes `dir` and auth token from `location.search`.
  - Unlocked `$('dl').hidden` for ready edit drafts (`fin || (S.stage === 'edit' && S.video)`).
  - Enhanced download event listener with HTTP 200/206 status check and fast fallback to `location.href`.
- `plugins/ai-editor/lib/ai_editor/home.html`:
  - Allowed download in video card menu whenever `v.media` exists and appended auth token.

## Verification
- Verified `/download` via proxy returns HTTP 200 / 206 with `Content-Disposition: attachment; filename="...mp4"`.
- Verified in browser harness: clicking Download button triggers file stream without error toasts.

Verdict: accept
