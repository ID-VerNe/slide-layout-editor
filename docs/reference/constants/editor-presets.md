# 编辑器预设

## 2. 编辑器预设系统 (`editorPresets.ts`)

- **文件**: `src/constants/editorPresets.ts`
- **用途**: 定义编辑器中字号、行高、字距的受控预设选项，确保设计一致性

### 2.1 字号预设 (`FONT_SIZE_PRESETS`)

12 档字号预设，涵盖从微小文字到艺术大字的全尺度范围：

```typescript
export const FONT_SIZE_PRESETS = [
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
  { value: 120, label: '120pt (Art)' }
] as const;
```

**设计原则**:
- 遵循杂志排版的离散尺度体系
- 每档之间保持视觉节奏的平衡跳跃
- 对齐 DesignSystem.typography.scales

### 2.2 行高预设 (`LINE_HEIGHT_PRESETS`)

7 档行高预设，适配不同排版密度需求：

```typescript
export const LINE_HEIGHT_PRESETS = [
  { value: 1.0, label: '1.0 (Tight)' },
  { value: 1.1, label: '1.1 (Display)' },
  { value: 1.2, label: '1.2 (Compact)' },
  { value: 1.4, label: '1.4 (Normal)' },
  { value: 1.6, label: '1.6 (Relaxed)' },
  { value: 1.8, label: '1.8 (Loose)' },
  { value: 2.0, label: '2.0 (Double)' }
] as const;
```

**使用场景**:
- `1.0-1.2`: 大字号标题、艺术字
- `1.4-1.6`: 正文、段落
- `1.8-2.0`: 松散排版、诗歌引用

### 2.3 字距预设 (`LETTER_SPACING_PRESETS`)

7 档字距预设，控制字符间距：

```typescript
export const LETTER_SPACING_PRESETS = [
  { value: -0.05, label: '-0.05em (Tight)' },
  { value: 0, label: '0 (Normal)' },
  { value: 0.05, label: '0.05em (Wide)' },
  { value: 0.1, label: '0.1em (Airy)' },
  { value: 0.15, label: '0.15em (Tracking)' },
  { value: 0.2, label: '0.2em (Caps)' },
  { value: 0.3, label: '0.3em (Display)' }
] as const;
```

**设计原则**:
- 负值用于大字号压紧
- 正值用于小号字母、全大写
- 以 `em` 为单位，相对于字号自适应

### 2.4 类型推导

```typescript
export type FontSizePreset = typeof FONT_SIZE_PRESETS[number]['value'];
export type LineHeightPreset = typeof LINE_HEIGHT_PRESETS[number]['value'];
export type LetterSpacingPreset = typeof LETTER_SPACING_PRESETS[number]['value'];
```

**值类型**: 字号和行高为 `number`，字距为 `number`（代表 em 值，如 `-0.05` 表示 `-0.05em`）

**声明方式**: 三个数组均使用 `as const` 断言声明
