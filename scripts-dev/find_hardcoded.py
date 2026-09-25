#!/usr/bin/env python3
"""Find hardcoded English UI strings in JSX components that are NOT wrapped in t()."""
import os, re, sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.join(REPO, 'packages/bruno-app/src/components')
OUT = '/tmp/i18n_hardcoded.txt'

# heuristic filters
SKIP_FILES_PARTS = ['StyledWrapper', '.spec.js', '.test.js']
WORD = re.compile(r'[A-Za-z]{2,}')

# 1. JSX text nodes: >Text< — capture between tags
JSX_TEXT = re.compile(r'>\s*([^<>{}\n]*[A-Za-z]{2,}[^<>{}\n]*)\s*<')
# 2. props: placeholder="..." title="..." label="..."
PROP = re.compile(r'\b(placeholder|title|aria-label|label|tooltip|headerLabel)=["\']([^"\'{}][^"\']*)["\']')

def is_likely_ui(text):
    if not WORD.search(text):
        return False
    # skip pure code/paths/urls
    t = text.strip()
    if not t or t.startswith('/') or 'http' in t:
        return False
    # must contain at least one space-separated word with a letter and be mostly letters/punct
    letters = sum(c.isalpha() for c in t)
    if letters < 4:
        return False
    return True

results = {}
for dirpath, dirnames, filenames in os.walk(ROOT):
    for fn in filenames:
        if not fn.endswith('.js'):
            continue
        if any(part in fn for part in SKIP_FILES_PARTS):
            continue
        p = os.path.join(dirpath, fn)
        rel = os.path.relpath(p, ROOT)
        try:
            src = open(p, encoding='utf-8').read()
        except Exception:
            continue
        hits = []
        for m in JSX_TEXT.finditer(src):
            txt = m.group(1).strip()
            if is_likely_ui(txt):
                line = src[:m.start()].count('\n') + 1
                hits.append((line, 'JSX', txt))
        for m in PROP.finditer(src):
            val = m.group(2).strip()
            if is_likely_ui(val):
                line = src[:m.start()].count('\n') + 1
                hits.append((line, m.group(1), val))
        if hits:
            results[rel] = sorted(hits)

with open(OUT, 'w', encoding='utf-8') as f:
    total = 0
    for rel in sorted(results):
        f.write(f'== {rel}\n')
        for line, kind, txt in results[rel]:
            f.write(f'  {line}: [{kind}] {txt}\n')
            total += 1
print('files:', len(results), 'hits:', total)
print('written', OUT)
