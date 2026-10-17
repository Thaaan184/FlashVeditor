# T-00 r1: Baseline Repo, Frozen Contract, dan Peta Titik Hard-Coded
Tanggal: 2026-10-17
Commit kode: baseline-original
Tipe: baseline
File diubah / ditambah:
- `.audit/baseline/hardcoded-endpoints.txt`
- `.audit/contract.md`
- `.audit/protected-paths.txt`
- `.audit/guard.py`
- `.audit/check_docs.py`
- `.audit/decisions.md`
- `.audit/dissent.md`
- `.claude/agents/*.md`
- `docs/CHANGES.md`
- `docs/REVERT.md`

Apa dan kenapa:
Inisialisasi repo target FlashVeditor dari upstream cooked. Memetakan 68 titik hard-coded endpoint dan variabel AI, membekukan kontrak audit `contract.md`, menyiapkan sistem perlindungan integritas (guard hook dan check_docs), mendefinisikan sub-agent, dan menandai `baseline-original`.

Temuan Teknis Recon:
1. 9Router pada `http://localhost:20128` mendukung format Anthropic `/v1/messages` (SSE streaming & tool calling) dan Gemini native `/v1beta/` (generateContent dengan Bearer auth).
2. Video dikirim inline via `inlineData` di `gemini.py` (tanpa Files API).
3. T-03 dinyatakan opsional / dilewati.

Bukti:
- `.audit/baseline/hardcoded-endpoints.txt`
- Tag git `baseline-original`

Verdict:
.audit/rounds/T-00/r1/curator.yaml (accept)

Cara revert:
git checkout baseline-original
