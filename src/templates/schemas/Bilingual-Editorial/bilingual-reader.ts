import { TemplateSchema } from '../types';

/**
 * BilingualReaderSchema - 双语精读正文内页
 * 艺术指导规范：
 * 1. 顶部 1/5 宽幅电影感横条图片（带留白）
 * 2. 首字下沉（Drop Cap）英文主干正文（Playfair / Lora 衬线体）
 * 3. 影子层级中文对照（思源宋体 Light / 降灰弱对比）
 * 4. 0.5pt 极细分割线
 * 5. 底部策展式生词栏（Gallery Caption Style）
 */
export const BilingualReaderSchema: TemplateSchema = {
  id: 'bilingual-reader',
  name: 'Bilingual Reader',
  category: 'Bilingual',
  supportedRatios: ['3:4', '2:3', '16:9'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden bg-white',
    children: [
      // 1. 顶部极简页眉 (Running Header)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'row', align: 'center', justify: 'between' },
        modular: { colStart: 3, colSpan: 19, rowStart: 2, rowSpan: 1 },
        className: 'border-b border-slate-900/10 pb-1.5',
        children: [
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.title',
            props: {
              size: 1.25,
              bold: true,
              tracking: 0.3,
              sans: true,
              className: 'uppercase opacity-60',
              color: 'primary',
            },
          },
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.subtitle',
            props: {
              size: 1.25,
              tracking: 0.2,
              sans: true,
              className: 'uppercase opacity-40',
              color: 'secondary',
            },
          },
        ],
      },

      // 2. 侧边 90° 旋转刊头印章 (Side Header Stamp)
      {
        type: 'Component',
        componentType: 'ZineCaption',
        bind: 'page.sideHeader',
        modular: { colStart: 23, colSpan: 1, rowStart: 3, rowSpan: 14, align: 'center', justify: 'center' },
        props: {
          orientation: 'vertical-rotate',
          size: 1.25,
          bold: true,
          tracking: 0.35,
          sans: true,
          className: 'uppercase opacity-35',
          color: 'primary',
        },
      },

      // 3. 顶部 1/5 宽幅电影感横条图片 (Cinematic Letterbox Banner)
      {
        type: 'Component',
        componentType: 'ZineMedia',
        bind: 'page.image',
        modular: { colStart: 3, colSpan: 19, rowStart: 3, rowSpan: 5 },
        props: {
          className: 'overflow-hidden rounded-none',
          imgClassName: 'object-cover w-full h-full filter saturate-[0.9]',
        },
      },

      // 4. 英文主干正文 (English Body with Drop Cap)
      {
        type: 'Component',
        componentType: 'ZineBody',
        bind: 'page.paragraph',
        modular: { colStart: 3, colSpan: 19, rowStart: 9, rowSpan: 6 },
        props: {
          serif: true,
          dropCap: true,
          size: 2.25,
          leading: 1.7,
          align: 'left',
          className: 'text-slate-900 font-serif tracking-normal selection:bg-slate-200',
          color: 'primary',
        },
      },

      // 5. 中文译文影子层 (Chinese Translation - Subtle Shadow)
      {
        type: 'Component',
        componentType: 'ZineBody',
        bind: 'page.paragraphZH',
        modular: { colStart: 3, colSpan: 19, rowStart: 15, rowSpan: 4 },
        props: {
          zh: true,
          size: 1.875,
          leading: 1.7,
          align: 'left',
          className: 'text-slate-600 font-serif opacity-80',
          color: 'secondary',
        },
      },

      // 6. 极细 0.5pt 分割线与展签标题 (Curated Hairline Separator)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'row', align: 'center', justify: 'between' },
        modular: { colStart: 3, colSpan: 19, rowStart: 19, rowSpan: 1 },
        className: 'border-t border-slate-900/15 pt-2 mb-1',
        children: [
          {
            type: 'Component',
            componentType: 'ZineCaption',
            props: {
              text: 'VOCABULARY ARCHIVE',
              size: 1.25,
              bold: true,
              tracking: 0.4,
              sans: true,
              className: 'uppercase opacity-40',
              color: 'primary',
            },
          },
          {
            type: 'Component',
            componentType: 'ZineCaption',
            props: {
              text: 'CURATED // KEY TERMS',
              size: 1.125,
              tracking: 0.25,
              sans: true,
              className: 'uppercase opacity-30',
              color: 'secondary',
            },
          },
        ],
      },

      // 7. 底部策展式生词栏 (Curated Vocab Gallery List)
      {
        type: 'Component',
        componentType: 'ZineVocabList',
        bind: 'page.vocabItems',
        modular: { colStart: 3, colSpan: 19, rowStart: 20, rowSpan: 4, align: 'start' },
        props: {
          columns: 2,
          showExample: false,
          size: 1.5,
        },
      },
    ],
  },
};

export default BilingualReaderSchema;
