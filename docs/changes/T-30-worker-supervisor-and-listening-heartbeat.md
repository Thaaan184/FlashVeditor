# Change Document: T-30 Auto-Worker Supervisor & Active Heartbeat

## Objective
Fix stalled background processing and web UI "Worker is idle" / "Notes sent" locking:
1. Add `update_heartbeats()` in `worker.py` to touch `.listening` in home and all active `/library/edits/*/review/` folders every iteration.
2. Ensure `review.py` and `home.py` reflect active listening status (`AI is listening`) without manual terminal intervention.
3. Add resilient auto-restart supervisor loop in `docker-entrypoint.sh` for `worker.py`.

Change-Doc: docs/changes/T-30-worker-supervisor-and-listening-heartbeat.md
Verdict: accept
