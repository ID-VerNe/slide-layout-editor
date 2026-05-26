import { TemplateSchema } from '../types';

/**
 * FloatingGallerySchema - 24x24 模块化迁移
 * 核心：居中画框布局、极简排版、诗意留白
 */
export const FloatingGallerySchema: TemplateSchema = {
  id: 'floating-gallery',
  name: 'Floating Gallery',
  category: 'Gallery',
  supportedRatios: ['2:3', 'A4'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden bg-zine-bg',
    children: [
      // 1. 居中图像 (Cols 5-20, Rows 3-13)
      {
        type: 'Container',
        layout: 'absolute',
        modular: { colStart: 5, colSpan: 16, rowStart: 3, rowSpan: 11 },
        className: 'bg-white shadow-2xl p-0 overflow-hidden border-[1px] border-black/5',
        children: [{ type: 'Component', componentType: 'ZineMedia', props: { className: 'w-full h-full' } }]
      },

      // 2. 标题区 (Cols 5-20, Rows 15-18)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'center', justify: 'start' },
        modular: { colStart: 5, colSpan: 16, rowStart: 15, rowSpan: 4 },
        children: [
          {
            type: 'Component',
            componentType: 'ZineDisplay',
            bind: 'page.title',
            props: { className: '!tracking-[0.4em] !uppercase !italic !font-light text-center' }
          },
          { type: 'Container', className: 'w-8 h-px bg-zine-accent my-6 opacity-30', children: [] },
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.subtitle',
            props: { className: 'text-center !tracking-widest opacity-60', color: 'secondary' }
          }
        ]
      },

      // 3. 底部正文 (Cols 6-19, Rows 20-22)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'center', justify: 'center' },
        modular: { colStart: 6, colSpan: 13, rowStart: 20, rowSpan: 3 },
        children: [
          {
            type: 'Component',
            componentType: 'ZineBody',
            bind: 'page.paragraph',
            props: { className: 'text-center !text-[0.8rem] opacity-40', color: 'secondary' }
          }
        ]
      },

      // 4. 底部标签
      {
        type: 'Component',
        componentType: 'ZineCaption',
        modular: { colStart: 2, colSpan: 10, rowStart: 23, rowSpan: 1 },
        props: {
          text: '{page.imageLabel}',
          className: 'text-left opacity-40',
          color: 'secondary'
        }
      }
    ]
  }
};
