# Template Refactor Plan (24x24 Modular Grid Migration)

## 通用约束（24x24 模块化坐标）
- **坐标系统**：全屏高度与宽度均分为 24 份（Units）。
- **坐标定义**：`col-1` 到 `col-24`，`row-1` 到 `row-24`。
- **微观对齐**：所有文本基线对齐 8px 基线网格。
- **PageFrame 托管**：Folio、页码、基线网格由 PageFrame 统一处理。

---

## Resume (简历)
### academic-hybrid-resume
- **坐标布局**：
    - 侧栏：`col-1 to col-7` (29.1%)。
    - 主栏：`col-9 to col-22` (54.1%)。
- **迁移重点**：保留 `ResumeLayout` 复合组件处理 DOMPurify。

---

## Gallery Archetype (画廊类)

### gravity-anchor-intro
- **坐标布局**：
    - 上部文字：`col-3 to col-22` (colSpan-20), `row-2 to row-10` (rowSpan-9)。
    - 下部图像：`col-1 to col-24` (colSpan-24), `row-11 to row-24` (rowSpan-14)。
- **Metadata**：锁定在 `col-2, row-23`。

### kinfolk-feature
- **坐标布局**：
    - 主图像块：`col-1 to col-18` (75%), `row-2 to row-18` (70.8%)。
    - 垂直标题：`col-19 to col-24`, `row-2 to row-24`。
- **注意**：镜像变体通过翻转 `colStart` 实现。

### kinfolk-montage
- **坐标布局**：
    - 图像 B (大)：`col-8 to col-24`, `row-8 to row-22`。
    - 图像 A (小)：`col-3 to col-14`, `row-3 to row-12`。
- **迁移重点**：垂直注脚锚点锁定在 `col-3, row-22`。

### film-diptych
- **坐标布局**：
    - 横向：`col-1 to col-12` (Frame A), `col-13 to col-24` (Frame B)。
    - 纵向：`row-1 to row-16` (Frame A), `row-17 to row-24` (Frame B)。

### micro-anchor
- **坐标布局**：
    - 背景文字：`row-6` (25% 位置)。
    - 图像：`col-3 to col-10` (或 `col-15 to col-22`)，底部对齐 `row-22`。

### sincerity-portrait
- **坐标布局**：
    - 背景标题：`row-5`。
    - 文本区：`col-3 to col-14`, `row-7 to row-12`。
    - 图像区：`col-14 to col-23` (70.8%), `row-13 to row-22`。

### artistic-l-space
- **坐标布局**：
    - 图像出血：`col-7 to col-24`, `row-7 to row-24` (75% x 75%)。
    - 垂直标题列：`col-1 to col-6`。
    - 顶部手记：`col-19 to col-24`, `row-2 to row-6`。

### floating-gallery
- **坐标布局**：
    - 图像：`col-4 to col-21`, `row-4 to row-16`。
    - 标题组：`col-4 to col-21`, `row-18 to row-22`。

### cinematic-letterbox
- **坐标布局**：
    - 图像：`col-1 to col-24`, `row-4 to row-16` (16:9 比例)。
    - 底部标题组：`col-3 to col-22`, `row-18 to row-22`。

### vertical-column
- **坐标布局**：
    - 图像：`col-1 to col-16` (66.6%)。
    - 文字栏：`col-18 to col-23` (垂直排版)。

### horizon-sky
- **坐标布局**：
    - 天空文字：`col-4 to col-21`, `row-3 to row-8`。
    - 地平线：`col-1 to col-24`, `row-13`。
    - 大地图：`col-4 to col-21`, `row-14 to row-22`。

### epilogue-pillar
- **坐标布局**：
    - 左侧文字：`col-2 to col-12`。
    - 右侧立柱：`col-14 to col-24` (50% 宽度)。

### future-focus
- **坐标布局**：
    - 主视觉：`col-1 to col-18` (75%)。
    - 侧栏：`col-19 to col-24`。
- **迁移重点**：背景数字 `col-16 to col-24`, `row-1 to row-10` (极浅透明度)。

### gallery-capsule
- **坐标布局**：
    - 4 个胶囊分别占据 `colSpan-5`，起始位置 `col-2, 7, 13, 18`。
    - 垂直偏移映射为 `translateY` preset。

### editorial-split
- **坐标布局**：
    - 侧栏文字：`col-2 to col-9` (33.3%)。
    - 主图区：`col-11 to col-24`。

---

## Cover Archetype (封面类)

### cinematic-full-bleed
- **坐标布局**：
    - 标题：`col-3 to col-22`, `row-4` (Top) 或 `row-20` (Bottom)。

### editorial-classic
- **坐标布局**：
    - 图像：`col-1 to col-24`, `row-1 to row-17` (70.8%)。
    - 标题区：`col-3 to col-22`, `row-18 to row-24`。

---

## Product Archetype (产品类)

### apple-bento-grid
- **坐标布局**：
    - 外壳：`col-2 to col-23`, `row-3 to row-22`。
    - 单元格：内部嵌套 grid。

### component-mosaic
- **坐标布局**：
    - 左文字：`col-3 to col-10`。
    - 右网格：`col-12 to col-24`。

---

## Marketing Archetype (市场类)

### platform-hero
- **坐标布局**：`col-4 to col-21`, `row-4 to row-12` (头部)。

### testimonial-card
- **坐标布局**：卡片 `col-2 to col-23`。头像占卡内 `col-1 to col-8`。

### community-hub
- **坐标布局**：左区 `col-1 to col-11`, 右区 `col-12 to col-24`。
