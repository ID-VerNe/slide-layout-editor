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
        modular: { colStart: 1, colSpan: 6, rowStart: 2, rowSpan: 1 },
        props: { text: 'BRAND LOGO', className: '!font-black !tracking-widest opacity-20' }
      },

      // 2. 左侧文字区 (Cols 1-10)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'start', justify: 'center', gap: 'spacing.xl' },
        modular: { colStart: 1, colSpan: 10, rowStart: 1, rowSpan: 24 },
        children: [
          {
            type: 'Component',
            componentType: 'ZineDisplay',
            bind: 'page.title',
            props: { className: '!text-[4rem] !font-black !tracking-tighter' }
          },
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.subtitle',
            props: { className: 'max-w-md', color: 'secondary' }
          },
          {
            type: 'Component',
            componentType: 'ZineCaption',
            props: { text: '{page.imageLabel}', className: 'opacity-40 uppercase !tracking-[0.4em]', color: 'accent' }
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
                      props: { text: 'ICON', className: '!text-[8px] opacity-20' }
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
