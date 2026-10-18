# Change Document: T-22 UI Rebranding to FlashVeditor

## Objective
Rebrand the user interface, sidebar, navigation, headers, favicons, window titles, and documentation references from legacy upstream "cooked." to "FlashVeditor". Replace the old cooking-pan icon with a sleek, modern lightning/film logo mark.

## Components Modified
- `plugins/ai-editor/lib/ai_editor/home.html`:
  - Replaced `<title>` and window title computation to "FlashVeditor".
  - Replaced SVG favicon with sleek dark lightning vector icon.
  - Replaced `PAN` icon generator and static brand markup to FlashVeditor brand mark and typography (`<b>FlashVeditor</b>`).
  - Updated onboarding and update card copy to reference FlashVeditor.
- `plugins/ai-editor/lib/ai_editor/review.html`:
  - Updated `<title>` to "Review · FlashVeditor".
  - Updated SVG favicon and navigation rail brand tile to FlashVeditor logo mark.
  - Updated navigation aria-labels and update prompt modal dialogs.
- `plugins/ai-editor/lib/ai_editor/home.py`:
  - Updated brand validation assertion in self-test suite to check for `<b>FlashVeditor</b>`.
- `plugins/ai-editor/lib/ai_editor/taste.py`, `toolhook.py`, `custom.py`:
  - Replaced internal mentions of "cooked." with "FlashVeditor".

## Verification
- Verified `.audit/check_docs.py` passes cleanly.
- Deployed files to VM Docker container and restarted `flashveditor`.
- Executed automated route test suite and browser validation to confirm "FlashVeditor" renders in header, document title, and sidebar.

Verdict: accept
