<p align="center">
  <img src="plugins/ai-editor/lib/ai_editor/favicon.svg" width="90" height="90" alt="MEMASAK Logo">
</p>

<h1 align="center">MEMASAK</h1>

<p align="center">
  <b>Modular AI Video Studio & Remotion Engine</b><br>
  <i>Studio video editor berbasis Remotion penuh di web dengan kustomisasi per-part modular, integrasi AI gateway lokal 9Router (BYOK), transkripsi Whisper otomatis, dan arsitektur rendering headless berstandar produksi.</i>
</p>

---

## Daftar Isi
- [Tentang MEMASAK](#tentang-memasak)
- [Fitur Utama](#fitur-utama)
  - [1. Studio Editor Interaktif Penuh (Remotion Studio)](#1-studio-editor-interaktif-penuh-remotion-studio)
  - [2. Kustomisasi Komposisi Per-Part (Zod Schema Controls)](#2-kustomisasi-komposisi-per-part-zod-schema-controls)
  - [3. Koleksi Komposisi Kreatif Siap Pakai](#3-koleksi-komposisi-kreatif-siap-pakai)
  - [4. Integrasi Gateway AI Lokal 9Router (BYOK & Zero-Leakage)](#4-integrasi-gateway-ai-lokal-9router-byok--zero-leakage)
  - [5. Pipeline Transkripsi & Pemotongan Cerdas](#5-pipeline-transkripsi--pemotongan-cerdas)
  - [6. Desain Visual Anti-AI-Slop (Neo-Brutalist & Comic Pop-Art)](#6-desain-visual-anti-ai-slop-neo-brutalist--comic-pop-art)
- [Struktur Direktori Repositori](#struktur-direktori-repositori)
- [Panduan Penggunaan](#panduan-penggunaan)
  - [Cara 1: Remotion Studio Interaktif (Rekomendasi Kreator)](#cara-1-remotion-studio-interaktif-rekomendasi-kreator)
  - [Cara 2: Docker Container (VM & Produksi)](#cara-2-docker-container-vm--produksi)
  - [Cara 3: Bare-Metal Local (CLI & Scripting)](#cara-3-bare-metal-local-cli--scripting)
- [Konfigurasi Gateway & Autentikasi](#konfigurasi-gateway--autentikasi)
- [Audit & Integritas Sistem](#audit--integritas-sistem)
- [Lisensi & Atribusi](#lisensi--atribusi)

---

## Tentang MEMASAK

**MEMASAK** adalah platform studio video editor bertenaga **Remotion 4** dan **React 19** yang dirancang untuk produksi konten video pendek (*TikTok, Instagram Reels, YouTube Shorts*) serta video presentasi teknis tingkat tinggi.

Berbeda dari alur editor video AI kaku yang berbasis template potong statis, MEMASAK memberikan kendali visual penuh kepada kreator melalui antarmuka web:
1. **Pratinjau Nyata & Scrubbing Presisi:** Navigasi timeline frame-by-frame (60fps / 30fps), waveform audio sinkron, dan kanvas pratinjau responsif.
2. **Modular Per Part:** Setiap layer visual (teks hook, zoom kamera, warna, maskot reaksi, stiker konfeti, efek guncangan layar) diatur lewat parameter terstruktur (*schema-driven props*).
3. **Privasi & Fleksibilitas Model:** Bebas dari keterikatan vendor tunggal; terhubung ke gateway **9Router** lokal untuk analisis multimodal dan orkestrasi agent.

---

## Fitur Utama

### 1. Studio Editor Interaktif Penuh (Remotion Studio)
- Didukung langsung oleh engine resmi `@remotion/studio`.
- Menampilkan pohon komponen visual React secara langsung di peramban web.
- Dilengkapi alat playback pro: kontrol kecepatan (0.5x s/d 2x), in/out point marker, layer snapping, dan pemantau audio multi-track.

### 2. Kustomisasi Komposisi Per-Part (Zod Schema Controls)
Setiap elemen diatur secara modular melalui skema validasi tipe data Zod dan `@remotion/zod-types`:
- **Part 1 (Intro Hook):** Teks kartu pembuka, warna latar belakang, visibilitas badge sub-callout.
- **Part 2 (Minimap & Camera Control):** Slider faktor perbesaran (*scale* 1.0x s/d 4.0x), titik fokus kamera (*origin X/Y* %), durasi & waktu trigger perbesaran.
- **Part 3 (Dynamic Subtitles):** Ukuran tipografi, palet warna teks, latar belakang boks subtitle.
- **Part 4 (Reaction Mascot):** Pengalih visibilitas maskot stiker, ukuran perbesaran, animasi fisika kartun bertahap (*stepped 12fps*).
- **Part 5 (Climax & Punchline):** Teks teriakan punchline, intensitas guncangan kanvas (*screen shake* 0 s/d 50), jumlah dan pengalih stiker konfeti meme.

### 3. Koleksi Komposisi Kreatif Siap Pakai
- **`Round12OperatorTroll`:** Komposisi meme gaming Valorant 60fps dengan punch-in minimap bersih, tipografi komik tebal, maskot kartun bergerak, dan efek guncangan kanvas.
- **`HipdutMontage`:** Komposisi gerak visual beat kendang koplo 130 BPM, transisi camcorder, marquee latar dinamis, stiker terisolasi, dan tipografi kinetik.
- **`CinematicStory`:** Komposisi cerita naratif sinematik bernuansa HUD reticle telemetri futuristik, audio stem ambien bertingkat, dan subtitle kinetik.
- **`CinematicBeachVlog`:** Komposisi estetika vlog pantai dengan rasio letterbox sinematik, efek sun flare procedural, dan transisi pudar lembut.
- **`StyleEdit`:** Komposisi adaptif multi-layer untuk penyesuaian gaya visual dari hasil analisis profil kreator referensi.

### 4. Integrasi Gateway AI Lokal 9Router (BYOK & Zero-Leakage)
- Menghubungkan seluruh proses inferensi AI ke 9Router lokal (`http://localhost:20128`):
  - **Teardown Visual Multimodal:** Analisis struktur visual video menggunakan `ag/gemini-3.8-flash-high` melalui endpoint `/v1beta/` dengan ekstraksi frame JPEG base64.
  - **Review & Skill Generator:** Pembuatan rule visual dan integrasi revisi catatan pengguna via endpoint `/v1/chat/completions` atau `/v1/messages`.
- Dilengkapi *tolerant JSON parser*, penanganan status 429 otomatis, dan proteksi kegagalan parsing markdown.

### 5. Pipeline Transkripsi & Pemotongan Cerdas
- Ekstraksi transkripsi dialog per kata menggunakan engine **Whisper** terintegrasi.
- Deteksi retake dan eliminasi jeda hening secara otomatis melalui pemodelan timeline non-destruktif.
- Output potongan video bersih dalam format H.264 AAC.

### 6. Desain Visual Anti-AI-Slop (Neo-Brutalist & Comic Pop-Art)
Mengeliminasi tampilan AI generik (gradien ungu-biru lembut, glassmorphism buram, font tipis tanpa kontras):
- **Border Hitam Tegas:** Garis tepi 4px - 6px solid `#000000`.
- **Hard Offset Shadow:** Bayangan tegas 6px - 10px tanpa efek blur (`boxShadow: 6px 6px 0px #000000`).
- **Stepped Stop-Motion Feel:** Kuantisasi pergerakan stiker dan maskot pada frame rate 12-15fps (`Math.floor(frame / 4)`).
- **Tipografi Komik Berkarakter:** Menggunakan font *Bangers*, *Luckiest Guy*, dan *Fredoka* dengan kontur teks tebal.

---

## Struktur Direktori Repositori

```
FlashVeditor/
├── plugins/
│   ├── ai-editor/                         # Core Studio Engine
│   │   ├── lib/ai_editor/                 # Server web review, home orchestrator, worker daemon
│   │   │   ├── home.py                    # Server dashboard, job queue, thumbnail handler
│   │   │   ├── worker.py                  # Daemon background pemroses audio, cut, dan render
│   │   │   ├── review.py                  # Server preview interaktif & reverse proxy
│   │   │   ├── home.html                  # Antarmuka dashboard MEMASAK
│   │   │   └── review.html                # Antarmuka studio review & revisi
│   │   ├── remotion/                      # Remotion 4 React Rendering Engine
│   │   │   ├── src/
│   │   │   │   ├── Root.tsx               # Registrasi komposisi & Zod schema props
│   │   │   │   ├── Round12OperatorTroll.tsx # Komposisi meme gaming kartun 60fps
│   │   │   │   ├── HipdutMontage.tsx      # Komposisi mograph hipdut koplo 60fps
│   │   │   │   ├── CinematicStory.tsx     # Komposisi sinematik HUD telemetri
│   │   │   │   ├── CinematicBeachVlog.tsx # Komposisi vlog pantai letterbox
│   │   │   │   ├── StyleEdit.tsx          # Komposisi adaptif multi-layer
│   │   │   │   └── components/            # Komponen visual modular
│   │   │   │       ├── CartoonTextBox.tsx # Boks teks neo-brutalist komik
│   │   │   │       ├── GunCutoutMascot.tsx # Maskot reaksi animasi 12fps
│   │   │   │       └── DynamicSubtitles.tsx # Subtitle kinetik tersinkronisasi
│   │   │   └── public/                    # Aset video, audio stem, dan stiker
│   │   └── skills/                        # Skill pemrosesan media
│   │       ├── cut/                       # Whisper transcription & FFmpeg cutter
│   │       └── style-edit/                # Perencana layout & pipeline render
│   └── creator-teardown/                  # Ekstraksi visual referensi kreator
├── .audit/                                # Suite kontrak audit (T-00 s/d T-35)
├── docs/                                  # Dokumentasi perubahan & panduan rollback
├── Dockerfile                             # Konfigurasi container runtime headless
├── docker-compose.yml                     # Konfigurasi deployment multi-port Docker
└── docker-entrypoint.sh                   # Inisialisasi container & supervisor loop
```

---

## Panduan Penggunaan

### Cara 1: Remotion Studio Interaktif (Rekomendasi Kreator)
Buka dan jalankan studio editor visual langsung di browser lokal Anda:

```bash
# Masuk ke direktori Remotion
cd plugins/ai-editor/remotion

# Jalankan Remotion Studio
npm run studio
```

Studio akan terbuka otomatis di `http://localhost:3000` (atau port yang ditentukan). Anda dapat:
- Memilih komposisi video di panel sebelah kiri.
- Mengatur teks, warna, ukuran, dan perbesaran kamera di panel sebelah kanan.
- Melakukan scrubbing timeline secara presisi sebelum melakukan render.

---

### Cara 2: Docker Container (VM & Produksi)
Jalankan studio video headless di server atau Docker VM dengan supervisor loop mandiri:

```bash
# Clone branch main
git clone https://github.com/Thaaan184/FlashVeditor.git
cd FlashVeditor

# Nyalakan kontainer
docker compose up -d
```

- Dashboard MEMASAK aktif pada: `http://localhost:47821`
- Remotion Studio aktif pada port: `47825`
- Supervisor loop di latar belakang otomatis memantau daemon `worker.py` dan memperbarui status antarmuka secara realtime.

---

### Cara 3: Bare-Metal Local (CLI & Scripting)
Jalankan rendering video headless melalui baris perintah CLI:

```bash
# Masuk ke direktori engine
cd plugins/ai-editor/remotion

# Render komposisi spesifik ke file MP4 definisi tinggi
npx remotion render src/index.ts Round12OperatorTroll output.mp4 --concurrency=8
```

---

## Konfigurasi Gateway & Autentikasi

Untuk menghubungkan MEMASAK ke gateway 9Router lokal:

1. Buat atau perbarui file environment di `~/.config/creator-teardown/.env` (atau file `.env` di root repositori):
   ```bash
   GEMINI_BASE_URL=http://localhost:20128
   GEMINI_API_VERSION=v1beta
   GEMINI_AUTH_MODE=bearer
   GEMINI_MODEL=ag/gemini-3.8-flash-high
   GEMINI_API_KEY=MEMASAK
   ```

2. Jalankan pemeriksaan kesiapan dependensi sistem:
   ```bash
   python3 plugins/ai-editor/skills/setup/scripts/setup.py doctor
   ```

---

## Audit & Integritas Sistem

Repositori ini dikelola dengan standar integritas ketat yang terdokumentasi di folder `.audit/`:
- **Pemeriksaan Kontrak:** Setiap commit divalidasi oleh skrip `.audit/check_docs.py` dengan metadata `Change-Doc` dan `Verdict: accept`.
- **Zero Secrets:** Bebas dari hardcoded API key, token rahasia, maupun kredensial privat.
- **Reversibilitas Penuh:** Seluruh riwayat perubahan tercatat di [`docs/CHANGES.md`](docs/CHANGES.md) dan dapat di-rollback mengacu pada [`docs/REVERT.md`](docs/REVERT.md).

---

## Lisensi & Atribusi

- **MEMASAK Modifications:** Hak Cipta © 2026 PT Nalar Cerdas Teknologi / Thaaan184. Didistribusikan di bawah lisensi MIT.
- **Upstream Engine:** Berbasis engine terbuka `nextwork-projects/ai-video-editor-cooked` (Lisensi MIT).
- **Remotion:** Menggunakan framework rendering video berbasis React `@remotion` (Lisensi Perusahaan/Inovator Remotion).
