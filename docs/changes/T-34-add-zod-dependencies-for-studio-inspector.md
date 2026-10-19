# Change Document: T-34 Add Zod Dependencies for Studio Inspector

## Objective
Add `zod` and `@remotion/zod-types` to `package.json` dependencies so Remotion Studio bundles Zod into the client runtime and enables the interactive Props Inspector.

## Changes
- In `package.json`: Explicitly declare `"zod": "^3.22.4"` and `"@remotion/zod-types": "4.0.530"` in `dependencies`.

Change-Doc: docs/changes/T-34-add-zod-dependencies-for-studio-inspector.md
Verdict: accept
