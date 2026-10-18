import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BackgroundMarquee } from "./components/BackgroundMarquee";
import { CamcorderOverlay } from "./components/CamcorderOverlay";
import { KineticText } from "./components/KineticText";
import { StickerImage } from "./components/StickerImage";

export interface HipdutMontageProps {
  enableBgm?: boolean;
}

export const HipdutMontage: React.FC<HipdutMontageProps> = ({ enableBgm = true }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0A0A", overflow: "hidden" }}>
      {/* ========================================================
          SCENE 1: THE VOCAL HOOK INTRO (Frame 0 - 300 | 0s - 5s)
          ======================================================== */}
      <Sequence from={0} durationInFrames={300}>
        <Scene1VocalHook />
      </Sequence>

      {/* ========================================================
          SCENE 2: BEAT DROP & CHARACTER SHOWCASE (Frame 300 - 540 | 5s - 9s)
          ======================================================== */}
      <Sequence from={300} durationInFrames={240}>
        <Scene2BeatDrop />
      </Sequence>

      {/* ========================================================
          SCENE 3: FAST-CUT KOPLO MONTAGE (Frame 540 - 750 | 9s - 12.5s)
          ======================================================== */}
      <Sequence from={540} durationInFrames={210}>
        <Scene3FastCutMontage />
      </Sequence>

      {/* ========================================================
          SCENE 4: OUTRO COLLAGE & FREEZE FRAME (Frame 750 - 900 | 12.5s - 15s)
          ======================================================== */}
      <Sequence from={750} durationInFrames={150}>
        <Scene4OutroCollage />
      </Sequence>

      {/* AUDIO: 130 BPM Hip-Hop Koplo Beat starting at Beat Drop (Frame 300) */}
      {enableBgm && (
        <Sequence from={300} durationInFrames={600}>
          <Audio src={staticFile("assets/hipdut-beat.mp3")} volume={1.0} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};

/* ==============================================================
   SCENE 1: THE VOCAL HOOK INTRO
   ============================================================== */
const Scene1VocalHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slow dynamic zoom-in from 1.0 to 1.12
  const zoom = interpolate(frame, [0, 300], [1.0, 1.12], { extrapolateRight: "clamp" });

  // Camera Shake & Glitch on scream (Frame 230 - 300)
  let shakeX = 0;
  let shakeY = 0;
  let glitchInvert = 0;
  if (frame >= 230) {
    const screamFrame = frame - 230;
    const decay = interpolate(screamFrame, [0, 70], [1.0, 0.4], { extrapolateRight: "clamp" });
    shakeX = Math.sin(frame * 0.9) * 28 * decay;
    shakeY = Math.cos(frame * 1.2) * 22 * decay;
    // Strobe flash at the hit
    if (screamFrame < 15 && screamFrame % 3 === 0) {
      glitchInvert = 1;
    }
  }

  // Spring animation for subtitles
  // Subtitle 1: "MATUR SUWUN BARUDAK!" (f60 - 150)
  const sub1Spring = spring({ frame: frame - 60, fps, config: { damping: 9, stiffness: 120 } });
  // Subtitle 2: "KUMAHA BARUDAK?!" (f150 - 230)
  const sub2Spring = spring({ frame: frame - 150, fps, config: { damping: 9, stiffness: 120 } });
  // Subtitle 3: "WEEEEAAA!" + "SIKAT MIRING!" (f230 - 300)
  const sub3Spring = spring({ frame: frame - 230, fps, config: { damping: 8, stiffness: 140 } });

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${shakeX}px, ${shakeY}px)`,
        filter: glitchInvert ? "invert(1) contrast(1.5)" : "none",
        backgroundColor: "#000000",
      }}
    >
      {/* Video Element */}
      <AbsoluteFill
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "center center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <OffthreadVideo
          src={staticFile("assets/342124.mp4")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "contrast(1.1) saturate(1.15) brightness(1.02)",
          }}
        />
      </AbsoluteFill>

      {/* Camcorder Viewfinder Y2K Overlay */}
      <CamcorderOverlay />

      {/* Subtitles Overlay */}
      <AbsoluteFill style={{ pointerEvents: "none", zIndex: 60, display: "flex", justifyContent: "flex-end", alignItems: "center", paddingBottom: 220 }}>
        {/* Frame 60 - 150: MATUR SUWUN BARUDAK! */}
        {frame >= 60 && frame < 150 && (
          <div
            style={{
              transform: `scale(${sub1Spring})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                backgroundColor: "#111111",
                padding: "8px 24px",
                border: "4px solid #CCFF00",
                borderRadius: 4,
                boxShadow: "6px 6px 0px #CCFF00",
                transform: "rotate(-2deg)",
              }}
            >
              <KineticText text="MATUR SUWUN" fontSize={80} color="#CCFF00" strokeWidth={8} strokeColor="#000000" />
            </div>
            <div
              style={{
                backgroundColor: "#CCFF00",
                padding: "8px 30px",
                borderRadius: 4,
                boxShadow: "8px 8px 0px #000000",
                transform: "rotate(2deg)",
              }}
            >
              <KineticText text="BARUDAK!" fontSize={96} color="#111111" strokeWidth={0} />
            </div>
          </div>
        )}

        {/* Frame 150 - 230: KUMAHA BARUDAK?! */}
        {frame >= 150 && frame < 230 && (
          <div
            style={{
              transform: `scale(${sub2Spring}) rotate(-5deg)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                backgroundColor: "#FF0055",
                padding: "10px 32px",
                borderRadius: 6,
                boxShadow: "10px 10px 0px #000000",
                border: "4px solid #FFFFFF",
              }}
            >
              <KineticText text="KUMAHA" fontSize={92} color="#FFFFFF" strokeWidth={8} strokeColor="#111111" />
            </div>
            <div
              style={{
                backgroundColor: "#111111",
                padding: "8px 36px",
                borderRadius: 6,
                boxShadow: "8px 8px 0px #FF0055",
                border: "4px solid #FF0055",
              }}
            >
              <KineticText text="BARUDAK?!" fontSize={104} color="#FF0055" strokeWidth={8} strokeColor="#000000" />
            </div>
          </div>
        )}

        {/* Frame 230 - 300: WEEEEAAA! + SIKAT MIRING! */}
        {frame >= 230 && (
          <div
            style={{
              transform: `scale(${sub3Spring})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                backgroundColor: "#FFD700",
                padding: "12px 40px",
                borderRadius: 8,
                boxShadow: "12px 12px 0px #000000",
                border: "6px solid #111111",
                transform: `rotate(${Math.sin(frame * 0.8) * 8}deg)`,
              }}
            >
              <KineticText text="WEEEEAAA! 🔥" fontSize={110} color="#111111" strokeWidth={0} />
            </div>
            <div
              style={{
                backgroundColor: "#FF0055",
                padding: "8px 32px",
                borderRadius: 6,
                boxShadow: "8px 8px 0px #CCFF00",
                transform: "rotate(-3deg)",
              }}
            >
              <KineticText text="SIKAT MIRING!" fontSize={72} color="#CCFF00" strokeWidth={6} strokeColor="#000000" />
            </div>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ==============================================================
   SCENE 2: BEAT DROP & CHARACTER SHOWCASE (Frames 300 - 540 | rel 0 - 240)
   ============================================================== */
const Scene2BeatDrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Bass pump pulse every beat (around every 28 frames @ 130 BPM 60fps)
  const beatProgress = (frame % 28) / 28;
  const bassPump = interpolate(beatProgress, [0, 0.2, 1], [1.05, 1.0, 1.0]);

  return (
    <AbsoluteFill style={{ transform: `scale(${bassPump})`, transformOrigin: "center center" }}>
      {/* Dynamic Marquee Background */}
      <BackgroundMarquee primaryColor="#CCFF00" secondaryColor="#FF0055" speed={5} />

      {/* SUB-SCENE 2A: Frame 0 - 60 (rel) -> 2131232132.jpg & 1233122.jpg */}
      {frame >= 0 && frame < 60 && (
        <AbsoluteFill style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          {/* Main sticker: Udeng + Sunglasses */}
          <div
            style={{
              position: "absolute",
              transform: `translateY(${interpolate(spring({ frame, fps, config: { damping: 11, stiffness: 100 } }), [0, 1], [400, 0])}px)`,
            }}
          >
            <StickerImage src="assets/2131232132.PNG" width={560} rotation={-4} borderWidth={14} />
          </div>

          {/* Overlapping sticker at f30 (rel) -> double metal pose */}
          {frame >= 30 && (
            <div
              style={{
                position: "absolute",
                top: 240,
                right: 60,
                transform: `scale(${spring({ frame: frame - 30, fps, config: { damping: 9, stiffness: 120 } })})`,
              }}
            >
              <StickerImage src="assets/1233122.PNG" width={420} rotation={8} borderWidth={12} borderColor="#CCFF00" />
            </div>
          )}

          {/* Header Title Badge */}
          <div style={{ position: "absolute", top: 120, left: 60, transform: "rotate(-3deg)" }}>
            <div style={{ backgroundColor: "#111111", padding: "10px 24px", border: "4px solid #FF0055", boxShadow: "8px 8px 0px #FF0055" }}>
              <KineticText text="CULTURE SHOCK 🔥" fontSize={72} color="#FFFFFF" strokeWidth={6} strokeColor="#000000" />
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* SUB-SCENE 2B: Frame 60 - 120 (rel) -> 2131.jpg (HP Keris pose) */}
      {frame >= 60 && frame < 120 && (
        <AbsoluteFill style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          {/* Zooming sticker image */}
          <div
            style={{
              transform: `scale(${interpolate(frame - 60, [0, 60], [1.1, 1.25], { extrapolateRight: "clamp" })})`,
            }}
          >
            <StickerImage src="assets/2131.PNG" width={600} rotation={3} borderWidth={16} borderColor="#FFD700" />
          </div>

          {/* Pulsing Neon Target Reticle over the phone area */}
          <div
            style={{
              position: "absolute",
              top: "46%",
              left: "48%",
              transform: "translate(-50%, -50%)",
              width: 140,
              height: 140,
              borderRadius: "50%",
              border: "6px dashed #FF0055",
              boxShadow: "0 0 20px #FF0055",
              animation: "none",
              opacity: (frame % 10 < 6) ? 1.0 : 0.3,
            }}
          />

          {/* Badges */}
          <div style={{ position: "absolute", bottom: 220, display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
            <div style={{ backgroundColor: "#111111", padding: "8px 28px", border: "4px solid #CCFF00", boxShadow: "8px 8px 0px #CCFF00" }}>
              <KineticText text="KERIS VIBES ONLY 🗡️" fontSize={64} color="#CCFF00" strokeWidth={6} strokeColor="#000000" />
            </div>
            <div style={{ backgroundColor: "#FF0055", padding: "6px 24px", borderRadius: 4, transform: "rotate(-2deg)" }}>
              <KineticText text="LOCAL PRIDE // 100%" fontSize={52} color="#FFFFFF" strokeWidth={0} />
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* SUB-SCENE 2C: Frame 120 - 180 (rel) -> Split-Screen Parallax 1425.PNG & 42112451.PNG */}
      {frame >= 120 && frame < 180 && (
        <AbsoluteFill style={{ display: "flex", flexDirection: "row", overflow: "hidden" }}>
          {/* Left Panel (Looking up) */}
          <div
            style={{
              flex: 1,
              height: "100%",
              borderRight: "8px solid #CCFF00",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: `${interpolate(frame - 120, [0, 60], [-50, 20])}px`,
                left: -60,
                width: 620,
              }}
            >
              <Img src={staticFile("assets/1425.PNG")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.2)" }} />
            </div>
          </div>

          {/* Right Panel (Hands on hips) */}
          <div
            style={{
              flex: 1,
              height: "100%",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: `${interpolate(frame - 120, [0, 60], [40, -40])}px`,
                right: -60,
                width: 620,
              }}
            >
              <Img src={staticFile("assets/42112451.PNG")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.2)" }} />
            </div>
          </div>

          {/* Center Streetwear Badge */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) rotate(-6deg)",
              backgroundColor: "#111111",
              padding: "16px 32px",
              border: "6px solid #FFD700",
              boxShadow: "10px 10px 0px #FF0055",
            }}
          >
            <KineticText text="SANTUY TAPI NENDANG" fontSize={56} color="#FFD700" strokeWidth={6} strokeColor="#000000" />
          </div>
        </AbsoluteFill>
      )}

      {/* SUB-SCENE 2D: Frame 180 - 240 (rel) -> Whip-pan Capture.PNG & Capture1.PNG */}
      {frame >= 180 && (
        <AbsoluteFill style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          {/* Capture.PNG (Car window pose) */}
          {frame < 210 ? (
            <div
              style={{
                transform: `translateX(${interpolate(frame - 180, [0, 10, 30], [-400, 0, 500])}px) rotate(-4deg)`,
              }}
            >
              <StickerImage src="assets/Capture.PNG" width={640} borderWidth={14} borderColor="#FFFFFF" />
            </div>
          ) : (
            /* Capture1.PNG (Duo in car) */
            <div
              style={{
                transform: `scale(${spring({ frame: frame - 210, fps, config: { damping: 10, stiffness: 120 } })}) rotate(2deg)`,
                position: "relative",
              }}
            >
              <StickerImage src="assets/Capture1.PNG" width={660} borderWidth={16} borderColor="#CCFF00" />
              {/* Parental Advisory Parody Badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: -20,
                  right: 30,
                  backgroundColor: "#FFFFFF",
                  border: "4px solid #111111",
                  padding: "4px 16px",
                  borderRadius: 4,
                  boxShadow: "6px 6px 0px #111111",
                }}
              >
                <span style={{ fontFamily: "'Impact', sans-serif", fontSize: 26, color: "#111111", letterSpacing: 1 }}>
                  PARENTAL ADVISORY // BARUDAK CONTENT
                </span>
              </div>
            </div>
          )}

          {/* Top Stamp */}
          <div style={{ position: "absolute", top: 120, transform: "rotate(-2deg)" }}>
            <div style={{ backgroundColor: "#FF0055", padding: "8px 28px", boxShadow: "8px 8px 0px #111111" }}>
              <KineticText text="CRUISING MODE 🚗💨" fontSize={64} color="#FFFFFF" strokeWidth={6} strokeColor="#000000" />
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ==============================================================
   SCENE 3: FAST-CUT KOPLO MONTAGE (Frames 540 - 750 | rel 0 - 210)
   ============================================================== */
const montageList = [
  { src: "assets/214421.PNG", zoom: true, rgb: true },
  { src: "assets/1421242.PNG", zoom: true, rgb: true },
  { src: "assets/1233122.PNG", zoom: false, rgb: false },
  { src: "assets/2131232132.PNG", zoom: false, rgb: false },
  { src: "assets/Capture.PNG", zoom: false, rgb: false },
  { src: "assets/2131.PNG", zoom: false, rgb: false },
  { src: "assets/42112451.PNG", zoom: false, rgb: false },
  { src: "assets/1425.PNG", zoom: false, rgb: false },
  { src: "assets/image.png", zoom: true, rgb: true },
];

const Scene3FastCutMontage: React.FC = () => {
  const frame = useCurrentFrame();

  // Switch image every 12 frames (0.2s @ 60fps)
  const cutIndex = Math.floor(frame / 12) % montageList.length;
  const currentPhoto = montageList[cutIndex];

  // Bass pump: every 15 frames scale pulses from 1.08 to 1.0
  const pumpProgress = (frame % 15) / 15;
  const pumpScale = interpolate(pumpProgress, [0, 0.25, 1], [1.08, 1.0, 1.0]);

  // Flash kinetic text synced to phrases:
  // f0 - 45: "HIP"
  // f45 - 95: "DUT"
  // f95 - 150: "GASS"
  // f150 - 210: "BARUDAK!"
  let currentWord = "HIP";
  let wordColor = "#CCFF00";
  if (frame >= 45 && frame < 95) {
    currentWord = "DUT";
    wordColor = "#FF0055";
  } else if (frame >= 95 && frame < 150) {
    currentWord = "GASS";
    wordColor = "#FFD700";
  } else if (frame >= 150) {
    currentWord = "BARUDAK!";
    wordColor = "#CCFF00";
  }

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${pumpScale})`,
        transformOrigin: "center center",
        backgroundColor: "#000000",
      }}
    >
      {/* Background Image filling frame */}
      <AbsoluteFill
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          filter: currentPhoto.rgb ? "contrast(1.3) saturate(1.4)" : "contrast(1.15) saturate(1.2)",
        }}
      >
        <Img
          src={staticFile(currentPhoto.src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: currentPhoto.zoom ? "scale(1.35)" : "scale(1.05)",
          }}
        />
      </AbsoluteFill>

      {/* VHS / Scanline Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 2px, transparent 2px, transparent 4px)",
          pointerEvents: "none",
        }}
      />

      {/* Giant Kinetic Word flashing in center */}
      <AbsoluteFill style={{ display: "flex", justifyContent: "center", alignItems: "center", pointerEvents: "none" }}>
        <div
          style={{
            transform: `scale(${1.0 + (frame % 12) * 0.03}) rotate(${(frame % 6 - 3) * 2}deg)`,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            padding: "16px 48px",
            border: `6px solid ${wordColor}`,
            boxShadow: `12px 12px 0px ${wordColor}`,
          }}
        >
          <KineticText text={currentWord} fontSize={140} color={wordColor} strokeWidth={12} strokeColor="#000000" />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ==============================================================
   SCENE 4: OUTRO COLLAGE & FREEZE FRAME (Frames 750 - 900 | rel 0 - 150)
   ============================================================== */
const Scene4OutroCollage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Tape stop / slow-down in last 30 frames (Frame 120 - 150)
  const isTapeStop = frame >= 120;
  const tapeVignette = isTapeStop ? interpolate(frame - 120, [0, 30], [0, 0.85], { extrapolateRight: "clamp" }) : 0;
  const tapeDesat = isTapeStop ? interpolate(frame - 120, [0, 30], [0, 0.6], { extrapolateRight: "clamp" }) : 0;

  // Staggered springs for scrapbook photos
  const s1 = spring({ frame, fps, config: { damping: 11, stiffness: 100 } });
  const s2 = spring({ frame: frame - 15, fps, config: { damping: 11, stiffness: 100 } });
  const s3 = spring({ frame: frame - 30, fps, config: { damping: 11, stiffness: 100 } });
  const s4 = spring({ frame: frame - 45, fps, config: { damping: 11, stiffness: 100 } });
  const titleSpring = spring({ frame: frame - 25, fps, config: { damping: 9, stiffness: 120 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#111111",
        filter: `saturate(${1.0 - tapeDesat})`,
        overflow: "hidden",
      }}
    >
      {/* Background collage base */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
        <Img src={staticFile("assets/1425.PNG")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(100%)" }} />
      </div>

      {/* Dot matrix */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle, rgba(204, 255, 0, 0.15) 2px, transparent 2px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Scrapbook Photos */}
      {/* Top Left: 2131232132.PNG */}
      <div
        style={{
          position: "absolute",
          top: 140,
          left: 60,
          transform: `scale(${s1})`,
        }}
      >
        <StickerImage src="assets/2131232132.PNG" width={380} rotation={-8} borderWidth={12} borderColor="#FFFFFF" />
      </div>

      {/* Top Right: 1233122.PNG */}
      <div
        style={{
          position: "absolute",
          top: 200,
          right: 50,
          transform: `scale(${s2})`,
        }}
      >
        <StickerImage src="assets/1233122.PNG" width={360} rotation={6} borderWidth={12} borderColor="#CCFF00" />
      </div>

      {/* Center Left: 214421.PNG */}
      <div
        style={{
          position: "absolute",
          top: 560,
          left: 80,
          transform: `scale(${s3})`,
        }}
      >
        <StickerImage src="assets/214421.PNG" width={340} rotation={-5} borderWidth={10} borderColor="#FF0055" />
      </div>

      {/* Center Right: 1421242.PNG */}
      <div
        style={{
          position: "absolute",
          top: 620,
          right: 60,
          transform: `scale(${s4})`,
        }}
      >
        <StickerImage src="assets/1421242.PNG" width={380} rotation={7} borderWidth={12} borderColor="#FFD700" />
      </div>

      {/* Bottom Center: image.png (cat ear sunglasses guy) */}
      <div
        style={{
          position: "absolute",
          bottom: 340,
          left: "50%",
          transform: `translateX(-50%) scale(${s1}) rotate(2deg)`,
        }}
      >
        <StickerImage src="assets/image.png" width={420} rotation={2} borderWidth={12} borderColor="#FFFFFF" />
      </div>

      {/* Giant Graffiti / Brutalist Typography */}
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", paddingBottom: 100, pointerEvents: "none" }}>
        <div
          style={{
            transform: `scale(${titleSpring})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          {/* Main Title */}
          <div
            style={{
              backgroundColor: "#111111",
              padding: "16px 40px",
              border: "6px solid #CCFF00",
              boxShadow: "12px 12px 0px #FF0055",
              transform: "rotate(-3deg)",
            }}
          >
            <KineticText text="BARUDAK HIPDUT" fontSize={88} color="#CCFF00" strokeWidth={8} strokeColor="#000000" />
          </div>

          {/* Subtitle Ribbon */}
          <div
            style={{
              backgroundColor: "#FF0055",
              padding: "8px 28px",
              boxShadow: "8px 8px 0px #111111",
              transform: "rotate(2deg)",
            }}
          >
            <span
              style={{
                fontFamily: "'Courier New', Courier, monospace",
                fontWeight: 900,
                fontSize: 26,
                color: "#FFFFFF",
                letterSpacing: 2,
              }}
            >
              MATUR SUWUN // EXECUTIVE PRODUCER: BARUDAK
            </span>
          </div>
        </div>
      </AbsoluteFill>

      {/* Tape stop dark vignette */}
      {isTapeStop && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle, transparent 40%, rgba(0,0,0,${tapeVignette}) 90%)`,
            pointerEvents: "none",
          }}
        />
      )}
    </AbsoluteFill>
  );
};
