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

export interface CinematicBeachVlogProps {
  sourceVideo?: string;
  enableBgm?: boolean;
  enableSfx?: boolean;
}

export const CinematicBeachVlog: React.FC<CinematicBeachVlogProps> = ({
  sourceVideo = "beach_source.mp4",
  enableBgm = true,
  enableSfx = true,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // 1. Dynamic Video CSS Filter & Scale based on Scene Breakdowns:
  // Scene 1: 0 - 105 (Ceria) -> contrast(1.08) saturate(1.2) brightness(1.05), scale 1.0 -> 1.04
  // Scene 2: 105 - 300 (Cinematic Sunset) -> contrast(1.15) saturate(1.35) sepia(0.12), scale 1.0 -> 1.08
  // Scene 3: 300 - 390 (Ceria Outro) -> contrast(1.08) saturate(1.2) brightness(1.05), scale 1.05 -> 1.0
  let videoFilter = "contrast(1.08) saturate(1.2) brightness(1.05)";
  let videoScale = 1.0;

  if (frame < 105) {
    videoFilter = "contrast(1.08) saturate(1.2) brightness(1.05)";
    videoScale = interpolate(frame, [0, 105], [1.0, 1.04], {
      extrapolateRight: "clamp",
    });
  } else if (frame >= 105 && frame < 300) {
    videoFilter = "contrast(1.15) saturate(1.35) sepia(0.12) brightness(0.98)";
    videoScale = interpolate(frame, [105, 300], [1.0, 1.08], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else {
    videoFilter = "contrast(1.08) saturate(1.2) brightness(1.05)";
    videoScale = interpolate(frame, [300, 390], [1.05, 1.0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  // 2. Flash transition opacity at frame 100 - 115
  const flashOpacity =
    frame >= 100 && frame <= 115
      ? interpolate(frame, [100, 107, 115], [0, 0.8, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  // 3. Audio Ducking calculation for BGM:
  // 0 - 150: 0.15 (dialogue "Sokin guys, sokin sokin...")
  // 151 - 295: 0.75 (beach scenery)
  // 296 - 390: 0.20 (outro dialogue "Mantap")
  const bgmVolume = (f: number): number => {
    if (f < 145) return 0.15;
    if (f >= 145 && f <= 165)
      return interpolate(f, [145, 165], [0.15, 0.75], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
    if (f > 165 && f < 285) return 0.75;
    if (f >= 285 && f <= 305)
      return interpolate(f, [285, 305], [0.75, 0.2], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
    return 0.2;
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000", overflow: "hidden" }}>
      {/* Base Video Track */}
      <AbsoluteFill
        style={{
          transform: `scale(${videoScale})`,
          transformOrigin: "center center",
          filter: videoFilter,
        }}
      >
        <OffthreadVideo
          src={staticFile(sourceVideo)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </AbsoluteFill>

      {/* Audio Stems */}
      {enableBgm && (
        <Audio
          src={staticFile("tropical_chill_lofi.wav")}
          volume={bgmVolume}
        />
      )}

      {enableSfx && (
        <>
          {/* Whoosh transition SFX at frame 100 */}
          <Sequence from={100} durationInFrames={20}>
            <Audio src={staticFile("whoosh_transition.wav")} volume={0.7} />
          </Sequence>

          {/* Pop ding SFX at frame 335 on 'MANTAP' */}
          <Sequence from={335} durationInFrames={35}>
            <Audio src={staticFile("pop_ding.wav")} volume={0.8} />
          </Sequence>
        </>
      )}

      {/* Transition 1 to 2: Warm Golden-White Flash */}
      {flashOpacity > 0 && (
        <AbsoluteFill
          style={{
            backgroundColor: "#FFF3E0",
            opacity: flashOpacity,
            mixBlendMode: "screen",
            pointerEvents: "none",
          }}
        />
      )}

      {/* SCENE 1: CHEERFUL HOOK (Frames 0 - 105) */}
      <Sequence from={0} durationInFrames={105}>
        <Scene1Hook />
      </Sequence>

      {/* SCENE 2: CINEMATIC GOLDEN HOUR BEACH (Frames 105 - 195, length 195 => 105 to 300) */}
      <Sequence from={105} durationInFrames={195}>
        <Scene2BeachCinematic />
      </Sequence>

      {/* SCENE 3: CHEERFUL OUTRO (Frames 300 - 90, length 90 => 300 to 390) */}
      <Sequence from={300} durationInFrames={90}>
        <Scene3Outro />
      </Sequence>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/* SCENE 1: CHEERFUL HOOK OVERLAYS                                            */
/* -------------------------------------------------------------------------- */
const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Frame 45 - 75: 'SOKIN GUYS! 🌊'
  const pop1 = spring({
    frame: frame - 45,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  // Frame 76 - 105: 'SOKIN SOKIN!'
  const pop2 = spring({
    frame: frame - 76,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: "320px",
      }}
    >
      {frame >= 45 && frame < 76 && (
        <div
          style={{
            transform: `scale(${pop1})`,
            opacity: pop1,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(10px)",
            padding: "16px 36px",
            borderRadius: "24px",
            border: "3px solid #FFD60A",
            boxShadow: "0 12px 36px rgba(0,0,0,0.5)",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: "Inter, 'Plus Jakarta Sans', system-ui, sans-serif",
              fontSize: "52px",
              fontWeight: 900,
              color: "#FFD60A",
              WebkitTextStroke: "2px #000000",
              letterSpacing: "0.02em",
              textShadow: "0 4px 16px rgba(0,0,0,0.6)",
            }}
          >
            SOKIN GUYS! 🌊
          </span>
        </div>
      )}

      {frame >= 76 && frame < 105 && (
        <div
          style={{
            transform: `scale(${pop2})`,
            opacity: pop2,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(10px)",
            padding: "16px 36px",
            borderRadius: "24px",
            border: "3px solid #30D158",
            boxShadow: "0 12px 36px rgba(0,0,0,0.5)",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: "Inter, 'Plus Jakarta Sans', system-ui, sans-serif",
              fontSize: "54px",
              fontWeight: 900,
              color: "#FFFFFF",
              WebkitTextStroke: "2px #000000",
              letterSpacing: "0.02em",
              textShadow: "0 4px 16px rgba(0,0,0,0.6)",
            }}
          >
            SOKIN SOKIN! 🤙
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/* SCENE 2: CINEMATIC BEACH OVERLAYS & LETTERBOX                              */
/* -------------------------------------------------------------------------- */
const Scene2BeachCinematic: React.FC = () => {
  const frame = useCurrentFrame(); // 0 to 195 (corresponds to global 105 to 300)
  const { fps } = useVideoConfig();

  // Letterbox slide in at start (frame 0-20), slide out near end (frame 175-195)
  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 120 },
  });
  const exitSpring = spring({
    frame: frame - 175,
    fps,
    config: { damping: 16, stiffness: 120 },
  });
  const barHeight = 140 * Math.max(0, enterSpring - exitSpring);

  // Frame 0 - 50 (Global 105 - 155): Subtitle "Kita main mantai dulu, Bro! 🌅"
  const subSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 14, stiffness: 130 },
  });

  // Frame 60 - 180 (Global 165 - 285): Aesthetic title "Golden Hour Vibes ✨"
  const titleFade = interpolate(frame, [60, 85, 160, 180], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleDrift = interpolate(frame, [60, 180], [10, -10], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* 1. Cinematic Letterbox Bars (140px) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: `${barHeight}px`,
          backgroundColor: "#050505",
          zIndex: 40,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: `${barHeight}px`,
          backgroundColor: "#050505",
          zIndex: 40,
        }}
      />

      {/* 2. Warm Sun Flare Glow overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 75% 45%, rgba(255, 140, 0, 0.35), transparent 60%)",
          mixBlendMode: "screen",
          zIndex: 20,
        }}
      />

      {/* 3. Subtitle Dialogue (Global 105 - 155 => Local 0 - 50) */}
      {frame >= 0 && frame < 55 && (
        <div
          style={{
            position: "absolute",
            bottom: "220px",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            opacity: subSpring,
            transform: `translateY(${(1 - subSpring) * 20}px)`,
            zIndex: 30,
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(10, 10, 14, 0.8)",
              backdropFilter: "blur(12px)",
              padding: "14px 32px",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            }}
          >
            <span
              style={{
                fontFamily: "Inter, 'Plus Jakarta Sans', system-ui, sans-serif",
                fontSize: "36px",
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: "-0.01em",
              }}
            >
              Kita main mantai dulu, Bro! 🌅
            </span>
          </div>
        </div>
      )}

      {/* 4. Aesthetic Title (Global 165 - 285 => Local 60 - 180) */}
      {frame >= 60 && frame < 185 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            opacity: titleFade,
            transform: `translateY(${titleDrift}px)`,
            zIndex: 35,
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(18, 14, 12, 0.65)",
              backdropFilter: "blur(16px)",
              padding: "24px 48px",
              borderRadius: "20px",
              border: "1px solid rgba(255, 180, 100, 0.3)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: "italic",
                fontSize: "52px",
                fontWeight: 600,
                color: "#FFF3E0",
                letterSpacing: "0.12em",
                textShadow: "0 4px 20px rgba(255, 140, 0, 0.4)",
              }}
            >
              Golden Hour Vibes ✨
            </div>
            <div
              style={{
                fontFamily: "Inter, monospace",
                fontSize: "16px",
                letterSpacing: "0.25em",
                color: "rgba(255,255,255,0.7)",
                marginTop: "8px",
                textTransform: "uppercase",
              }}
            >
              Sunset Session • Pantai
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/* SCENE 3: CHEERFUL OUTRO OVERLAYS ("MANTAP!")                               */
/* -------------------------------------------------------------------------- */
const Scene3Outro: React.FC = () => {
  const frame = useCurrentFrame(); // 0 to 90 (Global 300 to 390)
  const { fps } = useVideoConfig();

  // Frame 35 - 85 (Global 335 - 385): 'MANTAP! 🔥'
  const popSpring = spring({
    frame: frame - 35,
    fps,
    config: { damping: 10, stiffness: 220 }, // elastic bouncy
  });

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: "300px",
      }}
    >
      {frame >= 35 && (
        <div
          style={{
            transform: `scale(${popSpring})`,
            opacity: Math.min(1, popSpring),
            backgroundColor: "#30D158",
            border: "4px solid #FFFFFF",
            padding: "22px 52px",
            borderRadius: "28px",
            boxShadow: "0 20px 60px rgba(48, 209, 88, 0.65)",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: "Inter, 'Plus Jakarta Sans', system-ui, sans-serif",
              fontSize: "64px",
              fontWeight: 900,
              color: "#05220E",
              letterSpacing: "-0.01em",
              lineHeight: 1.0,
            }}
          >
            MANTAP! 🔥
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
};
