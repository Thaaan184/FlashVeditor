# T-01 r1: Bootstrap Lingkungan dan Doctor Check
Tanggal: 2026-10-17
Commit kode: gate-T01-accept
Tipe: konfigurasi
File diubah:
- `.audit/baseline/smoke-baseline.txt`
- `.audit/tasks/T-01.md`
- `.audit/rounds/T-01/r1/curator.yaml`

Apa dan kenapa:
Bootstrap lingkungan resmi dieksekusi via `setup.py bootstrap`. Pemasangan mencakup Python venv lokal (~/.ai-video-editor/venv), faster-whisper small model, Remotion React engine via npm ci, hyperframes + gsap, serta penyediaan binary FFmpeg 7.0.2 static di ~/.local/bin untuk mendukung fitur rotary probing modern.

Perilaku sebelum dan sesudah:
Sebelumnya dependensi belum terpasang dan `smoke.py` gagal karena tidak ada venv. Setelah bootstrap, `doctor` melaporkan `Ready.` dan `tests/smoke.py` lulus 100% (SMOKE OK on Linux).

Bukti:
- `.audit/baseline/smoke-baseline.txt`
- Hasil run `python3 setup.py doctor`

Verdict:
.audit/rounds/T-01/r1/curator.yaml (accept)

Cara revert:
Hapus folder `~/.ai-video-editor`
