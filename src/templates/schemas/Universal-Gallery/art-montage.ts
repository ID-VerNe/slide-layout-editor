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
      // 1. 底层大图 (Gallery[1]) - 遵循版心原则
      {
        type: 'Container',
        layout: 'absolute',
        modular: { colStart: 6, colSpan: 16, rowStart: 5, rowSpan: 15 },
        className: 'bg-zine-surface border-[6px] border-zine-surface shadow-2xl z-10 overflow-hidden p-0',
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
        className: 'bg-zine-surface border-[6px] border-zine-surface shadow-xl z-20 overflow-hidden p-0',
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

      // 3. 垂直注脚 - 确保地脚留白
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'start', justify: 'end' },
        modular: { colStart: 1, colSpan: 2, rowStart: 3, rowSpan: 17 },
        className: 'pb-8 pl-4',
        children: [
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.imageLabel',
            style: { writingMode: 'vertical-rl', transform: 'rotate(180deg)' },
            props: {
              className: 'opacity-40',
              tracking: 0.6,
              sans: true,
              color: 'secondary'
            }
          }
        ]
      }
    ]
  }
};
