# T-04 r1: Template .env dan .env.example
Tanggal: 2026-10-17
Commit kode: gate-T04-accept
Tipe: konfigurasi
File diubah:
- `.gitignore`
- `.env.example`
- `plugins/ai-editor/lib/ai_editor/keys.py`
- `.audit/tasks/T-04.md`
- `.audit/rounds/T-04/r1/curator.yaml`

Ringkasan:
Menambahkan template konfigurasi `.env.example` dengan opsi A (Google AI Studio resmi) dan opsi B (Gateway lokal 9Router dengan parameter `GEMINI_BASE_URL`, `GEMINI_AUTH_MODE`, `GEMINI_MODEL`, `GEMINI_FRAME_SAMPLING`). Memperbarui `.gitignore` agar file `.env` dan `*.env` tidak sengaja ter-commit. Memperbarui `keys.py` verifier agar tidak memblokir API key non-Google ketika gateway kustom diaktifkan.

Bukti verifikasi:
- `python3 plugins/ai-editor/lib/ai_editor/keys.py` -> `keys ok`
- `python3 tests/check_plugins.py` -> `plugins ok`
- Git status memverifikasi `.env` diabaikan dan `.env.example` terlacak.
- Nol rahasia/token pada diff.

Cara revert:
`git revert <commit-hash>`
