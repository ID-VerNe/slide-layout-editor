import { TemplateSchema } from '../types';

/**
 * EditorialBackCoverSchema - 24x24 模块化迁移
 * 核心：极简谢幕感、微缩排版、大量留白
 */
export const EditorialBackCoverSchema: TemplateSchema = {
  id: 'editorial-back-cover',
  name: 'Editorial Back',
  category: 'Cover',
  supportedRatios: ['2:3', 'A4'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden bg-zine-bg',
    children: [
      // 1. 中央微缩标题 (Rows 11-13)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'center', justify: 'center' },
        modular: { colStart: 6, colSpan: 12, rowStart: 11, rowSpan: 3 },
        children: [
          {
            type: 'Component',
            componentType: 'ZineDisplay',
            bind: 'page.title',
            props: {
              text: 'THANKS',
              className: 'text-center',
              size: 4,
              italic: true,
              tracking: 0.4,
              serif: true,
              color: 'accent'
            }
          }
        ]
      },

      // 2. 底部版权信息 (Rows 21-23)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'center', justify: 'center', gap: 'spacing.md' },
        modular: { colStart: 4, colSpan: 16, rowStart: 21, rowSpan: 3 },
        children: [
          { type: 'Container', className: 'w-6 h-px bg-zine-accent/30', children: [] },
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.subtitle',
            props: {
              text: 'SlideGrid Studio // All Rights Reserved',
              className: 'uppercase text-center',
              size: 0.875,
              tracking: 0.5,
              leading: 2,
              sans: true,
              color: 'secondary'
            }
          }
        ]
      }
    ]
  }
};
