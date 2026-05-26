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
      // 1. 顶部标题组 (Rows 2-13)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'center', justify: 'center', gap: 'spacing.lg' },
        modular: { colStart: 3, colSpan: 18, rowStart: 2, rowSpan: 11 },
        children: [
          { type: 'Component', componentType: 'ZineCaption', props: { text: 'BRAND LOGO', className: 'opacity-20' } },
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.subtitle',
            props: { className: '!text-[10px] !font-black uppercase !tracking-[0.4em]', color: 'secondary' }
          },
          {
            type: 'Component',
            componentType: 'ZineDisplay',
            bind: 'page.title',
            props: { className: '!text-[4.5rem] !font-black !tracking-tighter text-center leading-tight' }
          },
          {
            type: 'Component',
            componentType: 'ZineCaption',
            props: { text: '{page.imageLabel}', className: 'mt-4 px-8 py-3 border border-zine-accent/20 rounded-full', color: 'accent' }
          }
        ]
      },

      // 2. 底部特性网格 (Rows 14-24)
      {
        type: 'Container',
        layout: 'modular',
        layoutProps: { columns: 4, rows: 1 },
        modular: { colStart: 1, colSpan: 24, rowStart: 14, rowSpan: 11 },
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
                { type: 'Component', componentType: 'ZineCaption', props: { text: 'ICON', className: '!text-[12px] opacity-30', color: 'accent' } },
                { type: 'Component', componentType: 'ZineCaption', props: { text: '{item.title}', className: '!text-[1.2rem] !font-bold' } },
                { type: 'Component', componentType: 'ZineBody', props: { text: '{item.desc}', className: '!text-[0.875rem] !font-medium opacity-60', color: 'secondary' } }
              ]
            }
          }
        ]
      }
    ]
  }
};
