# Gemini Gateway Adapter (`gemini.py`)

File: `plugins/creator-teardown/skills/creator-teardown/scripts/gemini.py`

## Ringkasan Fungsi
Modifikasi adapter Gemini untuk mendukung gateway lokal (seperti 9Router pada `http://127.0.0.1:20128`) dan model AI pilihan (`ag/gemini-3.8-flash-high`) tanpa merusak alur Google AI Studio resmi.

## Variabel Lingkungan
- `GEMINI_BASE_URL`: Alamat host gateway (contoh: `http://127.0.0.1:20128`). Default: `https://generativelanguage.googleapis.com`. Trailing slash otomatis dibersihkan.
- `GEMINI_API_VERSION`: Versi API (contoh: `v1beta`). Default: `v1beta`.
- `GEMINI_AUTH_MODE`: Format otentikasi.
  - `bearer`: Mengirim header `Authorization: Bearer <key>`.
  - default: Mengirim header `x-goog-api-key: <key>`.
- `GEMINI_MODEL`: Model yang dipanggil. Default fallback `gemini-3.1-flash-lite`, `gemini-3.5-flash-lite`.
- `GEMINI_FRAME_SAMPLING`: Jika bernilai `1` / `true`, mengekstrak frame JPEG (`image/jpeg`) alih-alih raw MP4 inline data untuk kompatibilitas gateway model vision.

## Fungsi Internal Tambahan
1. `api_url(p)`: Menghasilkan URL lengkap endpoint Gemini (`{BASE}/{VER}/{p}`).
2. `upload_url()`: Menghasilkan URL upload files API (`{BASE}/upload/{VER}/files`).
3. `headers(key)`: Menghasilkan header HTTP dengan penyesuaian auth mode.
4. `tolerant_json_parse(text)`: Parser JSON tangguh yang dapat membaca:
   - JSON murni
   - JSON dalam blok markdown (```json ... ```)
   - JSON yang diawali/diakhiri teks bebas
   - Format baris key-value (YAML-like) sebagai fallback jika model gateway menghilangkan schema format.
