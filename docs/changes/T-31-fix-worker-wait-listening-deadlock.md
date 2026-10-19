# Change Document: T-31 Fix Worker Wait Listening Deadlock

## Objective
Fix deadlock in `worker.py` where manual touch of `home() / ".listening"` in `update_heartbeats`
prevented `home.py wait` from running by tripping its internal `if listening(): return "ALREADY"` check.

## Changes
- In `worker.py`: Remove `h_beat = home.home() / ".listening"` touch from `update_heartbeats()`.
- Let `home.py wait` manage its own `.listening` lifecycle while keeping review studio heartbeats active.

Change-Doc: docs/changes/T-31-fix-worker-wait-listening-deadlock.md
Verdict: accept
