# 深度重构提案：全案统一设计系统架构 (Unified Design System Architecture v2.0)

> 本方案融合了 Zine 设计规范的“美学法则”与向下兼容的“软件工程规范”，旨在将 Slide、简历、杂志等排版能力收敛至统一的底层渲染管线。

---

## 1. 建立单一渲染管线与平滑过渡 (Single Render Pipeline & Compatibility)

必须推动 **100% Schema 驱动**，彻底废弃硬编码模板，但需保证工程的平滑过渡。

*   **唯一渲染入口**：最终所有的布局（简历、Slide、杂志）都必须通过 `LayoutRenderer`（JSON-Schema）渲染。
*   **兼容层过渡 (Compatibility Layer)**：在重构期间，旧有的硬编码 React 模板（如 `AcademicHybridResume.tsx`）保留显示能力，但标记为 `[Deprecated]`。
*   **逐步迁移**：新模板直接使用 JSON Schema 编写；旧模板在后续版本中逐一翻译为 JSON 结构并替换。

---

## 2. 颜色与字体的 CSS 变量 Token 化 (CSS-Var Driven Tokens)

打破 Tailwind 类名与具体 Hex 颜色的硬绑定，实现运行时的“一键换肤”。

*   **CSS 变量映射**：在 `index.css` 的 `:root` 中注入 `--color-primary`, `--color-paper`, `--color-ink` 等变量。
*   **Tailwind 扩展**：在 `tailwind.config.js` 中将颜色指向 CSS 变量，确保支持未来的主题热切换（如日间/夜间/特殊杂志主题）。
*   **补齐 CJK 字体映射**：在 `ProjectTheme` 中补齐并强制落实中英文字体结构（`headingFontZH` / `bodyFontZH`），彻底解决多语言排版断层的问题。

---

## 3. 设计系统内核化 (Design System as Core)

将 Zine 规范中的“物理限制”写死在代码的最底层。

*   **建立排版 Scale (Semantic Primitives)**：
    *   `<ZineDisplay />`: 绑定 `text-zine-display` (极紧字距、特定大写/行高逻辑)。
    *   `<ZineBody />`: 绑定 `text-zine-body` (宽松行高、特定段落间距)。
    *   `<ZineCaption />`: 绑定 `text-zine-metadata` (宽字距、全大写、无衬线)。
*   **Folio 锚点锁定**：建立全局的 `GlobalFolio` 组件，脱离具体模板的 padding 控制，绝对锁定在画面的物理边缘（引入“档案号”概念）。
*   **固化排版预设 (Presets)**：将 12 栏网格 (12-Col Grid)、出血 (Bleed) 和沉底重力 (Gravity) 固化为 LayoutRenderer 可直接调用的预设属性。
*   **引入基线网格 (Baseline Grid)**：增加全局快捷键，开启后显示覆盖全屏的辅助线，要求所有的跨行文本严格踩准基线。

---

## 4. Schema 版本化与自动迁移机制 (Versioning & Migration) — 核心工程保障

重构底层极易导致用户旧数据崩溃，必须建立版本隔离与数据升级管道。

*   **版本控制**：为 `ProjectData` / `PageData` / `TemplateSchema` 增加强制的 `version` 字段（例如从 `v1.0.0` 升级为 `v2.0.0`）。
*   **迁移管道 (Migration Pipeline)**：编写 `src/utils/migration.ts`。当检测到用户载入旧版项目 JSON 时，自动经过转换函数（Transform），将旧的字体、颜色和结构映射到新的 Token 和 Schema 结构上，保证数据向下兼容。

---

## 5. 编辑器强约束层重构 (Editor Guardrails)

剥夺开发者和用户破坏“设计高级感”的权力。

*   **受控的样式选项**：在 `GlobalSettings.tsx` 和 `FieldRenderer.tsx` 中，字距、行高、字号采用**有限选项的下拉菜单或档位**（如小、中、大），禁止任意输入数值。
*   **禁用直接的 Hex 输入**：颜色选择必须从定义好的 Token 调色板中选取。
*   **StyleOverrides 白名单**：对组件的自定义样式进行白名单过滤，防止因错误覆盖破坏了整体的网格与基线对齐。

---

## 6. 模板原型库与回归验证 (Archetypes & Regression)

*   **构建核心原型 (Archetypes)**：定义 Gallery (画廊式)、Archive (档案式)、Tension (破局式) 等骨架。所有的具体模板必须基于这些骨架派生。
*   **视觉回归测试**：在重构过程中，针对现有的杂志、Slide、简历产出做 A/B 视觉对比，确保 Folio 锚点与基线网格在所有设备比例下表现一致。