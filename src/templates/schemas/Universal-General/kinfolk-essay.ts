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
      // 1. 顶部标题栏 (Rows 3-5) - 遵循天头 2.5格原则
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'row', align: 'end', justify: 'between' },
        modular: { colStart: 1, colSpan: 24, rowStart: 3, rowSpan: 3 },
        className: 'border-b-[1.5px] border-zine-accent pb-8',
        children: [
          {
            type: 'Container',
            children: [{
              type: 'Component',
              componentType: 'ZineDisplay',
              bind: 'page.title',
              props: { size: 6, italic: true, tracking: -0.025, align: 'left', serif: true }
            }]
          },
          {
            type: 'Container',
            children: [{
              type: 'Component',
              componentType: 'ZineCaption',
              bind: 'page.subtitle',
              props: {
                size: 1.25,
                bold: true,
                tracking: 0.3,
                sans: true,
                className: 'uppercase opacity-40 mb-2'
              }
            }]
          }
        ]
      },

      // 2. 中部叙事区 (Rows 7-17)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'center', justify: 'start' },
        modular: { colStart: 1, colSpan: 24, rowStart: 7, rowSpan: 11 },
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
                props: { align: 'justify', leading: 1.8, serif: true, dropCap: true }
              },
              // 签名
              {
                type: 'Conditional',
                condition: '{page.signature}',
                then: {
                  type: 'Container',
                  className: 'mt-6 self-end',
                  children: [
                    {
                      type: 'Component',
                      componentType: 'ZineMedia',
                      fieldKey: 'signature',
                      props: {
                        fieldKey: 'signature',
                        className: 'mix-blend-multiply opacity-85',
                        style: { width: '12rem', height: '5rem', objectFit: 'contain' }
                      }
                    }
                  ]
                }
              }
            ]
          }
        ]
      },

      // 3. 底部元数据网格 (Rows 19-20) - 确保地脚留白 4格
      {
        type: 'Container',
        layout: 'modular',
        layoutProps: { columns: 2, rows: 2 },
        modular: { colStart: 1, colSpan: 24, rowStart: 19, rowSpan: 2 },
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
                { type: 'Component', componentType: 'ZineCaption', props: { text: '{item.label}', size: 1.125, bold: true, tracking: 0.4, sans: true, className: 'opacity-30 uppercase' } },
                { type: 'Component', componentType: 'ZineCaption', props: { text: '{item.value}', size: 2.5, bold: true, tracking: -0.025, sans: true } }
              ]
            }
          }
        ]
      }
    ]
  }
};
