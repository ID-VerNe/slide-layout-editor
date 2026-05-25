import { TemplateSchema } from './types';

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
        modular: { colStart: 3, colSpan: 20, rowStart: 4, rowSpan: 16 },
        className: 'bg-zine-surface/60 backdrop-blur-xl rounded-[3.5rem] p-20 shadow-2xl border border-white/40',
        children: [
          // 1. 左侧头像区 (Cols 1-6)
          {
            type: 'Container',
            layout: 'flex',
            layoutProps: { direction: 'column', align: 'center', gap: 'spacing.lg' },
            modular: { colStart: 1, colSpan: 6, rowStart: 1, rowSpan: 18 },
            children: [
              {
                type: 'Component',
                componentType: 'ZineMedia',
                props: { className: 'aspect-square rounded-[3rem] border-[6px] border-white shadow-xl' }
              },
              {
                type: 'Component',
                componentType: 'ZineCaption',
                bind: 'page.imageLabel',
                props: { className: '!text-[10px] opacity-40 uppercase !tracking-widest', color: 'secondary' }
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
                  { type: 'Component', componentType: 'ZineCaption', props: { text: 'LOGO', className: 'opacity-20' } },
                  { type: 'Component', componentType: 'ZineDisplay', bind: 'page.title', props: { className: '!text-[2rem] !font-black !tracking-tight' } }
                ]
              },
              {
                type: 'Component',
                componentType: 'ZineDisplay',
                bind: 'page.subtitle',
                props: { className: '!text-[2.75rem] !leading-[1.3] !tracking-tight !font-black' }
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
                        { type: 'Component', componentType: 'ZineCaption', props: { text: '{item.label}', className: '!text-[9px] opacity-30 uppercase' } },
                        { type: 'Component', componentType: 'ZineCaption', props: { text: '{item.value}', className: '!text-lg !font-bold' } }
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
