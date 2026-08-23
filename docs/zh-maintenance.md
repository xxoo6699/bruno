# 简体中文版维护指南

本仓库的 `zh-CN` 分支在官方 Bruno 之上增加了完整的简体中文本地化与语言切换能力。
本文档说明官方仓库更新后，如何以最小成本产出新的中文版本。

## 分支模型

| 分支 | 作用 |
|---|---|
| `main` | 跟踪官方 usebruno/bruno，不做任何修改 |
| `zh-CN` | 官方代码 + 全部汉化改动（i18n 接线、词典、打包配置） |

## 日常更新（本地一键）

```bash
git checkout zh-CN
./scripts-dev/update-zh.sh          # 合并 origin/main 并重新打包
./scripts-dev/update-zh.sh 4.2.0    # 同时更新版本号
```

脚本会依次执行：合并上游 → 按需安装依赖 → 重建 8 个工作区依赖包和 QuickJS
沙箱捆绑包 → 汉化审计 → （可选）改版本号 → rsbuild 构建 → electron-builder 出
未签名 arm64 dmg/zip。产物在 `packages/bruno-electron/out/`。

## 冲突处理

合并冲突几乎只出现在被接入过 `t()` 的文件里。推荐策略：

1. 对冲突文件优先采用上游版本：`git checkout --theirs <file>` 然后 `git add`
2. 解决完所有冲突并提交后**重跑脚本**
3. 脚本第 3 步的审计会精确列出上游新增/改动的英文文案，按下一节方法补回

## 合并后补翻流程

两份审计产物：

- `/tmp/i18n_hardcoded.txt` —— 未接入 t() 的硬编码文案清单（`文件:行号 [类型] 文本`）
- `/tmp/i18n_missing.json` —— 已调用 t() 但 zh-CN.json 缺词条的 key

处理顺序：

1. **缺词条**（最常见）：把 key 原封不动地加进
   `packages/bruno-app/src/i18n/translation/zh-CN.json`（可用
   `scripts-dev/i18n_merge.py batch.json` 合并），缺失时界面自动回退英文，所以可以先出包再补。
2. **新硬编码文案**：在组件里接入 `t('原文')`（规范见 `I18N_SPEC.md`）。
   若词条已在词典里，可用 `scripts-dev/wrap_hardcoded.py` 半自动批量包裹；
   注意它对属性会生成 `{t('…')}` 形式，跑完后必须 `npx eslint src/components --fix` 并人工抽查。
3. **数据驱动文案盲区**：快捷键命令名（`providers/Hotkeys/keyMappings.js`）、
   下拉选项的 `label:/description:` 字段等，渲染处已包 t()，只需往词典加词条。
4. 改完运行 `scripts-dev/find_illegal_hooks.js <files.json>` 复查没有把 hook
   写进辅助函数/回调（历史上引发过 React #300 崩溃页），再 `npx eslint src/components`。

## 打包要点

- **未签名**：本机没有 Apple 开发者证书，使用
  `packages/bruno-electron/electron-builder-config.local.js`（关闭签名/公证，
  仅 arm64 dmg+zip）。首次打开需右键 → 打开绕过 Gatekeeper。
- **沙箱捆绑包**：`@usebruno/js` 的 `src/sandbox/bundle-browser-rollup.js`
  不入库，缺失会导致启动即崩（Cannot find module）。脚本已包含生成步骤：
  `npm run sandbox:bundle-libraries --workspace=packages/bruno-js`
- **版本号**：`packages/bruno-electron/package.json`（关于页 + 安装包名）、
  `packages/bruno-app/package.json`（应用内显示）。

## GitHub Actions 自动化（可选）

把仓库推到自己的 GitHub fork 后，`.github/workflows/zh-cn-build.yml` 提供：

- 手动触发（可填版本号）；取消注释 `schedule` 可改为每周自动构建
- macos-14 runner 上完成合并、审计、构建、打包，产物在 Artifacts 下载
- 审计结果作为 `i18n-audit` artifact 上传；不为空说明有新文案待补翻
- 合并结果自动 commit 回 `zh-CN` 分支

## 工具速查（scripts-dev/）

| 工具 | 用途 |
|---|---|
| `find_hardcoded.py` | 扫描未接入翻译的硬编码 UI 文案 |
| `wrap_hardcoded.py` | 按扫描结果半自动包裹 t()（用后必查 eslint） |
| `i18n_audit.py` | 列出所有 t() key 中词典缺失的条目 |
| `i18n_merge.py x.json` | 把词条批次合并进 zh-CN.json（排序去重） |
| `find_illegal_hooks.js` | AST 检查非法 hook（防 React #300） |
| `update-zh.sh` | 一键更新流水线（本文档主角） |
