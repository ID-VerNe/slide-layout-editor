import { PageData, AspectRatioType } from '../types';
import { TemplateConfig } from '../templates/registry';
import { DEFAULT_THEME } from '../constants/theme';

// 内容回退：模板未提供 title/subtitle 时使用
const CONTENT_FALLBACK: Partial<PageData> = {
  title: 'New Slide',
  subtitle: 'Created with SlideGrid Studio',
};

// 构造结构骨架，不含内容占位字段，避免挡住模板默认值
function createPageSkeleton(ratio: AspectRatioType, layoutId: string): Partial<PageData> {
  return {
    id: `slide-${crypto.randomUUID()}`,
    type: layoutId === 'freeform' ? 'freeform' : 'slide',
    layoutId,
    aspectRatio: ratio,
    backgroundColor: DEFAULT_THEME.colors.background,
    accentColor: DEFAULT_THEME.colors.accent,
    titleFont: DEFAULT_THEME.typography.headingFont,
    bodyFont: DEFAULT_THEME.typography.bodyFont,
    counterStyle: 'number',
    visibility: { logo: true },
    freeformItems: [],
    freeformConfig: {
      gridSize: 20,
      snapToGrid: true,
      showGridOverlay: false,
      showAlignmentGuides: true,
    },
  };
}

/**
 * 将模板默认值合并到目标页，仅在 undefined 或 null 时填充。
 * 适用于已存在页（保留用户编辑），也适用于骨架（由模板填充内容）。
 */
export function applyTemplateDefaults<T extends Partial<PageData>>(
  target: T,
  templateConfig?: TemplateConfig
): T {
  if (!templateConfig) return target;
  const result: Record<string, unknown> = { ...target };

  // 模板级默认数据：仅填充缺失字段，不覆盖已有值
  if (templateConfig.defaultData) {
    for (const [k, v] of Object.entries(templateConfig.defaultData)) {
      if (result[k] === undefined || result[k] === null) {
        result[k] = v;
      }
    }
  }

  // 字段级默认值：仅填充 undefined 字段
  if (templateConfig.fields) {
    for (const field of templateConfig.fields) {
      const key = String(field.key);
      if (field.defaultValue !== undefined && result[key] === undefined) {
        result[key] = field.defaultValue;
      }
    }
  }

  return result as T;
}

// 应用内容回退，补全模板与骨架都未覆盖的内容字段
function applyContentFallback<T extends Partial<PageData>>(target: T): T {
  const result: Record<string, unknown> = { ...target };
  for (const [k, v] of Object.entries(CONTENT_FALLBACK)) {
    if (result[k] === undefined || result[k] === null) {
      result[k] = v;
    }
  }
  return result as T;
}

/**
 * 新建页：结构骨架 → 模板默认值 → 内容回退，三层 only-fill。
 * 模板默认值优先于内容回退，确保带 defaultData 的模板能覆盖 New Slide 占位。
 */
export function createDefaultPage(
  ratio: AspectRatioType,
  layoutId: string,
  templateConfig?: TemplateConfig
): PageData {
  const skeleton = createPageSkeleton(ratio, layoutId);
  const withTemplate = applyTemplateDefaults(skeleton, templateConfig);
  return applyContentFallback(withTemplate) as PageData;
}
