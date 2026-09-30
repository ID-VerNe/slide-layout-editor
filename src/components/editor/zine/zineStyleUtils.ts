import { PageData, ProjectTheme } from '../../../types';
import { DesignSystem } from '../../../types/tokens';
import { getTemplateById } from '../../../templates/registry';
import { TemplateNode } from '../../../templates/schemas/types';

interface NodeWithProps {
  type?: string;
  fieldKey?: string;
  bind?: string;
  props?: Record<string, unknown>;
  root?: TemplateNode;
  children?: TemplateNode[];
}

/** 语义化属性解析（优先从 Schema 中读取 size，其次提供合理初始阶梯） */
export function getDefaultSizeForField(page: PageData, key: string): number {
  try {
    const tpl = getTemplateById(page.layoutId);
    if (tpl?.schema) {
      const findSizeInNode = (node: NodeWithProps | null | undefined): number | undefined => {
        if (!node) return undefined;
        if (node.type === 'Component' && (node.fieldKey === key || node.bind === `page.${key}`)) {
          if (typeof node.props?.size === 'number') return node.props.size;
        }
        if (node.root) {
          const res = findSizeInNode(node.root as NodeWithProps);
          if (res !== undefined) return res;
        }
        if (node.children && Array.isArray(node.children)) {
          for (const child of node.children) {
            const res = findSizeInNode(child as NodeWithProps);
            if (res !== undefined) return res;
          }
        }
        return undefined;
      };
      const defaultSize = findSizeInNode(tpl.schema.root as NodeWithProps);
      if (defaultSize !== undefined) return defaultSize;
    }
  } catch {
    // 降级到语义推导
  }

  const lk = key.toLowerCase();
  if (lk === 'title' || lk === 'heading') return 4; // 32px (H2)
  if (lk.includes('display') || lk.includes('hero')) return 6; // 48px (H1)
  if (lk.includes('quote')) return 3; // 24px
  if (lk.includes('metric') || lk.includes('number') || lk.includes('stat')) return 5; // 40px
  if (lk.includes('sub') || lk.includes('desc') || lk.includes('para') || lk.includes('body')) return 2; // 16px (Body)
  if (lk.includes('caption') || lk.includes('meta') || lk.includes('tag') || lk.includes('badge')) return 1.25; // 10px (Caption)
  return 2;
}

/** 智能推导当前文本对齐方式（优先从当前模板 Schema 中检索默认 align） */
export function getDefaultAlignForField(page: PageData, key: string): string {
  try {
    const tpl = getTemplateById(page.layoutId);
    if (tpl?.schema) {
      const findAlignInNode = (node: NodeWithProps | null | undefined): string | undefined => {
        if (!node) return undefined;
        if (node.type === 'Component' && (node.fieldKey === key || node.bind === `page.${key}`)) {
          return (node.props?.align as string) || (node.props?.textAlign as string);
        }
        if (node.root) {
          const res = findAlignInNode(node.root as NodeWithProps);
          if (res) return res;
        }
        if (node.children && Array.isArray(node.children)) {
          for (const child of node.children) {
            const res = findAlignInNode(child as NodeWithProps);
            if (res) return res;
          }
        }
        return undefined;
      };
      const defaultAlign = findAlignInNode(tpl.schema.root as NodeWithProps);
      if (defaultAlign) return defaultAlign;
    }
  } catch {
    // 降级使用 left
  }
  return 'left';
}

