# T-14 r1: Dukungan Docker Container & Dokumentasi README Resmi
Tanggal: 2026-10-17
Commit kode: gate-T14-accept
Tipe: fitur
File diubah:
- `Dockerfile`
- `docker-compose.yml`
- `docker-entrypoint.sh`
- `.dockerignore`
- `plugins/ai-editor/lib/ai_editor/home.py`
- `plugins/ai-editor/lib/ai_editor/review.py`
- `README.md`

Ringkasan:
- Menambahkan runtime containerized lengkap via `Dockerfile` (Python 3.11, Node.js 22 LTS, FFmpeg 7, Chromium headless untuk Remotion).
- Menyediakan `docker-compose.yml` 1-command startup yang menghubungkan otomatis ke 9Router di PC host via `host.docker.internal:20128`.
- Menambahkan helper auto-provisioning `docker-entrypoint.sh` untuk inisialisasi environment Gemini dan Claude Code.
- Memperluas `home.py` dan `review.py` agar mendukung environment variable `AI_EDITOR_HOST` dan `AI_EDITOR_ALLOWED_HOSTS` untuk akses web aman dari host Docker.
- Menulis ulang `README.md` branch `feat/9router-gateway` dengan panduan komprehensif penggunaan Docker, setup bare-metal PC pribadi, konfigurasi 9Router, dan alur kerja video editing.
