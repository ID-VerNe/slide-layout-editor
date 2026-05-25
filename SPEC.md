# 📐 Zine Technical Specification (SPEC) v1.0

> **指导思想**：无情克制，极端对比 (Ruthless Restraint, Extreme Contrast)

## 1. The 24x24 Modular Grid System
所有页面的底层坐标系。不使用 Flexbox 进行宏观布局。

*   **宽度 (X 轴)**：全屏宽度等分为 24 份 (`col-1` 到 `col-24`)。
*   **高度 (Y 轴)**：全屏高度等分为 24 份 (`row-1` 到 `row-24`)。
*   **安全边距 (Safe Area)**：默认的安全排版区域通常从 `col-3` 开始，到 `col-22` 结束（左右各留 2 个 units 作为绝对留白）。
*   **实现方式**：在父容器使用 `display: grid; grid-template-columns: repeat(24, minmax(0, 1fr)); grid-template-rows: repeat(24, minmax(0, 1fr));`。

## 2. The 8px Baseline Grid
所有垂直方向的文本排版和微小间距必须严格对齐 8px 基准线。

*   **Line Height**：文本的行高必须是 8 的倍数（如 16px, 24px, 32px, 48px）。
*   **Spacing (Gap/Margin/Padding)**：组件之间的微间距使用基于 8px 的倍数 (`spacing-1` = 8px, `spacing-2` = 16px)。

## 3. Design System Tokens
禁止在代码和 Schema 中硬编码十六进制颜色 (Hex) 或具体的像素值。

### 3.1 Color Tokens
*   `color.background`: 页面的物理底色 (如 `#FAFAF9` 或 `#0F172A`)。
*   `color.surface`: 悬浮卡片、输入框的背景色，需与 background 有微弱对比。
*   `color.primary`: 最主要的阅读文本颜色 (如 `#1C1917` 或 `#F8FAFC`)。
*   `color.secondary`: 次要文本、段落、副标题 (具有一定透明度或灰度)。
*   `color.accent`: 情绪强调色、点缀线、高亮元素 (唯一可以高饱和度的颜色)。

### 3.2 Typography Tokens (The Type Scale)
*   **A. Display (主标题)**
    *   **职责**：视觉张力，破网格。
    *   **特性**：超紧字距 (`tracking-tighter`) 或 超宽字距全大写 (`tracking-widest uppercase`)。行高极小 (`leading-none` 或 0.85)。
*   **B. Body (正文/诗歌)**
    *   **职责**：沉浸阅读。
    *   **特性**：标准字距 (`tracking-normal`)，大行高 (`leading-relaxed` 或 1.8)，颜色必须是 `color.secondary`，禁止纯黑/纯白。
*   **C. Caption (元数据/Folio)**
    *   **职责**：工业精密感。
    *   **特性**：必须全大写 (`uppercase`)，超宽字距 (`tracking-[0.2em]`)，极小字号 (9px - 11px)。

## 4. Architectural Components

### 4.1 PageFrame (外壳容器)
负责接管原本零散在各个模板中的全局元素。
*   **渲染层级**：`[ 背景纹理层 ] -> [ 内容 Slot (Schema 渲染在此) ] -> [ Folio 绝对锚点层 ] -> [ 调试辅助网格层 ]`
*   **绝对锚点 (Folio)**：页码、卷首语必须在 PageFrame 中绝对定位，通常锁定在 `col-2, row-23` (左下角) 或 `col-23, row-23` (右下角)。

### 4.2 Zine Atom Components
取代旧的 `Slide*` 组件，强制消费 Token 和 8px 基线。
*   `<ZineDisplay />`: 仅接受 Display Tokens。
*   `<ZineBody />`: 仅接受 Body Tokens。
*   `<ZineCaption />`: 仅接受 Caption Tokens。

## 5. Editor Constraints (The "Restraint")
编辑器 UI 的开发原则：**提供选择，而非自由。**
*   不要给用户提供输入框让他们写 `23px`。提供下拉框：`Small (16px)`, `Medium (24px)`, `Large (48px)`。
*   颜色选择器只能从 Design System 定义的 5 个 Token 中选择，或从预设的主题调色板中挑选，禁止任意取色。