import { TemplateSchema } from '../types';

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
      // 1. 顶部标题组 (Rows 3-6) - 遵循天头原则
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'center', justify: 'center', gap: 'spacing.md' },
        modular: { colStart: 4, colSpan: 16, rowStart: 3, rowSpan: 4 },
        children: [
          { type: 'Container', children: [{ type: 'Component', componentType: 'ZineCaption', bind: 'page.logo', props: { className: 'opacity-20 mb-2', sans: true } }] },
          { type: 'Container', children: [{ type: 'Component', componentType: 'ZineDisplay', bind: 'page.title', props: { size: 6, bold: true, align: 'center', serif: true } }] },
          { type: 'Container', children: [{ type: 'Component', componentType: 'ZineCaption', bind: 'page.subtitle', props: { size: 2.25, align: 'center', color: 'secondary', sans: true, className: 'opacity-60' } }] }
        ]
      },

      // 2. 目录卡片矩阵 (Rows 8-20) - 确保地脚留白
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'row', wrap: true, justify: 'center', align: 'center', gap: 'spacing.lg' },
        modular: { colStart: 1, colSpan: 24, rowStart: 8, rowSpan: 13 },
        className: 'overflow-y-auto no-scrollbar pb-20',
        children: [
          {
            type: 'Repeater',
            bind: 'page.agenda',
            template: {
              type: 'Container',
              layout: 'flex',
              layoutProps: { direction: 'column' },
              className: 'w-[300px] rounded-[3rem] bg-zine-surface border border-zine-accent/10 shadow-xl overflow-hidden hover:-translate-y-1 transition-all',
              children: [
                // 卡片头部
                {
                  type: 'Container',
                  layout: 'flex',
                  layoutProps: { direction: 'column', gap: 'spacing.sm' },
                  className: 'p-8 pb-5',
                  children: [
                    { type: 'Component', componentType: 'ZineCaption', bind: 'item.icon', props: { className: 'opacity-30', sans: true } },
                    { type: 'Component', componentType: 'ZineCaption', props: { text: '{item.title}', size: 2.25, bold: true, sans: true } },
                    { type: 'Component', componentType: 'ZineCaption', props: { text: '{item.desc}', size: 1.3, tracking: 0.1, sans: true, className: 'opacity-50 uppercase' } }
                  ]
                },
                // 章节号
                {
                  type: 'Container',
                  className: 'px-8 py-4 bg-zine-bg/40 border-y border-zine-accent/10',
                  children: [
                    { type: 'Component', componentType: 'ZineDisplay', props: { text: '{item.number}', size: 4, bold: true, tracking: -0.05, color: 'primary', serif: true } }
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
                          { type: 'Component', componentType: 'ZineCaption', props: { text: '{item}', size: 1.6, bold: true, sans: true } }
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
