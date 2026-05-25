import { TemplateSchema } from './types';

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
      // 1. 顶部大图 (Rows 1-16)
      {
        type: 'Container',
        layout: 'absolute',
        modular: { colStart: 1, colSpan: 24, rowStart: 1, rowSpan: 16 },
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
            style: { position: 'absolute', top: '40px', right: '40px', mixBlendMode: 'difference' },
            props: { text: '{page.imageSubLabel || "From Yuu\'s Lens"}', className: '!text-[7.5px] !tracking-[0.6em] !italic opacity-40', color: 'surface' }
          }
        ]
      },

      // 2. 底部标题组 (Rows 18-20)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'center', justify: 'center' },
        modular: { colStart: 4, colSpan: 18, rowStart: 18, rowSpan: 3 },
        children: [
          {
            type: 'Component',
            componentType: 'ZineDisplay',
            bind: 'page.title',
            props: { className: 'text-center !italic !font-light !tracking-[0.2em] !text-[3rem]', color: 'accent' }
          },
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.subtitle',
            props: { className: 'text-center !tracking-[0.8em] uppercase !font-bold opacity-30 mt-4', color: 'accent' }
          }
        ]
      },

      // 3. 底部信息栏 (Rows 22-23)
      {
        type: 'Container',
        layout: 'modular',
        layoutProps: { columns: 24, rows: 2 },
        modular: { colStart: 3, colSpan: 20, rowStart: 22, rowSpan: 2 },
        className: 'border-t border-zine-accent/15 pt-4',
        children: [
          // 左侧：刊号与月份
          {
            type: 'Container',
            layout: 'flex',
            layoutProps: { direction: 'column', align: 'start', justify: 'end' },
            modular: { colStart: 1, colSpan: 10, rowStart: 1, rowSpan: 2 },
            children: [
              { type: 'Component', componentType: 'ZineCaption', props: { text: '{page.imageSubLabel || "VOL.01"}', className: '!text-[10px] opacity-40 uppercase !tracking-widest' } },
              { type: 'Component', componentType: 'ZineDisplay', props: { text: '{page.imageLabel || "JANUARY"}', className: '!text-[1.5rem] !font-medium !tracking-[0.1em] uppercase', color: 'accent' } }
            ]
          },
          // 右侧：年份 (Ghost)
          {
            type: 'Container',
            layout: 'flex',
            layoutProps: { align: 'end', justify: 'end' },
            modular: { colStart: 18, colSpan: 7, rowStart: 1, rowSpan: 2 },
            children: [
              { type: 'Component', componentType: 'ZineDisplay', props: { text: '{page.actionText || "2026"}', className: '!text-[4rem] !font-light !italic !opacity-10 !tracking-tighter leading-none' } }
            ]
          }
        ]
      }
    ]
  }
};
