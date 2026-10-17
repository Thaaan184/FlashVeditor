# CONTRACT.md: Global Audit Contract & Acceptance Criteria
Bekukan: 17 Oktober 2026 · Status: DIBEKUKAN (Fase 0 / T-00)

## 1. Fakta Baseline Terverifikasi (Recon T-00)
1. **Gateway 9Router (`http://localhost:20128`):**
   - Mendukung format Anthropic `/v1/messages` native dengan SSE streaming & `tool_use`.
   - Mendukung format Gemini native `/v1beta/models/...:generateContent` dengan header `Authorization: Bearer <key>`.
   - Mampu memproses input video multimodal inline (`inlineData: {"mimeType": "video/mp4"}`).
2. **Skrip `gemini.py`:**
   - Tidak menggunakan Google Files API (`/upload/v1beta/files`).
   - Video otomatis dikompres ke MP4 480p 2fps silent via ffmpeg (~300-500 KB) dan dikirim inline via `inlineData`.
   - Tugas T-03 (OpenAI frame sampling fallback) tidak diperlukan untuk 9Router, cukup T-02 (base URL, version, auth mode, model).
3. **Penyimpanan Kredensial:**
   - Direktori key: `~/.config/creator-teardown/.env` (atau `$AI_EDITOR_HOME/.env`).
   - Key yang disimpan tidak boleh di-commit ke Git. File `.env` wajib ada di `.gitignore`.

## 2. Aturan Mutlak (Non-Negotiable)
1. **Bukti Mengalahkan Klaim:** Setiap status `accept` wajib melampirkan berkas bukti di `.audit/evidence/`.
2. **Tidak Ada Fallback Diam-diam:** Jika gateway 9Router gagal, proses harus gagal rapi dengan pesan error jelas. Dilarang fallback diam-diam ke Google atau Anthropic langsung tanpa persetujuan eksplisit.
3. **Zero Secrets in Git:** Kunci API, token, atau secret tidak boleh muncul di file, commit, log, atau `.audit/`.
4. **Audit Imparsial & Protected Paths:**
   - Path terlindungi (`tests/`, `.audit/contract.md`, `.audit/protected-paths.txt`, `.audit/guard.py`, `.claude/agents/`) tidak boleh disentuh Builder.
   - Perubahan hanya sah jika disahkan oleh Curator.
5. **Reversibilitas 100%:** Setiap commit fungsional wajib memiliki catatan di `docs/changes/`, indeks di `docs/CHANGES.md`, dan panduan pembatalan di `docs/REVERT.md`.

## 3. Kriteria Lulus per Tugas (Definition of Done)
- **T-00:** Peta hard-coded endpoints tersimpan, `contract.md` dibekukan, tag `baseline-original`.
- **T-01:** Bootstrap `setup.py bootstrap` sukses, semua baris `doctor` berstatus `ok`, lock files utuh.
- **T-02:** `gemini.py` mendukung `GEMINI_BASE_URL` (host-only), `GEMINI_API_VERSION`, `GEMINI_AUTH_MODE` (bearer/x-goog-api-key), dan `GEMINI_MODEL`. Teruji via mock server + real call ke 9Router.
- **T-03:** Dilewati / ditandai non-aktif (karena 9Router sudah mendukung Gemini native).
- **T-04:** Template `.env.example` terdokumentasi tanpa secret.
- **T-05:** Konfigurasi agen di `.claude/settings.local.json` dengan env `ANTHROPIC_BASE_URL` dan mapping model.
- **T-06:** Skrip health check bertahap (model list, message, streaming, tool-calling) 100% hijau.
- **T-07:** Smoke test `cut` sukses menghasilkan `cut.mp4` dan `words.json`.
- **T-08:** Smoke test `style-edit` menghasilkan `plan.json` valid.
- **T-09:** Render lokal Remotion sukses menghasilkan video MP4 yang bisa diputar.
- **T-10:** Teardown berhasil memproses video dengan panggilan visual tercatat ke `GEMINI_BASE_URL`.
- **T-11:** Suite uji web (W-01 s/d W-13) lulus konsisten 3x.
- **T-12:** Fault injection (F-01 s/d F-13) gagal rapi tanpa unhandled exception atau leak data.
- **T-13:** Regresi plugin (`check_plugins.py`, `smoke.py`), dokumentasi lengkap, dan latihan rollback terverifikasi.
