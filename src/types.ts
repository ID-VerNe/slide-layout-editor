export type SlideLayoutType =
  | 'cover-main'      // 封面：大标题 + 背景图 (左下对齐)
  | 'content-bullets' // 正文：左标题 + 右列表 (悬浮卡片)
  | 'split-image'     // 图文：全屏分割
  | 'big-statement'   // 强调：极简金句
  | 'step-timeline'   // 步骤：纵向时间轴
  | 'gallery-capsule' // 图库：胶囊马赛克
  | 'back-cover-movie' // 封底：电影谢幕
  | 'code-snippet'    // 代码：代码演示
  | 'data-grid';       // 数据：网格展示

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
  caption?: string; // Add caption support for gallery
  config?: {
    scale: number;
    x: number;
    y: number;
  };
}

export type AspectRatioType = '16:9' | '2:3' | 'A4' | '1:1';

import { TemplateId } from './templates/registry';

export interface PageData {
  id: string;
  type: 'slide';
  layoutId: TemplateId;
  aspectRatio: AspectRatioType; // 新增：单页比例定义
  layoutVariant?: string;

  // 核心内容
  title: string;
  subtitle?: string;
  bullets?: string[]; // 暂保持 string[] 兼容，建议组件层处理 ID
  actionText?: string;
  paragraph?: string; // 新增：长文段落内容
  imageLabel?: string;
  imageSubLabel?: string;

  // 扩展内容
    code?: string;
    language?: string;
    metrics?: MetricData[];
    features?: FeatureData[];
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

    // 图库数据
    gallery?: GalleryItem[];

    // 视觉元素        logo?: string;      // 自定义 Logo

    logoSize?: number;  // Logo 大小

    image?: string;

    imageConfig?: {
      scale: number;
      x: number;
      y: number;
    };
  backgroundColor?: string;
  accentColor?: string; // 新增：模板强调色 (用于装饰线、高亮文字等)
  themeColor?: string; // 主题色
  layoutVariant?: string; // 用于存储布局变体，如 'left' | 'right'

  // 字体配置
  titleFont?: string;
  bodyFont?: string;

  // 页脚信息
  footer?: string;
  pageNumber?: boolean;
  minimalCounter?: boolean; // 新增：极简页码模式（移除背景和边框）
  counterColor?: string; // 新增：全局页码颜色
  pageNumberText?: string; // 新增：页码关闭时的替代文本
  signature?: string; // 新增：本人签名内容 (文字或 Base64 图片)
  signatureType?: 'text' | 'image'; // 新增：签名类型
  counterStyle?: CounterStyle;
  backgroundPattern?: BackgroundPatternType;

  // 样式覆盖 (如自定义字号)
  styleOverrides?: Record<string, {
    fontSize?: number;
    lineHeight?: number;
    letterSpacing?: number;
    color?: string;
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

export interface PrintSettings {
  enabled: boolean;
  widthMm: number;
  heightMm: number;
  gutterMm: number;
  // 为每种方向存储独立的装订配置
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
  imageQuality?: number; // 新增：全局图片质量控制 (0.1 - 1.0)
  minimalCounter?: boolean; // 新增：全局极简页码开关
  counterColor?: string; // 新增：全局页码颜色
  printSettings?: PrintSettings; // 新增：全局打印/装订设置
}
