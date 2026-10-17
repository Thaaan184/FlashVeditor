<p align="center">
  <img src="docs/logo.svg" width="80" height="80" alt="FlashVeditor Logo">
</p>

<h1 align="center">FlashVeditor</h1>

<p align="center">
  <b>High-Performance AI Video Editor with Local 9Router Gateway & BYOK Architecture</b><br>
  <i>Fork resmi dan teroptimasi dari NextWork cooked. dengan dukungan penuh gateway AI lokal, isolasi privasi, dan deployment Docker.</i>
</p>

---

## Daftar Isi
- [Tentang FlashVeditor](#tentang-flashveditor)
- [Mengapa 9Router Gateway?](#mengapa-9router-gateway)
- [Struktur & Kemampuan Engine](#struktur--kemampuan-engine)
- [Cara Cepat: Menggunakan Docker (Rekomendasi)](#cara-cepat-menggunakan-docker-rekomendasi)
- [Cara Manual: Bare-Metal (PC Pribadi)](#cara-manual-bare-metal-pc-pribadi)
  - [Prasyarat Sistem](#prasyarat-sistem)
  - [Instalasi & Bootstrap](#instalasi--bootstrap)
  - [Konfigurasi Gateway](#konfigurasi-gateway)
- [Alur Kerja & Penggunaan](#alur-kerja--penggunaan)
  - [1. Web UI Mandiri (Tanpa Agent)](#1-web-ui-mandiri-tanpa-agent)
  - [2. CLI Script Langsung](#2-cli-script-langsung)
  - [3. Orchestrator Agent (Claude Code / Codex / Cursor)](#3-orchestrator-agent-claude-code--codex--cursor)
- [Audit & Integritas Sistem](#audit--integritas-sistem)
- [Lisensi & Atribusi](#lisensi--atribusi)

---

## Tentang FlashVeditor

**FlashVeditor** adalah engine penyunting video otomatis untuk format *talking-head*, video pendek (*short-form / reels / TikTok*), dan materi edukasi/bisnis.

Dua tugas utama engine:
1. **Pembersihan Rekaman (Cut Engine):** Mengeliminasi kata salah (*retakes*), jeda panjang (*awkward pauses*), dan gumaman (*filler words*) menggunakan model speech-to-text Whisper lokal.
2. **Penerapan Gaya Visual (Style & Render Engine):** Mengukur tempo potongan, zoom kamera dinamis, tipografi subtitle per kata, animasi kartu overlay, dan sound effect (SFX) dari profil kreator referensi, lalu merendernya dalam format MP4 definisi tinggi via engine Remotion 4.

Proyek ini telah direkayasa ulang pada branch `feat/9router-gateway` agar seluruh pemrosesan AI (analisis visual teardown dan orkestrasi agent) dialihkan ke gateway lokal **9Router**.

---

## Mengapa 9Router Gateway?

Pada implementasi upstream asli, sistem memiliki keterikatan (*hardcoded vendor lock-in*) ke Google AI Studio dan Anthropic Direct API. FlashVeditor mengalihkan seluruh lalu lintas ke gateway lokal 9Router (`http://localhost:20128`):

- **Zero Data Leakage:** Seluruh request prompt, video frames, dan log berjalan melalui gateway lokal privat Anda.
- **Dukungan Multi-Model Fleksibel (BYOK):**
  - **Teardown Visual Multimodal:** Menggunakan `ag/gemini-3.8-flash-high` melalui endpoint native `/v1beta/` dengan sampling frame JPEG base64.
  - **Agent Orchestrator:** Menggunakan model reasoning pilihan seperti `ag/claude-opus-4-6-thinking` atau `ag/claude-sonnet-4-6` via endpoint SSE streaming `/v1/messages`.
- **Ketahanan Jaringan:** Dilengkapi algoritma *tolerant JSON parser*, auto-retry pada status 429, dan proteksi kegagalan parsing format markdown.

---

## Struktur & Kemampuan Engine

```
FlashVeditor/
├── plugins/
│   ├── ai-editor/             # Core Video Editor
│   │   ├── lib/ai_editor/     # Server review, home server, askhook, library
│   │   ├── remotion/          # Remotion 4 React rendering engine (H.264 MP4)
│   │   └── skills/
│   │       ├── cut/           # Whisper transcribe + timeline builder + FFmpeg cutter
│   │       ├── style-edit/    # Layout generator, card animation, audio ducking, renderer
│   │       └── setup/         # System doctor & automated bootstrapper
│   └── creator-teardown/      # Visual Analysis Plugin
│       └── skills/
│           └── creator-teardown/scripts/gemini.py # 9Router Gemini Gateway Client
├── .audit/                    # Suite audit, kontrak pengujian (T-00 s/d T-13), dan guard
├── Dockerfile                 # Konfigurasi containerized runtime lengkap
├── docker-compose.yml         # 1-click startup compose
└── docker-entrypoint.sh       # Auto-provisioning environment & server launcher
```

---

## Cara Cepat: Menggunakan Docker (Rekomendasi)

Metode termudah untuk menjalankan FlashVeditor di PC pribadi (Linux, macOS, atau Windows dengan Docker Desktop) tanpa perlu mengonfigurasi Python venv atau Node.js manual di sistem host.

### 1. Prasyarat Docker
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/) terpasang.
- Gateway 9Router telah berjalan di PC host pada port `20128`.

### 2. Jalankan Kontainer
```bash
# Clone branch feat/9router-gateway
git clone -b feat/9router-gateway https://github.com/Thaaan184/FlashVeditor.git
cd FlashVeditor

# Nyalakan kontainer di latar belakang
docker compose up -d
```

*Catatan: Kontainer otomatis menghubungkan engine video ke 9Router di PC host via `host.docker.internal:20128`.*

### 3. Akses Antarmuka Web
Buka browser Anda dan akses:
```
http://localhost:47821
```
Letakkan file video mentah Anda di direktori `./library` pada host; file tersebut akan terbaca otomatis di dalam antarmuka FlashVeditor.

### 4. Perintah Berguna Kontainer
- Melihat log aktivitas server: `docker compose logs -f`
- Mematikan kontainer: `docker compose down`
- Masuk ke terminal kontainer: `docker compose exec flashveditor bash`

---

## Cara Manual: Bare-Metal (PC Pribadi)

Gunakan metode ini jika ingin menjalankan engine langsung di sistem operasi tanpa lapisan kontainerisasi.

### Prasyarat Sistem
1. **Python 3.10 atau lebih baru** (disarankan Python 3.11).
2. **Node.js 20 LTS atau lebih baru** (disarankan Node.js 22).
3. **FFmpeg & FFprobe 7.0+** (pastikan executable berada pada `PATH` sistem).
4. **9Router** aktif di `http://localhost:20128`.

### Instalasi & Bootstrap

```bash
git clone -b feat/9router-gateway https://github.com/Thaaan184/FlashVeditor.git
cd FlashVeditor

# Jalankan bootstrap otomatis (menginstal venv, model Whisper, dan dependensi Remotion)
python3 plugins/ai-editor/skills/setup/scripts/setup.py bootstrap
```

Periksa kesiapan sistem:
```bash
python3 plugins/ai-editor/skills/setup/scripts/setup.py doctor
```
Pastikan seluruh dependensi bertanda `ok`.

### Konfigurasi Gateway

#### A. Konfigurasi Teardown Visual Gemini (9Router)
Buat file konfigurasi rahasia lokal di `~/.config/creator-teardown/.env`:
```bash
mkdir -p ~/.config/creator-teardown
cat << 'EOF' > ~/.config/creator-teardown/.env
GEMINI_BASE_URL=http://localhost:20128
GEMINI_API_VERSION=v1beta
GEMINI_AUTH_MODE=bearer
GEMINI_MODEL=ag/gemini-3.8-flash-high
GEMINI_API_KEY=FlashVeditor
EOF
chmod 600 ~/.config/creator-teardown/.env
```
*(Ganti `FlashVeditor` dengan API key 9Router Anda jika menggunakan autentikasi spesifik).*

#### B. Konfigurasi Orchestrator Claude Code (Opsional)
Jika Anda menggunakan Claude Code sebagai agen pemotong:
```bash
cp .claude/settings.local.json.example .claude/settings.local.json
```
Isi variabel `ANTHROPIC_AUTH_TOKEN` pada file `.claude/settings.local.json` dengan API key 9Router Anda.

---

## Alur Kerja & Penggunaan

### 1. Web UI Mandiri (Tanpa Agent)
Jalankan server aplikasi lokal:
```bash
python3 plugins/ai-editor/lib/ai_editor/home.py serve
```
Buka URL ber-token yang tercetak di terminal pada browser Anda. Anda dapat melakukan *drag-and-drop* video, memilih preset style, meninjau hasil pemotongan kata, serta mengunduh hasil render final.

### 2. CLI Script Langsung
Anda dapat mengeksekusi pipeline penyuntingan per tahapan secara langsung melalui script Python di venv:

```bash
# Aktifkan virtualenv bawaan
source ~/.ai-video-editor/venv/bin/activate

# 1. Ekstraksi transkripsi per kata menggunakan Whisper
python3 plugins/ai-editor/skills/cut/scripts/transcribe.py input.mp4 words.json --engine whisper

# 2. Analisis keputusan pemotongan timeline
python3 plugins/ai-editor/skills/cut/scripts/build_timeline.py words.json decisions.json

# 3. Potong video dengan FFmpeg
python3 plugins/ai-editor/skills/cut/scripts/render.py input.mp4 decisions.json cut.mp4

# 4. Analisis visual referensi kreator via 9Router Gemini
python3 plugins/creator-teardown/skills/creator-teardown/scripts/gemini.py look referensi.mp4

# 5. Susun rencana visual (captions, zoom, overlay cards)
python3 plugins/ai-editor/skills/style-edit/scripts/plan.py style.json captions.json --out plan.json

# 6. Render hasil video final dengan Remotion engine
python3 plugins/ai-editor/skills/style-edit/scripts/edit.py render folder_proyek/
```

### 3. Orchestrator Agent (Claude Code / Codex / Cursor)

FlashVeditor mendukung berbagai cara menjalankan agent:

#### Way 1: open this folder in Claude Code (Direkomendasikan untuk pengembangan lokal)
Buka terminal pada direktori root repositori, lalu jalankan:
```bash
claude
```
Ketik perintah percakapan, misalnya:
> *"Tolong potong video take1.mp4 dan berikan style sesuai referensi kreator @sample"*

Agent akan membaca panduan `AGENTS.md` / `CLAUDE.md`, mengoordinasikan skill `cut` dan `style-edit`, serta mengarahkan seluruh panggilan model AI ke 9Router lokal tanpa keluar dari lingkungan privat Anda.

#### Way 2: Pasang via Plugin Marketplace
Jika ingin memakai editor dari direktori proyek lain pada Claude Code:
```bash
/plugin marketplace add nextwork-projects/ai-video-editor-cooked
```

#### Way 3: Agent CLI Lain (Codex, Cursor, Gemini CLI)
Bagi pengguna agen dengan standard Agent Skills CLI:
```bash
npx skills add nextwork-projects/ai-video-editor-cooked
```

---

## Audit & Integritas Sistem

Repositori ini mematuhi standar verifikasi ketat yang terdokumentasi dalam direktori `.audit/`:

- **Jaminan Reversibilitas 100%:** Seluruh perubahan diverifikasi dapat dibatalkan sewaktu-waktu. Panduan rollback tersedia lengkap di [`docs/REVERT.md`](docs/REVERT.md).
- **Verifikasi Multi-Agen Tanpa Bias:** Pengujian keamanan dan *fault injection* (F-01 s/d F-13) pada Task T-12 diaudit oleh sub-agen Red-Team independen dengan status kelulusan `verdict: accept`.
- **Audit Bebas Rahasia (Zero Secrets):** Seluruh file evidence dan commit history diinspeksi secara otomatis guna memastikan tidak ada API key atau kredensial riil yang terekspos.
- **Indeks Perubahan Resmi:** Log setiap fase dan perbaikan terdaftar pada [`docs/CHANGES.md`](docs/CHANGES.md).

---

## Lisensi & Atribusi

- **FlashVeditor Modifications:** Hak Cipta © 2026 PT Nalar Cerdas Teknologi / Thaaan184. Didistribusikan di bawah lisensi MIT.
- **Original Upstream:** Proyek ini merupakan pengembangan dari `nextwork-projects/ai-video-editor-cooked` oleh NextWork (Lisensi MIT).
- **HyperFrames:** Komponen motion dan tipografi menyertakan atribusi HyperFrames (Lisensi Apache-2.0). Lihat file `NOTICE` untuk informasi lisensi lengkap pihak ketiga.
