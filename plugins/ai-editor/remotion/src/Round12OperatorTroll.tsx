import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CartoonTextBox } from "./components/CartoonTextBox";
import { GunCutoutMascot } from "./components/GunCutoutMascot";

export interface Round12OperatorTrollProps {
  gameplaySrc?: string;
}

export const Round12OperatorTroll: React.FC<Round12OperatorTrollProps> = ({
  gameplaySrc = "gameplay.mp4",
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // 12fps Stepped Frame (Stop-motion feel for cartoon physics)
  const stepped = Math.floor(frame / 4);

  // -------------------------------------------------------------
  // CAMERA ZOOM & SHAKE CONTROLLER
  // -------------------------------------------------------------
  // Scene 2 Minimap Zoom: 00:13 - 00:26 (Frame 780 - 1560)
  // Scene 4 Buy Phase Creep Zoom: 00:33 - 00:37.5 (Frame 1980 - 2250)
  let cameraScale = 1.0;
  let cameraOrigin = "center center";

  if (frame >= 780 && frame <= 1620) {
    cameraScale = interpolate(
      frame,
      [780, 840, 1560, 1620],
      [1.0, 2.3, 2.3, 1.0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    cameraOrigin = "22% 12%";
  } else if (frame >= 1980 && frame < 2250) {
    cameraScale = interpolate(frame, [1980, 2250], [1.0, 1.25], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    cameraOrigin = "50% 55%";
  }

  // Cartoon Screen Shake during Scene 4 Punchline (00:37.5+: Frame 2250 - 3000)
  let shakeX = 0;
  let shakeY = 0;
  let shakeRot = 0;

  if (frame >= 2250 && frame <= 2800) {
    const shakeIntensity = interpolate(frame, [2250, 2340, 2750, 2800], [0, 24, 14, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    shakeX = (stepped % 2 === 0 ? 1 : -1) * shakeIntensity;
    shakeY = ((stepped + 1) % 2 === 0 ? 1 : -1) * (shakeIntensity * 0.7);
    shakeRot = (stepped % 2 === 0 ? 1 : -1) * (shakeIntensity * 0.15);
  }

  // -------------------------------------------------------------
  // CONFETTI / CARTOON FALLING STICKERS (Scene 4: Frame 2280 - 3000)
  // -------------------------------------------------------------
  const fallingStickers = useMemo(() => {
    const items = ["🐷", "💀", "🤡", "🤣", "💥", "💣", "💩"];
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      char: items[i % items.length],
      x: 60 + ((i * 41) % (width - 140)),
      speed: 1.2 + (i % 5) * 0.35,
      delay: (i * 18) % 180,
      size: 48 + (i % 4) * 14,
      rotOffset: (i * 37) % 360,
    }));
  }, [width]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        overflow: "hidden",
      }}
    >
      {/* Cartoon Web Fonts & Global Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Luckiest+Guy&family=Fredoka:wght@800;900&display=swap');
        * {
          box-sizing: border-box;
          user-select: none;
        }
      `}</style>

      {/* Camera / Video Container with Zoom & Shake */}
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `translate(${shakeX}px, ${shakeY}px) rotate(${shakeRot}deg) scale(${cameraScale})`,
          transformOrigin: cameraOrigin,
        }}
      >
        <OffthreadVideo
          src={staticFile(gameplaySrc)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* ========================================================
          SCENE 1: WIN ROUND & THE TROLL SETUP (00:00 - 00:13 | Frame 0 - 780)
          ======================================================== */}
      {/* 00:00 - 00:06: Comic Title Card */}
      {frame >= 0 && frame < 360 && (
        <div
          style={{
            position: "absolute",
            top: 480,
            left: 0,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            zIndex: 40,
          }}
        >
          <CartoonTextBox
            bg="#FFDE00"
            fontSize={42}
            rotation={-2}
            shadowOffset={8}
          >
            POV: TEMEN LAMA GAK MAIN VALO... 🎮
          </CartoonTextBox>
        </div>
      )}

      {/* 00:08 - 00:10: Musuh Terakhir Mati / Round Secure */}
      {frame >= 480 && frame < 600 && (
        <div
          style={{
            position: "absolute",
            top: 540,
            left: 0,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            zIndex: 40,
          }}
        >
          <CartoonTextBox
            bg="#00E5FF"
            fontSize={40}
            rotation={3}
            shadowOffset={8}
            burst={true}
          >
            RONDE AMAN! SAATNYA NGE-TROLL... 😈
          </CartoonTextBox>
        </div>
      )}

      {/* 00:10 - 00:13: The Troll Callout */}
      {frame >= 600 && frame < 780 && (
        <div
          style={{
            position: "absolute",
            bottom: 420,
            left: 0,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            zIndex: 45,
          }}
        >
          <CartoonTextBox
            bg="#FFDE00"
            fontSize={48}
            rotation={-3}
            burst={true}
          >
            OP DI MID!! LARI LARI LARI!! 🏃‍♂️💨
          </CartoonTextBox>

          {/* Visual Cue Score Reminder (10 - 1) */}
          {frame >= 660 && (
            <div
              style={{
                position: "absolute",
                top: -560,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  fontSize: 50,
                  transform: "rotate(180deg)",
                  filter: "drop-shadow(3px 3px 0px #000)",
                }}
              >
                👇
              </div>
              <CartoonTextBox
                bg="#FF2A2A"
                textColor="#FFFDF0"
                fontSize={32}
                rotation={2}
                shadowOffset={6}
              >
                PADAHAL RONDE 12 (MAU SWITCH SIDE) 🤫🤭
              </CartoonTextBox>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          SCENE 2: CLEAN MINIMAP ZOOM (00:13 - 00:26 | Frame 780 - 1560)
          ======================================================== */}
      {/* Subtitle Scene 2: 00:15 - 00:20 (Frame 900 - 1200) */}
      {frame >= 900 && frame < 1200 && (
        <div
          style={{
            position: "absolute",
            bottom: 240,
            left: 0,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <CartoonTextBox
            bg="#FFFDF0"
            textColor="#000000"
            fontSize={36}
            rotation={1}
            shadowOffset={6}
          >
            🎵 (Nyanyi santai sambil nunggu defuse) 🎵
          </CartoonTextBox>
        </div>
      )}

      {/* Subtitle Scene 2 (Salah manuver): 00:20 - 00:23 (Frame 1200 - 1380) */}
      {frame >= 1200 && frame < 1380 && (
        <div
          style={{
            position: "absolute",
            bottom: 240,
            left: 0,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <CartoonTextBox
            bg="#00E5FF"
            textColor="#000000"
            fontSize={36}
            rotation={-1}
            shadowOffset={6}
          >
            "Salah manuver, salah manuver mas! 🔄🤣"
          </CartoonTextBox>
        </div>
      )}

      {/* ========================================================
          SCENE 3: "AWP-NYA DI MANA?!" & ARRIVAL (00:26 - 00:33 | Frame 1560 - 1980)
          ======================================================== */}
      {/* 00:26 - 00:29: Teks Raungan "AWP-NYA DI MANA?!" */}
      {frame >= 1560 && frame < 1740 && (
        <div
          style={{
            position: "absolute",
            top: "45%",
            left: 0,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            zIndex: 60,
          }}
        >
          <CartoonTextBox
            bg="#FF2A2A"
            textColor="#FFFDF0"
            fontSize={56}
            rotation={stepped % 2 === 0 ? -4 : 4}
            shadowOffset={10}
            burst={true}
          >
            AWP-NYA DI MANA ANJ*NG?! 🤨⁉️
          </CartoonTextBox>
        </div>
      )}

      {/* 00:30 - 00:33: Chamber lari balik ke Site A tangan kosong */}
      {frame >= 1800 && frame < 1980 && (
        <div
          style={{
            position: "absolute",
            top: 480,
            right: 80,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 60,
          }}
        >
          <CartoonTextBox
            bg="#FFDE00"
            fontSize={32}
            rotation={-3}
            shadowOffset={6}
          >
            Capek lari keliling map tapi tangan kosong 🤡💦
          </CartoonTextBox>
          <div style={{ marginTop: 16 }}>
            <GunCutoutMascot mode="running" size={170} sweat={true} />
          </div>
        </div>
      )}

      {/* ========================================================
          SCENE 4: BUY PHASE BRAIN BUFFERING & EXPLOSION (00:33 - 00:50 | Frame 1980 - 3000)
          ======================================================== */}
      {/* 00:33 - 00:37.5: Silence / Loading Otak */}
      {frame >= 1980 && frame < 2250 && (
        <div
          style={{
            position: "absolute",
            top: 460,
            left: 0,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 60,
          }}
        >
          <GunCutoutMascot mode="thinking" size={230} />
          <div style={{ marginTop: 24 }}>
            <CartoonTextBox
              bg="#FFFDF0"
              textColor="#000000"
              fontSize={36}
              rotation={2}
              shadowOffset={6}
            >
              Mencerna keadaan... {Math.min(99, Math.floor(((frame - 1980) / 270) * 100))}%... 🧠⚙️
            </CartoonTextBox>
          </div>
        </div>
      )}

      {/* 00:37.5 - 00:40: Punchline "EH! BABI! BABI!" */}
      {frame >= 2250 && frame < 2400 && (
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: 0,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 80,
          }}
        >
          <GunCutoutMascot mode="triggered" size={260} />
          <div style={{ marginTop: 32 }}>
            <CartoonTextBox
              bg="#FF2A2A"
              textColor="#FFFDF0"
              fontSize={68}
              rotation={stepped % 2 === 0 ? -5 : 5}
              shadowOffset={12}
              burst={true}
            >
              EH! B*BI!! 🐷🤬
            </CartoonTextBox>
          </div>
        </div>
      )}

      {/* 00:40 - 00:43: "UDAH LARI MUTER-MUTER..." */}
      {frame >= 2400 && frame < 2580 && (
        <div
          style={{
            position: "absolute",
            top: "45%",
            left: 0,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            zIndex: 80,
          }}
        >
          <CartoonTextBox
            bg="#FFDE00"
            fontSize={52}
            rotation={-3}
            shadowOffset={10}
            burst={true}
          >
            UDAH LARI MUTER-MUTER... 🥵🏃💨
          </CartoonTextBox>
        </div>
      )}

      {/* 00:43 - 00:50: "PADAHAL GANTI HALF!!" */}
      {frame >= 2580 && frame <= 3000 && (
        <div
          style={{
            position: "absolute",
            top: "44%",
            left: 0,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            zIndex: 80,
          }}
        >
          <CartoonTextBox
            bg="#FF2A2A"
            textColor="#FFFDF0"
            fontSize={62}
            rotation={3}
            shadowOffset={12}
            burst={true}
          >
            PADAHAL GANTI HALF!! 💀🤣
          </CartoonTextBox>
          <CartoonTextBox
            bg="#00E5FF"
            textColor="#000000"
            fontSize={42}
            rotation={-2}
            shadowOffset={8}
          >
            SENJATA KE-RESET SEMUA!! 🤡💥
          </CartoonTextBox>
        </div>
      )}

      {/* Subtitles: 00:41 & 00:47 */}
      {frame >= 2460 && frame < 2640 && (
        <div
          style={{
            position: "absolute",
            bottom: 220,
            left: 0,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            zIndex: 85,
          }}
        >
          <CartoonTextBox
            bg="#FFDE00"
            fontSize={36}
            rotation={2}
            shadowOffset={6}
          >
            Gua dukung anj*ng wkwkwk 🤣
          </CartoonTextBox>
        </div>
      )}

      {frame >= 2820 && frame <= 2980 && (
        <div
          style={{
            position: "absolute",
            bottom: 220,
            left: 0,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            zIndex: 85,
          }}
        >
          <CartoonTextBox
            bg="#FFFDF0"
            fontSize={36}
            rotation={-2}
            shadowOffset={6}
          >
            Gua dari tadi diem nahan ketawa 😭
          </CartoonTextBox>
        </div>
      )}

      {/* Confetti Falling Meme Emojis (Scene 4: Frame 2280 - 3000) */}
      {frame >= 2280 &&
        fallingStickers.map((s) => {
          const rel = frame - 2280 - s.delay;
          if (rel < 0) return null;
          const cycleProgress = (rel * s.speed) % 220;
          const y = interpolate(cycleProgress, [0, 220], [-80, height + 80]);
          const x = s.x + Math.sin(frame * 0.1 + s.id) * 35;
          const rot = s.rotOffset + Math.sin(frame * 0.05 + s.id) * 45;

          return (
            <div
              key={s.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                transform: `translate(${x}px, ${y}px) rotate(${rot}deg)`,
                fontSize: s.size,
                filter: "drop-shadow(4px 4px 0px #000000)",
                pointerEvents: "none",
                zIndex: 75,
              }}
            >
              {s.char}
            </div>
          );
        })}
    </AbsoluteFill>
  );
};
