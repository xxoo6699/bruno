#!/usr/bin/env bash
# =============================================================================
# update-zh.sh — 官方仓库更新后，一键产出新的简体中文版本
#
# 用法:
#   ./scripts-dev/update-zh.sh            # 合并 origin/main 并重新打包（沿用现有版本号）
#   ./scripts-dev/update-zh.sh 4.2.0      # 同上，并把两个 package.json 的版本改为 4.2.0
#
# 前提:
#   - 当前在 zh-CN 分支，工作区干净（有未提交改动请先提交）
#   - origin 指向 usebruno/bruno（或你 fork 后 rebase 过的仓库）
#
# 流程:
#   1. git fetch origin && merge origin/main 到 zh-CN
#      （冲突时列出文件并退出，解决后重跑本脚本）
#   2. 缺少 node_modules 或依赖变化时 npm install；重建 8 个工作区依赖包 + QuickJS 沙箱捆绑包
#   3. 汉化审计: 扫描新增硬编码文案 + 缺失词条，输出到 /tmp 供补齐
#   4. 可选版本号更新
#   5. rsbuild 生产构建 → 拷贝进 electron 壳 → electron-builder 出未签名 arm64 dmg/zip
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

NEW_VERSION="${1:-}"
UPSTREAM_REF="${UPSTREAM_REF:-origin/main}"
BRANCH="zh-CN"

step() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
die()  { printf '\n\033[1;31mERROR: %s\033[0m\n' "$*" >&2; exit "${2:-1}"; }

# ---------- 0. 前置检查 ----------
step "0/7 前置检查"
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
[ "$CURRENT_BRANCH" = "$BRANCH" ] || die "请在 ${BRANCH} 分支上运行（当前: ${CURRENT_BRANCH}）"
if [ -n "$(git status --porcelain)" ]; then
  die "工作区不干净，请先提交或暂存改动"
fi

# ---------- 1. 合并上游 ----------
step "1/7 拉取并合并 origin/main"
git fetch origin --tags
if [ -n "${UPSTREAM_REMOTE:-}" ]; then git fetch "${UPSTREAM_REMOTE}" main --tags || true; fi
BEFORE="$(git rev-parse HEAD)"
if git merge-base --is-ancestor "$UPSTREAM_REF" HEAD; then
  echo "已是最新，无需合并。"
else
  if ! git merge --no-edit "$UPSTREAM_REF"; then
    echo
    echo "以下文件存在冲突:"
    git diff --name-only --diff-filter=U
    cat <<'EOF'

冲突处理建议:
  1. 对每个文件: 优先保留上游版本 (git checkout --theirs <file>)，
     然后运行 scripts-dev/find_hardcoded.py 扫描新文案并重新接入 t()。
  2. 全部解决后: git add -A && git commit
  3. 重跑本脚本继续。

EOF
    exit 2
  fi
fi

# ---------- 2. 依赖与工作区包 ----------
step "2/7 安装依赖并重建工作区包"
if [ ! -d node_modules ] || git diff --name-only "$BEFORE" HEAD | grep -q "^package-lock.json$"; then
  npm install
fi
npm run build:graphql-docs >/dev/null
npm run build:bruno-query >/dev/null
npm run build:bruno-common >/dev/null
npm run build:bruno-converters >/dev/null
npm run build:bruno-requests >/dev/null
npm run build:schema-types >/dev/null
npm run build:bruno-filestore >/dev/null
npm run build:bruno-sqlite >/dev/null
# 关键: QuickJS 沙箱捆绑包（不入库，缺失会导致启动崩溃）
npm run sandbox:bundle-libraries --workspace=packages/bruno-js >/dev/null
echo "工作区依赖包构建完成。"

# ---------- 3. 汉化审计 ----------
step "3/7 汉化审计（新增硬编码 / 缺失词条）"
python3 scripts-dev/find_hardcoded.py || true
python3 scripts-dev/i18n_audit.py || true
cat <<'EOF'

审计结果说明:
  - /tmp/i18n_hardcoded.txt : 上游新增/改动的硬编码英文（需人工接入 t()，可参考
    scripts-dev/wrap_hardcoded.py 自动包裹词典内已有条目）
  - /tmp/i18n_missing.json  : t() 已调用但 zh-CN.json 缺词条的 key（直接补翻译即可）
  这两项不为零不影响打包（缺失回退英文显示），建议补齐后再出包。

EOF

# ---------- 4. 版本号 ----------
if [ -n "$NEW_VERSION" ]; then
  step "4/7 更新版本号为 $NEW_VERSION"
  python3 - "$NEW_VERSION" <<'PYEOF'
import io, json, sys
v = sys.argv[1]
for rel in ['packages/bruno-electron/package.json', 'packages/bruno-app/package.json']:
    p = rel
    data = json.load(io.open(p, encoding='utf-8'))
    old = data['version']
    data['version'] = v
    io.open(p, 'w', encoding='utf-8').write(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    print(f'{rel}: {old} -> {v}')
PYEOF
else
  step "4/7 跳过版本号更新（未指定参数）"
fi

# ---------- 5/6/7. 构建 + 打包 ----------
step "5/7 rsbuild 生产构建"
npm run build:web

step "6/7 拷贝 web 产物到 electron 壳"
rm -rf packages/bruno-electron/out packages/bruno-electron/web
mkdir -p packages/bruno-electron/web
cp -r packages/bruno-app/dist/* packages/bruno-electron/web/
# perl -pi 跨平台（macOS BSD sed 与 GNU sed 的 -i 语法不兼容）
perl -pi -e 's@/static/@static/@g' packages/bruno-electron/web/*.html 2>/dev/null || true
perl -pi -e 's@/static/font@../../static/font@g' packages/bruno-electron/web/static/css/*.css 2>/dev/null || true
find packages/bruno-electron/web -name '*.map' -type f -delete

step "7/7 electron-builder 打包（未签名，--publish never 仅本地出包）"
case "$(uname -s)" in
  Darwin)               BUILDER_PLATFORM_ARGS='--mac' ;;
  Linux)                BUILDER_PLATFORM_ARGS='--linux' ;;
  MINGW*|MSYS*|CYGWIN*) BUILDER_PLATFORM_ARGS='--win' ;;
  *) die "未知平台 $(uname -s)，无法选择 electron-builder 目标" ;;
esac
# ELECTRON_BUILDER_EXTRA_ARGS 可追加参数，如 --x64 只出 x64 包
cd packages/bruno-electron
CSC_IDENTITY_AUTO_DISCOVERY=false npx electron-builder $BUILDER_PLATFORM_ARGS ${ELECTRON_BUILDER_EXTRA_ARGS:-} --publish never --config electron-builder-config.local.js

echo
echo "完成。产物位于 packages/bruno-electron/out/:"
ls -lh out/ | awk '{print "  " $9 " (" $5 ")"}'
