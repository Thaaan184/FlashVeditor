# Change Document: T-29 Clean Minimap Zoom (Remove Tracking Edit)

## Objective
Remove the SVG route tracking overlay and target marker in Scene 2 per user directive:
"yang editan tracking nya ilangin aja cukup zoom in ke map"

## Changes Made
1. `Round12OperatorTroll.tsx`:
   - Removed `<MinimapRouteTracker />` overlay.
   - Retained smooth camera zoom-in (`scale: 2.3`, `origin: 22% 12%`) to the minimap from frame 780 to 1560.
   - Kept unobtrusive bottom dialogue subtitles for the funny moments.

Change-Doc: docs/changes/T-29-clean-minimap-zoom.md
Verdict: accept
