import { TemplateSchema } from './types';

/**
 * HorizonSkySchema - 24x24 模块化迁移
 * 核心：地平线构图、天空留白、居中对称
 */
export const HorizonSkySchema: TemplateSchema = {
  id: 'horizon-sky',
  name: 'Horizon Sky',
  category: 'Gallery',
  supportedRatios: ['2:3', 'A4'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden bg-zine-bg',
    children: [
      // 1. 上半部分：天空 (Rows 1-11)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'center', justify: 'center' },
        modular: { colStart: 4, colSpan: 18, rowStart: 2, rowSpan: 9 },
        children: [
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.subtitle',
            props: { className: '!tracking-[0.5em] opacity-50 mb-4', color: 'secondary' }
          },
          {
            type: 'Component',
            componentType: 'ZineDisplay',
            bind: 'page.title',
            props: { className: 'text-center !tracking-[0.5em] !font-medium !text-[2.4rem]' }
          },
          {
            type: 'Component',
            componentType: 'ZineBody',
            bind: 'page.paragraph',
            props: { className: 'text-center !italic opacity-50 mt-6 !text-[0.75rem]', color: 'secondary' }
          }
        ]
      },

      // 2. 地平线 (Rows 12-13)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'center', justify: 'center' },
        modular: { colStart: 1, colSpan: 24, rowStart: 12, rowSpan: 2 },
        children: [
          {
            type: 'Component',
            componentType: 'ZineCaption',
            props: { text: '{page.imageLabel}', className: '!tracking-[0.2em] opacity-40 mb-4', color: 'secondary' }
          },
          { type: 'Container', className: 'w-full h-px bg-zine-accent/20', children: [] }
        ]
      },

      // 3. 下半部分：大地 (Rows 14-24)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { justify: 'center', align: 'start' },
        modular: { colStart: 4, colSpan: 18, rowStart: 15, rowSpan: 9 },
        children: [
          {
            type: 'Component',
            componentType: 'ZineMedia',
            props: { className: 'aspect-square shadow-sm' }
          }
        ]
      }
    ]
  }
};
