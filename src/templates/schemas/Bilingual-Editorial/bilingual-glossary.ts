import { TemplateSchema } from '../types';

/**
 * BilingualGlossarySchema - 双语生词策展页 · 展签式精解
 * 艺术指导规范：
 * 1. 双细线顶部展签标题栏
 * 2. 2 列网格精细生词卡片（含音标、词性、中文释义与语境双语例句）
 * 3. 侧边 90° 旋转归档印章（LEXICON ARCHIVE）
 * 4. 底部学术小注与页脚
 */
export const BilingualGlossarySchema: TemplateSchema = {
  id: 'bilingual-glossary',
  name: 'Bilingual Glossary',
  category: 'Bilingual',
  supportedRatios: ['3:4', '2:3', '16:9'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden bg-white',
    children: [
      // 1. 顶部策展标题栏 (Curated Lexicon Masthead)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'start', justify: 'center' },
        modular: { colStart: 3, colSpan: 19, rowStart: 2, rowSpan: 3 },
        className: 'border-b-2 border-slate-900 pb-3',
        children: [
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.subtitle',
            props: {
              size: 0.75,
              bold: true,
              tracking: 0.35,
              sans: true,
              className: 'uppercase opacity-40 mb-1',
              color: 'secondary',
            },
          },
          {
            type: 'Container',
            layout: 'flex',
            layoutProps: { direction: 'row', align: 'baseline', justify: 'between' },
            className: 'w-full',
            children: [
              {
                type: 'Component',
                componentType: 'ZineDisplay',
                bind: 'page.title',
                props: {
                  serif: true,
                  size: 2.2,
                  tracking: 0.05,
                  className: 'uppercase tracking-wider font-serif',
                  color: 'primary',
                },
              },
              {
                type: 'Component',
                componentType: 'ZineCaption',
                bind: 'page.actionText',
                props: {
                  size: 0.75,
                  tracking: 0.2,
                  sans: true,
                  className: 'uppercase opacity-50 font-mono',
                  color: 'secondary',
                },
              },
            ],
          },
        ],
      },

      // 2. 侧边 90° 旋转归档印章 (Side Lexicon Stamp)
      {
        type: 'Component',
        componentType: 'ZineCaption',
        bind: 'page.sideHeader',
        modular: { colStart: 23, colSpan: 1, rowStart: 4, rowSpan: 16, align: 'center', justify: 'center' },
        props: {
          orientation: 'vertical-rotate',
          size: 0.75,
          bold: true,
          tracking: 0.4,
          sans: true,
          className: 'uppercase opacity-35',
          color: 'primary',
        },
      },

      // 3. 核心生词网格区 (Curated Vocabulary Grid with Examples)
      {
        type: 'Component',
        componentType: 'ZineVocabList',
        bind: 'page.vocabItems',
        modular: { colStart: 3, colSpan: 19, rowStart: 6, rowSpan: 14, align: 'start' },
        props: {
          columns: 2,
          showExample: true,
        },
      },

      // 4. 底部学术小注与导读 (Editorial Colophon / Reading Tip)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'row', align: 'start', justify: 'between', gap: 'spacing.md' },
        modular: { colStart: 3, colSpan: 19, rowStart: 21, rowSpan: 2 },
        className: 'border-t border-slate-900/15 pt-3',
        children: [
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.paragraphZH',
            props: {
              zh: true,
              size: 0.8,
              leading: 1.5,
              className: 'opacity-60 italic',
              color: 'secondary',
            },
          },
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.imageLabel',
            props: {
              size: 0.75,
              sans: true,
              tracking: 0.2,
              className: 'uppercase opacity-40 shrink-0',
              color: 'primary',
            },
          },
        ],
      },
    ],
  },
};

export default BilingualGlossarySchema;
