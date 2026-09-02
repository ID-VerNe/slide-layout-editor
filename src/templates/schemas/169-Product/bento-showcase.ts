import { TemplateSchema } from '../types';

/**
 * AppleBentoGridSchema - 24x24 模块化迁移
 * 工业感 Bento 布局：严丝合缝的网格切分
 */
export const AppleBentoGridSchema: TemplateSchema = {
  id: 'apple-bento-grid',
  name: 'Bento Showcase',
  category: 'Product',
  supportedRatios: ['16:9'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.sm' },
    className: 'w-full h-full relative p-8 bg-zine-bg',
    children: [
      // 1. 左侧大卡片 (Main Feature)
      {
        type: 'Container',
        layout: 'modular',
        modular: { colStart: 1, colSpan: 16, rowStart: 1, rowSpan: 16 },
        className: 'bg-zine-surface rounded-3xl p-12 relative overflow-hidden group',
        children: [
          {
            type: 'Component',
            componentType: 'ZineDisplay',
            modular: { colStart: 2, colSpan: 20, rowStart: 2, rowSpan: 6 },
            bind: 'page.title',
            props: { size: 6, color: 'primary' }
          },
          {
            type: 'Component',
            componentType: 'ZineMedia',
            modular: { colStart: 1, colSpan: 24, rowStart: 8, rowSpan: 17 },
            props: { className: 'mt-8 !rounded-2xl' }
          }
        ]
      },

      // 2. 右侧顶部卡片
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', justify: 'center', align: 'center' },
        modular: { colStart: 17, colSpan: 8, rowStart: 1, rowSpan: 8 },
        className: 'bg-zine-primary rounded-3xl p-8 text-center',
        children: [
          {
            type: 'Container',
            children: [{
              type: 'Component',
              componentType: 'ZineCaption',
              bind: 'page.metricLabel',
              props: { color: 'accent', className: 'mb-4 opacity-50' }
            }]
          },
          {
            type: 'Container',
            children: [{
              type: 'Component',
              componentType: 'ZineDisplay',
              bind: 'page.metricValue',
              props: { size: 7.5, color: 'surface' }
            }]
          }
        ]
      },

      // 3. 右侧中部卡片
      {
        type: 'Container',
        layout: 'absolute',
        modular: { colStart: 17, colSpan: 8, rowStart: 9, rowSpan: 8 },
        className: 'bg-zine-accent rounded-3xl overflow-hidden',
        children: [
          {
            type: 'Component',
            componentType: 'ZineMedia',
            props: { className: 'w-full h-full grayscale hover:grayscale-0 transition-all duration-700' }
          }
        ]
      },

      // 4. 底部长条卡片
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { align: 'center', justify: 'between' },
        modular: { colStart: 1, colSpan: 24, rowStart: 17, rowSpan: 8 },
        className: 'bg-zine-surface/50 border border-zine-surface rounded-3xl px-12',
        children: [
          {
            type: 'Container',
            children: [{
              type: 'Component',
              componentType: 'ZineBody',
              bind: 'page.paragraph',
              props: { className: 'max-w-md', color: 'secondary' }
            }]
          },
          {
            type: 'Container',
            children: [{
              type: 'Component',
              componentType: 'ZineCaption',
              bind: 'page.subtitle',
              props: { tracking: 0.5, bold: true, sans: true, color: 'primary' }
            }]
          }
        ]
      }
    ]
  }
};
