import { TemplateSchema } from '../types';

/**
 * TypographyHeroSchema - 24x24 模块化迁移
 * 核心：文字即艺术、巨型排版中心、对称呼吸线条
 */
export const TypographyHeroSchema: TemplateSchema = {
  id: 'typography-hero',
  name: 'Typography Hero',
  category: 'General',
  supportedRatios: ['2:3', 'A4'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden bg-zine-bg',
    children: [
      // 1. 上分割线 (Divider 1: Top boundary)
      {
        type: 'Component',
        componentType: 'ZineDivider',
        fieldKey: 'topDivider',
        modular: { colStart: 3, colSpan: 20, rowStart: 9, rowSpan: 1, align: 'center' },
        props: { 
          color: 'secondary', 
          thickness: '1px', 
          style: { opacity: 0.3 } 
        }
      },

      // 2. 主标题 (Headline: ARCANA style)
      {
        type: 'Component',
        componentType: 'ZineDisplay',
        bind: 'page.title',
        modular: { colStart: 4, colSpan: 18, rowStart: 11, rowSpan: 2, align: 'center' },
        props: {
          className: 'text-center !tracking-[0.5em] !text-[3.2rem] !font-medium',
          color: 'accent'
        }
      },

      // 3. 中间正文 (Paragraph: Poem/Italic style)
      {
        type: 'Component',
        componentType: 'ZineBody',
        bind: 'page.paragraph',
        modular: { colStart: 5, colSpan: 16, rowStart: 14, rowSpan: 3, align: 'start' },
        props: {
          className: 'text-center !italic !font-light !tracking-[0.1em] !text-[1.1rem] !leading-[1.8]',
          color: 'secondary'
        }
      },

      // 4. 下分割线 (Divider 2: Bottom boundary)
      {
        type: 'Component',
        componentType: 'ZineDivider',
        fieldKey: 'bottomDivider',
        modular: { colStart: 3, colSpan: 20, rowStart: 18, rowSpan: 1, align: 'center' },
        props: { 
          color: 'secondary', 
          thickness: '1px', 
          style: { opacity: 0.3 } 
        }
      },

      // 5. 底部标注 (Subtitle: PRELUDE style)
      {
        type: 'Component',
        componentType: 'ZineCaption',
        bind: 'page.subtitle',
        modular: { colStart: 4, colSpan: 18, rowStart: 20, rowSpan: 1, align: 'start' },
        props: {
          className: 'text-center !font-medium !tracking-[0.4em] uppercase opacity-40 !text-[7pt]',
          color: 'secondary'
        }
      }
    ]
  }
};
