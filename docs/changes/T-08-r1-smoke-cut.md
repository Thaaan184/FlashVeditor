# T-08 r1: Smoke Test Engine Cut (cut.mp4 & words.json)
Tanggal: 2026-10-17
Commit kode: gate-T08-accept
Tipe: verifikasi
File diubah:
- `.audit/tasks/T-08.md`
- `.audit/tasks/test_T08_cut.py`
- `.audit/evidence/T-08/cut-smoke-evidence.txt`
- `.audit/rounds/T-08/r1/curator.yaml`

Ringkasan:
Melakukan verifikasi end-to-end terhadap pipeline pemotongan video (cut) pada `plugins/ai-editor/skills/cut/scripts/`. Video sampel `example.mp4` (12.000 detik) ditranskrip kata-per-kata via Whisper, kemudian diberi span penghapusan retake ("a router"). `build_timeline.py` sukses menghasilkan `decisions.json`, `report.json`, `words.json`, dan `cut-check.html`. `render.py` mengeksekusi perenderan H.264+AAC menghasilkan `cut.mp4` berdurasi 11.633 detik secara frame-accurate.

Bukti verifikasi:
- Uji script `.audit/tasks/test_T08_cut.py` menghasilkan `cut.mp4` (4.255.805 bytes) dan `words.json`.
- Log audit tercatat di `.audit/evidence/T-08/cut-smoke-evidence.txt`.

Cara revert:
`git revert <commit-hash>`
