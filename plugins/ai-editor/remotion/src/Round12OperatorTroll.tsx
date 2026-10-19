import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ScreenShake } from "./components/ScreenShake";
import { GunMascot } from "./components/GunMascot";
import { MinimapZoomOverlay } from "./components/MinimapZoomOverlay";
import { DynamicSubtitles } from "./components/DynamicSubtitles";

export interface Round12OperatorTrollProps {
  gameplaySrc?: string;
  avatarSrc?: string;
}

export const Round12OperatorTroll: React.FC<Round12OperatorTrollProps> = ({
  gameplaySrc = "gameplay.mp4",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ----------------------------------------------------
  // Camera Transform & Zoom Controller
  // ----------------------------------------------------
  // Scene 3 Minimap Zoom: Frame 900 to 1560
  // Scene 4 Chamber Push-in: Frame 2040 to 2220
  let cameraScale = 1;
  let transformOrigin = "center center";

  if (frame >= 900 && frame < 1600) {
    // Zoom into Minimap (top-left ~24% X, ~12% Y)
    const zoomIn = interpolate(frame, [900, 940], [1.0, 2.2], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const zoomOut = interpolate(frame, [1550, 1590], [2.2, 1.0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    cameraScale = frame < 1550 ? zoomIn : zoomOut;
    transformOrigin = "24% 12%";
  } else if (frame >= 2040 && frame <= 2280) {
    // Dramatic push-in to Chamber standing in spawn (50% X, 52% Y)
    cameraScale = interpolate(frame, [2040, 2220], [1.0, 1.28], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    transformOrigin = "50% 52%";
  }

  // ----------------------------------------------------
  // Screen Shake (Punchline explosion after frame 2220)
  // ----------------------------------------------------
  const isPunchline = frame >= 2220 && frame <= 2980;

  // ----------------------------------------------------
  // Header Badge (Scene 1: Frame 0 to 240)
  // ----------------------------------------------------
  const showHeaderBadge = frame >= 0 && frame <= 240;
  const badgeSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });
  const badgeOpacity = interpolate(frame, [0, 15, 220, 240], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ----------------------------------------------------
  // Score 10-1 Reminder Graphic (Scene 2: Frame 720 to 900)
  // ----------------------------------------------------
  const showScoreReminder = frame >= 720 && frame <= 900;
  const scorePulse = Math.sin(frame * 0.35) * 6;
  const scoreReminderSpring = spring({
    frame: frame - 720,
    fps,
    config: { damping: 10, stiffness: 140 },
  });

  // ----------------------------------------------------
  // Floating Emoji Particles (Frame 2340 to 3000)
  // ----------------------------------------------------
  const particles = useMemo(() => {
    const emojis = ["🤣", "💀", "🤡", "🤣", "😭", "💀", "🤣", "🔥"];
    return Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      emoji: emojis[i % emojis.length],
      x: 60 + ((i * 137) % (width - 120)),
      delay: (i * 24) % 360,
      speed: 1.1 + (i % 5) * 0.25,
      size: 40 + (i % 4) * 16,
    }));
  }, [width]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#05060A",
        overflow: "hidden",
        fontFamily: "'Montserrat', 'Rubik', 'Impact', sans-serif",
      }}
    >
      {/* Global Font Injection Fallback */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@800;900&family=Rubik:wght@800;900&display=swap');
      `}</style>

      {/* Screen Shake Container */}
      <ScreenShake active={isPunchline} intensity={24} startFrame={2220}>
        {/* Dynamic Camera Zoom Wrapper */}
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: `scale(${cameraScale})`,
            transformOrigin,
          }}
        >
          {/* Base Gameplay Video */}
          <OffthreadVideo
            src={staticFile(gameplaySrc)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          {/* Minimap Tactical Overlay (Tracked during Scene 3) */}
          <MinimapZoomOverlay active={true} startFrame={900} endFrame={1560} />
        </div>
      </ScreenShake>

      {/* ----------------------------------------------------
          SCENE 1: Header Badge (00:00 - 00:04 | Frame 0 - 240)
      ---------------------------------------------------- */}
      {showHeaderBadge && (
        <div
          style={{
            position: "absolute",
            top: 450,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            opacity: badgeOpacity,
            transform: `translate3d(0, ${(1 - badgeSpring) * -60}px, 0)`,
            zIndex: 60,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(10, 16, 28, 0.92)",
              border: "3px solid #00FFFF",
              borderRadius: 36,
              padding: "12px 28px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.8), 0 0 25px rgba(0,255,255,0.7)",
            }}
          >
            <span style={{ fontSize: 32 }}>🎮</span>
            <span
              style={{
                fontSize: 26,
                fontWeight: 900,
                color: "#FFFFFF",
                letterSpacing: 1.2,
                textTransform: "uppercase",
                textShadow: "0 2px 8px rgba(0,0,0,0.8)",
              }}
            >
              POV: Temen lama gak main Valo...
            </span>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          SCENE 2: The "10-1" Reminder Indicator (Frame 720 - 900)
      ---------------------------------------------------- */}
      {showScoreReminder && (
        <div
          style={{
            position: "absolute",
            top: 470,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `scale(${scoreReminderSpring})`,
            zIndex: 65,
          }}
        >
          {/* Pulsing Arrow pointing UP to Score */}
          <div
            style={{
              transform: `translate3d(0, ${scorePulse}px, 0)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 4L4 12H9V20H15V12H20L12 4Z"
                fill="#FF3333"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                filter="drop-shadow(0 0 10px #FF3333)"
              />
            </svg>
          </div>

          {/* Explanatory Warning Box */}
          <div
            style={{
              marginTop: 6,
              background: "rgba(30, 0, 8, 0.94)",
              border: "3px solid #FF3333",
              borderRadius: 20,
              padding: "10px 24px",
              boxShadow: "0 8px 30px rgba(255, 51, 51, 0.6)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 24 }}>🤫</span>
            <span
              style={{
                fontSize: 26,
                fontWeight: 900,
                color: "#FFD700",
                textTransform: "uppercase",
                letterSpacing: 1,
                textShadow: "1px 1px 0 #000",
              }}
            >
              Padahal Ronde 12 (Mau Ganti Half) 🤫🤭
            </span>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          SCENE 3: GunMascot Marathon Run (Frame 920 - 1560)
      ---------------------------------------------------- */}
      {frame >= 920 && frame <= 1560 && (
        <GunMascot
          mode="running"
          size={190}
          badgeText="Otak Senku: ON 🧠✨"
          subText="Amanin AWP dulu bos!"
          startFrame={920}
          style={{
            top: 480,
            left: 540,
          }}
        />
      )}

      {/* ----------------------------------------------------
          SCENE 3 Outro: Gun arrives after marathon (Frame 1800 - 1940)
      ---------------------------------------------------- */}
      {frame >= 1800 && frame <= 1940 && (
        <GunMascot
          mode="spinning"
          size={160}
          badgeText="Abis Maraton Keliling Map 🥵💦"
          subText="Muter dari B ke Spawn ke A"
          startFrame={1800}
          style={{
            top: 960,
            left: 360,
          }}
        />
      )}

      {/* ----------------------------------------------------
          SCENE 4: Chamber Realization (Loading Otak) (Frame 2040 - 2220)
      ---------------------------------------------------- */}
      {frame >= 2040 && frame < 2220 && (
        <GunMascot
          mode="thinking"
          size={180}
          badgeText="Loh... AWP gua mana?"
          subText="Kok cuma pegang Classic ???"
          startFrame={2040}
          style={{
            top: 720,
            left: 450,
          }}
        />
      )}

      {/* ----------------------------------------------------
          SCENE 4 Punchline: Triggered Rage Gun (Frame 2220 - 2940)
      ---------------------------------------------------- */}
      {frame >= 2220 && frame <= 2940 && (
        <GunMascot
          mode="triggered"
          size={240}
          badgeText="KENA MENTAL 💀💥"
          subText="SENJATA DI-RESET SEMUA"
          startFrame={2220}
          style={{
            top: 680,
            left: 420,
          }}
        />
      )}

      {/* ----------------------------------------------------
          Floating Meme Emoji Rain (Frame 2340 to 3000)
      ---------------------------------------------------- */}
      {frame >= 2340 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 75,
          }}
        >
          {particles.map((p) => {
            const rel = frame - 2340 - p.delay;
            if (rel < 0) return null;

            const progress = (rel * p.speed) % 180;
            const y = interpolate(progress, [0, 180], [height + 80, -100]);
            const x = p.x + Math.sin(frame * 0.08 + p.id) * 35;
            const rotate = Math.sin(frame * 0.05 + p.id) * 25;
            const op = interpolate(y, [height, height - 150, 150, -50], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <div
                key={p.id}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  fontSize: p.size,
                  transform: `rotate(${rotate}deg)`,
                  opacity: op,
                  filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.8))",
                }}
              >
                {p.emoji}
              </div>
            );
          })}
        </div>
      )}

      {/* ----------------------------------------------------
          Subtitles System (Synced across all 4 scenes)
      ---------------------------------------------------- */}
      <DynamicSubtitles />
    </AbsoluteFill>
  );
};
