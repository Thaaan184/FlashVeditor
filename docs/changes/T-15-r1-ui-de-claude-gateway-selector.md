# T-15 r1: Refaktor UI De-Claude, Pemilihan Gateway AI, dan Auto-Worker

Tanggal: 2026-10-17
Commit kode: gate-T15-accept
Tipe: fitur & peningkatan kegunaan
File diubah:
- `plugins/ai-editor/lib/ai_editor/home.html`
- `plugins/ai-editor/lib/ai_editor/review.html`
- `plugins/ai-editor/lib/ai_editor/home.py`
- `plugins/ai-editor/lib/ai_editor/worker.py`
- `docker-entrypoint.sh`

Ringkasan:
- Menghapus terminologi ambigu "Waiting for Claude / Type nextwork-editor" pada antarmuka Home dan Review, menggantikannya dengan status pemrosesan AI Worker via 9Router Gateway (`ag/gemini-3.8-flash-high`).
- Menambahkan panel konfigurasi AI Gateway pada layar Onboarding & Settings (`stGateway`), memungkinkan pengguna memilih dan menghubungkan FlashVeditor ke 9Router Gateway, Claude Direct, atau Custom LLM Gateway.
- Mengimplementasikan background daemon `worker.py` yang otomatis menjalankan polling antrean `home.py wait` dan memproses pipeline utuh (download yt-dlp, transkripsi Whisper, visual extraction, look pass via Gemini 9Router) secara transparan.
- Memperbarui `docker-entrypoint.sh` agar auto-worker aktif secara default di dalam kontainer Docker.
