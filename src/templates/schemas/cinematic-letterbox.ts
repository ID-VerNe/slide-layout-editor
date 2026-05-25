import { TemplateSchema } from './types';

/**
 * CinematicLetterboxSchema - 24x24 模块化迁移
 * 核心：宽画幅电影感、画面内嵌字幕、弥散式标题
 */
export const CinematicLetterboxSchema: TemplateSchema = {
  id: 'cinematic-letterbox',
  name: 'Cinematic Letterbox',
  category: 'Gallery',
  supportedRatios: ['2:3', 'A4'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden bg-zine-bg',
    children: [
      // 1. 宽画幅图像容器 (Rows 4-13)
      {
        type: 'Container',
        layout: 'absolute',
        modular: { colStart: 1, colSpan: 24, rowStart: 4, rowSpan: 10 },
        className: 'bg-black shadow-lg overflow-hidden p-0 relative',
        children: [
          {
            type: 'Component',
            componentType: 'ZineMedia',
            props: { className: 'w-full h-full object-cover' }
          },
          // 渐变遮罩 (字幕背景)
          {
            type: 'Container',
            layout: 'absolute',
            layoutProps: { inset: 0 },
            className: 'bg-gradient-to-t from-black/40 to-transparent pointer-events-none',
            children: []
          },
          // 画面内字幕 (Body)
          {
            type: 'Component',
            componentType: 'ZineBody',
            modular: { colStart: 3, colSpan: 18, rowStart: 7, rowSpan: 3 },
            bind: 'page.paragraph',
            style: { position: 'absolute', bottom: '24px', left: '48px', right: '48px' },
            props: {
              className: '!text-white !normal-case !text-[0.85rem] drop-shadow-md',
              color: 'surface'
            }
          }
        ]
      },

      // 2. 底部标题组 (Rows 16-22)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'center', justify: 'start' },
        modular: { colStart: 4, colSpan: 18, rowStart: 16, rowSpan: 6 },
        children: [
          // SubHeadline (Top Teaser)
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.subtitle',
            props: { className: '!tracking-[0.6em] opacity-60 mb-6', color: 'secondary' }
          },
          // 细线
          { type: 'Container', className: 'w-full h-px bg-zine-accent/30 mb-8', children: [] },
          // 主标题 (由于 ZineDisplay 是整块的，这里采用 interpolation 处理字间距)
          {
            type: 'Component',
            componentType: 'ZineDisplay',
            bind: 'page.title',
            props: {
              className: 'text-center !uppercase !italic !font-medium !text-[1.35rem] !tracking-[1.5em]',
              color: 'primary'
            }
          }
        ]
      },

      // 3. 底部标签
      {
        type: 'Component',
        componentType: 'ZineCaption',
        bind: 'page.imageLabel',
        modular: { colStart: 2, colSpan: 10, rowStart: 23, rowSpan: 1 },
        style: { position: 'relative', zIndex: 10 },
        props: {
          text: '{page.imageLabel}',
          className: 'text-left opacity-40',
          color: 'secondary'
        }
      }
    ]
  }
};
