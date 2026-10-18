import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export interface CinematicStoryProps {
  videoSrc?: string;
  enableBgm?: boolean;
  enableSfx?: boolean;
}

export const CinematicStory: React.FC<CinematicStoryProps> = ({
  videoSrc = "source.mp4",
  enableBgm = true,
  enableSfx = true,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  // Subtle handheld / digital slow push-in on the entire footage
  // 0s to 30s: slow 1.0 -> 1.06 scale with slight drift
  const cameraScale = interpolate(frame, [0, durationInFrames], [1.0, 1.05], {
    extrapolateRight: "clamp",
  });
  const cameraY = interpolate(frame, [0, durationInFrames], [0, -15], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0A0C", overflow: "hidden" }}>
      {/* 1. Base Footage with Color Grading & Camera Drift */}
      <AbsoluteFill
        style={{
          transform: `scale(${cameraScale}) translateY(${cameraY}px)`,
          transformOrigin: "center center",
          filter: "contrast(1.12) saturate(1.18) brightness(0.98)",
        }}
      >
        <OffthreadVideo
          src={staticFile(videoSrc)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </AbsoluteFill>

      {/* 2. Cinematic Vignette Overlay */}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* 3. Letterbox Bars (Cinematic 2.35:1 scope simulation for vertical shorts) */}
      <CinematicLetterbox />

      {/* 4. Audio Architecture */}
      {/* Original video audio plays automatically via OffthreadVideo. Additional stems: */}
      {enableBgm && (
        <Sequence from={0} durationInFrames={390}>
          {/* Lo-fi ambient backing track for Setup & Prep scenes, fades out smoothly before the failure */}
          <Audio
            src={staticFile("bgm_ambient.wav")}
            volume={(f: number) =>
              interpolate(f, [0, 45, 330, 390], [0, 0.45, 0.45, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            }
          />
        </Sequence>
      )}

      {enableSfx && (
        <>
          {/* Scene 2 target acquired UI beep */}
          <Sequence from={220} durationInFrames={30}>
            <Audio src={staticFile("sfx_ui_blip.wav")} volume={0.65} />
          </Sequence>

          {/* Scene 3 Problem reveal sub bass drop */}
          <Sequence from={420} durationInFrames={50}>
            <Audio src={staticFile("sfx_sub_drop.wav")} volume={0.85} />
          </Sequence>

          {/* Scene 4 Tension riser into diagnostic HUD */}
          <Sequence from={465} durationInFrames={70}>
            <Audio src={staticFile("sfx_riser.wav")} volume={0.55} />
          </Sequence>

          {/* Scene 4 Alarm failure buzzer */}
          <Sequence from={540} durationInFrames={60}>
            <Audio src={staticFile("sfx_alarm_fail.wav")} volume={0.7} />
          </Sequence>

          {/* Scene 5 Tape stop / scratch comedic cutoff */}
          <Sequence from={805} durationInFrames={30}>
            <Audio src={staticFile("sfx_tape_stop.wav")} volume={0.8} />
          </Sequence>
        </>
      )}

      {/* 5. Scene-by-Scene Narrative & Motion Graphics Overlays */}

      {/* SCENE 1: THE SETUP (Frames 0 - 96 | 0.0s - 3.2s) */}
      <Sequence from={0} durationInFrames={96}>
        <SceneSetup />
      </Sequence>

      {/* SCENE 2: THE PREPARATION & DISCOVERY (Frames 96 - 315 | 3.2s - 10.5s) */}
      <Sequence from={96} durationInFrames={219}>
        <ScenePrep />
      </Sequence>

      {/* SCENE 3: THE PROBLEM REVEAL (Frames 315 - 465 | 10.5s - 15.5s) */}
      <Sequence from={315} durationInFrames={150}>
        <SceneProblem />
      </Sequence>

      {/* SCENE 4: MECHANICAL HUD / DIAGNOSTIC INTERLUDE (Frames 465 - 675 | 15.5s - 22.5s) */}
      <Sequence from={465} durationInFrames={210}>
        <SceneDiagnosticHUD />
      </Sequence>

      {/* SCENE 5: THE PUNCHLINE (Frames 675 - 858 | 22.5s - 28.6s) */}
      <Sequence from={675} durationInFrames={183}>
        <ScenePunchline />
      </Sequence>

      {/* SCENE 6: CLEAN CINEMATIC ENDING (Frames 858 - 910 | 28.6s - 30.3s) */}
      <Sequence from={858} durationInFrames={52}>
        <SceneEnding />
      </Sequence>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/* REUSABLE MOTION GRAPHICS & OVERLAY COMPONENTS                              */
/* -------------------------------------------------------------------------- */

/** Cinematic Top & Bottom Letterbox Bars */
const CinematicLetterbox: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Smooth entrance: bars slide down/up over first 20 frames
  const barProgress = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 100 },
  });
  const barHeight = 85 * barProgress;

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: `${barHeight}px`,
          backgroundColor: "#060608",
          zIndex: 50,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: `${barHeight}px`,
          backgroundColor: "#060608",
          zIndex: 50,
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      />
    </>
  );
};

