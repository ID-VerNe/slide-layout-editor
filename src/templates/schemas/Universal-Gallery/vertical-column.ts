import { TemplateSchema } from '../types';

/**
 * VerticalColumnSchema - 24x24 模块化迁移
 * 核心：黄金分割边栏、多维垂直排版、极简竖线构图
 */
export const VerticalColumnSchema: TemplateSchema = {
  id: 'vertical-column',
  name: 'Vertical Column',
  category: 'Gallery',
  supportedRatios: ['2:3', 'A4'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden bg-zine-bg',
    children: [
      {
        type: 'Conditional',
        condition: '{page.layoutVariant === "right"}',
        then: {
          type: 'Container',
          layout: 'modular',
          layoutProps: { columns: 24, rows: 24 },
          className: 'absolute inset-0',
          children: [
            // 1. 右侧大图 (Cols 9-24)
            {
              type: 'Container',
              layout: 'absolute',
              modular: { colStart: 9, colSpan: 16, rowStart: 1, rowSpan: 24 },
              className: 'shadow-2xl z-10',
              children: [{ type: 'Component', componentType: 'ZineMedia', props: { className: 'w-full h-full' } }]
            },
            // 2. 左侧边栏 (Cols 1-8)
            {
              type: 'Container',
              layout: 'flex',
              layoutProps: { direction: 'row', align: 'center', justify: 'center', gap: 'spacing.md' },
              modular: { colStart: 1, colSpan: 8, rowStart: 1, rowSpan: 24 },
              className: 'bg-white z-20',
              children: [
                {
                  type: 'Component',
                  componentType: 'ZineBody',
                  bind: 'page.paragraph',
                  style: { writingMode: 'vertical-rl', maxHeight: '60%' },
                  props: { size: 1.4, italic: true, color: 'secondary', serif: true, className: 'opacity-40' }
                },
                { type: 'Container', className: 'w-px h-32 bg-zine-accent/20', children: [] },
                {
                  type: 'Component',
                  componentType: 'ZineCaption',
                  bind: 'page.subtitle',
                  style: { writingMode: 'vertical-rl' },
                  props: { tracking: 0.4, color: 'secondary', sans: true, className: 'opacity-60' }
                },
                { type: 'Container', className: 'w-px h-32 bg-zine-accent/30', children: [] },
                {
                  type: 'Component',
                  componentType: 'ZineDisplay',
                  bind: 'page.title',
                  style: { writingMode: 'vertical-rl' },
                  props: { size: 4.4, bold: true, tracking: -0.05, serif: true }
                }
              ]
            }
          ]
        },
        else: {
          type: 'Container',
          layout: 'modular',
          layoutProps: { columns: 24, rows: 24 },
          className: 'absolute inset-0',
          children: [
            // 1. 左侧大图 (Cols 1-16)
            {
              type: 'Container',
              layout: 'absolute',
              modular: { colStart: 1, colSpan: 16, rowStart: 1, rowSpan: 24 },
              className: 'shadow-2xl z-10',
              children: [{ type: 'Component', componentType: 'ZineMedia', props: { className: 'w-full h-full' } }]
            },
            // 2. 右侧边栏 (Cols 17-24)
            {
              type: 'Container',
              layout: 'flex',
              layoutProps: { direction: 'row', align: 'center', justify: 'center', gap: 'spacing.md' },
              modular: { colStart: 17, colSpan: 8, rowStart: 1, rowSpan: 24 },
              className: 'bg-white z-20',
              children: [
                {
                  type: 'Component',
                  componentType: 'ZineBody',
                  bind: 'page.paragraph',
                  style: { writingMode: 'vertical-rl', maxHeight: '60%' },
                  props: { size: 1.4, italic: true, color: 'secondary', serif: true, className: 'opacity-40' }
                },
                { type: 'Container', className: 'w-px h-32 bg-zine-accent/20', children: [] },
                {
                  type: 'Component',
                  componentType: 'ZineCaption',
                  bind: 'page.subtitle',
                  style: { writingMode: 'vertical-rl' },
                  props: { tracking: 0.4, color: 'secondary', sans: true, className: 'opacity-60' }
                },
                { type: 'Container', className: 'w-px h-32 bg-zine-accent/30', children: [] },
                {
                  type: 'Component',
                  componentType: 'ZineDisplay',
                  bind: 'page.title',
                  style: { writingMode: 'vertical-rl' },
                  props: { size: 4.4, bold: true, tracking: -0.05, serif: true }
                }
              ]
            }
          ]
        }
      },
      // 底部标签
      {
        type: 'Component',
        componentType: 'ZineCaption',
        modular: { colStart: 1, colSpan: 24, rowStart: 23, rowSpan: 1 },
        props: {
          text: '{page.imageLabel}',
          align: '{page.layoutVariant === "right" ? "right" : "left"}',
          color: 'surface',
          sans: true,
          className: '{page.layoutVariant === "right" ? "pr-12" : "pl-12"} opacity-60 mix-blend-difference !text-white'
        }
      }
    ]
  }
};
