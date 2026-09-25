#!/usr/bin/env python3
"""Wrap remaining hardcoded UI strings (from find_hardcoded output) with t()/i18n.t().

Reads /tmp/i18n_hardcoded.txt, applies curated decisions, rewrites files.
- Skips false positives / technical terms listed in SKIP.
- JSX text  -> {t('...')}
- props     -> attr={t('...')}
- Files without any useTranslation usage get `import i18n from 'i18n'` and t( -> i18n.t(
"""
import io, os, re, sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.join(REPO, 'packages/bruno-app/src/components')
SCAN = '/tmp/i18n_hardcoded.txt'

# file -> list of decisions. Each decision: (line_no, kind, exact_text) taken from scan.
# We regenerate the hit list programmatically and apply generic wrapping rules,
# with an explicit SKIP set for false positives / keep-as-is strings.
SKIP_EXACT = {
    # brands / protocols / technical
    '.yaml', '.json', 'Bruno', 'Discord', 'GitHub', 'Twitter', 'Markdown',
    'Akamai EdgeGrid', 'Content-Type', 'gRPC', 'HTTP', 'HTTPS', 'SOCKS4', 'SOCKS5',
    'GraphQL', 'WebSocket', 'OpenAPI', 'grpcs://', 'example.org', 'gpt-4o',
    'llama3.1:8b', '*_token', 'password', 'secret', '<number>', '<string>',
    'api_key', 'token', 'X-Custom-Token', 'MY_SESSION_TOKEN', 'no_proxy',
    'pac_url', ':name', 'true', 'false', '&nbsp;', '&middot;', '&times;',
    'ws://localhost:8080 or wss://example.com', 'https://example.com',
    # code-like false positives captured by scanner
}
SKIP_CODE_HINTS = ['=== ', '? (', '=STATUS.', '= 200 &&', '= 300 &&', '= 400 &&',
                   '= 0 &&', '= 0 ?', "replace(/", '+ internal.replace', '.test(part)',
                   'renderDriftRow', 'guest :', ']/i.test', "' + ", "0 ? (hasTestError",
                   'MAX_UNSAVED_REQUESTS_TO_SHOW &&', 'hasExamples ? (', '&& proxyEnabled &&',
                   '!file.exists)', '!path.exists)', 'code && code.trim']

def parse_scan():
    entries = []
    cur = None
    with open(SCAN, encoding='utf-8') as f:
        for line in f:
            line = line.rstrip('\n')
            if line.startswith('== '):
                cur = line[3:].strip()
            elif line.strip() and cur:
                m = re.match(r'\s*(\d+): \[([^\]]+)\] (.*)$', line)
                if m:
                    entries.append((cur, int(m.group(1)), m.group(2), m.group(3)))
    return entries

def main():
    entries = parse_scan()
    by_file = {}
    for f, ln, kind, text in entries:
        by_file.setdefault(f, []).append((ln, kind, text))

    changed = {}
    for rel, hits in sorted(by_file.items()):
        path = os.path.join(ROOT, rel)
        with io.open(path, encoding='utf-8') as fh:
            src = fh.read()
        orig = src
        for ln, kind, text in hits:
            t = text.strip()
            if t in SKIP_EXACT or any(h in t for h in SKIP_CODE_HINTS):
                continue
            if len(t) < 2:
                continue
            # 整文件匹配：扫描器的行号指向 `>` 所在行，跨行 JSX 文案的文本在
            # 下一行，按行定位会失配；\s 跨行是安全的（text 本身不含换行）
            esc = text.replace('\\', '\\\\').replace("'", "\\'")
            if kind == 'JSX':
                pat = re.compile(r'(>\s*)(' + re.escape(text) + r')(\s*<)')
                new_src = pat.sub(lambda m: m.group(1) + "{t('" + esc + "')}" + m.group(3), src, count=1)
            elif kind in ('title', 'aria-label', 'placeholder', 'label'):
                # 生成 JSX 表达式形式: title={t('…')}（去掉原来的引号）
                pat = re.compile(r'(\b' + kind + r'=")(' + re.escape(text) + r')(")')
                new_src = pat.sub(lambda m: m.group(1)[:-1] + "{t('" + esc + "')}", src, count=1)
            else:
                continue
            if new_src != src:
                src = new_src
        if src != orig:
            changed[rel] = src

    for rel, src in changed.items():
        path = os.path.join(ROOT, rel)
        with io.open(path, 'w', encoding='utf-8') as fh:
            fh.write(src)
        print('wrapped:', rel)

    print('files changed:', len(changed))

if __name__ == '__main__':
    main()
