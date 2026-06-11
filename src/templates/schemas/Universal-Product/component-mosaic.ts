import { TemplateSchema } from '../types';

/**
 * ComponentMosaicSchema - 24x24 模块化迁移
 * 核心：网格化组件展示、左文右图（组件阵列）、工业化堆叠感
 */
export const ComponentMosaicSchema: TemplateSchema = {
  id: 'component-mosaic',
  name: 'Component Mosaic',
  category: 'Product',
  supportedRatios: ['2:3', 'A4', '16:9'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden bg-zine-bg px-20',
    children: [
      // 1. Logo (Top Left)
      {
        type: 'Component',
        componentType: 'ZineCaption',
        bind: 'page.logo',
        modular: { colStart: 1, colSpan: 6, rowStart: 2, rowSpan: 1 },
        props: { bold: true, tracking: 0.1, className: 'opacity-20 uppercase', sans: true }
      },

      // 2. 左侧文字区 (Cols 1-10)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'start', justify: 'center', gap: 'spacing.xl' },
        modular: { colStart: 1, colSpan: 10, rowStart: 1, rowSpan: 24 },
        children: [
          {
            type: 'Container',
            children: [{
              type: 'Component',
              componentType: 'ZineDisplay',
              bind: 'page.title',
              props: { size: 8, bold: true, tracking: -0.05, serif: true }
            }]
          },
          {
            type: 'Container',
            children: [{
              type: 'Component',
              componentType: 'ZineCaption',
              bind: 'page.subtitle',
              props: { color: 'secondary', sans: true, className: 'max-w-md' }
            }]
          },
          {
            type: 'Container',
            children: [{
              type: 'Component',
              componentType: 'ZineCaption',
              bind: 'page.imageLabel',
              props: { tracking: 0.4, color: 'accent', sans: true, className: 'opacity-40 uppercase' }
            }]
          }
        ]
      },

      // 3. 右侧网格区 (Cols 12-24)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'center', justify: 'center', gap: 'spacing.md' },
        modular: { colStart: 12, colSpan: 12, rowStart: 1, rowSpan: 24 },
        children: [
          {
            type: 'Container',
            className: 'grid grid-cols-4 gap-4 w-full',
            children: [
              // 这里简化为固定 16 个格子的 Repeater 逻辑
              // 实际生产中应根据 page.mosaicConfig 动态生成
              {
                type: 'Repeater',
                bind: 'page.mosaicItems',
                template: {
                  type: 'Container',
                  className: 'aspect-square bg-zine-surface rounded-2xl shadow-sm border border-black/[0.03] flex items-center justify-center hover:-translate-y-1 transition-all',
                  children: [
                    {
                      type: 'Component',
                      componentType: 'ZineCaption',
                      bind: 'item.label',
                      props: { size: 1, className: 'opacity-20', sans: true }
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    ]
  }
};
