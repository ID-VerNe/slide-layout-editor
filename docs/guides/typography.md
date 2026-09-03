# 语义化排版开发指南 (Semantic Typography Guide)

本指南详细说明了项目中的“语义化排版”哲学及其在模板开发中的具体应用。

## 核心哲学：意图与表现分离

在本项目中，**模板 (Template Schema)** 应当只声明设计意图，而不应包含具体的 CSS 实现细节。

*   **错误做法**: `className: "!text-[48px] !font-black tracking-tighter"` (硬编码，难以维护)
*   **正确做法**: `props: { size: 6, bold: true, tracking: -0.05, serif: true }` (语义化，由渲染引擎统一控制)

---

## 语义化 Props 列表

所有原子组件（`ZineDisplay`, `ZineBody`, `ZineCaption`, `ZineArtFont`）均支持以下抽象属性：

### 1. 尺寸与行高 (Size & Leading)

*   **`size` (Number | String)**: 基于 **8px 基线倍数** 进行换算（由 `resolveModularFontSize` 统一处理）：
    *   `size: 1` -> `8px` (微型标注 / Caption)
    *   `size: 1.25` -> `10px` (元数据标签 / Meta Tag)
    *   `size: 1.5` -> `12px` (小字说明 / Subtitle)
    *   `size: 2` -> `16px` (正文基准 / Body Base)
    *   `size: 2.25` -> `18px` (双语生词 / Large Body)
    *   `size: 3` -> `24px` (小标题 / H3)
    *   `size: 4` -> `32px` (二级标题 / H2)
    *   `size: 6` -> `48px` (主标题 / H1)
    *   `size: 8` -> `64px` (巨幅展示标 / Display Hero)
    *   `size: 10+` -> `80px+` (艺术刊头 / Masthead)
*   **多单位与类型安全解析 (`resolveModularFontSize`)**:
    *   **数字类型**: 严格按 8px 律动基线换算（`size * 8`）；
    *   **纯数字字符串**: 如 `"1.5"`、`"2"` 同样自动换算为像素倍数（`12px`、`16px`）；
    *   **CSS 单位字符串**:
        *   `"1.5rem"` / `"1.5em"` -> 基于 16px 标准换算为 `24px`；
        *   `"24px"` -> 直接保留为 `24px`；
        *   `"12pt"` -> 按印刷 4/3 比率换算为 `16px`。
*   **`leading` (Number)**: 行高倍数，默认为 `1.2`。渲染引擎会自动对 `fontSize * leading` 向上吸附取整到 8px 网格，确保文本行完美对齐基线。
*   **原子组件可读性保护**:
    *   `ZineVocabList`：默认基准字号为 `2.25`（18px），内部针对词头（≥16px）、释义（≥14px）、音标（≥12px）设置物理像素下限，避免极端缩放时文字坍塌；
    *   `ZineMetric`：默认值基于 8px 网格规范（`72px`），消费 `variant: 'display'` Token；
    *   `ZineIcon`：`size <= 10` 时智能识别为 8px 基线倍数（`size: 1.5` -> 12px），`size > 10` 时作为物理像素（如 `size: 24` -> 24px）。

### 2. 字体族选择 (Font Identity)

模板不再关心具体的字体名称，只需通过以下开关切换：

*   **`serif` (Boolean)**: 衬线体。渲染器会根据语言自动匹配：
    *   英文: `Playfair Display`
    *   中文 (`lang: 'zh'`): `STFangsong` (仿宋)
*   **`sans` (Boolean)**: 无衬线体。对应 `Inter`。
*   **`caption` (Boolean)**: 标注体。对应项目主题中的 `captionFont`（默认为 `Inter`），且默认开启全大写和宽字距。
*   **`lang` ('en' | 'zh')**: 手动指定语言。影响 `serif/sans` 的具体映射（中文下 `serif` 默认映射到仿宋/宋体系）。
*   **`zh` (Boolean)**: 同 `lang: 'zh'` 的中文简写。当 `zh` 和 `lang` 同时存在时 `zh` 优先。

### 3. 排版细节

*   **`align`**: `'left' | 'center' | 'right' | 'justify'`
*   **`bold`**: 加粗切换。
*   **`italic`**: 斜体切换。
*   **`weight`** (Number | String): 精确字体字重（如 `700`、`'bold'`），优先级高于 `bold`。
*   **`tracking` (Number)**: 字距。单位为 `em` (如 `0.2` 为加宽 20%)。
*   **`color`**: 直接传入颜色 Token 名称 (如 `primary`, `accent`) 或 十六进制值。

