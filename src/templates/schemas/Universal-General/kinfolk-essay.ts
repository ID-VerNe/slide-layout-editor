import { TemplateSchema } from '../types';

/**
 * KinfolkEssaySchema - 24x24 模块化迁移
 * 核心：叙事长文排版、首字下沉、底部网格元数据
 */
export const KinfolkEssaySchema: TemplateSchema = {
  id: 'kinfolk-essay',
  name: 'Kinfolk Essay',
  category: 'General',
  supportedRatios: ['2:3', 'A4'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden bg-zine-bg px-32 py-20',
    children: [
      // 1. 顶部标题栏 (Rows 1-4)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'row', align: 'end', justify: 'between' },
        modular: { colStart: 1, colSpan: 24, rowStart: 1, rowSpan: 4 },
        className: 'border-b-[1.5px] border-zine-accent pb-8',
        children: [
          {
            type: 'Component',
            componentType: 'ZineDisplay',
            bind: 'page.title',
            props: { className: '!text-[3rem] !italic !font-light !tracking-tight text-left' }
          },
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.subtitle',
            props: {
              text: '{page.subtitle || "SHENZHEN / 2026"}',
              className: '!text-[10px] !font-black uppercase !tracking-[0.3em] opacity-40 mb-2'
            }
          }
        ]
      },

      // 2. 中部叙事区 (Rows 6-18)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'center', justify: 'start' },
        modular: { colStart: 1, colSpan: 24, rowStart: 6, rowSpan: 12 },
        className: 'py-12',
        children: [
          {
            type: 'Container',
            layout: 'flex',
            layoutProps: { direction: 'column' },
            className: 'w-full max-w-[90%]',
            children: [
              {
                type: 'Component',
                componentType: 'ZineBody',
                bind: 'page.paragraph',
                props: { className: 'text-justify leading-[1.8]', dropCap: true }
              },
              // 签名
              {
                type: 'Conditional',
                condition: '{page.signature}',
                then: {
                  type: 'Container',
                  className: 'mt-4 self-end',
                  children: [
                    {
                      type: 'Component',
                      componentType: 'ZineMedia',
                      props: { src: '{page.signature}', className: 'h-16 w-auto mix-blend-multiply opacity-80' }
                    }
                  ]
                }
              }
            ]
          }
        ]
      },

      // 3. 底部元数据网格 (Rows 20-24)
      {
        type: 'Container',
        layout: 'modular',
        layoutProps: { columns: 2, rows: 2 },
        modular: { colStart: 1, colSpan: 24, rowStart: 20, rowSpan: 5 },
        className: 'border-t border-zine-accent/15 pt-10',
        children: [
          {
            type: 'Repeater',
            bind: 'page.metrics',
            template: {
              type: 'Container',
              layout: 'flex',
              layoutProps: { direction: 'column', gap: 'spacing.xs' },
              className: 'mb-8',
              children: [
                { type: 'Component', componentType: 'ZineCaption', props: { text: '{item.label}', className: '!text-[9px] !font-black opacity-30 !tracking-[0.4em] uppercase' } },
                { type: 'Component', componentType: 'ZineCaption', props: { text: '{item.value}', className: '!text-xs !font-bold !tracking-tight' } }
              ]
            }
          }
        ]
      }
    ]
  }
};
