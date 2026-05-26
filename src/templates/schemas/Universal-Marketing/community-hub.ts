import { TemplateSchema } from '../types';

/**
 * CommunityHubSchema - 24x24 模块化迁移
 * 核心：社区愿景控制区、层叠式证言列表、多维合作伙伴展示
 */
export const CommunityHubSchema: TemplateSchema = {
  id: 'community-hub',
  name: 'Community Hub',
  category: 'Marketing',
  supportedRatios: ['2:3', 'A4', '16:9'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden bg-zine-bg',
    children: [
      // 1. 左侧控制区 (Cols 1-11)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'start', justify: 'center', gap: 'spacing.xl' },
        modular: { colStart: 1, colSpan: 11, rowStart: 1, rowSpan: 24 },
        className: 'bg-white shadow-2xl px-16 relative z-10',
        children: [
          { type: 'Component', componentType: 'ZineCaption', props: { text: 'BRAND LOGO', className: 'opacity-20' } },
          {
            type: 'Container',
            layout: 'flex',
            layoutProps: { direction: 'column', gap: 'spacing.lg' },
            children: [
              { type: 'Component', componentType: 'ZineDisplay', bind: 'page.title', props: { className: '!text-[3.5rem] !font-black !tracking-tighter' } },
              { type: 'Component', componentType: 'ZineCaption', bind: 'page.subtitle', props: { className: 'text-lg', color: 'secondary' } },
              { type: 'Component', componentType: 'ZineCaption', props: { text: '{page.imageLabel}', className: 'mt-4 px-8 py-3 bg-zine-accent/10 rounded-full', color: 'accent' } }
            ]
          },
          // 合作伙伴 (Partners)
          {
            type: 'Container',
            layout: 'flex',
            layoutProps: { direction: 'column', gap: 'spacing.md' },
            className: 'pt-12 border-t border-zine-accent/10 w-full',
            children: [
              { type: 'Component', componentType: 'ZineCaption', props: { text: '{page.partnersTitle || "POWERED BY"}', className: '!text-[10px] opacity-40 uppercase !tracking-widest' } },
              {
                type: 'Repeater',
                bind: 'page.partners',
                template: {
                  type: 'Component',
                  componentType: 'ZineCaption',
                  props: { text: '{item.name}', className: '!text-xs font-black' }
                }
              }
            ]
          }
        ]
      },

      // 2. 右侧证言区 (Cols 12-24)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'center', justify: 'center', gap: 'spacing.lg' },
        modular: { colStart: 12, colSpan: 13, rowStart: 1, rowSpan: 24 },
        className: 'bg-slate-50/50 px-12 relative',
        children: [
          // 背景装饰
          { type: 'Container', className: 'absolute inset-0 opacity-[0.02] pointer-events-none', style: { backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }, children: [] },
          // 证言卡片
          {
            type: 'Repeater',
            bind: 'page.testimonials',
            template: {
              type: 'Container',
              layout: 'flex',
              layoutProps: { direction: 'row', align: 'start', gap: 'spacing.md' },
              className: 'p-8 bg-white rounded-[2rem] shadow-sm border border-white max-w-full',
              children: [
                { type: 'Container', className: 'w-12 h-12 rounded-full bg-slate-100 shrink-0', children: [] },
                {
                  type: 'Container',
                  layout: 'flex',
                  layoutProps: { direction: 'column', gap: 'spacing.xs' },
                  children: [
                    { type: 'Component', componentType: 'ZineCaption', props: { text: '{item.name}', className: '!font-black' } },
                    { type: 'Component', componentType: 'ZineBody', props: { text: '"{item.quote}"', className: '!text-[0.75rem] opacity-60' } }
                  ]
                }
              ]
            }
          }
        ]
      }
    ]
  }
};