/** Scene 1: The Setup */
const SceneSetup: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title spring entrance
  const titleSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Badge spring entrance
  const badgeSpring = spring({
    frame: frame - 32,
    fps,
    config: { damping: 16, stiffness: 140 },
  });

  const fadeOut = interpolate(frame, [80, 95], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity: fadeOut,
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: "220px",
      }}
    >
      {/* Top hook label */}
      <div
        style={{
          transform: `translateY(${(1 - titleSpring) * 35}px)`,
          opacity: titleSpring,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(10, 10, 14, 0.75)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "14px",
            padding: "16px 36px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
          }}
        >
          <span
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "44px",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#FFFFFF",
              textTransform: "uppercase",
            }}
          >
            NIATNYA MAU JALAN...
          </span>
        </div>

        {/* Small subtitle badge */}
        <div
          style={{
            transform: `scale(${badgeSpring})`,
            opacity: badgeSpring,
            backgroundColor: "#30D158",
            color: "#05220E",
            padding: "6px 20px",
            borderRadius: "30px",
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 800,
            fontSize: "20px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>●</span> IZIN: APPROVED (SIAP GAS)
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Scene 2: The Preparation & Motorcycle Identification */
const ScenePrep: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Discovery 1: "Motor utama gak ada" at frame 60-120
  const missingBikeSpring = spring({
    frame: frame - 55,
    fps,
    config: { damping: 15, stiffness: 120 },
  });
  const missingBikeFade = interpolate(frame, [115, 125], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Discovery 2: "Tinggal Mio Legend" at frame 125 onwards
  const mioSpring = spring({
    frame: frame - 125,
    fps,
    config: { damping: 14, stiffness: 130 },
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Beat 1: Empty garage callout */}
      {frame >= 55 && frame < 125 && (
        <div
          style={{
            position: "absolute",
            top: "220px",
            left: "80px",
            opacity: missingBikeSpring * missingBikeFade,
            transform: `translateX(${(1 - missingBikeSpring) * -40}px)`,
            backgroundColor: "rgba(255, 69, 58, 0.88)",
            backdropFilter: "blur(10px)",
            color: "#FFFFFF",
            padding: "12px 24px",
            borderRadius: "10px",
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 800,
            fontSize: "26px",
            boxShadow: "0 8px 24px rgba(255, 69, 58, 0.35)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          ❌ MOTOR UTAMA: GAK ADA
        </div>
      )}

      {/* Beat 2: Target Acquired Yamaha Mio Legend */}
      {frame >= 125 && (
        <div
          style={{
            position: "absolute",
            bottom: "260px",
            left: "60px",
            right: "60px",
            opacity: mioSpring,
            transform: `translateY(${(1 - mioSpring) * 30}px)`,
            backgroundColor: "rgba(14, 15, 20, 0.82)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 214, 10, 0.35)",
            borderRadius: "18px",
            padding: "24px 30px",
            boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                fontFamily: "monospace",
                color: "#FFD60A",
                fontSize: "18px",
                letterSpacing: "0.15em",
                fontWeight: 700,
              }}
            >
              [ TARGET ACQUIRED ]
            </span>
            <span
              style={{
                backgroundColor: "rgba(255, 214, 10, 0.15)",
                color: "#FFD60A",
                padding: "3px 10px",
                borderRadius: "6px",
                fontSize: "14px",
                fontFamily: "monospace",
              }}
            >
              ONLY HOPE
            </span>
          </div>

          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "40px",
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            YAMAHA MIO LEGEND
          </div>

          <div
            style={{
              marginTop: "10px",
              display: "flex",
              gap: "16px",
              color: "rgba(255,255,255,0.65)",
              fontSize: "18px",
              fontFamily: "Inter, system-ui, sans-serif",
            }}
          >
            <span>Type: 115cc Matic</span>
            <span>•</span>
            <span>Status: Veteran</span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/** Scene 3: The Problem Reveal ("Ternyata motornya mogok") */
const SceneProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "TERNYATA..." at frame 30
  const leadSpring = spring({
    frame: frame - 25,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // "MOTORNYA MOGOK" impact slam at frame 95 (on audio "Mio-nya gak mau nyala")
  const impactSpring = spring({
    frame: frame - 95,
    fps,
    config: { damping: 10, stiffness: 180 },
  });

  // Screen shake on impact
  const shakeX =
    frame >= 95 && frame < 115
      ? Math.sin((frame - 95) * 1.5) * (115 - frame) * 0.8
      : 0;
  const shakeY =
    frame >= 95 && frame < 115
      ? Math.cos((frame - 95) * 1.8) * (115 - frame) * 0.8
      : 0;

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${shakeX}px, ${shakeY}px)`,
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      {/* Beat 1: Build up */}
      {frame >= 25 && frame < 95 && (
        <div
          style={{
            transform: `scale(${leadSpring})`,
            opacity: leadSpring,
            backgroundColor: "rgba(10, 10, 14, 0.85)",
            backdropFilter: "blur(14px)",
            padding: "20px 48px",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <span
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "48px",
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "0.05em",
            }}
          >
            TERNYATA...
          </span>
        </div>
      )}

      {/* Beat 2: Climax Failure Slam */}
      {frame >= 95 && (
        <div
          style={{
            transform: `scale(${impactSpring})`,
            opacity: Math.min(1, impactSpring),
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FF3B30",
              color: "#FFFFFF",
              padding: "24px 50px",
              borderRadius: "20px",
              boxShadow: "0 20px 60px rgba(255, 59, 48, 0.65)",
              border: "3px solid #FFFFFF",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "20px",
                letterSpacing: "0.2em",
                marginBottom: "4px",
                opacity: 0.9,
              }}
            >
              CRITICAL FAILURE
            </div>
            <div
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: "58px",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                lineHeight: 1.0,
              }}
            >
              MOTORNYA MOGOK! ⚠️
            </div>
          </div>

          <div
            style={{
              backgroundColor: "rgba(0,0,0,0.8)",
              color: "#FFD60A",
              padding: "8px 24px",
              borderRadius: "30px",
              fontFamily: "monospace",
              fontSize: "20px",
              fontWeight: 700,
              letterSpacing: "0.1em",
            }}
          >
            IGNITION ATTEMPT FAILED
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/** Scene 4: Mechanical Telemetry & Diagnostic HUD */
const SceneDiagnosticHUD: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring for HUD container
  const hudSpring = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 110 },
  });

  // Animated telemetry readings
  const voltage = interpolate(frame, [0, 150], [12.4, 11.1], {
    extrapolateRight: "clamp",
  }).toFixed(1);

  const rpm = interpolate(frame, [0, 40, 80, 120, 160], [250, 400, 150, 320, 0], {
    extrapolateRight: "clamp",
  });

  const isBlinking = Math.floor(frame / 8) % 2 === 0;

  return (
    <AbsoluteFill
      style={{
        opacity: hudSpring,
        pointerEvents: "none",
        padding: "120px 48px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Top HUD Header & Crosshair */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "1px solid rgba(100, 210, 255, 0.35)",
          paddingBottom: "12px",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "18px",
              color: "#64D2FF",
              letterSpacing: "0.15em",
              fontWeight: 700,
            }}
          >
            SYS.DIAG // 115CC-CARBURETOR
          </div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "14px",
              color: "rgba(255,255,255,0.6)",
              marginTop: "4px",
            }}
          >
            MONITORING STARTER SOLENOID...
          </div>
        </div>

        <div
          style={{
            fontFamily: "monospace",
            fontSize: "16px",
            color: isBlinking ? "#FF3B30" : "#FF9F0A",
            border: `1px solid ${isBlinking ? "#FF3B30" : "#FF9F0A"}`,
            padding: "4px 10px",
            borderRadius: "4px",
            fontWeight: 800,
          }}
        >
          {isBlinking ? "● FAULT" : "○ SCAN"}
        </div>
      </div>

      {/* Center Target Reticle & Engine Status */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {/* Reticle Circle */}
        <div
          style={{
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            border: "2px dashed rgba(255, 69, 58, 0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            transform: `rotate(${frame * 0.8}deg)`,
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: "#FF3B30",
              borderRadius: "50%",
            }}
          />
        </div>

        {/* Diagnostic Status Box */}
        <div
          style={{
            backgroundColor: "rgba(18, 18, 24, 0.9)",
            backdropFilter: "blur(18px)",
            border: "2px solid #FF453A",
            borderRadius: "16px",
            padding: "20px 36px",
            textAlign: "center",
            boxShadow: "0 12px 36px rgba(255, 69, 58, 0.35)",
          }}
        >
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "15px",
              color: "#FF453A",
              letterSpacing: "0.2em",
              fontWeight: 800,
              marginBottom: "6px",
            }}
          >
            ENGINE STATUS
          </div>
          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "36px",
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: "0.02em",
            }}
          >
            DEAD ON ARRIVAL
          </div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "16px",
              color: "#FFD60A",
              marginTop: "8px",
            }}
          >
            NO SPARK • CHOKE PULLED • GAK NYALA
          </div>
        </div>
      </div>

      {/* Bottom Telemetry Gauges */}
      <div
        style={{
          backgroundColor: "rgba(10, 12, 16, 0.85)",
          backdropFilter: "blur(14px)",
          borderRadius: "14px",
          border: "1px solid rgba(255,255,255,0.12)",
          padding: "18px 24px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "14px",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            BATTERY VOLTAGE
          </div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "24px",
              fontWeight: 800,
              color: Number(voltage) < 11.5 ? "#FF453A" : "#30D158",
            }}
          >
            {voltage} V <span style={{ fontSize: "14px" }}>[LOW]</span>
          </div>
        </div>

        <div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "14px",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            STARTER RPM
          </div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "24px",
              fontWeight: 800,
              color: "#64D2FF",
            }}
          >
            {Math.round(rpm)}{" "}
            <span style={{ fontSize: "14px" }}>RPM</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Scene 5: The Punchline ("Yang jalan cuma rencananya") */
const ScenePunchline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Punchline 1: "JALAN? BATAL." (Frame 20)
  const batalSpring = spring({
    frame: frame - 20,
    fps,
    config: { damping: 14, stiffness: 130 },
  });

  // Punchline 2: "YANG JALAN CUMA RENCANANYA" (Frame 80 - right after silence & defeated audio)
  const planSpring = spring({
    frame: frame - 80,
    fps,
    config: { damping: 12, stiffness: 140 },
  });

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 50px",
      }}
    >
      {/* Beat 1: Batal pill */}
      {frame >= 20 && frame < 80 && (
        <div
          style={{
            transform: `scale(${batalSpring})`,
            opacity: batalSpring,
            backgroundColor: "#000000",
            border: "2px solid #FF3B30",
            borderRadius: "18px",
            padding: "24px 52px",
            boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
          }}
        >
          <span
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "52px",
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: "-0.01em",
            }}
          >
            JALAN? <span style={{ color: "#FF3B30" }}>BATAL.</span>
          </span>
        </div>
      )}

      {/* Beat 2: Climax Joke Payoff */}
      {frame >= 80 && (
        <div
          style={{
            transform: `scale(${planSpring})`,
            opacity: planSpring,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "18px",
            maxWidth: "920px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(10, 10, 14, 0.92)",
              backdropFilter: "blur(20px)",
              border: "2px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "24px",
              padding: "36px 44px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.75)",
            }}
          >
            <div
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: "44px",
                fontWeight: 900,
                color: "#FFFFFF",
                lineHeight: 1.25,
                letterSpacing: "-0.02em",
              }}
            >
              YANG JALAN CUMA RENCANANYA. 🤡
            </div>
            <div
              style={{
                marginTop: "16px",
                color: "rgba(255,255,255,0.7)",
                fontSize: "22px",
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 600,
              }}
            >
              "Emang gak boleh datang, bang..."
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/** Scene 6: Clean Cinematic Outro */
const SceneEnding: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: `rgba(6, 6, 8, ${fadeIn * 0.96})`,
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          opacity: fadeIn,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "14px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "monospace",
            fontSize: "18px",
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "0.25em",
          }}
        >
          EPILOGUE
        </div>
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: "40px",
            fontWeight: 800,
            color: "#FFFFFF",
            letterSpacing: "-0.01em",
          }}
        >
          Balik rebahan lagi.
        </div>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: "15px",
            color: "#FFD60A",
            marginTop: "10px",
          }}
        >
          DIRECTED BY REALITY
        </div>
      </div>
    </AbsoluteFill>
  );
};
