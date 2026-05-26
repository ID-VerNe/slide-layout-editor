import { TemplateSchema } from '../types';

/**
 * BackCoverMovieSchema - 24x24 模块化迁移
 * 核心：电影谢幕感、羽化边缘大图、极简排版
 */
export const BackCoverMovieSchema: TemplateSchema = {
  id: 'back-cover-movie',
  name: 'Back Cover Movie',
  category: 'Gallery',
  supportedRatios: ['16:9', '2:3', 'A4'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden bg-[#111111]',
    children: [
      // 1. 核心图片区 (Rows 2-15)
      {
        type: 'Container',
        layout: 'absolute',
        modular: { colStart: 3, colSpan: 20, rowStart: 2, rowSpan: 14 },
        className: 'mask-movie-feather', // 需要在 index.css 中定义这个遮罩
        style: {
          WebkitMaskImage: 'radial-gradient(ellipse, black 50%, transparent 100%)',
          maskImage: 'radial-gradient(ellipse, black 50%, transparent 100%)'
        },
        children: [
          {
            type: 'Component',
            componentType: 'ZineMedia',
            props: { className: 'w-full h-full object-cover grayscale brightness-90 contrast-110' }
          }
        ]
      },

      // 2. 谢幕文本区 (Rows 17-22)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'center', justify: 'center' },
        modular: { colStart: 3, colSpan: 20, rowStart: 17, rowSpan: 6 },
        children: [
          {
            type: 'Component',
            componentType: 'ZineDisplay',
            bind: 'page.title',
            props: {
              text: '{page.title || "THANKS FOR WATCHING"}',
              className: '!tracking-[0.5em] !text-[2rem] uppercase !text-white/80',
              color: 'surface'
            }
          },
          { type: 'Container', className: 'w-12 h-px bg-white/20 my-6', children: [] },
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.subtitle',
            props: {
              text: '{page.subtitle || "SEE YOU NEXT YEAR"}',
              className: '!tracking-[0.8em] uppercase opacity-60',
              color: 'surface'
            }
          }
        ]
      }
    ]
  }
};
