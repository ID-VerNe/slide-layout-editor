# 辅助类型、预设与类型关系图

## 7. 其他辅助类型

### 7.1 页码样式

```typescript
type CounterStyle = 'number' | 'alpha' | 'roman' | 'dots';
```

### 7.2 背景纹理

```typescript
type BackgroundPatternType = 'none' | 'grid' | 'dots' | 'diagonal' | 'cross';
```

### 7.3 自定义字体

```typescript
interface CustomFont {
  name: string;      // 字体名称
  family: string;    // CSS font-family
  dataUrl?: string;  // 字体文件 DataURL
}
```

### 7.4 排版设置

```typescript
interface TypographySettings {
  defaultLatin?: string;    // 默认拉丁字体
  defaultCJK?: string;      // 默认中文字体
  fieldOverrides?: Record<string, string>;  // 字段级字体覆盖
}
```

### 7.5 打印设置

```typescript
interface PrintSettings {
  enabled: boolean;
  widthMm: number; heightMm: number;
  gutterMm: number;
  showGutterShadow: boolean;
  showTrimShadow: boolean;
  showContentFrame: boolean;
  configs: {
    landscape: { bindingSide: Side; trimSide: Side };
    portrait: { bindingSide: Side; trimSide: Side };
    square: { bindingSide: Side; trimSide: Side };
    resume: { bindingSide: Side; trimSide: Side };
  };
}

type Side = 'left' | 'right' | 'top' | 'bottom';
```

### 7.6 保留数据结构

```typescript
interface ProjectSaveData extends ProjectData {
  assets?: Record<string, string>;  // 资产映射 (assetId -> DataURL)
}
```

---

## 8. 编辑器预设类型

### 8.1 预设常量 (Preset Constants)

编辑器预设选项，用于字号、行高、字距的受控选择。所有预设数组使用 `as const` 声明以提供精确的类型推导。

- **文件**: `src/constants/editorPresets.ts`

**字号预设** (`FONT_SIZE_PRESETS`):
```typescript
readonly { value: number; label: string }[] = [
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

**行高预设** (`LINE_HEIGHT_PRESETS`):
```typescript
readonly { value: number; label: string }[] = [
  { value: 1.0, label: '1.0 (Tight)' },
  { value: 1.1, label: '1.1 (Display)' },
  { value: 1.2, label: '1.2 (Compact)' },
  { value: 1.4, label: '1.4 (Normal)' },
  { value: 1.6, label: '1.6 (Relaxed)' },
  { value: 1.8, label: '1.8 (Loose)' },
  { value: 2.0, label: '2.0 (Double)' }
] as const;
```

**字距预设** (`LETTER_SPACING_PRESETS`):
```typescript
readonly { value: number; label: string }[] = [
  { value: -0.05, label: '-0.05em (Tight)' },
  { value: 0, label: '0 (Normal)' },
  { value: 0.05, label: '0.05em (Wide)' },
  { value: 0.1, label: '0.1em (Airy)' },
  { value: 0.15, label: '0.15em (Tracking)' },
  { value: 0.2, label: '0.2em (Caps)' },
  { value: 0.3, label: '0.3em (Display)' }
] as const;
```

### 8.2 类型推导

```typescript
type FontSizePreset = typeof FONT_SIZE_PRESETS[number]['value'];
type LineHeightPreset = typeof LINE_HEIGHT_PRESETS[number]['value'];
type LetterSpacingPreset = typeof LETTER_SPACING_PRESETS[number]['value'];
```

### 8.3 8px 基线与模数化字阶解析 (`resolveModularFontSize`)
为确保在不同画幅中保持精密韵律，字体系统通过 `resolveModularFontSize` 将数值或预设单位换算为 8px 基线倍数：
- 若输入为纯数字且 $\le 10$（例如 `2`、`4`、`6`），将其解释为 8px 的倍数（`16px`、`32px`、`48px`）。
- 若为字符串尺寸（如 `'18px'`、`'1.5rem'`、`'24pt'`），自动完成单位转换。
- 文本原子组件（`ZineDisplay`、`ZineBody`、`ZineCaption`、`ZineVocabList`）统一遵守该规则。

---

## 9. 类型关系图

```text
ProjectData
├── version: string
├── id?: string
├── title / projectTitle: string
├── pages: PageData[]
│   ├── layoutId -> TEMPLATES[].id -> TemplateDefinition (src/templates/definitions/*.json)
│   ├── aspectRatio -> LAYOUT_CONFIG['16:9' | '2:3' | '3:4' | 'A4' | '1:1']
│   ├── agenda: AgendaData[]
│   ├── features: FeatureData[]
│   ├── metrics: MetricData[]
│   ├── testimonials: TestimonialData[]
│   ├── partners: PartnerData[]
│   ├── bentoItems: BentoItem[]
│   ├── resumeSections: ResumeSection[] -> ResumeItem[]
│   ├── vocabItems: VocabItem[]
│   └── mosaic / gallery / freeformItems: any[]
├── theme?: ProjectTheme
│   └── typography: { headingFont, bodyFont, captionFont?, headingFontZH?, bodyFontZH? }
├── designSystem?: DesignSystem
│   ├── tokens: DesignTokens
│   │   ├── colors: Record<string, string>
│   │   ├── spacing: { none, xs, sm, md, lg, xl, gutter }
│   │   └── typography: { scales, body, caption, display }
│   └── presets: { layout, effects }
├── customFonts: CustomFont[]
├── imageQuality?: number
├── minimalCounter?: boolean
├── counterStyle?: CounterStyle
├── printSettings?: PrintSettings
├── thumbnail?: string
└── filePath?: string
```
