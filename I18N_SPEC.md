# Bruno 汉化（简体中文）规范 — 子代理必读

目标：把 Bruno 渲染进程的英文 UI 文案接入 i18next（自然键模式），并产出中文翻译词条。

## 背景

- 仓库已配置 `i18next` + `react-i18next`，i18n 实例在 `packages/bruno-app/src/i18n/index.js`。
- **自然键模式**：`t()` 的 key 就是**原封不动的英文原文**（保留大小写、标点、空格）。例如 `t('Save')`、`t('Are you sure you want to delete this collection?')`。缺失翻译时自动回退英文，因此**宁可漏翻，不可错改代码**。
- 术语表和已有词条见 `packages/bruno-app/src/i18n/translation/zh-CN.json`，翻译前先读它，保持术语一致。

## 组件内用法（绝大多数文件）

```jsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  return <div>{t('Save')}</div>;
};
```

- 在每个渲染了用户可见文案的**函数组件体顶部**加 `const { t } = useTranslation();`（已有则复用）。
- 自定义 hook（`useXxx`，内部无 JSX）里如果只是返回文案字符串，也可以用 `useTranslation`（hook 内可调用 hook）。

## 非组件代码（redux slices / actions / utils 中的 toast 等）

```js
import i18n from 'i18n'; // 别名已配置，指向 src/i18n/index.js
...
toast.error(i18n.t('Failed to save request'));
```

- 在文件顶部 import 一次，调用处用 `i18n.t('英文原文')`。

## 需要包裹的位置（只限用户可见文本）

- JSX 文本节点：`<div>Create Collection</div>` → `<div>{t('Create Collection')}</div>`
- `placeholder`、`title`、`aria-label`、`tooltip`、`label` 等 prop 的字符串字面量
- `toast.success(...)` / `toast.error(...)` / `toast.load(...)` 的消息
- `window.confirm(...)` / Modal 的标题、按钮文字、描述文字
- 下拉/菜单项的显示文字（**注意**：如果同一个字符串同时被代码用作判断标识，比如 `mode === 'granted'` 或作为对象 key，则**不要翻译该字符串**，只翻译纯展示字段如 `label:`）

## 严禁翻译 / 严禁修改

- 标识符、变量名、函数名、className、id、CSS、HTML 属性名
- 代码逻辑中用于比较/分支/存储的字符串（`=== 'horizontal'`、localStorage key、ipc channel 名、文件后缀名等）
- HTTP 方法（GET/POST…）、Content-Type、品牌名（Bruno、Postman、OpenAPI、cURL、GitHub 等）
- `console.log/warn/error`、代码注释、URL、邮箱
- 不要改动无关代码的格式/缩进，保持最小 diff；遵守文件现有的 2 空格缩进与单引号风格
- 不要运行构建/测试，不要安装依赖

## 插值与拼接

- 原文含变量的模板串/拼接：转成 i18next 插值 `t('Request sent to {{url}}', { url })`，key 里用 `{{var}}` 占位。若拼接复杂易错，则保持原样不翻译（宁缺毋滥）。
- 不要引入新的依赖或新的 i18n 配置。

## 类组件

如果文件是 class 组件（极少见），跳过该文件的文案，在最终报告里列出文件名即可。

## 产出物（必须）

1. 修改你分工范围内的文件（最小 diff）。
2. 把你引入的**全部** en→zh 词条写入 `/tmp/i18n_batch_<你的批次名>.json`：扁平 JSON，key 与 t() 中完全一致（含插值占位符），value 为简体中文翻译，UTF-8、ensure_ascii=false。不要直接改 zh-CN.json（由主代理统一合并，避免冲突）。
3. 最终报告：修改了哪些文件、词条数量、跳过的文件及原因（一行一个，简明扼要）。

## 术语表（必须遵守，与 zh-CN.json 一致）

| 英文 | 中文 |
|---|---|
| Collection | 集合 |
| Folder | 文件夹 |
| Request | 请求 |
| Response | 响应 |
| Environment | 环境 |
| Workspace | 工作区 |
| Header(s) | 请求头 |
| Variable(s) | 变量 |
| Script | 脚本 |
| Test(s) | 测试 |
| Assert | 断言 |
| Auth | 认证 |
| Body | 请求体 |
| Preferences | 偏好设置 |
| Settings | 设置 |
| Runner | 运行器 |
| Mock Server | Mock 服务器 |
| Timeline | 时间线 |
| Cookies | Cookie |
| Save | 保存 |
| Send | 发送 |
| Delete | 删除 |
| Rename | 重命名 |
| Clone | 克隆 |
| Duplicate | 复制 |
| Import | 导入 |
| Export | 导出 |
| Upload | 上传 |
| Download | 下载 |
| Copy | 复制 |
| Create | 创建 |
| New | 新建 |
| Browse | 浏览 |
| Search | 搜索 |
| Filter | 筛选 |
| Enable / Disable | 启用 / 禁用 |
| Loading… | 加载中… |
| "Are you sure … ?" | "确定要…吗？" |
