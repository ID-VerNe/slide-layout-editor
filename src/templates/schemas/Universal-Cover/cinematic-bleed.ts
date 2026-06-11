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
            // 顶置标题（独立容器）
            {
              type: 'Container',
              layout: 'flex',
              layoutProps: { direction: 'column', align: 'center', justify: 'start' },
              modular: { colStart: 0, colSpan: 24, rowStart: 4, rowSpan: 3 },
              className: 'pt-8',
              children: [
                {
                  type: 'Component',
                  componentType: 'ZineDisplay',
                  bind: 'page.title',
                  props: { italic: true, tracking: 0.4, align: 'center', serif: true, className: 'text-white drop-shadow-2xl', color: 'surface' }
                }
              ]
            },
            // 底部 Subtitle（独立容器）
            {
              type: 'Container',
              layout: 'flex',
              layoutProps: { direction: 'column', align: 'center', justify: 'center' },
              modular: { colStart: 0, colSpan: 24, rowStart: 20, rowSpan: 1 },
              children: [
                {
                  type: 'Component',
                  componentType: 'ZineCaption',
                  bind: 'page.subtitle',
                  props: { align: 'center', tracking: 0.5, sans: true, bold: true, className: 'text-white uppercase opacity-80', color: 'surface' }
                }
              ]
            }
          ]
        },
        else: {
          type: 'Container',
          layout: 'modular',
          layoutProps: { columns: 24, rows: 24 },
          className: 'absolute inset-0 pointer-events-none',
          children: [
            // Subtitle（独立容器）
            {
              type: 'Container',
              layout: 'flex',
              layoutProps: { direction: 'column', align: 'center', justify: 'center' },
              modular: { colStart: 0, colSpan: 24, rowStart: 16, rowSpan: 2 },
              children: [
                {
                  type: 'Component',
                  componentType: 'ZineCaption',
                  bind: 'page.subtitle',
                  props: { tracking: 0.6, bold: true, sans: true, className: 'text-white uppercase', color: 'surface' }
                }
              ]
            },
            // 底部标题（独立容器）
            {
              type: 'Container',
              layout: 'flex',
              layoutProps: { direction: 'column', align: 'center', justify: 'end' },
              modular: { colStart: 0, colSpan: 24, rowStart: 18, rowSpan: 4 },
              className: 'pb-8',
              children: [
                {
                  type: 'Component',
                  componentType: 'ZineDisplay',
                  bind: 'page.title',
                  props: { italic: true, tracking: 0.3, align: 'center', serif: true, className: 'text-white drop-shadow-2xl', color: 'surface' }
                }
              ]
            }
          ]
        }
      },

      // 3. 通用页脚 (Row 23) - 降低位置防止遮挡，并绑定正确字段
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'row', align: 'center', justify: 'center' },
        modular: { colStart: 0, colSpan: 24, rowStart: 22, rowSpan: 1 },
        style: { position: 'relative', zIndex: 10 },
        children: [
          {
            type: 'Component',
            componentType: 'ZineBody',
            bind: 'page.imageLabel',
            props: { 
              align: 'center', 
              sans: true, 
              size: 0.9, 
              italic: true, 
              tracking: 0.2, 
              color: 'surface',
              className: 'opacity-60'
            }
          }
        ]
      }
    ]
  }
};
