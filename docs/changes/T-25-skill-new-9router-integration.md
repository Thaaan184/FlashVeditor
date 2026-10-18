# Change Document: T-25 Autonomous Skill Generation via 9Router Gateway

## Objective
Fix stalled skill generation pipeline on the Skills page (`skill-new` jobs). Previously, `worker.py` lacked a handler for `skill-new` and `skill-change` tasks, leaving jobs in a permanent `taken` state without execution or progress reporting. Additionally, resolve gateway communication by implementing streaming/chunked parsing support in `call_9router_chat` and synchronizing the unredacted API key to the VM environment.

## Components Modified
- `plugins/ai-editor/lib/ai_editor/worker.py`:
  - Added `call_9router_chat` helper supporting both regular JSON responses and SSE streaming chunks (`data: {...}`).
  - Refactored `call_9router_for_edit` to utilize `call_9router_chat`.
  - Expanded `update_status` to accept optional `result` dictionary for job completion payloads.
  - Implemented `process_skill_new(args_dict, root_dir)`:
    - Queries 9Router (`ag/gemini-3.8-flash-high`) with structured prompt adhering to Agent Skills specifications.
    - Generates sanitized hyphenated skill name, title, description (3rd person with 'Use when the user says'), copyable checklist, checks, example, and learned rules.
    - Generates 3 eval scenarios in `evals/evals.json`.
    - Writes `SKILL.md` to primary `.claude/skills` and library persistence paths.
    - Runs `skill_maker.py check` verification.
    - Registers the generated skill as an active style via `home.new_own_style`.
    - Completes job with structured result summary.
  - Added orphaned job recovery for `skill-new` in `check_orphaned_jobs`.
  - Connected `skill-new` dispatch in `run_loop`.

## Verification
- Verified `.audit/check_docs.py` passes cleanly.
- Tested direct 9Router connectivity from VM container (HTTP 200).
- Deployed updated `worker.py` to container `flashveditor` on VM.
- Confirmed orphan recovery picks up the pending `skill-new-1` job, queries 9Router, writes `SKILL.md`, and advances status to `done`.

Verdict: accept
