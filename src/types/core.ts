// 原子类型：模板 ID、宽高比、计数器样式等无依赖基础类型

export type TemplateId = string;

export type AspectRatioType = '16:9' | '2:3' | '3:4' | 'A4' | '1:1';
export type CounterStyle = 'number' | 'alpha' | 'roman' | 'dots';
export type BackgroundPatternType = 'none' | 'grid' | 'dots' | 'diagonal' | 'cross';

export interface CustomFont {
  name: string;
  family: string;
  dataUrl?: string;
}

// 排版设置类型
export interface TypographySettings {
  defaultLatin?: string;
  defaultCJK?: string;
  fieldOverrides?: Record<string, string>;
}
