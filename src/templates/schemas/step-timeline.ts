import { TemplateSchema } from './types';

/**
 * StepTimelineSchema - 24x24 模块化迁移
 * 核心：垂直流水线构图、左置时间轴、右置视觉卡片
 */
export const StepTimelineSchema: TemplateSchema = {
  id: 'step-timeline',
  name: 'Step Timeline',
  category: 'General',
  supportedRatios: ['2:3', 'A4', '16:9'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden bg-zine-bg px-24',
    children: [
      // 1. 顶部标题组 (Rows 2-5)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'center', justify: 'center', gap: 'spacing.md' },
        modular: { colStart: 4, colSpan: 16, rowStart: 2, rowSpan: 4 },
        children: [
          { type: 'Component', componentType: 'ZineDisplay', bind: 'page.title', props: { className: '!text-[2.5rem] !font-black text-center' } },
          { type: 'Component', componentType: 'ZineCaption', bind: 'page.subtitle', props: { className: 'text-center opacity-60 max-w-2xl', color: 'secondary' } }
        ]
      },

      // 2. 时间轴区域 (Rows 7-23)
      {
        type: 'Container',
        layout: 'modular',
        layoutProps: { columns: 24, rows: 16 },
        modular: { colStart: 1, colSpan: 24, rowStart: 7, rowSpan: 17 },
        children: [
          // 垂直轴线
          {
            type: 'Container',
            layout: 'absolute',
            style: { left: '32px', top: '40px', bottom: '40px', width: '1px' },
            className: 'bg-zine-accent opacity-20',
            children: []
          },
          // 步骤列表
          {
            type: 'Repeater',
            bind: 'page.features',
            template: {
              type: 'Container',
              layout: 'flex',
              layoutProps: { direction: 'row', align: 'center', gap: 'spacing.xl' },
              className: 'mb-8 relative z-10',
              children: [
                // 节点圆圈
                {
                  type: 'Container',
                  className: 'w-16 h-16 rounded-full bg-white border border-zine-accent/20 flex items-center justify-center shrink-0 shadow-sm',
                  children: [{ type: 'Component', componentType: 'ZineCaption', props: { text: '{index + 1}', className: '!font-black', color: 'accent' } }]
                },
                // 文本描述
                {
                  type: 'Container',
                  layout: 'flex',
                  layoutProps: { direction: 'column' },
                  className: 'flex-1',
                  children: [
                    { type: 'Component', componentType: 'ZineCaption', props: { text: '{item.title}', className: '!text-[1.2rem] !font-bold' } },
                    { type: 'Component', componentType: 'ZineBody', props: { text: '{item.desc}', className: '!text-[0.75rem] opacity-60 leading-relaxed', color: 'secondary' } }
                  ]
                },
                // 视觉卡片
                {
                  type: 'Container',
                  className: 'w-[400px] h-32 rounded-[2rem] bg-zine-surface shadow-lg border border-white/50 overflow-hidden shrink-0',
                  children: [{ type: 'Component', componentType: 'ZineMedia', props: { src: '{item.icon}', className: 'w-full h-full object-cover' } }]
                }
              ]
            }
          }
        ]
      }
    ]
  }
};
