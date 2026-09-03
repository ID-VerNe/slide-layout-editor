import { ProjectData } from '../../types';
import { DEFAULT_DESIGN_SYSTEM } from '../../constants/theme';

/**
 * 布局 ID 映射表 (V2 -> V3)
 */
const LAYOUT_ID_MAP: Record<string, string> = {
  'TwoColumnLayout': 'modern-feature',
  'GalleryLayout': 'floating-gallery',
  'HeroLayout': 'typography-hero',
};

/**
 * 递归迁移对象中的字段
 */
function migrateFields(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => migrateFields(item));
  }
  
  if (typeof obj === 'object') {
    const result: any = {};
    
    for (const key in obj) {
      const value = obj[key];
      
      // 字段重命名：desc -> description
      if (key === 'desc' && !obj.description) {
        result.description = value;
        continue;
      }
      
      // 字段重命名：quote -> content
      if (key === 'quote' && !obj.content) {
        result.content = value;
        continue;
      }
      
      // 字段合并：name -> author (如果 name 存在且与 author 不同)
      if (key === 'name' && value && obj.author && obj.author !== value) {
        // name 作为完整名称，覆盖 author
        result.author = value;
        continue;
      }
      
      // 布局 ID 映射：仅当属于页面级布局时将 layout -> layoutId，保留容器节点的 layout (grid/flex/modular/absolute)
      if (key === 'layout' && typeof value === 'string') {
        const isContainerLayout = value === 'flex' || value === 'grid' || value === 'modular' || value === 'absolute' || obj.type === 'container' || Array.isArray(obj.children);
        if (!isContainerLayout) {
          result.layoutId = LAYOUT_ID_MAP[value] || value;
          continue; // 跳过旧 layout 字段
        }
      }
      
      // 跳过废弃字段（如果新字段已存在）
      if (key === 'desc' && obj.description) continue;
      if (key === 'quote' && obj.content) continue;
      if (key === 'name' && obj.author) continue;
      
      // 递归处理嵌套对象
      result[key] = migrateFields(value);
    }
    
    return result;
  }
  
  return obj;
}

/**
 * 补全 theme 结构
 */
function ensureTheme(theme: any): any {
  const defaultColors = {
    primary: '#000000',
    secondary: '#666666',
    accent: '#264376',
    background: '#ffffff',
    surface: '#f0f0f0',
  };
  
  const defaultTypography = {
    headingFont: "'Noto Serif', serif",
    bodyFont: "'Inter', sans-serif",
    headingFontZH: "'Noto Serif SC', serif",
    bodyFontZH: "'Noto Sans SC', sans-serif",
  };
  
  return {
    colors: { ...defaultColors, ...theme?.colors },
    typography: { ...defaultTypography, ...theme?.typography },
  };
}

/** 为页面集合元素（features, bentoItems 等）补全缺失的唯一标识符 */
function ensureCollectionIds(pages: any[] = []): any[] {
  if (!Array.isArray(pages)) return pages;
  return pages.map((page, pIdx) => {
    if (!page || typeof page !== 'object') return page;
    let modified = false;
    const pageCopy = { ...page };

    if (Array.isArray(pageCopy.features)) {
      pageCopy.features = pageCopy.features.map((feat: any, fIdx: number) => {
        if (feat && typeof feat === 'object' && !feat.id) {
          modified = true;
          return { ...feat, id: `feat_${pIdx}_${fIdx}_${Math.random().toString(36).slice(2, 8)}` };
        }
        return feat;
      });
    }

    if (Array.isArray(pageCopy.bentoItems)) {
      pageCopy.bentoItems = pageCopy.bentoItems.map((item: any, bIdx: number) => {
        if (item && typeof item === 'object' && !item.id) {
          modified = true;
          return { ...item, id: `bento_${pIdx}_${bIdx}_${Math.random().toString(36).slice(2, 8)}` };
        }
        return item;
      });
    }

    return modified ? pageCopy : page;
  });
}

/**
 * Zine V3 迁移器
 * 负责：
 * 1. 字段重命名 (desc->description, quote->content)
 * 2. 布局 ID 映射 (layout->layoutId)
 * 3. 清理废弃字段
 * 4. 补全 theme 结构
 * 5. 注入 DesignSystem
 * 6. 统一补全集合元素唯一标识符 (id)
 */
export function migrateToV3(data: any): ProjectData {
  if (!data) return data;

  // 如果已经是 v3+，且包含 designSystem，确保集合元素 id 完整后返回
  if (data.version && parseFloat(data.version) >= 3.0 && data.designSystem) {
    if (Array.isArray(data.pages)) {
      data.pages = ensureCollectionIds(data.pages);
    }
    return data as ProjectData;
  }

  // 递归迁移所有字段
  const migratedData = migrateFields(data);

  // 构建最终数据
  const upgradedData = {
    ...migratedData,
    version: '3.0.0',
    designSystem: migratedData.designSystem || DEFAULT_DESIGN_SYSTEM,
    theme: ensureTheme(migratedData.theme),
    pages: ensureCollectionIds(migratedData.pages),
  };

  return upgradedData as ProjectData;
}
