export type SlideLayoutType =
  | 'cover-main'      // 封面：大标题 + 背景图 (左下对齐)
  | 'content-bullets' // 正文：左标题 + 右列表 (悬浮卡片)
  | 'split-image'     // 图文：全屏分割
  | 'big-statement'   // 强调：极简金句
  | 'step-timeline'   // 步骤：纵向时间轴
  | 'gallery-capsule' // 图库：胶囊马赛克
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
  label: string;
  value: string;
  unit?: string;
  subLabel?: string; // 新增：指标下方的补充说明
}

export interface FeatureData {
  title: string;
  desc: string;
  icon?: string; // 存储 Lucide 图标名称或 Base64 图片
  imageConfig?: {
    scale: number;
    x: number;
    y: number;
  };
}

export interface PartnerData {
  name: string;
  logo: string;
}

export interface TestimonialData {
  name: string;
  quote: string;
  avatar: string;
}

export interface AgendaData {
  title: string;
  desc: string;
  icon?: string;
  number?: string; // 章节编号，如 "01"
  items?: string[]; // 章节下的子要点
}

export interface PageData {
  id: string;
  type: 'slide';
  layoutId: SlideLayoutType;

  // 核心内容
  title: string;
  subtitle?: string;
  bullets?: string[]; 
  actionText?: string; // 用于色块内的文字
  imageLabel?: string; // 图片下方的标签
  imageSubLabel?: string; // 图片下方的子标签
  
  // 扩展内容
    code?: string;      // 用于 code-snippet
    language?: string;  // 代码语言
      metrics?: MetricData[]; // 用于 data-grid
        features?: FeatureData[]; // 用于 platform-hero 网格
        mosaicIcons?: string[]; // 已废弃，保留兼容
          mosaicConfig?: {
            rows: number;
            cols: number;
            stagger: boolean;
            tileColor?: string; // 方块底色
            icons: Record<string, string>; // 坐标映射 "row-col": "IconName"
          };
    partners?: PartnerData[]; // 用于 community-hub
    testimonials?: TestimonialData[]; // 用于 community-hub
    agenda?: AgendaData[]; // 新增：用于目录页
    activeIndex?: number; // 新增：用于突出显示当前章节
    partnersTitle?: string; // 新增：合作伙伴部分的标题
    
    // 图库数据
    gallery?: Array<{
      url: string;
      config?: {
        scale: number;
        x: number;
        y: number;
      };
    }>;
    
    // 视觉元素        logo?: string;      // 自定义 Logo
    
        logoSize?: number;  // Logo 大小
    
        image?: string;
    
    imageConfig?: {
      scale: number;
      x: number;
      y: number;
    };
  backgroundColor?: string;
  themeColor?: string; // 主题色
  layoutVariant?: string; // 用于存储布局变体，如 'left' | 'right'

  // 字体配置
  titleFont?: string;
  bodyFont?: string;

  // 页脚信息
  footer?: string;
  pageNumber?: boolean;
  counterStyle?: CounterStyle;
  backgroundPattern?: BackgroundPatternType;

  // 样式覆盖 (如自定义字号)
  styleOverrides?: Record<string, {
    fontSize?: number;
    lineHeight?: number;
    letterSpacing?: number;
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

export interface ProjectData {
  version: string;
  title: string;
  pages: PageData[];
  customFonts: CustomFont[];
}