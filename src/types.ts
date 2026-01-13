import { TemplateId } from './templates/registry';

export type AspectRatioType = '16:9' | '2:3' | 'A4' | '1:1';
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
  | 'backgroundColor' | 'pageNumber' | 'logoSize' | 'titleY' // 新增 titleY
  | 'group' | 'separator' | 'resumeSections';

export interface FieldSchema {
  key: FieldType;
  label?: string;
  icon?: string;
  props?: Record<string, any>;
}

// --- 自由布局 (Freeform) 类型 ---
export interface FreeformItem {
  id: string;
  type: 'text' | 'image' | 'shape' | 'icon';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  content?: any;
  style?: any;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  typography?: any;
}

export interface FreeformConfig {
  gridSize: number;
  snapToGrid: boolean;
  showGridOverlay: boolean;
  showAlignmentGuides: boolean;
}

// --- 简历 2.0 全动态结构 ---
export interface ResumeItem {
  id: string;
  title: string;       
  subtitle?: string;    
  time?: string;        
  location?: string;    
  description?: string; 
}

export interface ResumeSection {
  id: string;
  title: string;        
  items: ResumeItem[];
}

export interface PageData {
  id: string;
  type: 'slide' | 'freeform'; 
  layoutId: TemplateId;
  aspectRatio: AspectRatioType; 
  layoutVariant?: string;
  title: string;        
  subtitle?: string;    
  
  bullets?: string[];
  paragraph?: string;
  image?: string;
  logo?: string;
  logoSize?: number;
  accentColor?: string;
  backgroundPattern?: BackgroundPatternType;
  
  freeformItems?: FreeformItem[];
  freeformConfig?: FreeformConfig;

  resumeSections?: ResumeSection[];
  resumePageIndex?: number; 

  visibility?: Record<string, boolean>;
  styleOverrides?: Record<string, any>;

  backgroundColor?: string;
  titleFont?: string;
  bodyFont?: string;
  footer?: string;
  pageNumber?: boolean;
  minimalCounter?: boolean;
  counterStyle?: CounterStyle;

  agenda?: any[];
  features?: any[];
  metrics?: any[];
  mosaic?: any[];
  testimonials?: any[];
  gallery?: any[];
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
    resume: { bindingSide: 'left' | 'right' | 'top' | 'bottom'; trimSide: 'left' | 'right' | 'top' | 'bottom' };
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
  printSettings?: PrintSettings; 
}

export interface ProjectSaveData extends ProjectData {
  assets?: Record<string, string>;
}