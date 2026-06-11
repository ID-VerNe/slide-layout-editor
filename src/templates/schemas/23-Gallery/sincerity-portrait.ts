import { TemplateSchema } from '../types';

/**
 * SincerityPortraitSchema - 24x24 模块化迁移
 * 强调非对称平衡：左侧大面积正文，右下角悬浮肖像
 */
export const SincerityPortraitSchema: TemplateSchema = {
  id: 'sincerity-portrait',
  name: 'Sincerity Portrait',
  category: 'Gallery',
  supportedRatios: ['2:3'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden',
    children: [
      // 1. 顶部背景文本 (Decorative Background Title)
      {
        type: 'Component',
        componentType: 'ZineCaption',
        bind: 'page.title',
        modular: { colStart: 1, colSpan: 24, rowStart: 6, rowSpan: 2 },
        props: {
          className: '!opacity-10 text-center',
          italic: true,
          bold: true,
          tracking: 0.8,
          size: 1.75,
          sans: true
        }
      },

      // 2. 标题区 (Display) - 遵循天头原则
      {
        type: 'Component',
        componentType: 'ZineDisplay',
        modular: { colStart: 3, colSpan: 12, rowStart: 3, rowSpan: 4 },
        bind: 'page.title',
        props: {
          className: '!normal-case',
          bold: false,
          serif: true,
          color: 'primary'
        }
      },

      // 3. 副标题 (Caption)
      {
        type: 'Component',
        componentType: 'ZineCaption',
        modular: { colStart: 3, colSpan: 12, rowStart: 8, rowSpan: 1 },
        bind: 'page.subtitle',
        props: {
          className: '',
          italic: true,
          tracking: 0.1,
          sans: true,
          color: 'secondary'
        }
      },

      // 4. 正文 (Body)
      {
        type: 'Component',
        componentType: 'ZineBody',
        modular: { colStart: 3, colSpan: 10, rowStart: 10, rowSpan: 10 },
        bind: 'page.paragraph',
        props: {
          serif: true,
          color: 'secondary'
        }
      },

      // 5. 悬浮肖像 (Media)
      {
        type: 'Component',
        componentType: 'ZineMedia',
        modular: { colStart: 14, colSpan: 9, rowStart: 10, rowSpan: 12 },
        props: {
          className: 'shadow-2xl z-20 border-[0.5px] border-white/20',
        }
      },

      // 6. 图片说明 (Caption) - 位于地脚区域
      {
        type: 'Component',
        componentType: 'ZineCaption',
        bind: 'page.imageLabel',
        modular: { colStart: 14, colSpan: 9, rowStart: 21, rowSpan: 1 },
        props: {
          className: '!p-0 opacity-40 text-right',
          italic: true,
          size: 1.125,
          tracking: 0.1,
          sans: true,
          color: 'secondary'
        }
      }
    ]
  }
};
