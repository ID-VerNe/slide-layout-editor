import { TemplateSchema } from '../types';

/**
 * GravityAnchorIntroSchema - 24x24 模块化迁移
 * 核心：上白下屏，重力沉底。
 */
export const GravityAnchorIntroSchema: TemplateSchema = {
  id: 'gravity-anchor-intro',
  name: 'Gravity Anchor',
  category: 'Gallery',
  supportedRatios: ['2:3', 'A4'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden bg-zine-bg',
    children: [
      // 1. 上半部分：极简序言区 (Rows 1-11)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'center', justify: 'center', gap: 'spacing.lg' },
        modular: { colStart: 1, colSpan: 24, rowStart: 1, rowSpan: 11 },
        className: 'px-24',
        children: [
          // 章节标题
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.title',
            props: {
              tracking: 0.6,
              bold: true,
              align: 'center',
              color: 'secondary',
              sans: true
            }
          },
          // 序言文本
          {
            type: 'Component',
            componentType: 'ZineBody',
            bind: 'page.paragraph',
            props: {
              align: 'center',
              italic: true,
              leading: 2,
              color: 'primary',
              serif: true,
              className: '!max-w-xl'
            }
          }
        ]
      },

      // 2. 下半部分：沉底大图 (Rows 12-24)
      {
        type: 'Container',
        layout: 'absolute',
        modular: { colStart: 1, colSpan: 24, rowStart: 12, rowSpan: 13 },
        className: 'relative group',
        children: [
          {
            type: 'Component',
            componentType: 'ZineMedia',
            props: { className: 'w-full h-full', imgClassName: 'object-cover' }
          },
          // 3. 图片内部元数据 (左下角锚点)
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.imageLabel',
            modular: { colStart: 2, colSpan: 12, rowStart: 12, rowSpan: 1 },
            style: { position: 'absolute', bottom: '24px', left: '24px', mixBlendMode: 'difference' },
            props: {
              color: 'secondary',
              sans: true,
              className: '!text-white !opacity-70'
            }
          }
        ]
      }
    ]
  }
};
