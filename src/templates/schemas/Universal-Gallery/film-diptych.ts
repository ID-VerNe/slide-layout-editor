import { TemplateSchema } from '../types';

/**
 * FilmDiptychSchema - 24x24 模块化迁移
 * 核心：双联画平衡感、胶片序列感
 */
export const FilmDiptychSchema: TemplateSchema = {
  id: 'film-diptych',
  name: 'Film Diptych',
  category: 'Gallery',
  supportedRatios: ['2:3', 'A4', '16:9'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden bg-zine-bg',
    children: [
      {
        type: 'Conditional',
        condition: '{page.layoutVariant === "vertical"}',
        then: {
          type: 'Container',
          layout: 'modular',
          layoutProps: { columns: 24, rows: 24, gap: 'spacing.sm' },
          className: 'absolute inset-0 p-16',
          children: [
            // 上图 (70% height approx)
            {
              type: 'Container',
              layout: 'absolute',
              modular: { colStart: 1, colSpan: 24, rowStart: 1, rowSpan: 16 },
              className: 'bg-white shadow-sm overflow-hidden p-0',
              children: [
                {
                  type: 'Component',
                  componentType: 'ZineMedia',
                  props: { 
                    src: '{page.gallery[0]?.url}', 
                    config: '{page.gallery[0]?.config}',
                    className: 'w-full h-full' 
                  }
                }
              ]
            },
            // 下图 (30% height approx)
            {
              type: 'Container',
              layout: 'absolute',
              modular: { colStart: 1, colSpan: 24, rowStart: 18, rowSpan: 7 },
              className: 'bg-white shadow-sm overflow-hidden p-0',
              children: [
                {
                  type: 'Component',
                  componentType: 'ZineMedia',
                  props: { 
                    src: '{page.gallery[1]?.url}', 
                    config: '{page.gallery[1]?.config}',
                    className: 'w-full h-full' 
                  }
                }
              ]
            }
          ]
        },
        else: {
          type: 'Container',
          layout: 'modular',
          layoutProps: { columns: 24, rows: 24, gap: 'spacing.sm' },
          className: 'absolute inset-0 p-16 pb-24',
          children: [
            // 左图
            {
              type: 'Container',
              layout: 'absolute',
              modular: { colStart: 1, colSpan: 11, rowStart: 1, rowSpan: 24 },
              className: 'bg-white shadow-sm overflow-hidden p-0',
              children: [
                {
                  type: 'Component',
                  componentType: 'ZineMedia',
                  props: { 
                    src: '{page.gallery[0]?.url}', 
                    config: '{page.gallery[0]?.config}',
                    className: 'w-full h-full' 
                  }
                }
              ]
            },
            // 右图
            {
              type: 'Container',
              layout: 'absolute',
              modular: { colStart: 13, colSpan: 12, rowStart: 1, rowSpan: 24 },
              className: 'bg-white shadow-sm overflow-hidden p-0',
              children: [
                {
                  type: 'Component',
                  componentType: 'ZineMedia',
                  props: { 
                    src: '{page.gallery[1]?.url}', 
                    config: '{page.gallery[1]?.config}',
                    className: 'w-full h-full' 
                  }
                }
              ]
            }
          ]
        }
      },
      // 底部标签 (居中)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { justify: 'center', align: 'end' },
        modular: { colStart: 1, colSpan: 24, rowStart: 23, rowSpan: 2 },
        className: 'pb-8',
        children: [
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.imageLabel',
            props: {
              text: 'SEQUENCE 04 · MOVEMENT STUDY',
              tracking: 0.2,
              bold: true,
              color: 'secondary',
              sans: true
            }
          }
        ]
      }
    ]
  }
};
