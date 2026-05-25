import { ProjectData } from '../../types';
import { DEFAULT_DESIGN_SYSTEM } from '../../constants/theme';

/**
 * Zine V3 迁移器
 * 负责：
 * 1. 检查项目版本，如果 < 3.0 则注入 DesignSystem
 * 2. 升级 ProjectTheme 以支持中文字体
 * 3. 未来：支持旧 PageData 坐标向 24x24 网格的启发式转换
 */
export function migrateToV3(data: any): ProjectData {
  if (!data) return data;

  // 如果已经是 v3+，且包含 designSystem，则跳过
  if (data.version && parseFloat(data.version) >= 3.0 && data.designSystem) {
    return data as ProjectData;
  }

  console.log('[Migration] Upgrading project to V3 (Modular Grid)...');

  const upgradedData = {
    ...data,
    version: '3.0.0',
    designSystem: data.designSystem || DEFAULT_DESIGN_SYSTEM,
    theme: {
      ...data.theme,
      typography: {
        ...data.theme?.typography,
        headingFontZH: data.theme?.typography?.headingFontZH || "'Noto Serif SC', serif",
        bodyFontZH: data.theme?.typography?.bodyFontZH || "'Noto Serif SC', serif",
      }
    }
  };

  return upgradedData as ProjectData;
}
