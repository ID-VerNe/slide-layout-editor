import { TemplateSchema } from '../types';

/**
 * GalleryCapsuleSchema - 24x24 模块化迁移
 * 核心：垂直胶囊阵列、多重叠排版、动态错位感
 */
export const GalleryCapsuleSchema: TemplateSchema = {
  id: 'gallery-capsule',
  name: 'Capsule Mosaic',
  category: 'Gallery',
  supportedRatios: ['2:3', 'A4'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden bg-zine-bg',
    children: [
      // 1. 背景装饰 (DOT Grid)
      {
        type: 'Container',
        layout: 'absolute',
        layoutProps: { inset: 0 },
        className: 'opacity-[0.02] pointer-events-none',
        style: { backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' },
        children: []
      },

      // 2. 方案 Under (Text Behind)
      {
        type: 'Conditional',
        condition: '{page.layoutVariant === "under" || !page.layoutVariant}',
        then: {
          type: 'Container',
          layout: 'flex',
          layoutProps: { direction: 'column', align: 'center', justify: 'center' },
          modular: { colStart: 2, colSpan: 20, rowStart: 6, rowSpan: 12 },
          className: 'z-0 pointer-events-none opacity-[0.05]',
          children: [
            {
              type: 'Component',
              componentType: 'ZineDisplay',
              bind: 'page.title',
              props: { 
                size: 30, 
                align: 'center',
                leading: 0.8,
                tracking: -0.05,
                bold: true
              }
            }
          ]
        }
      },

      // 3. 核心胶囊阵列 (Rows 4-20)
      {
        type: 'Container',
        layout: 'modular',
        layoutProps: { columns: 4, rows: 1 },
        modular: { colStart: 2, colSpan: 22, rowStart: 4, rowSpan: 16 },
        className: 'gap-4 z-10',
        children: [
          // Capsule 1
          {
            type: 'Container',
            modular: { colStart: 1, colSpan: 1, rowStart: 1, rowSpan: 1 },
            className: 'mt-10 h-[80%] rounded-full border-[4px] border-white shadow-xl overflow-hidden',
            children: [{ type: 'Component', componentType: 'ZineMedia', props: { src: '{page.gallery[0]?.url}', className: 'w-full h-full', rounded: '9999px' } }]
          },
          // Capsule 2
          {
            type: 'Container',
            modular: { colStart: 2, colSpan: 1, rowStart: 1, rowSpan: 1 },
            className: '-mt-10 h-[85%] rounded-full border-[4px] border-white shadow-xl overflow-hidden',
            children: [{ type: 'Component', componentType: 'ZineMedia', props: { src: '{page.gallery[1]?.url}', className: 'w-full h-full', rounded: '9999px' } }]
          },
          // Capsule 3
          {
            type: 'Container',
            modular: { colStart: 3, colSpan: 1, rowStart: 1, rowSpan: 1 },
            className: 'mt-6 h-[82%] rounded-full border-[4px] border-white shadow-xl overflow-hidden',
            children: [{ type: 'Component', componentType: 'ZineMedia', props: { src: '{page.gallery[2]?.url}', className: 'w-full h-full', rounded: '9999px' } }]
          },
          // Capsule 4
          {
            type: 'Container',
            modular: { colStart: 4, colSpan: 1, rowStart: 1, rowSpan: 1 },
            className: '-mt-4 h-[78%] rounded-full border-[4px] border-white shadow-xl overflow-hidden',
            children: [{ type: 'Component', componentType: 'ZineMedia', props: { src: '{page.gallery[3]?.url}', className: 'w-full h-full', rounded: '9999px' } }]
          }
        ]
      },

      // 4. 方案 Minimal (Corner Text)
      {
        type: 'Conditional',
        condition: '{page.layoutVariant === "minimal"}',
        then: {
          type: 'Container',
          layout: 'absolute',
          layoutProps: { inset: 0 },
          children: [
            {
              type: 'Container',
              layout: 'flex',
              layoutProps: { direction: 'column', align: 'start' },
              modular: { colStart: 2, colSpan: 10, rowStart: 2, rowSpan: 4 },
              children: [
                { 
                  type: 'Component', 
                  componentType: 'ZineCaption', 
                  props: { 
                    text: '{page.imageSubLabel}', 
                    size: 1.25, 
                    tracking: 0.5,
                    opacity: 0.3
                  } 
                },
                { 
                  type: 'Component', 
                  componentType: 'ZineDisplay', 
                  bind: 'page.subtitle', 
                  props: { 
                    size: 5, 
                    bold: true,
                    tracking: -0.02
                  } 
                }
              ]
            },
            {
              type: 'Container',
              layout: 'flex',
              layoutProps: { direction: 'column', align: 'end', justify: 'end' },
              modular: { colStart: 12, colSpan: 11, rowStart: 16, rowSpan: 8 },
              className: 'z-20 pointer-events-none',
              children: [
                {
                  type: 'Component',
                  componentType: 'ZineArtFont',
                  bind: 'page.artFont',
                  props: {
                    mode: 'outline',
                    fontSize: 200,
                    strokeWidth: 2,
                    textAlign: 'right',
                    className: 'opacity-40',
                    style: '{page.styleOverrides?.artFont}'
                  }
                }
              ]
            },
            {
              type: 'Container',
              layout: 'flex',
              layoutProps: { direction: 'column', align: 'end', justify: 'end' },
              modular: { colStart: 12, colSpan: 11, rowStart: 20, rowSpan: 4 },
              children: [
                { 
                  type: 'Component', 
                  componentType: 'ZineCaption', 
                  props: { 
                    text: '{page.imageLabel}', 
                    size: 1.25, 
                    opacity: 0.4,
                    tracking: 0.3
                  } 
                },
                { type: 'Container', className: 'w-12 h-0.5 bg-zine-accent mb-6', children: [] },
                { 
                  type: 'Component', 
                  componentType: 'ZineDisplay', 
                  bind: 'page.title', 
                  props: { 
                    size: 8, 
                    bold: true,
                    align: 'right',
                    leading: 0.9,
                    tracking: -0.05
                  } 
                }
              ]
            }
          ]
        }
      }
    ]
  }
};
