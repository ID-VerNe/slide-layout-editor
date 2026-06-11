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

*   **`size` (Number)**: 使用 **8px 的倍数** 作为字号单位。
    *   `size: 2` -> `16px`
    *   `size: 10` -> `80px`
    *   **优势**: 自动计算行高并吸附到 8px 基线。
*   **`leading` (Number)**: 行高倍数，默认为 `1.2`。渲染引擎会自动对结果进行像素取整，确保文本行完美对齐网格基线。

### 2. 字体族选择 (Font Identity)

模板不再关心具体的字体名称，只需通过以下开关切换：

*   **`serif` (Boolean)**: 衬线体。渲染器会根据语言自动匹配：
    *   英文: `Playfair Display`
    *   中文 (`lang: 'zh'`): `STFangsong` (仿宋)
*   **`sans` (Boolean)**: 无衬线体。对应 `Inter`。
*   **`caption` (Boolean)**: 标注体。对应 `Inter` 且默认开启全大写和宽字距。
*   **`lang` ('en' | 'zh')**: 手动指定语言。影响 `serif/sans` 的具体映射。

### 3. 排版细节

*   **`align`**: `'left' | 'center' | 'right' | 'justify'`
*   **`bold`**: 加粗切换。
*   **`italic`**: 斜体切换。
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
