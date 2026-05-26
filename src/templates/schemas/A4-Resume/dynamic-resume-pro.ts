import { TemplateSchema } from '../types';

/**
 * AcademicHybridResumeSchema - 24x24 模块化迁移
 * 核心：工业级简历排版、A4 适配、原子化简历块
 */
export const AcademicHybridResumeSchema: TemplateSchema = {
  id: 'academic-hybrid-resume',
  name: 'Dynamic Resume Pro',
  category: 'Resume',
  supportedRatios: ['A4'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden bg-white text-slate-800 px-[60px] py-[60px]',
    children: [
      // 1. 头部 (Rows 1-4)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'center', justify: 'center' },
        modular: { colStart: 1, colSpan: 24, rowStart: 1, rowSpan: 4 },
        className: 'mb-12',
        children: [
          {
            type: 'Component',
            componentType: 'ZineDisplay',
            bind: 'page.title',
            props: { className: '!text-[38px] !font-black !tracking-tighter uppercase mb-4' }
          },
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.subtitle',
            props: { className: '!text-[11px] !font-bold text-slate-500 uppercase !tracking-widest leading-relaxed' }
          }
        ]
      },

      // 2. 主体简历区 (Rows 5-22)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column' },
        modular: { colStart: 1, colSpan: 24, rowStart: 5, rowSpan: 18 },
        className: 'overflow-y-auto no-scrollbar',
        children: [
          {
            type: 'Component',
            componentType: 'ZineResume',
            props: { className: 'w-full' }
          }
        ]
      },

      // 3. 页脚 (Rows 23-24)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'row', align: 'center', justify: 'between' },
        modular: { colStart: 1, colSpan: 24, rowStart: 23, rowSpan: 2 },
        className: 'mt-auto pt-8 opacity-20 border-t border-slate-100',
        children: [
          {
            type: 'Component',
            componentType: 'ZineCaption',
            props: { text: 'CV — {page.title || "NAME"}', className: '!text-[10px] uppercase font-black tracking-[0.4em]' }
          },
          {
            type: 'Component',
            componentType: 'ZineCaption',
            props: { text: 'Academic Edition', className: '!text-[10px] uppercase font-black' }
          }
        ]
      }
    ]
  }
};
