# T-06 r1: Verifikasi Model Mapping di Gateway (Haiku, Sonnet, Opus)
Tanggal: 2026-10-17
Commit kode: gate-T06-accept
Tipe: verifikasi
File diubah:
- `.audit/tasks/T-06.md`
- `.audit/tasks/test_T06_model_mapping.py`
- `.audit/evidence/T-06/model-mapping-log.txt`
- `.audit/rounds/T-06/r1/curator.yaml`

Ringkasan:
Menjalankan audit verifikasi pemetaan alias model Claude Code pada gateway 9Router lokal (`http://127.0.0.1:20128`). Pengujian membuktikan model cepat (Haiku -> `ag/gemini-3.8-flash-high`), model kerja standar (Sonnet -> `ag/claude-sonnet-4-6`), dan model penalaran mendalam (Opus -> `ag/claude-opus-4-6-thinking`) semuanya merespons dengan HTTP 200 dan streaming token lancar. Uji negatif memverifikasi model Anthropic tanpa prefix `ag/` ditolak dengan HTTP 404, mengonfirmasi perlunya pemetaan alias.

Bukti verifikasi:
- Log bukti di `.audit/evidence/T-06/model-mapping-log.txt` (bebas dari token).
- Panggilan 4 model mengembalikan HTTP 200.
- Uji negatif mengonfirmasi 404 pada panggilan tanpa pemetaan.

Cara revert:
`git revert <commit-hash>`
