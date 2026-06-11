import { TemplateSchema } from '../types';

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
      // 1. 顶部标题组 (Rows 3-5) - 遵循天头原则
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'center', justify: 'center', gap: 'spacing.md' },
        modular: { colStart: 4, colSpan: 16, rowStart: 3, rowSpan: 3 },
        children: [
          { type: 'Container', children: [{ type: 'Component', componentType: 'ZineDisplay', bind: 'page.title', props: { size: 5, bold: true, align: 'center', serif: true } }] },
          { type: 'Container', children: [{ type: 'Component', componentType: 'ZineCaption', bind: 'page.subtitle', props: { align: 'center', color: 'secondary', sans: true, className: 'opacity-60 max-w-2xl' } }] }
        ]
      },

      // 2. 时间轴区域 (Rows 7-20) - 确保地脚留白
      {
        type: 'Container',
        layout: 'modular',
        layoutProps: { columns: 24, rows: 16 },
        modular: { colStart: 1, colSpan: 24, rowStart: 7, rowSpan: 14 },
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
                  children: [{ type: 'Component', componentType: 'ZineCaption', props: { text: '{index + 1}', bold: true, color: 'accent', sans: true } }]
                },
                // 文本描述
                {
                  type: 'Container',
                  layout: 'flex',
                  layoutProps: { direction: 'column' },
                  className: 'flex-1',
                  children: [
                    { type: 'Component', componentType: 'ZineCaption', props: { text: '{item.title}', size: 2.4, bold: true, sans: true } },
                    { type: 'Component', componentType: 'ZineBody', props: { text: '{item.desc}', size: 1.5, leading: 1.625, color: 'secondary', serif: true, className: 'opacity-60' } }
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
