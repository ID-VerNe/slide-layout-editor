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
              text: '{page.title || "THANKS"}',
              className: '!text-[2rem] !italic !font-light !tracking-[0.4em] text-center',
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
              text: '{page.subtitle || "SlideGrid Studio // All Rights Reserved"}',
              className: '!text-[7px] !tracking-[0.5em] uppercase text-center leading-loose',
              color: 'secondary'
            }
          }
        ]
      }
    ]
  }
};
