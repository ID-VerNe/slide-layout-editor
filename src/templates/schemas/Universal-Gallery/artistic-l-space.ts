import { TemplateSchema } from '../types';

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
            // 1. 左侧大图 (Cols 1-18, Rows 5-20) - 遵循天头地脚原则
            {
              type: 'Container',
              layout: 'absolute',
              modular: { colStart: 1, colSpan: 18, rowStart: 5, rowSpan: 16 },
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
                  props: { 
                    orientation: 'vertical-stack',
                    className: 'text-center'
                  }
                }
              ]
            },
            // 3. 顶部信息区 (Handwritten Notes) - 镜像至左上角
            {
              type: 'Component',
              componentType: 'ZineCaption',
              bind: 'page.subtitle',
              modular: { colStart: 2, colSpan: 6, rowStart: 2, rowSpan: 1 },
              props: { 
                className: '!italic !tracking-normal text-left', 
                color: 'secondary',
                justifySelf: 'start'
              }
            },
            { 
              type: 'Component', 
              componentType: 'ZineDivider', 
              fieldKey: 'topDivider',
              modular: { colStart: 2, colSpan: 1, rowStart: 3, rowSpan: 1 },
              props: { 
                thickness: '1px', 
                color: 'accent',
                justifySelf: 'start', // 对齐到第 2 列的左侧
                style: { width: '85%' }
              } 
            }
          ]
        },
        else: {
          type: 'Container',
          layout: 'modular',
          layoutProps: { columns: 24, rows: 24 },
          className: 'absolute inset-0',
          children: [
            // 1. 右侧大图 (Cols 7-24, Rows 5-20) - 遵循天头地脚原则
            {
              type: 'Container',
              layout: 'absolute',
              modular: { colStart: 7, colSpan: 18, rowStart: 5, rowSpan: 16 },
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
                  props: { 
                    orientation: 'vertical-stack',
                    className: 'text-center'
                  }
                }
              ]
            },
            // 3. 顶部信息区 (Handwritten Notes) - 统一移至右上角
            {
              type: 'Component',
              componentType: 'ZineCaption',
              bind: 'page.subtitle',
              modular: { colStart: 18, colSpan: 6, rowStart: 2, rowSpan: 1 },
              props: { 
                className: '!italic !tracking-normal text-right', 
                color: 'secondary',
                justifySelf: 'end'
              }
            },
            { 
              type: 'Component', 
              componentType: 'ZineDivider', 
              fieldKey: 'topDivider',
              modular: { colStart: 23, colSpan: 1, rowStart: 3, rowSpan: 1 },
              props: { 
                thickness: '1px', 
                color: 'accent',
                justifySelf: 'end', 
                style: { width: '85%' }
              } 
            }
          ]
        }
      }
      ]
      }
      };
