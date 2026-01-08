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

export interface ProjectTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
  };
  typography: {
    headingFont?: string;
    bodyFont?: string;
  };
}

// --- Phase 4: Schema 驱动编辑器定义 ---

export type FieldType = 
  | 'logo' | 'title' | 'subtitle' | 'actionText' | 'paragraph' 
  | 'signature' | 'image' | 'imageLabel' | 'imageSubLabel'
  | 'features' | 'bentoItems' | 'mosaic' | 'metrics' 
  | 'partnersTitle' | 'partners' | 'testimonials' | 'agenda' 
  | 'gallery' | 'variant' | 'footer' | 'bullets' 
  | 'backgroundColor' | 'pageNumber' | 'logoSize'
  | 'group' | 'separator'; // 预留特殊类型

export interface FieldSchema {
  key: FieldType;
  label?: string;
  icon?: string;
  props?: Record<string, any>; // 传递给具体 Field 组件的透传参数
}

// ------------------------------------

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

  styleOverrides?: Record<string, {
    fontSize?: number;
    lineHeight?: number;
    letterSpacing?: number;
    color?: string;
    fontFamily?: string;
  }>;

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
  minimalCounter?: boolean; 
  counterColor?: string; 
  printSettings?: PrintSettings; 
}
