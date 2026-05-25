import { TemplateSchema } from './types';

/**
 * ModernFeatureSchema - 24x24 模块化迁移
 * 核心：经典 1/3 与 2/3 分割、极简工业风、左文右图
 */
export const ModernFeatureSchema: TemplateSchema = {
  id: 'modern-feature',
  name: 'Modern Feature',
  category: 'Product',
  supportedRatios: ['2:3', 'A4', '16:9'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden bg-zine-bg px-32',
    children: [
      // 1. Logo (Top Left)
      {
        type: 'Component',
        componentType: 'ZineCaption',
        modular: { colStart: 1, colSpan: 6, rowStart: 2, rowSpan: 1 },
        props: { text: 'BRAND LOGO', className: '!font-black !tracking-widest opacity-20' }
      },

      // 2. 左侧文字区 (Cols 1-8)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'start', justify: 'center', gap: 'spacing.xl' },
        modular: { colStart: 1, colSpan: 8, rowStart: 1, rowSpan: 24 },
        className: 'z-10',
        children: [
          {
            type: 'Component',
            componentType: 'ZineDisplay',
            bind: 'page.title',
            props: { className: '!text-[4rem] !font-black !tracking-tighter leading-tight' }
          },
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.subtitle',
            props: { className: 'max-w-sm', color: 'secondary' }
          },
          {
            type: 'Component',
            componentType: 'ZineCaption',
            props: { text: '{page.imageLabel}', className: 'mt-4 opacity-40 uppercase !tracking-[0.4em]', color: 'accent' }
          }
        ]
      },

      // 3. 右侧图片区 (Cols 10-24)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'center', justify: 'center' },
        modular: { colStart: 10, colSpan: 15, rowStart: 1, rowSpan: 24 },
        className: 'pl-12',
        children: [
          {
            type: 'Component',
            componentType: 'ZineMedia',
            props: { className: 'w-full h-[75%] shadow-sm' }
          },
          {
            type: 'Component',
            componentType: 'ZineCaption',
            props: { text: '{page.imageSubLabel}', className: 'mt-6 opacity-30 italic', color: 'secondary' }
          }
        ]
      }
    ]
  }
};
