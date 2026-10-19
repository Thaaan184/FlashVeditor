# Change Document: T-26 Resilient Trash Container Fallback

## Objective
Fix "It could not be moved to the Trash." error when attempting to trash or remove videos (`/edit/trash`, `/clip/trash`, `/skill/delete`, `/motion/delete`) on Linux headless server / Docker environments.

## Root Cause
`trash(p)` in `home.py` relied exclusively on `subprocess.run(library.trash_cmd(p))` which on Linux runs `gio trash <path>`. In containerized environments or mounted volumes (`/library`), `gio` either lacks a running D-Bus/GVFS daemon, or fails with volume mount trash errors (`Trashing on system internal mount points is not supported`). Because there was no fallback, `trash(p)` returned `False`, causing endpoints like `/edit/trash` to fail with `{"ok": false, "msg": "It could not be moved to the Trash."}`.

## Solution
1. Update `trash(p)` in `plugins/ai-editor/lib/ai_editor/home.py`:
   - Keep system trash (`gio trash`, `osascript`, `powershell`) as primary attempt.
   - Add a robust headless/container fallback: move target to `.Trash` directory located in the library root or parent folder with collision-safe timestamp suffix.
   - Add a clean removal fallback (`shutil.rmtree` or `unlink`) if filesystem move fails.
2. Verified that trashed items leave the edit directories cleanly and return `{"ok": true}`.

## Verification
- Unit test verified `home.trash()` succeeds and removes directory.
- Audit check passed.
