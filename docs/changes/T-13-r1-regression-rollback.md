# T-13 r1: Regresi Plugin, Integritas Dokumentasi, dan Latihan Rollback
Tanggal: 2026-10-17
Commit kode: gate-T13-accept
Tipe: verifikasi
File diubah:
- `.audit/tasks/T-13.md`
- `.audit/tasks/test_T13_regression_rollback.py`
- `.audit/evidence/T-13/regression-evidence.txt`
- `.audit/rounds/T-13/r1/curator.yaml`

Ringkasan:
- Menjalankan seluruh pemeriksaan regresi `tests/check_plugins.py` (status: `plugins ok`).
- Menjalankan smoke test penuh `tests/smoke.py` (status: `SMOKE OK on Linux: 10 stills, both renders 4 s`).
- Menjalankan validator commit `.audit/check_docs.py` (status: `check_docs: ok`).
- Melakukan verifikasi latihan rollback ke `baseline-original` (`922fb75b9bf4ae2286c4fe44fc17229e92d17bdd`).
- Seluruh instruksi pemulihan pada `docs/REVERT.md` terverifikasi akurat dan siap pakai.
