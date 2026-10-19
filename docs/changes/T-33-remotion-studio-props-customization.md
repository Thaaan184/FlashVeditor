# Change Document: T-33 Remotion Studio Props Customization

## Objective
Enable full modular video editing per part in Remotion Studio via Zod schema and interactive props controls.

## Changes
- In `Round12OperatorTroll.tsx`: Define `round12Schema` with Zod and `@remotion/zod-types` covering 5 modular scenes/parts:
  1. Part 1 Intro Hook: Titles, callouts, colors, show/hide toggles.
  2. Part 2 Minimap Zoom: Scale (1.0-4.0), origin X/Y percentages, start/end timing.
  3. Part 3 Subtitles: Font size, text color, box background.
  4. Part 4 Mascot: Show/hide toggle, size scaling factor.
  5. Part 5 Punchline: Rage text, reason text, box color, screen shake intensity, confetti count/toggle.
- In `Root.tsx`: Bind `schema={round12Schema}` and default props to `Round12OperatorTroll`.

Change-Doc: docs/changes/T-33-remotion-studio-props-customization.md
Verdict: accept
