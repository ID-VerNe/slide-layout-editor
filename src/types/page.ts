// 页面数据模型：模板专用子结构、字段 schema 与 PageData 主接口

import { TemplateId, AspectRatioType, CounterStyle, BackgroundPatternType } from './core';

// --- 数据结构定义 ---

/** 策展式双语生词项 */
export interface VocabItem {
  id: string;
  word: string;
  phonetic?: string;
  pos?: string; // 词性 如 adj. / n. / vt.
  meaning: string;
  example?: string;
  exampleZH?: string;
}

export interface AgendaData {
  id: string;
  title: string;
  subtitle?: string;
  time?: string;
  location?: string;
  description?: string;
  items?: string[];
}

export type BentoItemType = 'metric' | 'icon-text' | 'image' | 'feature-list';
export interface BentoItem {
  id: string;
  type: BentoItemType;
  x: number;
  y: number;
  colSpan: number;
  rowSpan: number;
  theme: 'light' | 'dark' | 'accent' | 'glass';
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
  fontSize?: number;
}

export interface FeatureData {
  id: string;
  title: string;
  description?: string;
  /** @deprecated 使用 description 替代 */
  desc?: string;
  icon?: string;
  image?: string;
  imageConfig?: {
    scale: number;
    x: number;
    y: number;
  };
}

export interface MetricData {
  id: string;
  value: string;
  label: string;
  icon?: string;
  unit?: string;
}

export interface PartnerData {
  id: string;
  name: string;
  logo?: string;
}

/** 图片裁剪／定位配置 */
export interface ImageConfig {
  scale: number;
  x: number;
  y: number;
}

export interface TestimonialData {
  id: string;
  content?: string;
  quote?: string;
  author?: string;
  name?: string;
  role?: string;
  avatar?: string;
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

// --- Phase 4: Schema 驱动编辑器定义 ---

export type FieldType =
  | 'logo' | 'title' | 'subtitle' | 'actionText' | 'paragraph'
  | 'paragraphZH' | 'quoteZH' | 'sideHeader' | 'vocabItems'
  | 'signature' | 'image' | 'imageLabel' | 'imageSubLabel'
  | 'features' | 'bentoItems' | 'mosaic' | 'metrics'
  | 'partnersTitle' | 'partners' | 'testimonials' | 'agenda'
  | 'gallery' | 'variant' | 'footer' | 'bullets'
  | 'backgroundColor' | 'pageNumber' | 'logoSize' | 'titleY'
  | 'group' | 'separator' | 'resumeSections' | 'artFont'
  | 'bigDataMetrics';

export interface FieldSchema {
  key: FieldType;
  label?: string;
  type?: string;
  icon?: string;
  /** 字段专属属性映射，如编辑器配置参数 */
  props?: Record<string, unknown>;
  /**
   * 字段默认值
   * 类型视具体 FieldType 而定：
   * - 字符串字段 -> string
   * - 数值字段 -> number
   * - 布尔字段 -> boolean
   * - 数组字段 -> unknown[]
   * - 对象字段 -> Record<string, unknown>
   */
  defaultValue?: unknown;
  placeholder?: string;    // 编辑器占位符提示
}

export interface PageData extends Record<string, unknown> {
  id: string;
  type: 'slide' | 'freeform';
  layoutId: TemplateId;
  aspectRatio: AspectRatioType;
  layoutVariant?: string;
  title: string;
  subtitle?: string;

  bullets?: string[];
  paragraph?: string;
  paragraphZH?: string;
  quoteZH?: string;
  sideHeader?: string;
  vocabItems?: VocabItem[];

  image?: string;
  imageLabel?: string;
  imageSubLabel?: string;
  pageNumberText?: string;
  partnersTitle?: string;
  variant?: string;
  imageConfig?: {
    scale: number;
    x: number;
    y: number;
  };
  actionText?: string;
  logo?: string;
  logoSize?: number;
  accentColor?: string;
  backgroundPattern?: BackgroundPatternType;

  resumeSections?: ResumeSection[];
  resumePageIndex?: number;

  visibility?: Record<string, boolean>;
  /** 样式覆盖映射，用于运行时动态调整 */
  styleOverrides?: Record<string, Record<string, unknown>>;

  backgroundColor?: string;
  counterColor?: string;
  titleFont?: string;
  bodyFont?: string;
  footer?: string;
  pageNumber?: boolean;
  folioAlignment?: 'left' | 'right' | 'auto'; // 手动控制页码左右位置
  artFont?: string;
  minimalCounter?: boolean;
  counterStyle?: CounterStyle;

  agenda?: AgendaData[];
  features?: FeatureData[];
  metrics?: MetricData[];
  /** 马赛克网格数据，每项为键值结构 */
  mosaic?: Record<string, unknown>[];
  testimonials?: TestimonialData[];
  gallery?: Record<string, unknown>[];
  partners?: PartnerData[];
  signature?: string;

  bentoItems?: BentoItem[];
  bentoConfig?: { rows: number; cols: number };
  bigDataMetricsConfig?: { rows: number; cols: number };
  mosaicConfig?: {
    rows: number;
    cols: number;
    stagger?: boolean;
    tileColor?: string;
    icons?: Record<string, string>;
  };

  // --- Freeform Editor Fields ---
  /** 自由编辑模式下放置的任意元素，每项为键值结构 */
  freeformItems?: Record<string, unknown>[];
  freeformConfig?: {
    gridSize: number;
    snapToGrid: boolean;
    showGridOverlay: boolean;
    showAlignmentGuides: boolean;
  };
}

// --- Page Data 扩展类型（用于 Type Guards） ---

export interface TableOfContentsData extends PageData {
  agenda: AgendaData[];
}

export interface PlatformHeroData extends PageData {
  features: FeatureData[];
}

export interface StepTimelineData extends PageData {
  /** 步骤时间线数据，每项为键值结构 */
  steps: Record<string, unknown>[];
}

export interface TestimonialCardData extends PageData {
  testimonials: TestimonialData[];
}

export interface CommunityHubData extends PageData {
  /** 社区成员数据，每项为键值结构 */
  members?: Record<string, unknown>[];
}

export interface ComponentMosaicData extends PageData {
  /** 马赛克组件数据，每项为键值结构 */
  mosaic: Record<string, unknown>[];
}

export interface GalleryCapsuleData extends PageData {
  /** 画廊胶囊数据，每项为键值结构 */
  gallery: Record<string, unknown>[];
}

export interface EditorialSplitData extends PageData {
  /** 编辑分割区域数据，每项为键值结构 */
  sections?: Record<string, unknown>[];
}
