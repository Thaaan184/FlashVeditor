#!/usr/bin/env python3
import json, sys
data = json.load(sys.stdin)
path = (data.get('tool_input') or {}).get('file_path', '')
rules = [l.strip() for l in open('.audit/protected-paths.txt') if l.strip()]
if any(r in path for r in rules):
    print('BLOCKED: path dilindungi: ' + path, file=sys.stderr)
    sys.exit(2)
