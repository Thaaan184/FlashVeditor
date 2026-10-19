import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export interface MinimapZoomOverlayProps {
  active?: boolean;
  startFrame?: number;
  endFrame?: number;
}

export const MinimapZoomOverlay: React.FC<MinimapZoomOverlayProps> = ({
  active = true,
  startFrame = 900,
  endFrame = 1560,
}) => {
  const frame = useCurrentFrame();

  if (!active || frame < startFrame || frame > endFrame) {
    return null;
  }

  const relFrame = frame - startFrame;
  const totalFrames = endFrame - startFrame;

  // Fade in and out
  const opacity = interpolate(
    relFrame,
    [0, 25, totalFrames - 30, totalFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animated dashed path tracking Chamber's marathon run
  // Route: Mid -> B Main -> Defender Spawn -> A Screens / A Site
  const pathProgress = interpolate(relFrame, [20, totalFrames - 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pathLength = 650;
  const strokeDashoffset = pathLength * (1 - pathProgress);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity,
        zIndex: 40,
      }}
    >
      {/* Spotlight Radial Mask: Highlights Minimap (top-left ~220px 220px), dims the rest */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 240px 220px, rgba(0,0,0,0) 160px, rgba(10,12,20,0.55) 300px, rgba(5,7,12,0.85) 650px)",
        }}
      />

      {/* Minimap Reticle & Radar Sweep HUD */}
      <svg
        style={{
          position: "absolute",
          left: 40,
          top: 30,
          width: 400,
          height: 380,
          overflow: "visible",
        }}
      >
        {/* Radar Ring Glow */}
        <circle
          cx="200"
          cy="190"
          r="165"
          fill="none"
          stroke="#00FFFF"
          strokeWidth="3"
          strokeDasharray="12 6"
          opacity="0.8"
        />

        {/* Tactical Crosshairs */}
        <line x1="200" y1="10" x2="200" y2="40" stroke="#00FFFF" strokeWidth="2" opacity="0.7" />
        <line x1="200" y1="340" x2="200" y2="370" stroke="#00FFFF" strokeWidth="2" opacity="0.7" />
        <line x1="20" y1="190" x2="50" y2="190" stroke="#00FFFF" strokeWidth="2" opacity="0.7" />
        <line x1="350" y1="190" x2="380" y2="190" stroke="#00FFFF" strokeWidth="2" opacity="0.7" />

        {/* Chamber Marathon Dashed Run Path: Mid (200, 210) -> B (120, 220) -> Spawn (110, 110) -> A (270, 110) */}
        <path
          d="M 210 220 Q 140 250 120 200 Q 95 130 140 100 Q 210 70 270 120"
          fill="none"
          stroke="#39FF14"
          strokeWidth="6"
          strokeDasharray={pathLength}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          filter="drop-shadow(0 0 10px #39FF14)"
        />

        {/* Start Point (Mid OP) */}
        <circle cx="210" cy="220" r="7" fill="#FFD700" filter="drop-shadow(0 0 8px #FFD700)" />
        <text
          x="225"
          y="225"
          fill="#FFD700"
          fontFamily="'Montserrat', 'Rubik', sans-serif"
          fontWeight="900"
          fontSize="16"
        >
          AWP MID
        </text>

        {/* Waypoint 1 (B Site) */}
        {pathProgress > 0.35 && (
          <circle cx="120" cy="200" r="5" fill="#39FF14" opacity="0.9" />
        )}

        {/* Waypoint 2 (Defender Spawn) */}
        {pathProgress > 0.65 && (
          <circle cx="140" cy="100" r="5" fill="#39FF14" opacity="0.9" />
        )}

        {/* Gun's current animated position icon along path */}
        <circle
          cx={
            pathProgress < 0.35
              ? interpolate(pathProgress, [0, 0.35], [210, 120])
              : pathProgress < 0.7
              ? interpolate(pathProgress, [0.35, 0.7], [120, 140])
              : interpolate(pathProgress, [0.7, 1.0], [140, 270])
          }
          cy={
            pathProgress < 0.35
              ? interpolate(pathProgress, [0, 0.35], [220, 200])
              : pathProgress < 0.7
              ? interpolate(pathProgress, [0.35, 0.7], [200, 100])
              : interpolate(pathProgress, [0.7, 1.0], [100, 120])
          }
          r="10"
          fill="#00FFFF"
          stroke="#FFFFFF"
          strokeWidth="3"
          filter="drop-shadow(0 0 12px #00FFFF)"
        />
      </svg>

      {/* Tactical Route Label */}
      <div
        style={{
          position: "absolute",
          left: 45,
          top: 420,
          background: "rgba(5, 10, 22, 0.9)",
          border: "2px solid #39FF14",
          borderRadius: 12,
          padding: "6px 16px",
          boxShadow: "0 0 20px rgba(57, 255, 20, 0.4)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 18 }}>🏃‍♂️</span>
        <span
          style={{
            fontFamily: "'Montserrat', 'Rubik', sans-serif",
            fontSize: 20,
            fontWeight: 900,
            color: "#39FF14",
            letterSpacing: 1,
          }}
        >
          RUTE MUTER: MID ➔ B ➔ SPAWN ➔ A
        </span>
      </div>
    </div>
  );
};
