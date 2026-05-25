# 📖 The Zine Design Specification v1.0
**核心信条：无情克制，极端对比 (Ruthless Restraint, Extreme Contrast)**

## 第一部分：底层美学架构 (Core Aesthetic Framework)

作为单面印刷套卡，每一张都是独立的海报，但组合起来必须是一条流动的长河。

1.  **绝对锚点锁定 (Baseline & Anchor Lock)**
    *   **原则**：读者快速抽换卡片时，必须有某些元素在物理空间的绝对位置保持静止，这会带来极度专业的“工业精密感”。
    *   **规范**：定义一个**全局 Folio（页脚信息栏）**。无论是纯图、纯文还是图文混排，页码（如 `VI`）和档案号（如 `FIG. 04`）必须永远锁定在卡片底部的同一高度（如绝对定位 `bottom-8 left-8`）。
2.  **呼吸感与重力 (Gravity & Active Whitespace)**
    *   **原则**：不要将内容均匀铺满页面。留白要像实体一样具有重量。
    *   **规范**：打破上下左右等距的常规。采用“沉底排版”（底部留白远大于顶部）或“悬浮排版”（顶部留白极大，内容沉降）。天头（Top）与地脚（Bottom）的比例建议为 **1 : 1.5** 或 **1 : 2**。
3.  **情绪节奏跳跃 (Editorial Rhythm)**
    *   **原则**：拒绝连续三张结构相同的排版。
    *   **规范（一套 10 张卡牌的标准节奏）**：
        *   1 封面 (强视觉锁定) -> 1 纯文本引言 (洗眼) -> 1 满版出血大远景 (宏大) -> 1 极小比例特写 + 大面积留白 (收缩) -> 2 经典半身肖像混排 (平稳) -> 1 破网格文字跨图排版 (高潮) -> ...

---

## 第二部分：排版系统与 Tailwind 映射 (Typography & Grid Spec)

基于你提供的字体库（Inter, Noto Serif SC, Crimson Pro, Playfair Display），我们需要建立严格的字体层级（Type Scale）。

### 2.1 字体层级体系 (Type System)

#### A. Display (主标题/情绪大字) - *展现视觉张力*
*   **字体**: Playfair Display (英文) / Noto Serif SC (中文)
*   **Tailwind 规范**: `font-serif text-5xl md:text-7xl`
*   **细节控制**:
    *   **全大写 (All Caps)** 时，配合超宽字距：`!uppercase !tracking-[0.2em] !leading-none`
    *   **大小写混排 (Mixed Case)** 时，配合极紧字距（制造现代锋利感）：`!tracking-tighter !leading-[0.8]`
*   **应用场景**: 封面大字、跨页/破网格的主题词。

#### B. Body / Poetic (诗歌/正文) - *沉浸式阅读*
*   **字体**: Crimson Pro (英文具有优雅的旧式体特征) / Noto Serif SC
*   **Tailwind 规范**: `font-serif text-sm md:text-base`
*   **细节控制**: 必须给予充足的行高，禁止调整字距。`!leading-relaxed` (或 `!leading-[1.8]`) `!tracking-normal text-gray-800`。如果是深色背景，使用 `text-gray-200`，绝不使用纯白 `#FFF`。

#### C. Metadata / Caption (图注/元数据/机身参数) - *极简工业感*
*   **字体**: Inter (无衬线)
*   **Tailwind 规范**: `font-sans text-[9px] md:text-xs`
*   **细节控制**: 必须全大写，拉开字距，降低灰度。`!uppercase !tracking-widest !leading-normal text-gray-500`（或更浅的冷灰色）。
*   **应用场景**: 位于页面绝对边角的次要信息、相机器材、拍摄坐标。

### 2.2 网格与容器规范 (Grid & Container Layouts)

在你的 `LayoutRenderer` 中，通过预设的 Container 实现一致性：

*   **Standard Padding (版心外边距)**:
    *   默认容器类：`p-8 md:p-12 pb-16` (确保地脚更宽，托住版面)。
