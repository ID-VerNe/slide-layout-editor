import { TemplateSchema } from '../types';

/**
 * CinematicFullBleedSchema - 24x24 模块化迁移
 * 核心：全屏沉浸感、极简浮动文字、电影感留白
 */
export const CinematicFullBleedSchema: TemplateSchema = {
  id: 'cinematic-full-bleed',
  name: 'Cinematic Bleed',
  category: 'Cover',
  supportedRatios: ['2:3', 'A4', '16:9'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden bg-slate-950',
    children: [
      // 1. 背景主图
      {
        type: 'Container',
        layout: 'absolute',
        layoutProps: { inset: 0 },
        children: [{ type: 'Component', componentType: 'ZineMedia', props: { className: 'w-full h-full object-cover' } }]
      },

      // 2. 文字层 (Conditional based on layoutVariant)
      {
        type: 'Conditional',
        condition: '{page.layoutVariant === "top"}',
        then: {
          type: 'Container',
          layout: 'modular',
          layoutProps: { columns: 24, rows: 24 },
          className: 'absolute inset-0 pointer-events-none',
          children: [
            // 顶置标题
            {
              type: 'Container',
              layout: 'flex',
              layoutProps: { direction: 'column', align: 'center', justify: 'start' },
              modular: { colStart: 4, colSpan: 18, rowStart: 4, rowSpan: 6 },
              className: 'pt-8',
              children: [
                {
                  type: 'Component',
                  componentType: 'ZineDisplay',
                  bind: 'page.title',
                  props: { className: '!text-white !italic !font-light !tracking-[0.4em] text-center drop-shadow-2xl', color: 'surface' }
                }
              ]
            },
            // 底部 Subtitle
            {
              type: 'Component',
              componentType: 'ZineCaption',
              modular: { colStart: 4, colSpan: 18, rowStart: 20, rowSpan: 1 },
              bind: 'page.subtitle',
              props: { className: 'text-center !text-white !tracking-[0.5em] uppercase opacity-80', color: 'surface' }
            }
          ]
        },
        else: {
          type: 'Container',
          layout: 'modular',
          layoutProps: { columns: 24, rows: 24 },
          className: 'absolute inset-0 pointer-events-none',
          children: [
            // 底部标题组
            {
              type: 'Container',
              layout: 'flex',
              layoutProps: { direction: 'column', align: 'center', justify: 'end' },
              modular: { colStart: 4, colSpan: 18, rowStart: 16, rowSpan: 6 },
              className: 'pb-8',
              children: [
                {
                  type: 'Component',
                  componentType: 'ZineCaption',
                  bind: 'page.subtitle',
                  props: { className: '!text-white !tracking-[0.6em] uppercase !font-black mb-4', color: 'surface' }
                },
                {
                  type: 'Component',
                  componentType: 'ZineDisplay',
                  bind: 'page.title',
                  props: { className: '!text-white !italic !font-light !tracking-[0.3em] text-center drop-shadow-2xl', color: 'surface' }
                }
              ]
            }
          ]
        }
      },

      // 3. 通用页脚 (Row 22)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'row', align: 'center', justify: 'center' },
        modular: { colStart: 5, colSpan: 16, rowStart: 22, rowSpan: 1 },
        style: { position: 'relative', zIndex: 10 },
        children: [
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.imageLabel',
            props: { text: '{page.imageLabel || "© 2026"}', className: '!italic !tracking-[0.4em]', color: 'accent' }
          }
        ]
      }
    ]
  }
};