/** 智能推导当前文本字体族（从模板 Schema 或 Design Token 继承） */
export function getDefaultFontFamilyForField(page: PageData, key: string, theme: ProjectTheme): string {
  try {
    const tpl = getTemplateById(page.layoutId);
    if (tpl?.schema) {
      const findFontInNode = (node: NodeWithProps | null | undefined): string | undefined => {
        if (!node) return undefined;
        if (node.type === 'Component' && (node.fieldKey === key || node.bind === `page.${key}`)) {
          if (node.props?.fontFamily) return node.props.fontFamily as string;

          const isZH = node.props?.zh || node.props?.lang === 'zh';
          if (node.props?.serif) return isZH ? theme.typography.headingFontZH : theme.typography.headingFont;
          if (node.props?.sans) return isZH ? theme.typography.bodyFontZH : theme.typography.bodyFont;
          if (node.props?.caption) return theme.typography.captionFont;
        }
        if (node.root) {
          const res = findFontInNode(node.root as NodeWithProps);
          if (res) return res;
        }
        if (node.children && Array.isArray(node.children)) {
          for (const child of node.children) {
            const res = findFontInNode(child as NodeWithProps);
            if (res) return res;
          }
        }
        return undefined;
      };
      const defaultFont = findFontInNode(tpl.schema.root as NodeWithProps);
      if (defaultFont) return defaultFont;
    }
  } catch {
    // 忽略异常，降级到语义推导
  }

  const lk = key.toLowerCase();
  if (lk === 'title' || lk === 'heading' || lk.includes('display') || lk.includes('hero')) {
    return page.titleFont || theme.typography.headingFont;
  }
  if (lk.includes('caption') || lk.includes('meta') || lk.includes('tag') || lk.includes('badge') || lk === 'footer') {
    return theme.typography.captionFont || theme.typography.bodyFont;
  }
  if (lk.includes('zh') || lk.includes('chinese')) {
    return theme.typography.bodyFontZH || theme.typography.bodyFont;
  }
  return page.bodyFont || theme.typography.bodyFont;
}

/** 获取字段的默认颜色配置 */
export function getDefaultColorForField(page: PageData, key: string, ds: DesignSystem): string {
  try {
    const tpl = getTemplateById(page.layoutId);
    if (tpl?.schema) {
      const findColorInNode = (node: NodeWithProps | null | undefined): string | undefined => {
        if (!node) return undefined;
        if (node.type === 'Component' && (node.fieldKey === key || node.bind === `page.${key}`)) {
          const colorProp = node.props?.color as string | undefined;
          if (colorProp) {
            return ds.tokens.colors[colorProp] || colorProp;
          }
        }
        if (node.root) {
          const res = findColorInNode(node.root as NodeWithProps);
          if (res) return res;
        }
        if (node.children && Array.isArray(node.children)) {
          for (const child of node.children) {
            const res = findColorInNode(child as NodeWithProps);
            if (res) return res;
          }
        }
        return undefined;
      };
      const defaultColor = findColorInNode(tpl.schema.root as NodeWithProps);
      if (defaultColor) return defaultColor;
    }
  } catch {
    // Schema 查找失败时降级到主题主色
  }
  return ds.tokens.colors.primary;
}

/** 获取 Divider 的默认粗细 */
export function getDefaultThicknessForField(page: PageData, key: string): number {
  try {
    const tpl = getTemplateById(page.layoutId);
    if (tpl?.schema) {
      const findThicknessInNode = (node: NodeWithProps | null | undefined): number | undefined => {
        if (!node) return undefined;
        if (node.type === 'Component' && (node.fieldKey === key || node.bind === `page.${key}`)) {
          if (typeof node.props?.thickness === 'number') return node.props.thickness;
        }
        if (node.root) {
          const res = findThicknessInNode(node.root as NodeWithProps);
          if (res !== undefined) return res;
        }
        if (node.children && Array.isArray(node.children)) {
          for (const child of node.children) {
            const res = findThicknessInNode(child as NodeWithProps);
            if (res !== undefined) return res;
          }
        }
        return undefined;
      };
      const defaultThickness = findThicknessInNode(tpl.schema.root as NodeWithProps);
      if (defaultThickness !== undefined) return defaultThickness;
    }
  } catch {
    // Schema 查找失败时降级到默认粗细
  }
  return 1;
}
