import { TemplateSchema } from '../types';

/**
 * EditorialClassicSchema - 24x24 模块化迁移
 * 核心：经典杂志分屏、底部多维信息栏、大比例主图
 */
export const EditorialClassicSchema: TemplateSchema = {
  id: 'editorial-classic',
  name: 'Editorial Classic',
  category: 'Cover',
  supportedRatios: ['2:3', 'A4'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden bg-zine-bg',
    children: [
      // 1. 顶部大图 (Rows 1-15) - 遵循天头原则
      {
        type: 'Container',
        layout: 'absolute',
        modular: { colStart: 1, colSpan: 24, rowStart: 1, rowSpan: 15 },
        children: [
          {
            type: 'Component',
            componentType: 'ZineMedia',
            props: { className: 'w-full h-full object-cover' }
          },
          // 悬浮装饰文字 (Top Right)
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.imageSubLabel',
            style: { position: 'absolute', top: '40px', right: '40px', mixBlendMode: 'difference' },
            props: { size: 0.9375, tracking: 0.6, italic: true, className: 'opacity-40', color: 'surface' }
          }
        ]
      },

      // 2. 底部标题组 (Rows 17-19)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'center', justify: 'center' },
        modular: { colStart: 4, colSpan: 18, rowStart: 17, rowSpan: 3 },
        children: [
          {
            type: 'Container',
            children: [{
              type: 'Component',
              componentType: 'ZineDisplay',
              bind: 'page.title',
              props: { align: 'center', italic: true, tracking: 0.2, size: 6, color: 'accent' }
            }]
          },
          {
            type: 'Container',
            children: [{
              type: 'Component',
              componentType: 'ZineCaption',
              bind: 'page.subtitle',
              props: { align: 'center', tracking: 0.8, bold: true, className: 'uppercase opacity-30 mt-4', color: 'accent' }
            }]
          }
        ]
      },

      // 3. 底部信息栏 (Rows 21-22) - 确保地脚留白
      {
        type: 'Container',
        layout: 'modular',
        layoutProps: { columns: 24, rows: 2 },
        modular: { colStart: 3, colSpan: 20, rowStart: 21, rowSpan: 2 },
        className: 'border-t border-zine-accent/15 pt-4',
        children: [
          // 左侧：刊号与月份
          {
            type: 'Container',
            layout: 'flex',
            layoutProps: { direction: 'column', align: 'start', justify: 'end' },
            modular: { colStart: 1, colSpan: 10, rowStart: 1, rowSpan: 2 },
            children: [
              { type: 'Container', children: [{ type: 'Component', componentType: 'ZineCaption', bind: 'page.imageSubLabel', props: { size: 1.25, tracking: 0.1, className: 'opacity-40 uppercase' } }] },
              { type: 'Container', children: [{ type: 'Component', componentType: 'ZineDisplay', bind: 'page.imageLabel', props: { size: 3, tracking: 0.1, className: 'uppercase', color: 'accent' } }] }
            ]
          },
          // 右侧：年份 (Ghost)
          {
            type: 'Container',
            layout: 'flex',
            layoutProps: { align: 'end', justify: 'end' },
            modular: { colStart: 18, colSpan: 7, rowStart: 1, rowSpan: 2 },
            children: [
              { type: 'Component', componentType: 'ZineDisplay', bind: 'page.actionText', props: { size: 8, italic: true, tracking: -0.05, className: 'opacity-10 leading-none' } }
            ]
          }
        ]
      }
    ]
  }
};
