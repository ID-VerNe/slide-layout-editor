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
    className: 'w-full h-full relative p-0 overflow-hidden bg-zine-bg text-zine-primary px-16 py-16',
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
            type: 'Container',
            children: [{
              type: 'Component',
              componentType: 'ZineDisplay',
              bind: 'page.title',
              props: {
                className: 'uppercase mb-4',
                size: 4.75,
                bold: true,
                tracking: -0.05,
                serif: true,
                color: 'primary'
              }
            }]
          },
          {
            type: 'Container',
            children: [{
              type: 'Component',
              componentType: 'ZineCaption',
              bind: 'page.subtitle',
              props: {
                className: 'uppercase opacity-60',
                color: 'secondary',
                size: 1.375,
                bold: true,
                tracking: 0.1,
                leading: 1.625,
                sans: true
              }
            }]
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
        className: 'mt-auto pt-8 border-t border-zine-accent/15',
        children: [
          {
            type: 'Container',
            children: [{
              type: 'Component',
              componentType: 'ZineCaption',
              bind: 'page.footer',
              props: {
                className: 'uppercase',
                size: 1.25,
                bold: true,
                tracking: 0.4,
                sans: true
              }
            }]
          },
          {
            type: 'Container',
            children: [{
              type: 'Component',
              componentType: 'ZineCaption',
              bind: 'page.edition',
              props: {
                className: 'uppercase',
                size: 1.25,
                bold: true,
                sans: true
              }
            }]
          }
        ]
      }
    ]
  }
};
