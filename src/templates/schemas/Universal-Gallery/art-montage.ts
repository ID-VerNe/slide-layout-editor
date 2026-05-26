import { TemplateSchema } from '../types';

/**
 * KinfolkMontageSchema - 24x24 模块化迁移
 * 核心：错位双图拼贴、垂直侧标
 */
export const KinfolkMontageSchema: TemplateSchema = {
  id: 'kinfolk-montage',
  name: 'Art Montage',
  category: 'Gallery',
  supportedRatios: ['2:3', 'A4'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden bg-zine-bg',
    children: [
      // 1. 底层大图 (Gallery[1])
      {
        type: 'Container',
        layout: 'absolute',
        modular: { colStart: 6, colSpan: 18, rowStart: 6, rowSpan: 18 },
        className: 'bg-white border-[6px] border-white shadow-2xl z-10 overflow-hidden p-0',
        children: [
          {
            type: 'Component',
            componentType: 'ZineMedia',
            props: { 
              src: '{page.gallery[1]?.url}', 
              config: '{page.gallery[1]?.config}',
              className: 'w-full h-full' 
            }
          }
        ]
      },

      // 2. 顶层小图 (Gallery[0])
      {
        type: 'Container',
        layout: 'absolute',
        modular: { colStart: 2, colSpan: 14, rowStart: 3, rowSpan: 11 },
        className: 'bg-white border-[6px] border-white shadow-xl z-20 overflow-hidden p-0',
        children: [
          {
            type: 'Component',
            componentType: 'ZineMedia',
            props: { 
              src: '{page.gallery[0]?.url}', 
              config: '{page.gallery[0]?.config}',
              className: 'w-full h-full grayscale-[0.05] hover:grayscale-0 transition-all duration-1000' 
            }
          }
        ]
      },

      // 3. 垂直注脚
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'start', justify: 'end' },
        modular: { colStart: 1, colSpan: 2, rowStart: 1, rowSpan: 23 },
        className: 'pb-8 pl-4',
        children: [
          {
            type: 'Component',
            componentType: 'ZineCaption',
            style: { writingMode: 'vertical-rl', transform: 'rotate(180deg)' },
            props: {
              text: '{page.imageLabel || "SCENE 04 — THE TOUCH"}',
              className: '!tracking-[0.6em] opacity-40',
              color: 'secondary'
            }
          }
        ]
      }
    ]
  }
};
