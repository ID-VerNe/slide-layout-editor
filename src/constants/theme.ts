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
    bodyFont: "'Crimson Pro', serif",
    captionFont: "'Inter', sans-serif",
    headingFontZH: "'Noto Serif SC', serif", 
    bodyFontZH: "'Noto Serif SC', serif" 
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
        display: '72px',
        h1: '48px',
        h2: '32px',
        body: '16px',
        caption: '10px'
      },
      body: { fontSize: '16px', lineHeight: '1.8', fontWeight: '400', letterSpacing: '0.01em' },
      caption: { fontSize: '10px', lineHeight: '1.5', fontWeight: '900', letterSpacing: '0.25em', textTransform: 'uppercase' },
      display: { fontSize: '72px', lineHeight: '0.85', fontWeight: '900', letterSpacing: '-0.04em' }
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
