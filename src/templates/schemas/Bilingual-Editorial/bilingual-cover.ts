import { TemplateSchema } from '../types';

/**
 * BilingualCoverSchema - 双语阅读杂志封面 · 海报模式
 * 艺术指导规范：
 * 1. 顶部全大写宽字距 Masthead
 * 2. 偏角非对称画廊主图裁切
 * 3. 侧边 90° 旋转刊号/来源印章
 * 4. 底部中英双语主副标题与年份发行信息
 */
export const BilingualCoverSchema: TemplateSchema = {
  id: 'bilingual-cover',
  name: 'Bilingual Cover',
  category: 'Bilingual',
  supportedRatios: ['3:4', '2:3', '16:9'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden bg-white',
    children: [
      // 1. 顶部刊名 (Magazine Masthead) - 宽字距全大写衬线
      {
        type: 'Component',
        componentType: 'ZineDisplay',
        modular: { colStart: 3, colSpan: 19, rowStart: 2, rowSpan: 2, align: 'end' },
        bind: 'page.title',
        props: {
          serif: true,
          bold: true,
          tracking: 0.25,
          size: 4.5,
          className: 'uppercase tracking-[0.25em]',
          color: 'primary',
        },
      },

      // 2. 刊名下方细线与卷号 (Hairline 0.5pt & Volume Header)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'row', align: 'center', justify: 'between' },
        modular: { colStart: 3, colSpan: 19, rowStart: 4, rowSpan: 1 },
        className: 'border-b border-slate-900/20 pb-2',
        children: [
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.imageSubLabel',
            props: {
              size: 1.25,
              bold: true,
              tracking: 0.25,
              sans: true,
              className: 'uppercase opacity-60',
              color: 'secondary',
            },
          },
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.actionText',
            props: {
              size: 1.25,
              bold: true,
              tracking: 0.2,
              sans: true,
              className: 'uppercase opacity-60',
              color: 'secondary',
            },
          },
        ],
      },

      // 3. 侧边 90° 旋转刊号/来源印章 (Vertical Rotated Side Header)
      {
        type: 'Component',
        componentType: 'ZineCaption',
        bind: 'page.sideHeader',
        modular: { colStart: 23, colSpan: 1, rowStart: 6, rowSpan: 12, align: 'center', justify: 'center' },
        props: {
          orientation: 'vertical-rotate',
          size: 1.25,
          bold: true,
          tracking: 0.35,
          sans: true,
          className: 'uppercase opacity-40',
          color: 'primary',
        },
      },

      // 4. 画廊主图 (Main Cover Media)
      {
        type: 'Component',
        componentType: 'ZineMedia',
        bind: 'page.image',
        modular: { colStart: 3, colSpan: 19, rowStart: 6, rowSpan: 12 },
        props: {
          className: 'shadow-sm',
          imgClassName: 'object-cover w-full h-full',
        },
      },

      // 5. 图片极简图注 (Photo Metadata)
      {
        type: 'Component',
        componentType: 'ZineCaption',
        bind: 'page.imageLabel',
        modular: { colStart: 3, colSpan: 19, rowStart: 18, rowSpan: 1, align: 'start' },
        props: {
          size: 1.25,
          sans: true,
          tracking: 0.15,
          className: 'opacity-40 italic',
          color: 'secondary',
        },
      },

      // 6. 底部主视觉文章标题 (Featured Article Title)
      {
        type: 'Component',
        componentType: 'ZineDisplay',
        bind: 'page.subtitle',
        modular: { colStart: 3, colSpan: 19, rowStart: 19, rowSpan: 3, align: 'center' },
        props: {
          serif: true,
          italic: true,
          size: 2.75,
          leading: 1.2,
          color: 'primary',
        },
      },

      // 7. 中文副标题/导读 (Chinese Translation / Sub-Tagline)
      {
        type: 'Component',
        componentType: 'ZineBody',
        bind: 'page.paragraphZH',
        modular: { colStart: 3, colSpan: 19, rowStart: 22, rowSpan: 2, align: 'start' },
        props: {
          zh: true,
          size: 1.875,
          leading: 1.6,
          className: 'opacity-70',
          color: 'secondary',
        },
      },
    ],
  },
};

export default BilingualCoverSchema;
