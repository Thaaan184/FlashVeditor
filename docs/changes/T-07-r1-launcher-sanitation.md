# T-07 r1: Uji Sanitasi Env Var pada Launcher
Tanggal: 2026-10-17
Commit kode: gate-T07-accept
Tipe: fitur
File diubah:
- `plugins/ai-editor/lib/ai_editor/launcher.py`
- `.audit/tasks/T-07.md`
- `.audit/tasks/test_T07_launcher_env.py`
- `.audit/evidence/T-07/launcher-env-sanitation.txt`
- `.audit/rounds/T-07/r1/curator.yaml`

Ringkasan:
Menambahkan sanitasi dan penerusan eksplisit variabel lingkungan gateway AI (`ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `ANTHROPIC_DEFAULT_*_MODEL`, `GEMINI_*`) pada fungsi `open_claude` di `launcher.py`. Memastikan pembukaan terminal baru (terutama via `osascript` di macOS yang tidak mewarisi shell env induk secara otomatis) tetap membawa konfigurasi gateway ke proses agen yang baru.

Bukti verifikasi:
- Uji script `.audit/tasks/test_T07_launcher_env.py` memverifikasi perintah Darwin & Linux tetap menyertakan env var gateway.
- Log bukti di `.audit/evidence/T-07/launcher-env-sanitation.txt`.
- `launcher.py demo` lolos `ok`.
- `tests/check_plugins.py` lolos `plugins ok`.

Cara revert:
`git revert <commit-hash>`
