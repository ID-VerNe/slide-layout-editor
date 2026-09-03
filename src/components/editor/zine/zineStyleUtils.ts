import { PageData } from '../../../types';
import { getTemplateById } from '../../../templates/registry';

/** 语义化属性解析（提供贴合排版层级的合理初始阶梯） */
export function getDefaultSizeForField(key: string): number {
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
      const findAlignInNode = (node: any): string | undefined => {
        if (!node) return undefined;
        if (node.type === 'Component' && (node.fieldKey === key || node.bind === `page.${key}`)) {
          return node.props?.align || node.props?.textAlign;
        }
        if (node.children && Array.isArray(node.children)) {
          for (const child of node.children) {
            const res = findAlignInNode(child);
            if (res) return res;
          }
        }
        return undefined;
      };
      const defaultAlign = findAlignInNode(tpl.schema);
      if (defaultAlign) return defaultAlign;
    }
  } catch {
    // 降级使用 left
  }
  return 'left';
}

/** 智能推导当前文本字体族（从模板 Schema 或 Design Token 继承） */
export function getDefaultFontFamilyForField(page: PageData, key: string, theme: any): string {
  try {
    const tpl = getTemplateById(page.layoutId);
    if (tpl?.schema) {
      const findFontInNode = (node: any): string | undefined => {
        if (!node) return undefined;
        if (node.type === 'Component' && (node.fieldKey === key || node.bind === `page.${key}`)) {
          if (node.props?.fontFamily) return node.props.fontFamily;
          if (node.props?.serif) return theme.typography.headingFont;
          if (node.props?.sans) return theme.typography.bodyFont;
          if (node.props?.caption) return theme.typography.captionFont;
        }
        if (node.children && Array.isArray(node.children)) {
          for (const child of node.children) {
            const res = findFontInNode(child);
            if (res) return res;
          }
        }
        return undefined;
      };
      const defaultFont = findFontInNode(tpl.schema);
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
    return theme.typography.bodyFontZH;
  }
  return page.bodyFont || theme.typography.bodyFont;
}
