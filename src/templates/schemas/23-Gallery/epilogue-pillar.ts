import { TemplateSchema } from '../types';

/**
 * EpiloguePillarSchema - 24x24 模块化迁移
 * 核心：瘦高立柱图像、极简档案感、版块化信息排列
 */
export const EpiloguePillarSchema: TemplateSchema = {
  id: 'epilogue-pillar',
  name: 'Epilogue Pillar',
  category: 'Gallery',
  supportedRatios: ['2:3', 'A4'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden bg-zine-bg',
    children: [
      // 1. 左侧文本区 (Rows 1-24, Cols 1-12)
      {
        type: 'Container',
        layout: 'modular',
        layoutProps: { columns: 12, rows: 24 },
        modular: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 24 },
        className: 'px-16 py-20',
        children: [
          // 顶部标题
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.title',
            modular: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 1 },
            props: {
              tracking: 1,
              size: 1.5,
              bold: true,
              sans: true,
              className: 'opacity-30',
              color: 'primary'
            }
          },
          // 中下部信息块 (Container for alignment)
          {
            type: 'Container',
            layout: 'flex',
            layoutProps: { direction: 'column', align: 'start', justify: 'end' },
            modular: { colStart: 1, colSpan: 12, rowStart: 16, rowSpan: 10 },
            className: 'pb-10 pr-8',
            children: [
              // 1. Metrics (使用 BigDataMetrics 组件，从右下到左上填充)
              {
                type: 'Container',
                className: 'border-b pb-8 mb-8 border-zine-accent/15 w-full mt-auto',
                children: [
                  {
                    type: 'Component',
                    componentType: 'BigDataMetrics',
                    bind: 'page.metrics',
                    props: {
                      fillOrder: 'bottom-right-to-top-left',
                      gap: '1.5rem'
                    }
                  }
                ]
              },
              // 2. 段落
              {
                type: 'Component',
                componentType: 'ZineBody',
                bind: 'page.paragraph',
                props: { size: 1.75, italic: true, align: 'justify', serif: true, className: 'mb-8 opacity-60 font-mono', color: 'secondary' }
              },
              // 3. 签名 (If exists)
              {
                type: 'Conditional',
                condition: '{page.signature}',
                then: {
                  type: 'Container',
                  className: 'self-end',
                  children: [
                    {
                        type: 'Component',
                        componentType: 'ZineMedia',
                        props: {
                          fieldKey: 'signature',
                          className: 'mix-blend-multiply opacity-80',
                          style: { width: '15rem', height: '8rem', objectFit: 'contain' }
                        }
                    }
                  ]
                }
              }
            ]
          }
        ]
      },

      // 2. 右侧立柱图像 (Rows 3-22, Cols 13-24)
      {
        type: 'Component',
        componentType: 'ZineMedia',
        modular: { colStart: 13, colSpan: 12, rowStart: 3, rowSpan: 20 },
        props: { className: 'w-full h-full object-cover' }
      },

      // 3. Footer (底部元数据)
      {
        type: 'Component',
        componentType: 'ZineFooter',
        bind: 'page.footer',
        modular: { colStart: 1, colSpan: 24, rowStart: 24, rowSpan: 1 },
        props: {
          align: 'left',
          size: 1,
          className: 'px-16'
        }
      }
    ]
  }
};
