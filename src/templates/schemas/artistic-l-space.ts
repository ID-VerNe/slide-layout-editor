import { TemplateSchema } from './types';

/**
 * ArtisticLSpaceSchema - 24x24 模块化迁移
 * 核心：L型负空间、出血大图、垂直字符排版
 */
export const ArtisticLSpaceSchema: TemplateSchema = {
  id: 'artistic-l-space',
  name: 'Artistic L-Space',
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
            // 1. 左侧大图 (Cols 1-18, Rows 7-24)
            {
              type: 'Container',
              layout: 'absolute',
              modular: { colStart: 1, colSpan: 18, rowStart: 7, rowSpan: 18 },
              children: [{ type: 'Component', componentType: 'ZineMedia', props: { className: 'w-full h-full' } }]
            },
            // 2. 右侧垂直标题 (Cols 19-24)
            {
              type: 'Container',
              layout: 'flex',
              layoutProps: { direction: 'column', align: 'center', justify: 'end' },
              modular: { colStart: 19, colSpan: 6, rowStart: 1, rowSpan: 20 },
              className: 'pb-16',
              children: [
                {
                  type: 'Component',
                  componentType: 'ZineDisplay',
                  bind: 'page.title',
                  style: { writingMode: 'vertical-rl', fontSize: '3rem' },
                  props: { className: '!tracking-tighter !normal-case' }
                }
              ]
            },
            // 3. 顶部信息区 (Cols 1-6)
            {
              type: 'Container',
              layout: 'flex',
              layoutProps: { direction: 'column', align: 'start' },
              modular: { colStart: 2, colSpan: 6, rowStart: 2, rowSpan: 4 },
              children: [
                {
                  type: 'Component',
                  componentType: 'ZineCaption',
                  bind: 'page.subtitle',
                  props: { className: '!italic !normal-case !tracking-normal', color: 'secondary' }
                },
                { type: 'Container', className: 'w-6 h-px bg-zine-accent mt-4', children: [] }
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
            // 1. 右侧大图 (Cols 7-24, Rows 7-24)
            {
              type: 'Container',
              layout: 'absolute',
              modular: { colStart: 7, colSpan: 18, rowStart: 7, rowSpan: 18 },
              children: [{ type: 'Component', componentType: 'ZineMedia', props: { className: 'w-full h-full' } }]
            },
            // 2. 左侧垂直标题 (Cols 1-6)
            {
              type: 'Container',
              layout: 'flex',
              layoutProps: { direction: 'column', align: 'center', justify: 'end' },
              modular: { colStart: 1, colSpan: 6, rowStart: 1, rowSpan: 20 },
              className: 'pb-16',
              children: [
                {
                  type: 'Component',
                  componentType: 'ZineDisplay',
                  bind: 'page.title',
                  style: { writingMode: 'vertical-rl', fontSize: '3rem' },
                  props: { className: '!tracking-tighter !normal-case' }
                }
              ]
            },
            // 3. 顶部信息区 (Cols 19-24)
            {
              type: 'Container',
              layout: 'flex',
              layoutProps: { direction: 'column', align: 'end' },
              modular: { colStart: 18, colSpan: 6, rowStart: 2, rowSpan: 4 },
              children: [
                {
                  type: 'Component',
                  componentType: 'ZineCaption',
                  bind: 'page.subtitle',
                  props: { className: '!italic !normal-case !tracking-normal text-right', color: 'secondary' }
                },
                { type: 'Container', className: 'w-6 h-px bg-zine-accent mt-4', children: [] }
              ]
            }
          ]
        }
      },
      // 底部标签
      {
        type: 'Component',
        componentType: 'ZineCaption',
        modular: { colStart: 1, colSpan: 24, rowStart: 23, rowSpan: 1 },
        props: {
          text: '{page.imageLabel}',
          className: '{page.layoutVariant === "left" ? "text-left pl-12" : "text-right pr-12"} opacity-40',
          color: 'secondary'
        }
      }
    ]
  }
};
