# Architectural Decisions Record (ADR)

## ADR-001: Pemanfaatan Endpoint Gemini Native 9Router untuk Skrip `gemini.py`
- **Tanggal:** 2026-10-17
- **Konteks:** `MASTER_PLAN.md` mengasumsikan gateway mungkin tidak memiliki endpoint Gemini native `/v1beta/` sehingga butuh T-03 (OpenAI fallback frame sampling).
- **Temuan Recon (T-00):**
  1. 9Router pada `http://localhost:20128` mengekspos endpoint Gemini native di `/v1beta/models/{model}:generateContent`.
  2. Mendukung autentikasi via header `Authorization: Bearer <key>`.
  3. Mendukung transmisi video multimodal inline (`inlineData: {"mimeType": "video/mp4", ...}`).
  4. Skrip asli `gemini.py` tidak menggunakan Google Files API (`/upload/v1beta/files`), melainkan mengompres video menjadi MP4 480p 2fps silent dan mengirimkannya via `inlineData`.
- **Keputusan:**
  - Tugas T-03 dilewati (bypass) karena 9Router menangani Gemini native secara penuh.
  - Implementasi T-02 cukup mengonfigurasi host URL (`GEMINI_BASE_URL`), versi API, header auth Bearer, dan nama model target.
