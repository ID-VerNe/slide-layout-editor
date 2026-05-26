import { TemplateSchema } from '../types';

/**
 * MicroAnchorSchema - 24x24 模块化迁移
 * 极端留白设计：将锚点控制在网格的关键交汇处
 */
export const MicroAnchorSchema: TemplateSchema = {
  id: 'micro-anchor',
  name: 'Micro Anchor',
  category: 'Gallery',
  supportedRatios: ['2:3'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden',
    children: [
      // 1. 顶部极简装饰文本
      {
        type: 'Component',
        componentType: 'ZineCaption',
        modular: { colStart: 1, colSpan: 24, rowStart: 7, rowSpan: 1 },
        props: {
          text: '{page.title || "THE SILENCE OF THE FRAME"}',
          className: '!italic !font-bold !tracking-[0.6em] !opacity-20 text-center',
          style: { fontSize: '10px' }
        }
      },

      // 2. 悬浮媒体容器 (使用 Conditional 处理左右变体)
      {
        type: 'Container',
        layout: 'modular',
        layoutProps: { columns: 24, rows: 24 },
        className: 'absolute inset-0',
        children: [
          {
            type: 'Conditional',
            condition: '{page.layoutVariant === "right"}',
            then: {
              type: 'Container',
              layout: 'flex',
              layoutProps: { direction: 'column', align: 'end' },
              modular: { colStart: 15, colSpan: 8, rowStart: 10, rowSpan: 13 },
              children: [
                {
                  type: 'Component',
                  componentType: 'ZineMedia',
                  props: { className: 'aspect-[3/4] shadow-xl w-full' }
                },
                {
                  type: 'Component',
                  componentType: 'ZineCaption',
                  bind: 'page.subtitle',
                  props: {
                    className: 'mt-6 !tracking-[0.2em] !font-bold !text-right',
                    color: 'secondary'
                  }
                }
              ]
            },
            else: {
              type: 'Container',
              layout: 'flex',
              layoutProps: { direction: 'column', align: 'start' },
              modular: { colStart: 2, colSpan: 8, rowStart: 10, rowSpan: 13 },
              children: [
                {
                  type: 'Component',
                  componentType: 'ZineMedia',
                  props: { className: 'aspect-[3/4] shadow-xl w-full' }
                },
                {
                  type: 'Component',
                  componentType: 'ZineCaption',
                  bind: 'page.subtitle',
                  props: {
                    className: 'mt-6 !tracking-[0.2em] !font-bold !text-left',
                    color: 'secondary'
                  }
                }
              ]
            }
          }
        ]
      }
    ]
  }
};
