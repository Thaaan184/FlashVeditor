# T-12 r1: Audit Red-Team Mandiri (F-01 s/d F-13)
Tanggal: 2026-10-17
Commit kode: gate-T12-accept
Tipe: verifikasi
File diubah:
- `.audit/tasks/T-12.md`
- `.audit/tasks/test_T12_redteam_faults.py`
- `.audit/evidence/T-12/redteam-evidence.txt`
- `.audit/rounds/T-12/r1/redteam.yaml`

Ringkasan:
- Sub-agen Red-Team independen menjalankan pengujian fault injection komprehensif F-01 s/d F-13.
- Menguji kegagalan jaringan simulasi: Connection Refused (F-01), Timeout (F-02), HTTP 401 Unauthorized (F-03), HTTP 429 Rate Limit (F-04), HTTP 500 Gateway Error (F-05), HTTP 404 Model Fallback (F-06).
- Menguji ketahanan parsing: Tolerant Key-Value JSON parsing (F-07), Non-JSON HTML error page (F-08), Markdown-wrapped JSON response (F-09).
- Menguji keamanan antarmuka web: CSRF bad/spoofed Origin blocking (F-10), Path traversal attack blocking (F-11).
- Menguji audit privasi & integritas: Nol kebocoran rahasia / API key (F-12) dan verifikasi immutability protected paths via guard.py (F-13).
- Hasil vonis independen Red-Team: `verdict: accept` (0 temuan High/Critical).
