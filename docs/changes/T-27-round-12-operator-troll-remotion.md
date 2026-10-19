# Change Document: T-27 Round 12 Operator Troll Remotion Composition

## Objective
Implement programmatic Remotion video composition `Round12OperatorTroll` (1080x1920, 60fps, 3000 frames / 50 seconds) for the Valorant "Round 12 Operator Troll" clip as specified in user brief.

## Architecture & Components
1. `Round12OperatorTroll.tsx`: Master composition managing 4 scenes, camera zooms, screen shake, and floating particles.
2. `ScreenShake.tsx`: Dynamic screen shake driven by sine/cosine trigonometric physics for comedic punchline impact.
3. `GunMascot.tsx`: Animated mascot for "Gun" with running gait bounce, thinking loading spinner, and triggered red rage states.
4. `MinimapZoomOverlay.tsx`: Camera zoom and tactical radar overlay tracking Gun's marathon path (Mid -> B -> Defender Spawn -> A).
5. `DynamicSubtitles.tsx`: Kinetic subtitles with speaker color coding, scale pop spring physics, and vibration effects.
6. `Root.tsx`: Registered `Round12OperatorTroll` composition with 1080x1920 @ 60fps, 3000 frames.

## Verification
- Code created with Remotion spring and interpolate clamping.
- Root composition registered and ready for headless rendering.
