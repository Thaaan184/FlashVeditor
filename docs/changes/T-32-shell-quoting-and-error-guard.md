# Change Document: T-32 Shell Quoting and Error Guard in Job Pipeline

## Objective
Fix shell argument splitting bugs when video paths contain spaces, and add defensive validation
in `worker.py` to stop pipelines if transcription fails.

## Changes
- In `home.py`: Wrap all job line paths in `shlex.quote`.
- In `worker.py`: Parse all positional arguments into full source path.
- In `worker.py`: Abort `process_video` gracefully if `words_raw` was not generated.

Change-Doc: docs/changes/T-32-shell-quoting-and-error-guard.md
Verdict: accept
