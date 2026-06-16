# 主题与布局系统

## 4. 主题系统

### 4.1 `ProjectTheme`
全局视觉主题，存储在 `ProjectData.theme` 中。

```typescript
interface ProjectTheme {
  colors: {
    primary: string;    // 主色 (默认: '#0F172A')
    secondary: string;  // 次色 (默认: '#64748B')
    accent: string;     // 强调色 (默认: '#264376')
    background: string; // 背景色 (默认: '#ffffff')
    surface: string;    // 卡片底色 (默认: '#F1F3F5')
  };
  typography: {
    headingFont: string;      // 英文标题字体 (默认: 'Playfair Display')
    bodyFont: string;         // 英文正文字体 (默认: 'Inter')
    captionFont?: string;     // 说明文字字体 (默认: 'Inter')
    headingFontZH?: string;   // 中文标题字体 (默认: 'STFangsong, FangSong, Noto Serif SC')
    bodyFontZH?: string;      // 中文正文字体 (默认: 'STFangsong, FangSong, Noto Serif SC')
  };
}
```

### 4.2 `DesignSystem`
设计令牌系统，提供精细化的样式拆解，**优先级高于** `ProjectTheme`。

```typescript
interface DesignSystem {
  tokens: DesignTokens;
  presets: {
    layout: Record<string, { p?: string; px?: string; py?: string }>;
    effects: Record<string, React.CSSProperties>;
  };
}
```

### 4.3 `DesignTokens`
原子化设计变量。

```typescript
interface DesignTokens {
  colors: Record<string, string>;           // 颜色 Token
  spacing: { none, xs, sm, md, lg, xl, gutter };  // 间距 Token
  typography: {
    scales: Record<string, string>;         // 字号阶梯
    body: TypographyToken;                  // 正文排版
    caption: TypographyToken;               // 说明排版
    display: TypographyToken;               // 标题排版
  };
}
```

### 4.4 `TypographyToken`
排版令牌单元。

```typescript
interface TypographyToken {
  fontSize: string;
  lineHeight: string;
  letterSpacing?: string;
  fontWeight?: string | number;
  textTransform?: string;
  fontStyle?: string;              // 字体样式 (如 'italic')
}
```

### 4.5 默认值 (来自 `src/constants/theme.ts`)

**默认主题 (`DEFAULT_THEME`)**:

```typescript
colors: {
  primary: '#0F172A',
  secondary: '#64748B',
  accent: '#264376',
  background: '#ffffff',
  surface: '#F1F3F5'
}
typography: {
  headingFont: "'Playfair Display', serif",
  bodyFont: "'Inter', sans-serif",
  captionFont: "'Inter', sans-serif",
  headingFontZH: "'STFangsong', 'FangSong', 'Noto Serif SC', serif",
  bodyFontZH: "'STFangsong', 'FangSong', 'Noto Serif SC', serif"
}
```

**默认 Design Tokens**:

| Token | fontSize | lineHeight | fontWeight | letterSpacing | fontStyle | textTransform |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `display` | 48pt | 1.1 | 400 | 0.2em | — | uppercase |
| `body` | 10pt | 1.6 | 400 | 0 | italic | — |
| `caption` | 7pt | 1.8 | 700 | 0.2em | — | uppercase |

**字号阶梯** (`typography.scales`):

| Token | 值 |
| :--- | :--- |
| `display` | 64pt |
| `h1` | 48pt |
| `h2` | 32pt |
| `body` | 10pt |
| `caption` | 7pt |

**预设布局**:
- `'safe-area'`: `{ px: 'spacing.gutter', py: 'spacing.gutter' }`
- `'full-bleed'`: `{ p: 'spacing.none' }`

**预设效果**:
- `'glass-card'`: 毛玻璃卡片 `{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255,255,255,0.8)' }`
- `'hard-edge'`: 硬边缘 `{ border: '1px solid #000' }`

**默认打印设置 (`DEFAULT_PRINT_SETTINGS`)**:

```typescript
{
  enabled: false,
  widthMm: 100,
  heightMm: 145,
  gutterMm: 10,
  showGutterShadow: true,
  showTrimShadow: true,
  showContentFrame: true,
  configs: {
    landscape: { bindingSide: 'bottom', trimSide: 'right' },
    portrait: { bindingSide: 'left', trimSide: 'bottom' },
    square: { bindingSide: 'left', trimSide: 'bottom' },
    resume: { bindingSide: 'left', trimSide: 'bottom' }
  }
}
```

---

## 5. 布局系统类型

### 5.1 画面比例与方向

- **文件**: `src/constants/layout.ts`

```typescript
type AspectRatioType = '16:9' | '2:3' | 'A4' | '1:1';
type OrientationType = 'landscape' | 'portrait' | 'square' | 'resume';

interface LayoutDimensions {
  width: number;       // 像素宽度
  height: number;      // 像素高度
  label: string;       // 显示标签
  orientation: OrientationType;
}
```

**预定义尺寸**:

| 比例 | 宽度 | 高度 | 方向 |
| :--- | :--- | :--- | :--- |
| 16:9 | 1920 | 1080 | landscape |
| 2:3 | 1080 | 1620 | portrait |
| A4 | 1240 | 1754 | resume |
| 1:1 | 1080 | 1080 | square |

### 5.2 编辑器布局常量

```typescript
const LAYOUT = {
  EDITOR_PANEL_WIDTH: 400,  // 右侧编辑器宽度
  SIDEBAR_WIDTH: 96,        // 左侧侧边栏宽度
  SIDEBAR_OFFSET: -80,      // 侧边栏偏移
};
```

---

