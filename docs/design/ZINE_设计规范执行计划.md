# Zine 设计规范 v1.0 - 代码审计与执行计划

## 1. 代码审计总结 (Code Audit Summary)

### 1.1 核心架构 (布局与渲染)
*   **当前状态**：项目采用混合渲染系统。老旧模板是硬编码的 React 组件，而新模板通过 `LayoutRenderer`（JSON-Schema 驱动）渲染。
*   **审计发现**：`LayoutRenderer` 已经支持 `flex`、`grid` 和 `absolute` 布局，非常适合实现 Zine 规范中的原型。但目前缺乏一个能跨模板统一注入的“全局页码/档案栏 (Global Folio)”机制。
*   **审计发现**：`MetadataOverlay` 处理页码逻辑，但其样式目前偏向通用的“幻灯片”美学，缺乏规范要求的“工业精密感”。

### 1.2 字体系统 (Typography System)
*   **当前状态**：字体通过 `FontManager` 管理，组件如 `SlideHeadline` 从 `ProjectTheme` 获取字体。
*   **审计发现**：`tailwind.config.js` 配置过于简单，没有定义规范要求的 “Display (展示)”、“Body (正文)” 和 “Metadata (元数据)” 严格字阶。
*   **审计发现**：虽然传入了 `typography` 参数，但各组件内部仍有较多硬编码的 fallback 样式，不利于严格一致性。

### 1.3 数据结构与状态
*   **当前状态**：`PageData` 和 `ProjectTheme` 仅包含基础颜色和布局 ID。
*   **审计发现**：缺少对“档案号 (Archive Numbers, 如 FIG. 04)”和“重力排版 (Gravity Settings)”的显式支持。

---

## 2. 执行计划 (Implementation Plan)

### 第一阶段：底层基建 (设计令牌与 Token 化)
**目标**：在配置层锁定“极端对比”和“严格字阶”。

1.  **更新 `tailwind.config.js`**：
    *   注册指定字体：`Playfair Display`, `Noto Serif SC`, `Crimson Pro`, `Inter`。
    *   添加自定义工具类：
        *   `text-zine-display`: `text-7xl tracking-tighter leading-[0.8]` (极紧字距)
        *   `text-zine-body`: `text-base leading-[1.8] tracking-normal` (宽松行高)
        *   `text-zine-metadata`: `text-[9px] uppercase tracking-[0.2em] font-sans` (超宽字距)
2.  **增强 `src/types.ts`**：
    *   在 `ProjectData` 中增加 `archivePrefix` (默认 "FIG.")。
    *   在 `ProjectTheme` 中增加“对比色对”：如 `ink` (墨色) 和 `paper` (纸色)，而非简单的 primary/secondary。

### 第二阶段：全局锚点与页脚系统 (Folio & Anchor Lock)
**目标**：实现物理空间的绝对静止感。

1.  **重构 `src/components/ui/slide/MetadataOverlay.tsx`**：
    *   移除圆角气泡等“软件感”样式。
    *   实现“专业 Folio”模式：
        *   左下角固定 `bottom-8 left-8` (档案号：FIG. XX)。
        *   右下角固定 `bottom-8 right-8` (罗马数字页码：VI)。
        *   使用 `Inter` 字体，全大写，极宽字距。
2.  **优化预览层 `Preview.tsx`**：
    *   确保 Folio 层级最高，且不随模板内部的 padding 偏移，实现绝对位置锁定。

### 第三阶段：布局蓝图实现 (JSON Archetypes)
**目标**：基于 JSON Schema 创建三种核心情绪模板。

1.  **蓝图 1: The Gallery (画廊式)**：
    *   重点实现 `aspect-[4/5]` 比例图片，采用“沉底排版”（底部留白 > 顶部）。
2.  **蓝图 2: The Archive (档案式)**：
    *   实现 12 栏网格，左侧预留 5 栏宽度的大面积留白（呼吸感）。
3.  **蓝图 3: The Tension (破局式)**：
    *   全出血 (Full-bleed) 绝对定位容器。
    *   使用 `mix-blend-difference` 实现文字跨图的高对比排版。

### 第四阶段：编辑器“封印” (Editor Guardrails)
**目标**：限制随意操作，保护高级感。

1.  **更新 `GlobalSettings.tsx`**：
    *   增加 “Zine Mode” 开关，一键预设主题色和字体配对。
2.  **限制字段选项**：
    *   在编辑器面板中，当处于 Zine 模式时，字阶和字距只提供有限的“标准选项”，禁止随意拉动。
3.  **网格辅助线 (Grid Guide)**：
    *   实现快捷键召回 12 栏参考线和基线网格 (Baseline Grid)，辅助排版对齐。

---

## 3. 待办任务清单 (Next Steps)

- [ ] **任务 1**: 更新 `tailwind.config.js` 字体与字阶定义。
- [ ] **任务 2**: 修改 `src/types.ts` 扩展 Zine 相关主题属性。
- [ ] **任务 3**: 创建 `src/templates/schemas/zine-gallery.ts` 作为首个原型模板。
- [ ] **任务 4**: 彻底重写 `MetadataOverlay.tsx` 页脚系统。
- [ ] **任务 5**: 在 Store 和全局设置中集成 “Zine Mode” 配置。

---
**Gemini CLI 撰写**
*2026年5月24日*
