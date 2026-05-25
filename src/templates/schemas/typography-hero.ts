import { TemplateSchema } from './types';

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
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'center', justify: 'center' },
        modular: { colStart: 4, colSpan: 18, rowStart: 4, rowSpan: 16 },
        children: [
          // 上分割线
          { type: 'Container', className: 'w-full h-px bg-zine-accent/30 mb-12', children: [] },
          
          // 主标题
          {
            type: 'Component',
            componentType: 'ZineDisplay',
            bind: 'page.title',
            props: {
              className: 'text-center !italic !font-light !tracking-[0.4em] !text-[3.5rem]',
              color: 'accent'
            }
          },

          // 中间正文
          {
            type: 'Component',
            componentType: 'ZineBody',
            bind: 'page.paragraph',
            props: {
              className: 'text-center !font-light !tracking-[0.15em] !text-[1.2rem] !leading-[2.2] my-10 max-w-[800px]',
              color: 'secondary'
            }
          },

          // 下分割线
          { type: 'Container', className: 'w-full h-px bg-zine-accent/30 mt-4 mb-12', children: [] },

          // 底部标注
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.subtitle',
            props: {
              className: 'text-center !font-black !tracking-[0.6em] uppercase opacity-40 !text-[9px]',
              color: 'accent'
            }
          }
        ]
      }
    ]
  }
};
