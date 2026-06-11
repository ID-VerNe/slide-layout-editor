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
                    {
                      type: 'Component',
                      componentType: 'ZineCaption',
                      bind: 'page.paragraph',
                      props: {
                        className: 'opacity-40 uppercase',
                        size: 1,
                        tracking: 0.2,
                        leading: 2,
                        sans: true
                      }
                    },
                    {
                      type: 'Repeater',
                      bind: 'page.bullets',
                      template: {
                        type: 'Component',
                        componentType: 'ZineCaption',
                        props: {
                          text: '{item}',
                          className: 'opacity-60 uppercase mb-2',
                          size: 1.25,
                          bold: true,
                          sans: true
                        }
                      }
                    }
                  ]
                },
                {
                  type: 'Container',
                  layout: 'flex',
                  layoutProps: { direction: 'column', gap: 'spacing.sm' },
                  children: [
                    {
                      type: 'Container',
                      children: [{
                        type: 'Component',
                        componentType: 'ZineCaption',
                        bind: 'page.subtitle',
                        props: {
                          className: 'uppercase',
                          size: 1.25,
                          bold: true,
                          tracking: 0.4,
                          sans: true,
                          color: 'accent'
                        }
                      }]
                    },
                    {
                      type: 'Container',
                      children: [{
                        type: 'Component',
                        componentType: 'ZineDisplay',
                        bind: 'page.title',
                        props: {
                          className: 'uppercase',
                          size: 6,
                          bold: true,
                          tracking: -0.05,
                          serif: true
                        }
                      }]
                    },
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
                    {
                      type: 'Container',
                      children: [{
                        type: 'Component',
                        componentType: 'ZineCaption',
                        bind: 'page.imageSubLabel',
                        props: {
                          className: 'uppercase',
                          size: 1.375,
                          bold: true,
                          sans: true,
                          color: 'primary'
                        }
                      }]
                    },
                    {
                      type: 'Container',
                      children: [{
                        type: 'Component',
                        componentType: 'ZineCaption',
                        bind: 'page.imageLabel',
                        props: {
                          className: '',
                          size: 1.75,
                          bold: true,
                          leading: 1.625,
                          sans: true,
                          color: 'primary'
                        }
                      }]
                    }
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
                    {
                      type: 'Component',
                      componentType: 'ZineCaption',
                      bind: 'page.paragraph',
                      props: {
                        className: 'opacity-40 uppercase',
                        size: 1,
                        tracking: 0.2,
                        leading: 2,
                        sans: true
                      }
                    },
                    {
                      type: 'Repeater',
                      bind: 'page.bullets',
                      template: {
                        type: 'Component',
                        componentType: 'ZineCaption',
                        props: {
                          text: '{item}',
                          className: 'opacity-60 uppercase mb-2',
                          size: 1.25,
                          bold: true,
                          sans: true
                        }
                      }
                    }
                  ]
                },
                {
                  type: 'Container',
                  layout: 'flex',
                  layoutProps: { direction: 'column', gap: 'spacing.sm' },
                  children: [
                    {
                      type: 'Container',
                      children: [{
                        type: 'Component',
                        componentType: 'ZineCaption',
                        bind: 'page.subtitle',
                        props: {
                          className: 'uppercase',
                          size: 1.25,
                          bold: true,
                          tracking: 0.4,
                          sans: true,
                          color: 'accent'
                        }
                      }]
                    },
                    {
                      type: 'Container',
                      children: [{
                        type: 'Component',
                        componentType: 'ZineDisplay',
                        bind: 'page.title',
                        props: {
                          className: 'uppercase',
                          size: 6,
                          bold: true,
                          tracking: -0.05,
                          serif: true
                        }
                      }]
                    },
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
                    {
                      type: 'Container',
                      children: [{
                        type: 'Component',
                        componentType: 'ZineCaption',
                        bind: 'page.imageSubLabel',
                        props: {
                          className: 'uppercase',
                          size: 1.375,
                          bold: true,
                          sans: true,
                          color: 'primary'
                        }
                      }]
                    },
                    {
                      type: 'Container',
                      children: [{
                        type: 'Component',
                        componentType: 'ZineCaption',
                        bind: 'page.imageLabel',
                        props: {
                          className: '',
                          size: 1.75,
                          bold: true,
                          leading: 1.625,
                          sans: true,
                          color: 'primary'
                        }
                      }]
                    }
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

export default EditorialSplitSchema;