*   **Grid Column System (网格流)**:
    *   所有内容应遵循 6 栏或 12 栏。在 Tailwind 中通过 `grid-cols-6` 或 `grid-cols-12` 定义。
    *   示例：图片占据 `col-span-4 col-start-2`（图片在中间，两侧留白）。
*   **The "Bleed" (出血与满版)**:
    *   如果图片需要全满铺，使用绝对定位 Container：`absolute inset-0 w-full h-full object-cover`，文字叠加其上，并添加微弱的 `bg-black/20` 遮罩以保证文字可读性。

---

## 第三部分：核心模板蓝图 (JSON Node Archetypes)

为了让你的工具能够快速复用，这里为你规划三种不同情绪的 JSON Layout 蓝图理念（针对你的系统架构）：

### 📌 蓝图 1: The "Gallery" (画廊式：极简与高贵)
*   **适用场景**: 展示高精度人物特写或半身像。
*   **骨架逻辑**:
    *   `Container (flex column, h-full, p-12)`
        *   `Component (Image)`: 设定固定长宽比（如 `aspect-[4/5]`），`object-cover`，强制居中或靠上顶端对齐。
        *   `Container (flex row, justify-between, mt-8, items-end)`: 图注区域，紧贴图片下方或沉入页面最底部。
            *   `Component (Text, Metadata)`: 靠左，渲染 FIG 编号。
            *   `Component (Text, Metadata)`: 靠右，渲染页码。

### 📌 蓝图 2: The "Archive" (档案式：文字与留白的张力)
*   **适用场景**: 大段诗歌、故事背景设定、世界观阐述。
*   **骨架逻辑**:
    *   `Container (grid grid-cols-12, gap-4, h-full, p-12)`
        *   `Container (col-span-5, col-start-1)`: 左侧留出**绝对空拍（大面积留白）**。
        *   `Container (col-span-6, col-start-7, flex column, justify-center)`: 文本框缩在版面右半侧。
            *   `Component (Text, Display)`: 巨大的主标题，破出边界。
            *   `Component (Text, Body)`: 优雅排列的段落。

### 📌 蓝图 3: The "Tension" (破局式：打破四平八稳)
*   **适用场景**: 需要视觉冲击力的关键节点（如首尾页）。
*   **骨架逻辑**:
    *   `Container (absolute, inset-0)`: 将图片放大到占满全卡，甚至做故意裁切（比如只露出半张脸或局部道具）。
    *   `Container (absolute, bottom-12, right-12)`
        *   `Component (Text, Display)`: 使用极大的无衬线或衬线字体（如 `text-[120px] !leading-none text-white mix-blend-difference`），让文字与图片产生物理上的遮挡与穿插。

---

## 🛠 给开发者（你自己）的落地建议

由于这款软件是你自己用 React + Tailwind 开发的，你可以进行以下优化以锁定设计规范：

1.  **封印危险的 Tailwind 类名**: 在编辑器面板里，不要让用户（你自己）随意拉动行高和字距。提供**有限的选项**。比如字距只给 `tracking-tight` (配大号标题), `tracking-normal` (配正文), `tracking-[0.2em]` (配大写元数据)。
2.  **强制网格对齐线 (Baseline Grid Guide)**: 在 `slide-layout-editor` 中写一个调试工具，按 `Cmd+;` 可以召唤出一层 `bg-[url('data:image...线框')]` 的全屏网格。强迫自己在排版时，所有的文本基线（尤其是跨行、跨块的文本）都能踩在这个网格上。
3.  **色彩变量 Token 化**: 在你的 JSON Schema 中，不要存具体的颜色 hex，而是存 `text-primary` / `text-muted`。在 Tailwind 配置中，根据下一期的主题（比如下一期是赛博风），统一将 `primary` 换成高饱和荧光色，`muted` 换成冷灰色，实现一键切换 Theme 且不破坏高级感。
