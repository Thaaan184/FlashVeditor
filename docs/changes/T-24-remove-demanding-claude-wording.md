# Change Document: T-24 Remove Demanding Claude Wording

## Objective
Neutralize rigid vendor-specific and demanding "Claude" phrasing across all user-facing interfaces, forms, modals, alerts, and helper scripts in accordance with user directive ("cari setiap sudut jangan terlalu claude demanding hilangkan kata kata itu"). Replace with neutral, model-agnostic terms ("the AI", "AI worker", "terminal", "system").

## Components Modified
- `plugins/ai-editor/lib/ai_editor/home.html`:
  - Neutralized input helper placeholders: "Claude keeps the lines..." -> "The AI keeps the lines...".
  - Neutralized research references: "Claude uses these before looking..." -> "The AI uses these before looking...".
  - Updated buttons and titles: "Change when Claude uses it" -> "Change when the AI uses it".
  - Neutralized skill and style combination copies: "Claude combines styles..." -> "The AI combines styles...".
  - Updated learned rules cards: "Rules Claude must follow" -> "Learned rules for this style".
  - Updated job status labels: "Waiting for Claude" -> "Waiting for AI Worker".
  - Updated fork and update notices: removed "Ask Claude Code: update my editor", replaced with clean update instructions.
  - Renamed function `connectClaude` to `connectWorker`.
- `plugins/ai-editor/lib/ai_editor/review.html`:
  - Neutralized draft feedback status: "Claude is working on this draft" -> "The AI is working on this draft".
  - Neutralized chat response attribution: "Claude: " -> "AI: ".
  - Neutralized step progress: "Claude is reading your notes..." -> "The AI is reading your notes...".
  - Neutralized timeout warning: "No word from Claude..." -> "No response from AI for a while...".
  - Neutralized feedback button labels: "Submit feedback to Claude" -> "Submit feedback".
  - Neutralized decision suggestions: "Let Claude decide" -> "Let AI decide", "Claude suggests" -> "AI suggests".
- `plugins/ai-editor/lib/ai_editor/ask.js`:
  - Replaced terminal prompt labels: "Claude needs you in the Terminal window" -> "AI needs your input".
  - Replaced secondary fallback button: "Answer in Claude Code instead" -> "Answer in Terminal instead".
- `plugins/ai-editor/lib/ai_editor/review.py`:
  - Updated HTTP 409 error messages from "Claude has this note now" / "Claude is working on this draft" to "AI is processing this note now" / "AI is working on this draft".
- `plugins/ai-editor/lib/ai_editor/toolhook.py`:
  - Updated interactive prompt question prefix from "Claude asked: " to "AI asked: ".
- `plugins/ai-editor/lib/ai_editor/launcher.py`, `custom.py`, `net.py`, `update.py`, `app.tsx`:
  - Replaced vendor-demanding prompts and certificate messages with neutral, professional terminal instructions.

## Verification
- Verified `.audit/check_docs.py` passes cleanly.
- Tested route test suite against Cloudflare endpoint: 21/21 PASS.
- Verified absence of demanding Claude strings in UI DOM and prompt surfaces.

Verdict: accept
