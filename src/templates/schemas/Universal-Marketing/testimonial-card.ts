import { TemplateSchema } from '../types';

/**
 * TestimonialCardSchema - 24x24 模块化迁移
 * 核心：圆角卡片构图、侧边头像、动态引言与数据
 */
export const TestimonialCardSchema: TemplateSchema = {
  id: 'testimonial-card',
  name: 'Testimonial Card',
  category: 'Marketing',
  supportedRatios: ['2:3', 'A4', '16:9'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden bg-zine-bg flex items-center justify-center',
    children: [
      {
        type: 'Container',
        layout: 'modular',
        layoutProps: { columns: 20, rows: 18 },
        modular: { colStart: 3, colSpan: 20, rowStart: 4, rowSpan: 17 },
        className: 'bg-zine-surface/60 backdrop-blur-xl rounded-[3.5rem] p-20 shadow-2xl border border-zine-accent/15',
        children: [
          // 1. 左侧头像区 (Cols 1-6)
          {
            type: 'Container',
            layout: 'flex',
            layoutProps: { direction: 'column', align: 'center', gap: 'spacing.lg' },
            modular: { colStart: 1, colSpan: 6, rowStart: 1, rowSpan: 18 },
            children: [
              {
                type: 'Container',
                children: [{
                  type: 'Component',
                  componentType: 'ZineMedia',
                  props: { className: 'aspect-square rounded-[3rem] border-[6px] border-zine-surface shadow-xl' }
                }]
              },
              {
                type: 'Container',
                children: [{
                  type: 'Component',
                  componentType: 'ZineCaption',
                  bind: 'page.imageLabel',
                  props: { size: 1.25, tracking: 0.1, color: 'secondary', sans: true, className: 'opacity-40 uppercase' }
                }]
              }
            ]
          },
          // 2. 右侧内容区 (Cols 8-20)
          {
            type: 'Container',
            layout: 'flex',
            layoutProps: { direction: 'column', justify: 'center', gap: 'spacing.xl' },
            modular: { colStart: 8, colSpan: 12, rowStart: 1, rowSpan: 18 },
            children: [
              {
                type: 'Container',
                layout: 'flex',
                layoutProps: { direction: 'row', align: 'center', gap: 'spacing.md' },
                children: [
                  { type: 'Container', children: [{ type: 'Component', componentType: 'ZineCaption', bind: 'page.logo', props: { className: 'opacity-20', sans: true } }] },
                  { type: 'Container', children: [{ type: 'Component', componentType: 'ZineDisplay', bind: 'page.title', props: { size: 4, bold: true, tracking: -0.025, serif: true } }] }
                ]
              },
              {
                type: 'Component',
                componentType: 'ZineDisplay',
                bind: 'page.subtitle',
                props: { size: 5.5, leading: 1.3, tracking: -0.025, bold: true, serif: true }
              },
              { type: 'Container', className: 'h-px w-full bg-zine-accent/10 my-8', children: [] },
              {
                type: 'Container',
                layout: 'modular',
                layoutProps: { columns: 3, rows: 1 },
                children: [
                  {
                    type: 'Repeater',
                    bind: 'page.metrics',
                    template: {
                      type: 'Container',
                      layout: 'flex',
                      layoutProps: { direction: 'column' },
                      children: [
                        { type: 'Component', componentType: 'ZineCaption', props: { text: '{item.label}', size: 1.125, className: 'opacity-30 uppercase', sans: true } },
                        { type: 'Component', componentType: 'ZineCaption', props: { text: '{item.value}', size: 2.25, bold: true, sans: true } }
                      ]
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
};
