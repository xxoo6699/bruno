#!/usr/bin/env python3
"""Merge translation batches into zh-CN.json (sorted, 2-space indent)."""
import json, os, sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZH = os.path.join(REPO, 'packages/bruno-app/src/i18n/translation/zh-CN.json')

def merge(pairs):
    with open(ZH, encoding='utf-8') as f:
        data = json.load(f)
    before = len(data)
    data.update(pairs)
    with open(ZH, 'w', encoding='utf-8') as f:
        json.dump(dict(sorted(data.items())), f, ensure_ascii=False, indent=2)
        f.write('\n')
    print(f'added {len(data)-before} keys, total {len(data)}')

if __name__ == '__main__':
    batch_file = sys.argv[1]
    with open(batch_file, encoding='utf-8') as f:
        pairs = json.load(f)
    merge(pairs)
