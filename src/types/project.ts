// 工程级别数据：主题、工程结构、保存格式

import { CustomFont, CounterStyle } from './core';
import { DesignSystem } from './tokens';
import { PrintSettings } from './print';
import { PageData } from './page';

export interface ProjectTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    captionFont?: string;
    headingFontZH?: string;
    bodyFontZH?: string;
  };
}

export interface ProjectData {
  version: string;
  id?: string;
  title: string;
  projectTitle?: string;
  pages: PageData[];
  customFonts: CustomFont[];
  theme?: ProjectTheme;
  designSystem?: DesignSystem;
  imageQuality?: number;
  minimalCounter?: boolean;
  counterStyle?: CounterStyle;
  printSettings?: PrintSettings;
  filePath?: string;
  thumbnail?: string;
}

export interface ProjectSaveData extends ProjectData {
  assets?: Record<string, string>;
}
