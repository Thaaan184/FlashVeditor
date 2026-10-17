# T-02 r1: Patch gemini.py untuk Gateway 9Router
Tanggal: 2026-10-17
Commit kode: gate-T02-accept
Tipe: fitur
File diubah:
- `plugins/creator-teardown/skills/creator-teardown/scripts/gemini.py`
- `docs/functions/gemini-gateway.md`
- `.audit/tasks/T-02.md`
- `.audit/tasks/test_T02_gateway.py`
- `.audit/evidence/T-02/mock-test.txt`
- `.audit/evidence/T-02/real-call.txt`
- `.audit/rounds/T-02/r1/curator.yaml`

Ringkasan:
Memodifikasi adapter `gemini.py` untuk mendukung gateway lokal 9Router (`http://127.0.0.1:20128`) dan model visual kustom (`ag/gemini-3.8-flash-high`) via header bearer serta frame sampling fallback jika inline raw mp4 tidak didukung oleh backend proxy. Default fallback ke Google AI Studio tetap 100% utuh jika tidak ada environment variable yang di-set.

Bukti verifikasi:
- Uji server tiruan (mock test): routing base URL, stripping trailing slash, upload url path, dan header `Authorization: Bearer` tervalidasi.
- Uji nyata 9Router: panggilan multimodal dengan model `ag/gemini-3.8-flash-high` sukses menghasilkan analisis look video dan 7518 token.
- `gemini.py demo` lolos status `ok`.
- Seluruh suite `demos.sh` (50+ skrip) lolos (`all demos ok`).

Cara revert:
`git revert <commit-hash>` atau `git checkout baseline-original -- plugins/creator-teardown/skills/creator-teardown/scripts/gemini.py`
