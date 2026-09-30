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
function migrateFields(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => migrateFields(item));
  }

  if (typeof obj === 'object') {
    const source = obj as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    for (const key in source) {
      const value = source[key];

      // 字段重命名：desc -> description
      if (key === 'desc' && !source.description) {
        result.description = value;
        continue;
      }

      // 字段重命名：quote -> content
      if (key === 'quote' && !source.content) {
        result.content = value;
        continue;
      }

      // 字段合并：name -> author (如果 name 存在且与 author 不同)
      if (key === 'name' && value && source.author && source.author !== value) {
        // name 作为完整名称，覆盖 author
        result.author = value;
        continue;
      }

      // 页面级布局映射:layout -> layoutId,容器节点保留 layout 值
      // container layout 保留: flex/grid/modular/absolute
      if (key === 'layout' && typeof value === 'string') {
        const isContainerLayout = value === 'flex' || value === 'grid' || value === 'modular' || value === 'absolute' || source.type === 'container' || Array.isArray(source.children);
        if (!isContainerLayout) {
          result.layoutId = LAYOUT_ID_MAP[value] || value;
          continue; // 跳过旧 layout 字段
        }
      }

      // 跳过废弃字段（如果新字段已存在）
      if (key === 'desc' && source.description) continue;
      if (key === 'quote' && source.content) continue;
      if (key === 'name' && source.author) continue;

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
function ensureTheme(theme: unknown): { colors: Record<string, string>; typography: Record<string, string> } {
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

  const src = (theme || {}) as { colors?: Record<string, string>; typography?: Record<string, string> };
  return {
    colors: { ...defaultColors, ...src.colors },
    typography: { ...defaultTypography, ...src.typography },
  };
}

/** 为页面集合元素（features, bentoItems 等）补全缺失的唯一标识符 */
function ensureCollectionIds(pages: unknown[] = []): unknown[] {
  if (!Array.isArray(pages)) return pages;
  return pages.map((page, pIdx) => {
    if (!page || typeof page !== 'object') return page;
    let modified = false;
    const pageCopy = { ...(page as Record<string, unknown>) };

    if (Array.isArray(pageCopy.features)) {
      pageCopy.features = pageCopy.features.map((feat: Record<string, unknown> | null, fIdx: number) => {
        if (feat && typeof feat === 'object' && !feat.id) {
          modified = true;
          return { ...feat, id: `feat_${pIdx}_${fIdx}_${Math.random().toString(36).slice(2, 8)}` };
        }
        return feat;
      });
    }

    if (Array.isArray(pageCopy.bentoItems)) {
      pageCopy.bentoItems = pageCopy.bentoItems.map((item: Record<string, unknown> | null, bIdx: number) => {
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
export function migrateToV3(data: unknown): ProjectData {
  if (!data) return data as ProjectData;

  const src = data as Record<string, unknown>;

  // 如果已经是 v3+，且包含 designSystem，确保集合元素 id 完整后返回
  if (src.version && parseFloat(String(src.version)) >= 3.0 && src.designSystem) {
    if (Array.isArray(src.pages)) {
      src.pages = ensureCollectionIds(src.pages);
    }
    return src as unknown as ProjectData;
  }

  // 递归迁移所有字段
  const migratedData = migrateFields(data) as Record<string, unknown>;

  // 构建最终数据
  const upgradedData = {
    ...migratedData,
    version: '3.0.0',
    designSystem: migratedData.designSystem || DEFAULT_DESIGN_SYSTEM,
    theme: ensureTheme(migratedData.theme),
    pages: ensureCollectionIds(migratedData.pages as unknown[] | undefined),
  };

  return upgradedData as ProjectData;
}