---

## 最佳实践示例

### 1. 巨型封面标题
```typescript
{
  type: 'Component',
  componentType: 'ZineDisplay',
  props: {
    size: 20,      // 160px
    serif: true,   // 使用优雅的衬线体
    align: 'center',
    bold: true,
    leading: 0.9   // 紧凑行高
  }
}
```

### 2. 工业感元数据标注
```typescript
{
  type: 'Component',
  componentType: 'ZineCaption',
  props: {
    size: 1.25,    // 10px
    tracking: 0.5, // 极宽字距，营造精密感
    opacity: 0.4
  }
}
```

### 3. 诗性正文段落
```typescript
{
  type: 'Component',
  componentType: 'ZineBody',
  props: {
    size: 2.5,     // 20px
    serif: true,
    italic: true,  // 诗性斜体
    lang: 'zh'     // 强制使用中文仿宋
  }
}
```

---

## 编辑器约束与预设系统

从 v3.0 开始，编辑器中的字号、行高、字距采用**受控预设**而非自由输入，确保设计一致性。

### 预设选择器 (PresetSelect)

**组件**: `src/components/ui/PresetSelect.tsx`  
**预设定义**: `src/constants/editorPresets.ts`

#### 可用预设

**字号** (12 档): `6pt → 7pt → 10pt → 12pt → 14pt → 18pt → 24pt → 32pt → 48pt → 64pt → 80pt → 120pt`

**行高** (7 档): `1.0 → 1.1 → 1.2 → 1.4 → 1.6 → 1.8 → 2.0`

**字距** (7 档): `-0.05em → 0 → 0.05em → 0.1em → 0.15em → 0.2em → 0.3em`

#### 设计原则

- ✅ 遵循杂志排版的离散尺度体系
- ✅ 每档之间保持视觉节奏的平衡跳跃
- ✅ 对齐 DesignSystem.typography.scales
- ✅ 自动值映射：非预设值自动映射到最接近的档位

---

## 渲染引擎逻辑 (`useModularStyle`)

所有的语义化属性都通过 `useModularStyle` 钩子统一处理。该引擎具备以下高级能力：
1.  **基线吸附**: 确保 `fontSize * leading` 始终是 8 的倍数。
2.  **黑名单过滤**: 自动剔除 `className` 中不符合 Zine Mode 工业审美的 Tailwind 类名（如阴影、模糊、动画）。
3.  **负边距补偿**: 自动通过 `margin-right` 负值抵消 `letter-spacing` 在末尾字符产生的偏移，确保对齐完美。
4.  **单位安全换算**: 内置 `resolveModularFontSize`，彻底杜绝字符串或带单位数值（如 `"1.5"`、`"1.5rem"`）被误吞为极小物理像素。
5.  **画幅与视口自适应**: 横版 16:9（1920x1080）与竖版 2:3/3:4/A4/1:1 画布通过统一的 8px 模数保持严密的排版节奏与层级感。
6.  **双轴 9 点停靠 (9-point Docking)**: 结合 `resolveDockingStyle`，将 `alignSelf` 与 `justifySelf` 精确映射为 Flex 容器与文本对齐样式，并强制施加 `min-w-0` 与断词保护 (`break-words`)，杜绝排版宽度坍塌。

---

## 字体与排版基础设施

### 1. 全局字体加载器 (`src/utils/fontLoader.ts`)
- **协议兼容**: 支持 `data:font/*`、`http(s)://`、`blob:` 以及原生 `asset://` 协议自定义字体。
- **双重注入**: 优先调用标准 `new FontFace()` 注册至 `document.fonts`；失败时优雅降级为动态注入 `@font-face` `<style>` 标签。
- **生命周期保全**: 支持按字族名精确清理与批量载入，防止多次切换工程导致的字体污染。

### 2. 闭式字号计算引擎 (`src/workers/fontCalculatorManager.ts`)
- **$O(1)$ 闭式代数公式**: 彻底淘汰低效的二分逼近循环，基于字符单位权重推导（ASCII: 0.6，CJK: 1.0），瞬间计算出不超过容器宽度与行数限制的最大允许字号。
- **全局共享 Worker 单例**: 通过 `fontCalculatorManager` 集中调度 Web Worker 线程，杜绝多实例创建造成的线程爆炸，带有 2000ms 超时安全保护。

