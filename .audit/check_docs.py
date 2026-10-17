#!/usr/bin/env python3
import subprocess, sys, os, re

base = os.environ.get('BASE_REF')
if not base:
    # check if origin/main exists
    try:
        subprocess.check_output(['git', 'rev-parse', '--verify', 'origin/main'], stderr=subprocess.DEVNULL)
        base = 'origin/main'
    except Exception:
        base = 'HEAD~1'

try:
    shas = subprocess.check_output(['git', 'log', '--format=%H', f'{base}..HEAD'], text=True).split()
except Exception:
    shas = [subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip()]

bad = []
for s in shas:
    msg = subprocess.check_output(['git', 'show', '-s', '--format=%B', s], text=True)
    if not msg.startswith('T-'):
        continue
    m = re.search(r'^Change-Doc: (.+)$', msg, re.M)
    if not m or not os.path.exists(m.group(1).strip()):
        bad.append(s[:8])
if bad:
    print('Commit tanpa Change-Doc valid: ' + ', '.join(bad))
    sys.exit(1)
print('check_docs: ok')
