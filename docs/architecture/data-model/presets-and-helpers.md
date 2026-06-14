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

### 8.1 `PresetOption<T>`
编辑器预设选项，用于字号、行高、字距的受控选择。

- **文件**: `src/constants/editorPresets.ts`

```typescript
interface PresetOption<T extends string | number> {
  value: T;      // 预设值 (数字或字符串)
  label: string; // 显示标签
}
```

### 8.2 预设常量

**字号预设** (`FONT_SIZE_PRESETS`):
```typescript
PresetOption<number>[] = [
  { value: 6, label: '6pt (Micro)' },
  { value: 7, label: '7pt (Caption)' },
  // ... 共 12 档
];
```

**行高预设** (`LINE_HEIGHT_PRESETS`):
```typescript
PresetOption<number>[] = [
  { value: 1.0, label: '1.0 (Tight)' },
  // ... 共 7 档
];
```

**字距预设** (`LETTER_SPACING_PRESETS`):
```typescript
PresetOption<string>[] = [
  { value: '-0.05em', label: '-0.05em (Tight)' },
  // ... 共 7 档
];
```

---

## 9. 类型关系图

```text
ProjectData
├── pages: PageData[]
│   ├── layoutId -> TEMPLATES[].id -> TemplateConfig.schema -> TemplateSchema
│   ├── aspectRatio -> LAYOUT_CONFIG[ratio]
│   ├── agenda: AgendaData[]
│   ├── features: FeatureData[]
│   ├── metrics: MetricData[]
│   ├── testimonials: TestimonialData[]
│   ├── bentoItems: BentoItem[]
│   ├── resumeSections: ResumeSection[] -> ResumeItem[]
│   └── mosaic / gallery / freeformItems: any[]
├── theme: ProjectTheme
│   └── typography: { headingFont, bodyFont, ... }
├── designSystem: DesignSystem
│   ├── tokens: DesignTokens
│   │   ├── colors: Record<string, string>
│   │   ├── spacing: { none, xs, sm, md, lg, xl, gutter }
│   │   └── typography: { scales, body, caption, display }
│   └── presets: { layout, effects }
├── customFonts: CustomFont[]
├── printSettings: PrintSettings
└── counterStyle: CounterStyle
```
