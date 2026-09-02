import { TemplateSchema } from '../types';

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
      // 1. 宽画幅图像容器 (Rows 5-14) - 遵循天头 2.5格原则
      {
        type: 'Container',
        layout: 'absolute',
        modular: { colStart: 1, colSpan: 24, rowStart: 5, rowSpan: 10 },
        className: 'bg-zine-primary shadow-lg overflow-hidden p-0 relative',
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
              className: 'drop-shadow-md',
              size: 1.7,
              serif: true,
              color: 'surface'
            }
          }
        ]
      },

      // 2. 底部标题组 (Rows 16-19)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'center', justify: 'start' },
        modular: { colStart: 4, colSpan: 18, rowStart: 16, rowSpan: 4 },
        children: [
          // SubHeadline (Top Teaser)
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.subtitle',
            props: {
              className: 'opacity-60 mb-6',
              tracking: 0.6,
              sans: true,
              color: 'secondary'
            }
          },
          // 细线
          { type: 'Container', className: 'w-full h-px bg-zine-accent/30 mb-8', children: [] },
          // 主标题 (由于 ZineDisplay 是整块的，这里采用 interpolation 处理字间距)
          {
            type: 'Component',
            componentType: 'ZineDisplay',
            bind: 'page.title',
            props: {
              className: 'text-center !uppercase',
              italic: true,
              size: 2.7,
              tracking: 1.5,
              serif: true,
              color: 'primary'
            }
          }
        ]
      }
    ]
  }
};
