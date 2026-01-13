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
  type: 'slide';
  layoutId: TemplateId;
  aspectRatio: AspectRatioType; 
  title: string;        // 姓名
  subtitle?: string;    // 联系方式 (Email | GitHub | ...)
  
  // 核心：全量数据池
  resumeSections?: ResumeSection[];
  
  // 自动分页标记 (由引擎计算)
  resumePageIndex?: number; 

  backgroundColor?: string;
  accentColor?: string; 
  titleFont?: string;
  bodyFont?: string;
  footer?: string;
  pageNumber?: boolean;
  minimalCounter?: boolean;
  counterStyle?: CounterStyle;
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
