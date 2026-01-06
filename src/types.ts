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
  imageConfig?: {
    scale: number;
    x: number;
    y: number;
  };
}

export interface PartnerData {
  id?: string;
  name: string;
  logo: string;
}

export interface TestimonialData {
  id?: string;
  name: string;
  quote: string;
  avatar: string;
}

export interface AgendaData {
  id?: string;
  title: string;
  desc: string;
  icon?: string;
  number?: string;
  items?: string[];
}

export interface GalleryItem {
  id?: string;
  url: string;
  caption?: string; 
  config?: {
    scale: number;
    x: number;
    y: number;
  };
}

export type AspectRatioType = '16:9' | '2:3' | 'A4' | '1:1';

import { TemplateId } from './templates/registry';

// --- Bento Box 专用定义 ---
export type BentoItemType = 'metric' | 'icon-text' | 'image' | 'feature-list';

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
  imageConfig?: {
    scale: number;
    x: number;
    y: number;
  };
  theme?: 'light' | 'dark' | 'accent' | 'glass';
}

/**
 * 字体管控层
 */
export interface TypographySettings {
  // 1. 粗略调整
  defaultLatin: string; // 默认英文字体
  defaultCJK: string;   // 默认中文字体
  // 2. 精细调整 (Key 是字段名，如 'title', 'subtitle', 'paragraph')
  fieldOverrides: Record<string, string>;
}

export interface PageData {
  id: string;
  type: 'slide';
  layoutId: TemplateId;
  aspectRatio: AspectRatioType; 
  layoutVariant?: string;

  title: string;
  subtitle?: string;
  bullets?: string[]; 
  actionText?: string;
  paragraph?: string; 
  imageLabel?: string;
  imageSubLabel?: string;

    code?: string;
    language?: string;
    metrics?: MetricData[];
    features?: FeatureData[];
    bentoItems?: BentoItem[]; 
    bentoConfig?: { rows: number; cols: number }; 
    mosaicIcons?: string[];
    mosaicConfig?: {
      rows: number;
      cols: number;
      stagger: boolean;
      tileColor?: string;
      icons: Record<string, string>;
    };
    partners?: PartnerData[];
    testimonials?: TestimonialData[];
    agenda?: AgendaData[];
    activeIndex?: number;
    partnersTitle?: string;

    gallery?: GalleryItem[];

    logo?: string;
    logoSize?: number;
    image?: string;
    imageConfig?: {
      scale: number;
      x: number;
      y: number;
    };
  backgroundColor?: string;
  accentColor?: string; 
  themeColor?: string; 
  layoutVariant?: string; 

  titleFont?: string; // 兼容旧数据
  bodyFont?: string;

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
  imageQuality?: number; 
  minimalCounter?: boolean; 
  counterColor?: string; 
  printSettings?: PrintSettings; 
  typography?: TypographySettings; // 新增：全局字体管控
}
