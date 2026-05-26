import { TemplateSchema } from '../types';

/**
 * FutureFocusSchema - 24x24 模块化迁移
 * 核心：高冲击力主图、侧边强调栏、错位画廊组件
 */
export const FutureFocusSchema: TemplateSchema = {
  id: 'future-focus',
  name: 'Future Focus',
  category: 'Marketing',
  supportedRatios: ['2:3', 'A4'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden bg-zine-bg',
    children: [
      // 1. 背景装饰 (Ghost Text)
      {
        type: 'Component',
        componentType: 'ZineDisplay',
        modular: { colStart: 18, colSpan: 12, rowStart: 20, rowSpan: 8 },
        props: {
          text: '{page.actionText || "26"}',
          size: 50,
          bold: true,
          italic: true,
          tracking: -0.05,
          leading: 1,
          className: 'opacity-[0.03] pointer-events-none'
        }
      },

      // 2. 主视觉区 (Rows 1-15)
      {
        type: 'Container',
        layout: 'absolute',
        modular: { colStart: 1, colSpan: 24, rowStart: 1, rowSpan: 15 },
        className: 'relative',
        children: [
          {
            type: 'Component',
            componentType: 'ZineMedia',
            props: { className: 'w-full h-full object-cover', imgClassName: 'scale-105' }
          },
          // 渐变遮罩
          {
            type: 'Container',
            className: 'absolute inset-0 bg-gradient-to-t from-black/60 to-transparent',
            children: []
          },
          // 主视觉文字 (Subtitle + Headline)
          {
            type: 'Container',
            layout: 'flex',
            layoutProps: { direction: 'column', align: 'start', justify: 'end' },
            modular: { colStart: 2, colSpan: 20, rowStart: 10, rowSpan: 4 },
            className: 'pb-8 pl-4',
            children: [
              {
                type: 'Component',
                componentType: 'ZineCaption',
                bind: 'page.subtitle',
                props: { 
                  size: 3.6, 
                  italic: true, 
                  bold: true,
                  className: '!text-white mb-2', 
                  color: 'surface' 
                }
              },
              {
                type: 'Component',
                componentType: 'ZineDisplay',
                bind: 'page.title',
                props: { 
                  size: 10, 
                  bold: true,
                  leading: 0.85,
                  tracking: -0.05,
                  className: '!text-white uppercase', 
                  color: 'surface' 
                }
              }
            ]
          }
        ]
      },

      // 3. 排版与画廊区 (Rows 16-24)
      {
        type: 'Container',
        layout: 'modular',
        layoutProps: { columns: 24, rows: 9 },
        modular: { colStart: 1, colSpan: 24, rowStart: 16, rowSpan: 9 },
        className: 'px-8 pt-8',
        children: [
          // 侧边强调栏
          {
            type: 'Container',
            layout: 'flex',
            layoutProps: { direction: 'column', align: 'start' },
            modular: { colStart: 2, colSpan: 12, rowStart: 1, rowSpan: 4 },
            className: 'border-l-[6px] border-zine-accent pl-8 py-2',
            children: [
              {
                type: 'Component',
                componentType: 'ZineCaption',
                bind: 'page.imageSubLabel',
                props: { size: 2.5, italic: true, className: 'opacity-40 mb-1', color: 'secondary' }
              },
              {
                type: 'Component',
                componentType: 'ZineDisplay',
                bind: 'page.imageLabel',
                props: { 
                  size: 6, 
                  bold: true,
                  tracking: -0.05,
                  leading: 1,
                  className: 'uppercase' 
                }
              }
            ]
          },
          // 错位画廊 (Conditional)
          {
            type: 'Conditional',
            condition: '{page.visibility?.gallery !== false}',
            then: {
              type: 'Container',
              layout: 'modular',
              layoutProps: { columns: 12, rows: 8 },
              modular: { colStart: 14, colSpan: 10, rowStart: 1, rowSpan: 8 },
              children: [
                // 圆形图
                {
                  type: 'Container',
                  layout: 'absolute',
                  modular: { colStart: 1, colSpan: 5, rowStart: 1, rowSpan: 5 },
                  className: 'rounded-full border-[5px] border-white shadow-xl overflow-hidden z-30',
                  children: [
                    {
                      type: 'Component',
                      componentType: 'ZineMedia',
                      props: { src: '{page.gallery[0]?.url}', className: 'w-full h-full' }
                    }
                  ]
                },
                // 拍立得卡片
                {
                  type: 'Container',
                  layout: 'modular',
                  layoutProps: { columns: 4, rows: 6 },
                  modular: { colStart: 4, colSpan: 8, rowStart: 3, rowSpan: 6 },
                  className: 'bg-white p-4 shadow-2xl border border-slate-100 z-20 -rotate-3',
                  children: [
                    {
                      type: 'Component',
                      componentType: 'ZineMedia',
                      modular: { colStart: 1, colSpan: 4, rowStart: 1, rowSpan: 4 },
                      props: { src: '{page.gallery[1]?.url}' }
                    },
                    {
                      type: 'Component',
                      componentType: 'ZineCaption',
                      modular: { colStart: 1, colSpan: 4, rowStart: 5, rowSpan: 1 },
                      props: { text: '{page.gallery[1]?.caption || "ARTWORK // 2026"}', className: 'text-center !italic opacity-60', color: 'secondary' }
                    }
                  ]
                }
              ]
            }
          }
        ]
      }
    ]
  }
};
