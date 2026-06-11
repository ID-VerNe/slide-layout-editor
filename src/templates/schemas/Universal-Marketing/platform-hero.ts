import { TemplateSchema } from '../types';

/**
 * PlatformHeroSchema - 24x24 模块化迁移
 * 核心：平台愿景展示、网格化特性块、极简居中排版
 */
export const PlatformHeroSchema: TemplateSchema = {
  id: 'platform-hero',
  name: 'Platform Hero',
  category: 'Marketing',
  supportedRatios: ['2:3', 'A4', '16:9'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden bg-zine-bg px-24',
    children: [
      // 1. 顶部标题组 (Rows 3-12) - 遵循天头原则
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'center', justify: 'center', gap: 'spacing.lg' },
        modular: { colStart: 3, colSpan: 18, rowStart: 3, rowSpan: 10 },
        children: [
          { type: 'Container', children: [{ type: 'Component', componentType: 'ZineCaption', bind: 'page.logo', props: { className: 'opacity-20', sans: true } }] },
          {
            type: 'Container',
            children: [{
              type: 'Component',
              componentType: 'ZineCaption',
              bind: 'page.subtitle',
              props: { size: 1.25, bold: true, tracking: 0.4, color: 'secondary', sans: true, className: 'uppercase' }
            }]
          },
          {
            type: 'Container',
            children: [{
              type: 'Component',
              componentType: 'ZineDisplay',
              bind: 'page.title',
              props: { size: 9, bold: true, tracking: -0.05, align: 'center', leading: 1.25, serif: true }
            }]
          },
          {
            type: 'Container',
            children: [{
              type: 'Component',
              componentType: 'ZineCaption',
              bind: 'page.imageLabel',
              props: { className: 'mt-4 px-8 py-3 border border-zine-accent/20 rounded-full', color: 'accent', sans: true }
            }]
          }
        ]
      },

      // 2. 底部特性网格 (Rows 14-20) - 确保地脚留白
      {
        type: 'Container',
        layout: 'modular',
        layoutProps: { columns: 4, rows: 1 },
        modular: { colStart: 1, colSpan: 24, rowStart: 14, rowSpan: 7 },
        className: 'border-t border-zine-accent/15',
        children: [
          {
            type: 'Repeater',
            bind: 'page.features',
            template: {
              type: 'Container',
              layout: 'flex',
              layoutProps: { direction: 'column', align: 'start', gap: 'spacing.md' },
              className: 'p-10 border-r border-zine-accent/15 last:border-r-0',
              children: [
                { type: 'Component', componentType: 'ZineCaption', bind: 'item.icon', props: { size: 1.5, color: 'accent', sans: true, className: 'opacity-30' } },
                { type: 'Component', componentType: 'ZineCaption', props: { text: '{item.title}', size: 2.4, bold: true, sans: true } },
                { type: 'Component', componentType: 'ZineBody', props: { text: '{item.desc}', size: 1.75, bold: true, color: 'secondary', serif: true, className: 'opacity-60' } }
              ]
            }
          }
        ]
      }
    ]
  }
};
