import { ProjectTheme, PrintSettings, DesignSystem } from '../types';

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
    bodyFont: "'Playfair Display', serif",
    captionFont: "'Inter', sans-serif",
    headingFontZH: "'STFangsong', 'FangSong', 'Noto Serif SC', serif", 
    bodyFontZH: "'STFangsong', 'FangSong', 'Noto Serif SC', serif" 
  }
};

export const DEFAULT_DESIGN_SYSTEM: DesignSystem = {
  tokens: {
    colors: {
      primary: '#0F172A',
      secondary: '#64748B',
      accent: '#264376',
      background: '#ffffff',
      surface: '#F1F3F5'
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
      // 引言/诗歌 (Lead/Poem): Playfair Display Italic, 9pt-11pt, Leading 1.6x
      body: { 
        fontSize: '10pt', 
        lineHeight: '1.6', 
        fontWeight: '400', 
        letterSpacing: '0',
        fontStyle: 'italic'
      },
      // 元数据/图注 (Metadata/Caption): Inter Bold/Medium, 6.5pt-7.5pt, ALL CAPS, Tracking +150 to +200, Leading 12pt-14pt
      caption: { 
        fontSize: '7pt', 
        lineHeight: '1.8', // 12.6pt if fontSize is 7pt
        fontWeight: '700', 
        letterSpacing: '0.2em', 
        textTransform: 'uppercase' 
      },
      // 主标题 (Title): Playfair Display, 32pt-48pt, Tracking +150 to +250 (AllCaps)
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
