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
      // 1. 居中图像 (Cols 5-20, Rows 3-12) - 遵循天头 2.5格原则
      {
        type: 'Container',
        layout: 'absolute',
        modular: { colStart: 5, colSpan: 16, rowStart: 3, rowSpan: 10 },
        className: 'bg-white shadow-2xl p-0 overflow-hidden border-[1px] border-black/5',
        children: [{ type: 'Component', componentType: 'ZineMedia', props: { className: 'w-full h-full' } }]
      },

      // 2. 标题区 (Cols 5-20, Rows 15-18) - 增加间距
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'center', justify: 'start' },
        modular: { colStart: 5, colSpan: 16, rowStart: 19, rowSpan: 4 },
        children: [
          {
            type: 'Component',
            componentType: 'ZineDisplay',
            bind: 'page.title',
            props: { tracking: 0.4, italic: true, align: 'center', className: 'uppercase', serif: true }
          },
          { type: 'Container', className: 'w-8 h-px bg-zine-accent my-6 opacity-30', children: [] },
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.subtitle',
            props: { align: 'center', tracking: 0.1, color: 'secondary', sans: true, className: 'opacity-60' }
          }
        ]
      },

      // 3. 底部正文 (Cols 6-19, Rows 19-20) - 确保地脚留白 4格
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'center', justify: 'center' },
        modular: { colStart: 6, colSpan: 13, rowStart: 19, rowSpan: 2 },
        children: [
          {
            type: 'Component',
            componentType: 'ZineBody',
            bind: 'page.paragraph',
            props: { align: 'center', size: 1.6, color: 'secondary', className: 'opacity-40', serif: true }
          }
        ]
      }
    ]
  }
};
