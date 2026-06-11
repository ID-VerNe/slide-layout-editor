# 全局常量与配置参考 (Constants & Config)

本章记录了 SlideGrid Studio 中的全局设计参数、布局配置与静态资源映射。

---

## 1. 布局与画布配置 (`layout.ts`)

- **文件**: `src/constants/layout.ts`

### 1.1 比例与尺寸 (`LAYOUT_CONFIG`)
定义了编辑器画布在不同比例下的原始像素尺寸：

| 比例 | 宽度 (px) | 高度 (px) | 描述 |
| :--- | :--- | :--- | :--- |
| `16:9` | 1920 | 1080 | 标准宽屏 |
| `2:3` | 1080 | 1620 | 海报排版 |
| `A4` | 1240 | 1754 | 专业简历 (Resume 专用) |
| `1:1` | 1080 | 1080 | 正方形 |

### 1.2 编辑器 UI 常量
- `SIDEBAR_WIDTH`: 96px (左侧导航栏)
- `EDITOR_PANEL_WIDTH`: 400px (右侧编辑面板)

---

## 2. 编辑器预设系统 (`editorPresets.ts`)

- **文件**: `src/constants/editorPresets.ts`
- **用途**: 定义编辑器中字号、行高、字距的受控预设选项，确保设计一致性

### 2.1 字号预设 (`FONT_SIZE_PRESETS`)

12 档字号预设，涵盖从微小文字到艺术大字的全尺度范围：

```typescript
export const FONT_SIZE_PRESETS: PresetOption<number>[] = [
  { value: 6, label: '6pt (Micro)' },
  { value: 7, label: '7pt (Caption)' },
  { value: 10, label: '10pt (Body)' },
  { value: 12, label: '12pt (Body+)' },
  { value: 14, label: '14pt (Lead)' },
  { value: 18, label: '18pt (Subhead)' },
  { value: 24, label: '24pt (H3)' },
  { value: 32, label: '32pt (H2)' },
  { value: 48, label: '48pt (H1)' },
  { value: 64, label: '64pt (Display)' },
  { value: 80, label: '80pt (Hero)' },
  { value: 120, label: '120pt (Art)' },
];
```

**设计原则**:
- 遵循杂志排版的离散尺度体系
- 每档之间保持视觉节奏的平衡跳跃
- 对齐 DesignSystem.typography.scales

### 2.2 行高预设 (`LINE_HEIGHT_PRESETS`)

7 档行高预设，适配不同排版密度需求：

```typescript
export const LINE_HEIGHT_PRESETS: PresetOption<number>[] = [
  { value: 1.0, label: '1.0 (Tight)' },
  { value: 1.1, label: '1.1 (Display)' },
  { value: 1.2, label: '1.2 (Compact)' },
  { value: 1.4, label: '1.4 (Normal)' },
  { value: 1.6, label: '1.6 (Relaxed)' },
  { value: 1.8, label: '1.8 (Loose)' },
  { value: 2.0, label: '2.0 (Double)' },
];
```

**使用场景**:
- `1.0-1.2`: 大字号标题、艺术字
- `1.4-1.6`: 正文、段落
- `1.8-2.0`: 松散排版、诗歌引用

### 2.3 字距预设 (`LETTER_SPACING_PRESETS`)

7 档字距预设，控制字符间距：

```typescript
export const LETTER_SPACING_PRESETS: PresetOption<string>[] = [
  { value: '-0.05em', label: '-0.05em (Tight)' },
  { value: '0', label: '0 (Normal)' },
  { value: '0.05em', label: '0.05em (Wide)' },
  { value: '0.1em', label: '0.1em (Airy)' },
  { value: '0.15em', label: '0.15em (Tracking)' },
  { value: '0.2em', label: '0.2em (Caps)' },
  { value: '0.3em', label: '0.3em (Display)' },
];
```

**设计原则**:
- 负值用于大字号压紧
- 正值用于小号字母、全大写
- 以 `em` 为单位，相对于字号自适应

### 2.4 类型定义

```typescript
export interface PresetOption<T extends string | number> {
  value: T;
  label: string;
}
```

**泛型约束**: 支持 `number`（字号、行高）和 `string`（字距）类型

---

## 3. 图标系统 (`icons.ts`)

- **文件**: `src/constants/icons.ts`
- **图标库**: 基于 `lucide-react`。

### 2.1 `LUCIDE_ICON_MAP`
将字符串 ID 映射到具体的 Lucide 组件，用于模板 Schema 动态渲染图标。

### 2.2 `CATEGORIZED_ICONS`
用于图标选择器中的分组展示，包含：
- Technology & Infrastructure
- Science & Health
- Business & Finance
- Communication & Social
- Security & Interface

---

## 3. 设计系统令牌 (`theme.ts`)

- **文件**: `src/constants/theme.ts`
- **内容**: 预设的主题调色板、圆角等级（尽管 Zine 模式限制了圆角的使用）以及阴影定义。
