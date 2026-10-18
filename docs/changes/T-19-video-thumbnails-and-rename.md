# Change Document: T-19 Video Thumbnail Restoration and Rename Feature

## Objective
Restore visual video thumbnails on the "Your videos" dashboard list (resolving grey placeholder boxes) and add a video rename capability across the dashboard and review studio.

## Root Cause Analysis
1. In `plugins/ai-editor/lib/ai_editor/home.py`, `is_review_route` erroneously included `"/thumb"`. When the dashboard requested video card thumbnails (`/thumb?p=...`), requests were intercepted and proxied to `review.py` (which does not implement `/thumb`), returning HTTP 404 and leaving cards with default grey background (`#45403C`).
2. There was no rename endpoint or menu item for videos. Video labels in `review.json` could only be set during job creation.

## Technical Implementation
- `plugins/ai-editor/lib/ai_editor/home.py`:
  - Removed `"/thumb"` from `is_review_route`, allowing `home.py`'s native `thumb` handler (which calls `library.thumb()`) to process requests directly.
  - Appended auth token to `v.thumb` URLs to ensure frictionless authentication.
  - Added `POST /video/rename` endpoint that updates both `"name"` and `"label"` in the project's `review.json`.
- `plugins/ai-editor/lib/ai_editor/home.html`:
  - Added "Rename" with pencil icon to the video card 3-dots menu (`vMenu`).
  - Added inline `editRenameRow()` UI in `videos()` view allowing immediate rename and save.
- `plugins/ai-editor/lib/ai_editor/review.html`:
  - Made the header project title (`#name`) interactive and clickable with a rename prompt and automatic title refresh.

## Verification
- Verified `/thumb` endpoint serves valid JPEG images with HTTP 200.
- Verified dashboard renders video cards with blurred background and sharp thumbnail frames instead of grey placeholders.
- Verified renaming updates `review.json` and reflects on the UI.

Verdict: accept
