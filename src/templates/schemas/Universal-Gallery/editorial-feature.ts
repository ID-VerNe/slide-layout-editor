import { TemplateSchema } from '../types';

/**
 * KinfolkFeatureSchema - 24x24 模块化迁移
 * 特性：垂直排版、非对称画幅、大面积留白
 */
export const KinfolkFeatureSchema: TemplateSchema = {
  id: 'kinfolk-feature',
  name: 'Editorial Feature',
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
        condition: '{page.layoutVariant === "right"}',
        then: {
          type: 'Container',
          layout: 'modular',
          layoutProps: { columns: 24, rows: 24 },
          className: 'absolute inset-0',
          children: [
            // 1. 右侧大图 (Cols 7-24, Rows 3-18) - 遵循天头原则
            {
              type: 'Container',
              layout: 'absolute',
              modular: { colStart: 7, colSpan: 17, rowStart: 3, rowSpan: 16 },
              className: 'bg-white shadow-xl p-2 border-[0.5px] border-black/5',
              children: [
                {
                  type: 'Component',
                  componentType: 'ZineMedia',
                  props: { className: 'w-full h-full' }
                },
                {
                  type: 'Component',
                  componentType: 'ZineCaption',
                  bind: 'page.imageLabel',
                  style: { position: 'absolute', bottom: '16px', right: '16px', mixBlendMode: 'difference' },
                  props: {
                    className: '!text-white opacity-60',
                    size: 1,
                    sans: true
                  }
                }
              ]
            },
            // 2. 左侧垂直标题 (Cols 1-6)
            {
              type: 'Container',
              layout: 'flex',
              layoutProps: { justify: 'center', align: 'start' },
              modular: { colStart: 1, colSpan: 6, rowStart: 3, rowSpan: 16 },
              className: 'pt-8',
              children: [
                {
                  type: 'Component',
                  componentType: 'ZineDisplay',
                  bind: 'page.title',
                  style: { writingMode: 'vertical-rl' },
                  props: {
                    className: '!normal-case',
                    tracking: 0.15,
                    serif: true
                  }
                }
              ]
            },
            // 3. 底部信息区 - 确保地脚留白
            {
              type: 'Container',
              layout: 'flex',
              layoutProps: { direction: 'column', align: 'end' },
              modular: { colStart: 7, colSpan: 16, rowStart: 20, rowSpan: 2 },
              className: 'pr-8 pt-4',
              children: [
                { type: 'Container', className: 'w-10 h-px bg-zine-accent mb-6', children: [] },
                {
                  type: 'Component',
                  componentType: 'ZineCaption',
                  bind: 'page.subtitle',
                  props: {
                    className: 'text-right',
                    tracking: 0.2,
                    sans: true,
                    color: 'secondary'
                  }
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
            // 1. 左侧大图 (Cols 1-18, Rows 3-18) - 遵循天头原则
            {
              type: 'Container',
              layout: 'absolute',
              modular: { colStart: 2, colSpan: 17, rowStart: 3, rowSpan: 16 },
              className: 'bg-white shadow-xl p-2 border-[0.5px] border-black/5',
              children: [
                {
                  type: 'Component',
                  componentType: 'ZineMedia',
                  props: { className: 'w-full h-full' }
                },
                {
                  type: 'Component',
                  componentType: 'ZineCaption',
                  bind: 'page.imageLabel',
                  style: { position: 'absolute', bottom: '16px', left: '16px', mixBlendMode: 'difference' },
                  props: {
                    className: '!text-white opacity-60',
                    size: 1,
                    sans: true
                  }
                }
              ]
            },
            // 2. 右侧垂直标题 (Cols 19-24)
            {
              type: 'Container',
              layout: 'flex',
              layoutProps: { justify: 'center', align: 'start' },
              modular: { colStart: 19, colSpan: 6, rowStart: 3, rowSpan: 16 },
              className: 'pt-8',
              children: [
                {
                  type: 'Component',
                  componentType: 'ZineDisplay',
                  bind: 'page.title',
                  style: { writingMode: 'vertical-rl' },
                  props: {
                    className: '!normal-case',
                    tracking: 0.15,
                    serif: true
                  }
                }
              ]
            },
            // 3. 底部信息区 - 确保地脚留白
            {
              type: 'Container',
              layout: 'flex',
              layoutProps: { direction: 'column', align: 'start' },
              modular: { colStart: 2, colSpan: 16, rowStart: 20, rowSpan: 2 },
              className: 'pl-8 pt-4',
              children: [
                { type: 'Container', className: 'w-10 h-px bg-zine-accent mb-6', children: [] },
                {
                  type: 'Component',
                  componentType: 'ZineCaption',
                  bind: 'page.subtitle',
                  props: {
                    className: 'text-left',
                    tracking: 0.2,
                    sans: true,
                    color: 'secondary'
                  }
                }
              ]
            }
          ]
        }
      }
    ]
  }
};
