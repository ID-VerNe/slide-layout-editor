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

export interface FieldSchema {
  key: string;
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
  title: string;       // 标题 (学校/公司/项目名)
  subtitle?: string;    // 副标题 (学位/职位)
  time?: string;        // 时间 (2020 - 2024)
  location?: string;    // 地点 (香港, 中国)
  description?: string; // 描述 (支持 - 列表模式)
}

export interface ResumeSection {
  id: string;
  title: string;        // 板块标题 (EDUCATION, WORK, etc.)
  items: ResumeItem[];
}

export interface PageData {
  id: string;
  type: 'slide' | 'freeform'; // 支持自由布局
  layoutId: TemplateId;
  aspectRatio: AspectRatioType; 
  layoutVariant?: string;
  title: string;        // 姓名/主标题
  subtitle?: string;    // 副标题
  
  // 找回的缺失字段
  bullets?: string[];
  paragraph?: string;
  image?: string;
  logo?: string;
  logoSize?: number;
  accentColor?: string;
  backgroundPattern?: BackgroundPatternType;
  
  // 自由布局
  freeformItems?: FreeformItem[];
  freeformConfig?: FreeformConfig;

  // 核心：全量数据池
  resumeSections?: ResumeSection[];
  resumePageIndex?: number; 

  // 视觉控制
  visibility?: Record<string, boolean>;
  styleOverrides?: Record<string, any>;

  backgroundColor?: string;
  titleFont?: string;
  bodyFont?: string;
  footer?: string;
  pageNumber?: boolean;
  minimalCounter?: boolean;
  counterStyle?: CounterStyle;

  // 兼容性字段
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
