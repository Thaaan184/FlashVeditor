# Change Document: T-23 UI Rebranding to MEMASAK

## Objective
Rebrand the application user interface, sidebar, navigation, headers, favicons, window titles, worker logs, and documentation references from intermediate "FlashVeditor" to official product brand "MEMASAK" as requested by user.

## Components Modified
- `plugins/ai-editor/lib/ai_editor/home.html`:
  - Set `<title>MEMASAK</title>` and dynamic title computation `${ji.label} · MEMASAK`.
  - Replaced SVG favicon with sleek wok flame mark.
  - Set sidebar brand mark typography to `<b>MEMASAK</b>` and updated `PAN` SVG component to the stylized cooking pan with heat steam flame.
  - Updated onboarding texts and update cards to reference "MEMASAK".
- `plugins/ai-editor/lib/ai_editor/review.html`:
  - Updated `<title>Review · MEMASAK</title>`.
  - Set brand rail tile to `MEMASAK` with the new SVG logo.
  - Updated modal dialogs and aria-labels.
- `plugins/ai-editor/lib/ai_editor/home.py`:
  - Updated brand validation assertion in self-test suite to check for `<b>MEMASAK</b>`.
- `plugins/ai-editor/lib/ai_editor/taste.py`, `toolhook.py`, `custom.py`, `worker.py`:
  - Updated references and logs to "MEMASAK".
- `.audit/tasks/test_all_routes_proxy.py`:
  - Updated test assert to verify `b"MEMASAK" in body`.

## Verification
- Verified `.audit/check_docs.py` passes cleanly.
- Deployed files to VM Docker container and restarted `flashveditor`.
- Executed automated route test suite (21/21 PASS) and browser validation to confirm "MEMASAK" renders in header, document title, and sidebar.

Verdict: accept
