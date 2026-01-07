export type SlideLayoutType =
  | 'cover-main'      
  | 'content-bullets' 
  | 'split-image'     
  | 'big-statement'   
  | 'step-timeline'   
  | 'gallery-capsule' 
  | 'back-cover-movie' 
  | 'code-snippet'    
  | 'data-grid';       

export type CounterStyle = 'number' | 'alpha' | 'roman' | 'dots';
export type BackgroundPatternType = 'none' | 'grid' | 'dots' | 'diagonal' | 'cross';

export interface CustomFont {
  name: string;
  family: string;
  dataUrl?: string;
}

// --- 新增：语义化设计系统 Token ---
export interface ProjectTheme {
  colors: {
    primary: string;    // 主标题/强调文字
    secondary: string;  // 副标题/引言
    accent: string;     // 装饰线/图标
    background: string; // 页面底色
    surface: string;    // 模块背景/边框
  };
  typography: {
    headingFont?: string;
    bodyFont?: string;
  };
}

export interface MetricData {
  id?: string;
  label: string;
  value: string;
  unit?: string;
  subLabel?: string;
}

export interface FeatureData {
  id?: string;
  title: string;
  desc: string;
  icon?: string;
  imageConfig?: { scale: number; x: number; y: number; };
}

export interface BentoItem {
  id: string;
  type: BentoItemType;
  x: number;       
  y: number;       
  colSpan: number; 
  rowSpan: number;
  title?: string;
  subtitle?: string;
  value?: string;
  icon?: string;
  image?: string;
  imageConfig?: { scale: number; x: number; y: number; };
  fontSize?: number; 
  theme?: 'light' | 'dark' | 'accent' | 'glass';
}

export type BentoItemType = 'metric' | 'icon-text' | 'image' | 'feature-list';

export type AspectRatioType = '16:9' | '2:3' | 'A4' | '1:1';

import { TemplateId } from './templates/registry';

export interface PageData {
  id: string;
  type: 'slide';
  layoutId: TemplateId;
  aspectRatio: AspectRatioType; 
  layoutVariant?: string;

  // 核心内容
  title: string;
  subtitle?: string;
  bullets?: string[]; 
  actionText?: string;
  paragraph?: string; 
  imageLabel?: string;
  imageSubLabel?: string;

  // 扩展内容
  metrics?: MetricData[];
  features?: FeatureData[];
  bentoItems?: BentoItem[]; 
  bentoConfig?: { rows: number; cols: number }; 
  gallery?: GalleryItem[];

  // 视觉元素
  logo?: string;
  logoSize?: number;
  image?: string;
  imageConfig?: { scale: number; x: number; y: number; };
  backgroundColor?: string;
  accentColor?: string; 
  
  // 字体配置
  titleFont?: string;
  bodyFont?: string;

  // 页脚与元数据
  footer?: string;
  pageNumber?: boolean;
  minimalCounter?: boolean; 
  counterColor?: string; 
  pageNumberText?: string; 
  signature?: string; 
  signatureType?: 'text' | 'image'; 
  counterStyle?: CounterStyle;
  backgroundPattern?: BackgroundPatternType;

  // 样式覆盖 (允许单页覆盖全局 Token)
  styleOverrides?: Record<string, {
    fontSize?: number;
    lineHeight?: number;
    letterSpacing?: number;
    color?: string;
    fontFamily?: string;
  }>;

  // 显隐控制
  visibility?: {
    title?: boolean;
    subtitle?: boolean;
    logo?: boolean;
    actionText?: boolean;
    imageLabel?: boolean;
    features?: boolean;
    metrics?: boolean;
    image?: boolean;
    partnersTitle?: boolean;
    partners?: boolean;
    testimonials?: boolean;
    agenda?: boolean;
  };
}

export interface GalleryItem {
  id?: string;
  url: string;
  caption?: string; 
  config?: { scale: number; x: number; y: number; };
}

export interface PrintSettings {
  enabled: boolean;
  widthMm: number;
  heightMm: number;
  gutterMm: number;
  showGutterShadow: boolean;
  showTrimShadow: boolean;
  showContentFrame: boolean;
  configs: {
    landscape: { bindingSide: 'left' | 'right' | 'top' | 'bottom'; trimSide: 'left' | 'right' | 'top' | 'bottom' };
    portrait: { bindingSide: 'left' | 'right' | 'top' | 'bottom'; trimSide: 'left' | 'right' | 'top' | 'bottom' };
    square: { bindingSide: 'left' | 'right' | 'top' | 'bottom'; trimSide: 'left' | 'right' | 'top' | 'bottom' };
  }
}

export interface ProjectData {
  version: string;
  title: string;
  pages: PageData[];
  customFonts: CustomFont[];
  theme?: ProjectTheme; 
  imageQuality?: number; 
  minimalCounter?: boolean; // 新增：全局简约页码开关
  counterColor?: string; 
  printSettings?: PrintSettings; 
}