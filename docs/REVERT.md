# Panduan Revert (FlashVeditor)

Setiap perubahan di repo ini dirancang 100% reversible (dapat dibatalkan).

## Cara Revert

1. **Revert Satu Perubahan Logis:**
   ```bash
   git revert <sha>
   ```
   Lalu ikuti bagian "Cara revert" di dokumen `docs/changes/T-xx-rN-*.md` yang bersangkutan.

2. **Revert Seluruh Tugas Multi-Commit:**
   ```bash
   git revert --no-commit <sha-sebelum-tugas>..<sha-terakhir-tugas>
   git commit -m "revert: rollback tugas T-xx"
   ```

3. **Kembali ke Gate Tertentu:**
   ```bash
   git switch -c rollback/gate-Txx gate-Txx-accept
   ```

4. **Kembali Total ke Baseline Original (Opsi A: Direct Anthropic + Google):**
   - Hapus blok `env` di `.claude/settings.local.json`.
   - Kosongkan `GEMINI_BASE_URL` di `~/.config/creator-teardown/.env`.
   - Atau checkout tag: `git checkout baseline-original`.

5. **Setelah Melakukan Revert:**
   - Jalankan ulang: `python3 tests/check_plugins.py`.
   - Ubah status entri di `docs/CHANGES.md` menjadi `reverted` dengan mencantumkan SHA revert.
