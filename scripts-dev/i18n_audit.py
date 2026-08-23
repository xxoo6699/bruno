#!/usr/bin/env python3
"""Scan bruno-app src for t('key') / i18n.t('key') calls and report keys missing from zh-CN.json."""
import json, os, re, sys

ROOT = '/Users/xts/00aProjects/bruno/packages/bruno-app/src'
ZH = '/Users/xts/00aProjects/bruno/packages/bruno-app/src/i18n/translation/zh-CN.json'

with open(ZH, encoding='utf-8') as f:
    zh = json.load(f)

# match t('...') / t("...") — handles escaped quotes inside; skips template literals
CALL_RE = re.compile(r"""\bt\(\s*('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")""")

def unquote(lit):
    body = lit[1:-1]
    # unescape common sequences
    body = body.replace("\\'", "'").replace('\\"', '"').replace('\\\\', '\\').replace('\\n', '\n')
    return body

missing = {}
per_file = {}
for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in ('node_modules',)]
    for fn in filenames:
        if not fn.endswith(('.js', '.jsx')):
            continue
        if fn.endswith(('.spec.js', '.test.js')):
            continue
        p = os.path.join(dirpath, fn)
        with open(p, encoding='utf-8') as f:
            src = f.read()
        keys = []
        for m in CALL_RE.finditer(src):
            lit = m.group(1)
            key = unquote(lit)
            # skip things that are clearly not UI keys: single chars, paths, css, etc.
            if key in zh:
                continue
            keys.append(key)
        if keys:
            rel = os.path.relpath(p, ROOT)
            per_file[rel] = keys
            for k in keys:
                if k not in missing:
                    missing[k] = rel

print(f'total missing: {len(missing)}')
out = '/tmp/i18n_missing.json'
with open(out, 'w', encoding='utf-8') as f:
    json.dump({k: missing[k] for k in sorted(missing)}, f, ensure_ascii=False, indent=2)
print('written', out)
if len(sys.argv) > 1 and sys.argv[1] == 'files':
    for rel, keys in sorted(per_file.items()):
        miss = [k for k in keys if k in missing]
        if miss:
            print(f'{rel}: {len(miss)}')
