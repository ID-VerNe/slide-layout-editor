import { TemplateSchema } from './types';

/**
 * TableOfContentsSchema - 24x24 模块化迁移
 * 核心：多维卡片矩阵、层级化目录索引、动态激活态
 */
export const TableOfContentsSchema: TemplateSchema = {
  id: 'table-of-contents',
  name: 'Table of Contents',
  category: 'General',
  supportedRatios: ['2:3', 'A4', '16:9'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden bg-zine-bg px-24',
    children: [
      // 1. 顶部标题组 (Rows 2-6)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'center', justify: 'center', gap: 'spacing.md' },
        modular: { colStart: 4, colSpan: 16, rowStart: 2, rowSpan: 5 },
        children: [
          { type: 'Component', componentType: 'ZineCaption', props: { text: 'BRAND LOGO', className: 'opacity-20 mb-2' } },
          { type: 'Component', componentType: 'ZineDisplay', bind: 'page.title', props: { className: '!text-[3rem] !font-black text-center' } },
          { type: 'Component', componentType: 'ZineCaption', bind: 'page.subtitle', props: { className: 'text-lg opacity-60 text-center', color: 'secondary' } }
        ]
      },

      // 2. 目录卡片矩阵 (Rows 8-23)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'row', wrap: true, justify: 'center', align: 'center', gap: 'spacing.lg' },
        modular: { colStart: 1, colSpan: 24, rowStart: 8, rowSpan: 16 },
        className: 'overflow-y-auto no-scrollbar pb-20',
        children: [
          {
            type: 'Repeater',
            bind: 'page.agenda',
            template: {
              type: 'Container',
              layout: 'flex',
              layoutProps: { direction: 'column' },
              className: 'w-[300px] rounded-[3rem] bg-zine-surface border border-white shadow-xl overflow-hidden hover:-translate-y-1 transition-all',
              children: [
                // 卡片头部
                {
                  type: 'Container',
                  layout: 'flex',
                  layoutProps: { direction: 'column', gap: 'spacing.sm' },
                  className: 'p-8 pb-5',
                  children: [
                    { type: 'Component', componentType: 'ZineCaption', props: { text: 'ICON', className: 'opacity-30' } },
                    { type: 'Component', componentType: 'ZineCaption', props: { text: '{item.title}', className: '!text-lg !font-black' } },
                    { type: 'Component', componentType: 'ZineCaption', props: { text: '{item.desc}', className: '!text-[0.65rem] opacity-50 uppercase tracking-widest' } }
                  ]
                },
                // 章节号
                {
                  type: 'Container',
                  className: 'px-8 py-4 bg-white/40 border-y border-white/60',
                  children: [
                    { type: 'Component', componentType: 'ZineDisplay', props: { text: '{item.number}', className: '!text-[2rem] !font-black !tracking-tighter', color: 'primary' } }
                  ]
                },
                // 子项目列表
                {
                  type: 'Container',
                  layout: 'flex',
                  layoutProps: { direction: 'column', gap: 'spacing.xs' },
                  className: 'p-8 pt-6',
                  children: [
                    {
                      type: 'Repeater',
                      bind: 'item.items',
                      template: {
                        type: 'Container',
                        layout: 'flex',
                        layoutProps: { direction: 'row', align: 'center', gap: 'spacing.sm' },
                        className: 'mb-1',
                        children: [
                          { type: 'Container', className: 'w-1.5 h-1.5 rounded-full bg-zine-accent/30', children: [] },
                          { type: 'Component', componentType: 'ZineCaption', props: { text: '{item}', className: '!text-[0.8rem] font-semibold' } }
                        ]
                      }
                    }
                  ]
                }
              ]
            }
          }
        ]
      }
    ]
  }
};
