import { TemplateSchema } from '../types';

/**
 * BilingualQuoteSchema - 双语金句高潮页 · 纯排印张力
 * 艺术指导规范：
 * 1. 彻底去除配图，纯粹依靠衬线排印（Playfair Display / Lora）
 * 2. 占据视觉中心的巨幅英文金句
 * 3. 极小字号思源宋体译文浮于下方
 * 4. 侧边 90° 旋转书签印章（QUOTE OF THE DAY）
 * 5. 极度空气感与呼吸感
 */
export const BilingualQuoteSchema: TemplateSchema = {
  id: 'bilingual-quote',
  name: 'Bilingual Quote',
  category: 'Bilingual',
  supportedRatios: ['3:4', '2:3', '16:9'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden bg-zine-bg',
    children: [
      // 1. 顶部页眉与来源 (Top Running Header)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'row', align: 'center', justify: 'between' },
        modular: { colStart: 3, colSpan: 19, rowStart: 3, rowSpan: 1 },
        className: 'border-b border-zine-accent/10 pb-2',
        children: [
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.title',
            props: {
              size: 1.25,
              bold: true,
              tracking: 0.35,
              sans: true,
              className: 'uppercase opacity-50',
              color: 'primary',
            },
          },
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.actionText',
            props: {
              size: 1.25,
              tracking: 0.25,
              sans: true,
              className: 'uppercase opacity-40',
              color: 'secondary',
            },
          },
        ],
      },

      // 2. 侧边 90° 旋转书签 (Side Rotated Bookmark)
      {
        type: 'Component',
        componentType: 'ZineCaption',
        bind: 'page.sideHeader',
        modular: { colStart: 23, colSpan: 1, rowStart: 4, rowSpan: 16, align: 'center', justify: 'center' },
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

      // 3. 引号装饰符号 (Decorative Opening Quote Mark)
      {
        type: 'Component',
        componentType: 'ZineDisplay',
        modular: { colStart: 3, colSpan: 19, rowStart: 6, rowSpan: 2, align: 'end' },
        props: {
          text: '“',
          serif: true,
          size: 6,
          className: 'font-serif opacity-15 leading-none select-none -mb-4',
          color: 'accent',
        },
      },

      // 4. 巨幅英文金句核心 (Oversized Serif English Quote)
      {
        type: 'Component',
        componentType: 'ZineDisplay',
        bind: 'page.paragraph',
        modular: { colStart: 3, colSpan: 19, rowStart: 8, rowSpan: 8, align: 'center' },
        props: {
          serif: true,
          italic: true,
          size: 4.5,
          leading: 1.35,
          align: 'left',
          className: 'font-serif text-zine-primary tracking-tight',
          color: 'primary',
        },
      },

      // 5. 极细微线分割 (0.5pt Accent Hairline)
      {
        type: 'Container',
        layout: 'absolute',
        modular: { colStart: 3, colSpan: 4, rowStart: 16, rowSpan: 1 },
        className: 'border-t-2 border-zine-accent/30 mt-2',
        children: [],
      },

      // 6. 中文金句释义影子层 (Chinese Translation Shadow)
      {
        type: 'Component',
        componentType: 'ZineBody',
        bind: 'page.quoteZH',
        modular: { colStart: 3, colSpan: 19, rowStart: 17, rowSpan: 3, align: 'start' },
        props: {
          zh: true,
          size: 2.0,
          leading: 1.7,
          align: 'left',
          className: 'text-zine-secondary font-serif opacity-75',
          color: 'secondary',
        },
      },

      // 7. 底部作者/书名出处署名 (Author & Source Citation)
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', align: 'start', justify: 'end' },
        modular: { colStart: 3, colSpan: 19, rowStart: 21, rowSpan: 2 },
        className: 'border-t border-zine-accent/10 pt-3',
        children: [
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.subtitle',
            props: {
              size: 1.75,
              bold: true,
              tracking: 0.25,
              sans: true,
              className: 'uppercase opacity-70',
              color: 'primary',
            },
          },
          {
            type: 'Component',
            componentType: 'ZineCaption',
            bind: 'page.imageLabel',
            props: {
              size: 1.25,
              tracking: 0.15,
              sans: true,
              className: 'opacity-40 italic mt-0.5',
              color: 'secondary',
            },
          },
        ],
      },
    ],
  },
};

export default BilingualQuoteSchema;
