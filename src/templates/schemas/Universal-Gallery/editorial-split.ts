import { TemplateSchema } from '../types';

/**
 * EditorialSplitSchema - 24x24 模块化迁移
 * 核心：边栏元数据排版、大比例圆角主图、浮动信息面板
 */
export const EditorialSplitSchema: TemplateSchema = {
  id: 'editorial-split',
  name: 'Editorial Split',
  category: 'Gallery',
  supportedRatios: ['2:3', 'A4'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden bg-zine-bg',
    children: [
      {
        type: 'Conditional',
        condition: '{page.layoutVariant === "left"}',
        then: {
          type: 'Container',
          layout: 'modular',
          layoutProps: { columns: 24, rows: 24 },
          className: 'absolute inset-0',
          children: [
            // 1. 右侧边栏 (Cols 17-24)
            {
              type: 'Container',
              layout: 'flex',
              layoutProps: { direction: 'column', align: 'start', justify: 'between' },
              modular: { colStart: 17, colSpan: 8, rowStart: 1, rowSpan: 24 },
              className: 'p-12',
              children: [
                {
                  type: 'Container',
                  layout: 'flex',
                  layoutProps: { direction: 'column', gap: 'spacing.lg' },
                  children: [
                    { type: 'Component', componentType: 'ZineCaption', props: { text: '{page.paragraph || "EDITORIAL METADATA"}', className: '!text-[8px] opacity-40 uppercase !tracking-[0.2em] !leading-loose' } },
                    {
                      type: 'Repeater',
                      bind: 'page.bullets',
                      template: {
                        type: 'Component',
                        componentType: 'ZineCaption',
                        props: { text: '{item}', className: '!text-[10px] !font-bold opacity-60 uppercase mb-2' }
                      }
                    }
                  ]
                },
                {
                  type: 'Container',
                  layout: 'flex',
                  layoutProps: { direction: 'column', gap: 'spacing.sm' },
                  children: [
                    { type: 'Component', componentType: 'ZineCaption', bind: 'page.subtitle', props: { className: '!text-[10px] !font-black uppercase !tracking-[0.4em]', color: 'accent' } },
                    { type: 'Component', componentType: 'ZineDisplay', bind: 'page.title', props: { className: '!text-[3rem] !font-black !tracking-tighter uppercase' } },
                    { type: 'Container', className: 'h-px w-16 bg-zine-accent/20 mt-4', children: [] }
                  ]
                }
              ]
            },
            // 2. 左侧主图 (Cols 1-16)
            {
              type: 'Container',
              layout: 'absolute',
              modular: { colStart: 1, colSpan: 16, rowStart: 1, rowSpan: 24 },
              className: 'p-4',
              children: [
                {
                  type: 'Component',
                  componentType: 'ZineMedia',
                  props: { className: 'w-full h-full object-cover rounded-[3.5rem] shadow-xl' }
                },
                // 浮动面板
                {
                  type: 'Container',
                  layout: 'flex',
                  layoutProps: { direction: 'column', gap: 'spacing.md' },
                  style: { position: 'absolute', bottom: '48px', left: '48px' },
                  className: 'bg-white/95 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-white/50 max-w-[320px]',
                  children: [
                    { type: 'Component', componentType: 'ZineCaption', props: { text: '{page.imageSubLabel || "Information"}', className: '!text-[11px] !font-black uppercase', color: 'primary' } },
                    { type: 'Component', componentType: 'ZineCaption', props: { text: '{page.imageLabel}', className: '!text-sm !font-bold leading-relaxed', color: 'primary' } }
                  ]
                }
              ]
            }
          ]
        },
        else: {
          type: 'Container',
          layout: 'modular',
          layoutProps: { columns: 24, rows: 24 },
          className: 'absolute inset-0',
          children: [
            // 1. 左侧边栏 (Cols 1-8)
            {
              type: 'Container',
              layout: 'flex',
              layoutProps: { direction: 'column', align: 'start', justify: 'between' },
              modular: { colStart: 1, colSpan: 8, rowStart: 1, rowSpan: 24 },
              className: 'p-12',
              children: [
                {
                  type: 'Container',
                  layout: 'flex',
                  layoutProps: { direction: 'column', gap: 'spacing.lg' },
                  children: [
                    { type: 'Component', componentType: 'ZineCaption', props: { text: '{page.paragraph || "EDITORIAL METADATA"}', className: '!text-[8px] opacity-40 uppercase !tracking-[0.2em] !leading-loose' } },
                    {
                      type: 'Repeater',
                      bind: 'page.bullets',
                      template: {
                        type: 'Component',
                        componentType: 'ZineCaption',
                        props: { text: '{item}', className: '!text-[10px] !font-bold opacity-60 uppercase mb-2' }
                      }
                    }
                  ]
                },
                {
                  type: 'Container',
                  layout: 'flex',
                  layoutProps: { direction: 'column', gap: 'spacing.sm' },
                  children: [
                    { type: 'Component', componentType: 'ZineCaption', bind: 'page.subtitle', props: { className: '!text-[10px] !font-black uppercase !tracking-[0.4em]', color: 'accent' } },
                    { type: 'Component', componentType: 'ZineDisplay', bind: 'page.title', props: { className: '!text-[3rem] !font-black !tracking-tighter uppercase' } },
                    { type: 'Container', className: 'h-px w-16 bg-zine-accent/20 mt-4', children: [] }
                  ]
                }
              ]
            },
            // 2. 右侧主图 (Cols 9-24)
            {
              type: 'Container',
              layout: 'absolute',
              modular: { colStart: 9, colSpan: 16, rowStart: 1, rowSpan: 24 },
              className: 'p-4',
              children: [
                {
                  type: 'Component',
                  componentType: 'ZineMedia',
                  props: { className: 'w-full h-full object-cover rounded-[3.5rem] shadow-xl' }
                },
                // 浮动面板
                {
                  type: 'Container',
                  layout: 'flex',
                  layoutProps: { direction: 'column', gap: 'spacing.md' },
                  style: { position: 'absolute', bottom: '48px', right: '48px' },
                  className: 'bg-white/95 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-white/50 max-w-[320px]',
                  children: [
                    { type: 'Component', componentType: 'ZineCaption', props: { text: '{page.imageSubLabel || "Information"}', className: '!text-[11px] !font-black uppercase', color: 'primary' } },
                    { type: 'Component', componentType: 'ZineCaption', props: { text: '{page.imageLabel}', className: '!text-sm !font-bold leading-relaxed', color: 'primary' } }
                  ]
                }
              ]
            }
          ]
        }
      }
    ]
  }
};
