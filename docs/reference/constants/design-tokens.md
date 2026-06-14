# Design Tokens 与主题默认值

## 4. 设计系统令牌 (`theme.ts`)

- **文件**: `src/constants/theme.ts`
- **内容**: 预设的主题调色板、设计令牌系统。

### 4.1 默认设计系统 (`DEFAULT_DESIGN_SYSTEM`)

```typescript
export const DEFAULT_DESIGN_SYSTEM: DesignSystem = {
  tokens: {
    colors: {
      primary: '#0F172A',      // 深灰黑（标题）
      secondary: '#64748B',    // 中灰（副标题、说明）
      accent: '#264376',       // 深蓝强调色
      background: '#ffffff',   // 背景白
      surface: '#F1F3F5'       // 表面灰
    },
    spacing: {
      none: '0px',
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      gutter: '24px'
    },
    typography: {
      scales: {
        display: '64pt',
        h1: '48pt',
        h2: '32pt',
        body: '10pt',
        caption: '7pt'
      },
      body: {
        fontSize: '10pt',
        lineHeight: '1.6',
        fontWeight: '400',
        letterSpacing: '0',
        fontStyle: 'italic'
      },
      caption: {
        fontSize: '7pt',
        lineHeight: '1.8',
        fontWeight: '700',
        letterSpacing: '0.2em',
        textTransform: 'uppercase'
      },
      display: {
        fontSize: '48pt',
        lineHeight: '1.1',
        fontWeight: '400',
        letterSpacing: '0.2em',
        textTransform: 'uppercase'
      }
    }
  },
  presets: {
    layout: {
      'safe-area': { px: 'spacing.gutter', py: 'spacing.gutter' },
      'full-bleed': { p: 'spacing.none' }
    },
    effects: {
      'glass-card': { backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255,255,255,0.8)' },
      'hard-edge': { border: '1px solid #000' }
    }
  }
};
```

### 4.2 颜色令牌系统

| 令牌名 | 默认值 | 用途 |
|--------|--------|------|
| `primary` | `#0F172A` | 主标题、正文文字 |
| `secondary` | `#64748B` | 副标题、说明文字、元数据 |
| `accent` | `#264376` | 深蓝强调色、分割线、图标 |
| `background` | `#ffffff` | 页面背景 |
| `surface` | `#F1F3F5` | 卡片、面板背景 |

### 4.3 字体令牌规模

**Display（展示级）**：
- 用于大标题、封面标题
- 默认字号: `48pt`, 默认字重: `400`, 行高: `1.1`
- 默认字距: `+0.2em`, 默认全大写

**Body（正文级）**：
- 用于段落、描述文字
- 默认字号: `10pt`, 默认字重: `400`, 行高: `1.6`
- 默认斜体 (`fontStyle: 'italic'`)

**Caption（标注级）**：
- 用于元数据、页码、小字标签
- 默认字号: `7pt`, 默认字重: `700`, 行高: `1.8`
- 默认全大写, 默认字距: `+0.2em`

### 4.4 间距令牌

基于 8px 网格系统：

| 令牌 | 值 | 用途 |
|------|-----|------|
| `none` | `0px` | 零间距 |
| `xs` | `4px` | 最小间距 |
| `sm` | `8px` | 基础单元 |
| `md` | `16px` | 标准间距 |
| `lg` | `24px` | 区块间距 |
| `xl` | `32px` | 大区块间距 |
| `gutter` | `24px` | 安全区边距 |

---

## 6. 主题默认值 (`theme.ts`)

- **文件**: `src/constants/theme.ts`

### 6.1 `DEFAULT_THEME`

全局视觉主题的默认配置：

```typescript
export const DEFAULT_THEME: ProjectTheme = {
  colors: { 
    primary: '#0F172A', 
    secondary: '#64748B', 
    accent: '#264376', 
    background: '#ffffff', 
    surface: '#F1F3F5' 
  },
  typography: { 
    headingFont: "'Playfair Display', serif", 
    bodyFont: "'Inter', sans-serif",
    captionFont: "'Inter', sans-serif",
    headingFontZH: "'STFangsong', 'FangSong', 'Noto Serif SC', serif", 
    bodyFontZH: "'STFangsong', 'FangSong', 'Noto Serif SC', serif" 
  }
};
```

### 6.2 `DEFAULT_PRINT_SETTINGS`

打印/出版设置的默认值：

```typescript
export const DEFAULT_PRINT_SETTINGS: PrintSettings = {
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
};
```
