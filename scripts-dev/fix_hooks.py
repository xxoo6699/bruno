#!/usr/bin/env python3
"""Insert `const { t } = useTranslation();` into components that use t( without a hook.
Class components and lowercase helper functions get i18n.t fallback instead."""
import io, re, subprocess, json, os

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/packages/bruno-app'
IMPORT_LINE = "import { useTranslation } from 'react-i18next';"
HOOK_LINE = 'const { t } = useTranslation();'

def get_error_files():
    out = subprocess.run(['npx', 'eslint', 'src/components', '-f', 'json'],
                         cwd=APP, capture_output=True, text=True)
    data = json.loads(out.stdout)
    files = set()
    for f in data:
        for m in f.get('messages', []):
            if m['severity'] == 2 and m.get('ruleId') == 'no-undef' and "'t' is not defined" in m.get('message', ''):
                files.add(f['filePath'])
    return sorted(files)

def top_level_blocks(src):
    """Yield (start_idx, end_idx_exclusive, def_line) for top-level const/function defs."""
    lines = src.split('\n')
    starts = []
    for i, ln in enumerate(lines):
        if re.match(r'^(export default )?(async )?(function |const )[A-Za-z_$]', ln) and not ln.startswith('export default function Main'):
            starts.append(i)
    blocks = []
    for s in starts:
        depth = 0
        seen_open = False
        e = s
        while e < len(lines):
            depth += lines[e].count('{') - lines[e].count('}')
            if '{' in lines[e]:
                seen_open = True
            if seen_open and depth <= 0:
                break
            e += 1
        blocks.append((s, min(e + 1, len(lines)), lines[s]))
    return blocks

def repair(path_rel):
    p = os.path.join(APP, path_rel)
    src = io.open(p, encoding='utf-8').read()
    orig = src

    is_class = 'extends React.Component' in src or 'extends Component' in src or 'React.PureComponent' in src

    # ensure import
    if IMPORT_LINE not in src and not is_class:
        lines = src.split('\n')
        for i, ln in enumerate(lines):
            if ln.startswith('import ') or (ln.startswith("const ") and '=' in ln and i > 0 and 'require(' in ln):
                lines.insert(i, IMPORT_LINE)
                break
        src = '\n'.join(lines)

    if is_class:
        # class component: swap bare t( -> i18n.t(
        src = src.replace("{t('", "{i18n.t('").replace('={t(\'', '={i18n.t(\'')
        src = re.sub(r'title=\{t\(', 'title={i18n.t(', src)
        src = re.sub(r'\{t\(', '{i18n.t(', src)
        src = re.sub(r'=t\(\'', "=i18n.t('", src)
        if "import i18n from 'i18n';" not in src:
            lines = src.split('\n')
            lines.insert(0, "import i18n from 'i18n';")
            src = '\n'.join(lines)
        io.open(p, 'w', encoding='utf-8').write(src)
        return 'class->i18n.t'

    changed = False
    while True:
        blocks = top_level_blocks(src)
        inserted = False
        for (s, e, def_line) in blocks:
            body = '\n'.join(src.split('\n')[s:e])
            if 't(' not in body:
                continue
            if HOOK_LINE in body:
                continue
            # insert hook after def line if it opens a block
            lines = src.split('\n')
            dl = lines[s]
            stripped = dl.rstrip()
            if stripped.endswith('{'):
                indent_match = re.match(r'^(\s*)', dl)
                indent = indent_match.group(1) + '  '
                lines.insert(s + 1, indent + HOOK_LINE)
                src = '\n'.join(lines)
                changed = True
                inserted = True
                break
            else:
                print('  !! non-block def, manual:', path_rel, '::', dl[:80])
        if not inserted:
            break

    if changed:
        io.open(p, 'w', encoding='utf-8').write(src)
    return 'hooks' if changed else ('unchanged' if src == orig else 'import-only')

if __name__ == '__main__':
    files = get_error_files()
    print(len(files), 'files to repair')
    results = {}
    for f in files:
        rel = f.split('bruno-app/')[-1]
        try:
            r = repair(rel)
        except Exception as ex:
            r = f'ERROR {ex}'
        results[rel] = r
        if not r.startswith(('hooks', 'class', 'import-only')):
            print(rel, '->', r)
    print('done.')
