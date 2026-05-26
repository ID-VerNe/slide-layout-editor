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
            modular: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 1 },
            props: {
              text: '{page.title || "P I L O G U E"}',
              className: '!tracking-[1em] opacity-30 !font-black !text-[12px]',
              color: 'primary'
            }
          },
          // 中下部信息块 (Container for alignment)
          {
            type: 'Container',
            layout: 'flex',
            layoutProps: { direction: 'column', align: 'start', justify: 'end' },
            modular: { colStart: 1, colSpan: 12, rowStart: 12, rowSpan: 12 },
            className: 'pb-10 pr-8',
            children: [
              // Metrics (这里采用自定义 Container 模拟网格)
              {
                type: 'Container',
                className: 'grid grid-cols-2 gap-x-12 gap-y-6 border-b pb-8 border-zine-accent/15 w-full',
                children: [
                  {
                    type: 'Repeater',
                    bind: 'page.metrics',
                    template: {
                      type: 'Container',
                      layout: 'flex',
                      layoutProps: { direction: 'column', gap: 'spacing.xs' },
                      children: [
                        { type: 'Component', componentType: 'ZineCaption', props: { text: '{item.label}', className: '!text-[9px] opacity-25 !tracking-[0.3em] font-black' } },
                        { type: 'Component', componentType: 'ZineCaption', props: { text: '{item.value}', className: '!text-[12px] !font-medium font-mono' } }
                      ]
                    }
                  }
                ]
              },
              // 段落
              {
                type: 'Component',
                componentType: 'ZineBody',
                bind: 'page.paragraph',
                props: { className: 'mt-6 !text-[14px] !italic opacity-60 font-mono text-justify', color: 'secondary' }
              },
              // 签名 (If exists)
              {
                type: 'Conditional',
                condition: '{page.signature}',
                then: {
                  type: 'Container',
                  className: 'mt-8 self-end',
                  children: [
                    {
                      type: 'Component',
                      componentType: 'ZineMedia',
                      props: {
                        src: '{page.signature}',
                        className: 'h-16 w-auto mix-blend-multiply opacity-80'
                      }
                    }
                  ]
                }
              }
            ]
          }
        ]
      },

      // 2. 右侧立柱图像 (Rows 1-24, Cols 13-24)
      {
        type: 'Container',
        layout: 'absolute',
        modular: { colStart: 13, colSpan: 12, rowStart: 3, rowSpan: 20 },
        className: 'bg-white p-4',
        children: [
          {
            type: 'Component',
            componentType: 'ZineMedia',
            props: { className: 'w-full h-full object-cover shadow-lg' }
          }
        ]
      },

      // 3. 底部标签
      {
        type: 'Component',
        componentType: 'ZineCaption',
        modular: { colStart: 2, colSpan: 10, rowStart: 23, rowSpan: 1 },
        props: {
          text: '{page.imageLabel}',
          className: 'text-left opacity-30 !text-[9px]',
          color: 'secondary'
        }
      }
    ]
  }
};
