import { TemplateSchema } from '../types';

/**
 * ZineClassicSchema - 24x24 模块化标杆模板
 * 设计原则：
 * 1. 黄金比例分割：左 12/24 文本区，右 10/24 媒体区
 * 2. 锚点锁定：标题锁定在 (2, 4) 坐标
 * 3. 基线对齐：所有文字组件自动吸附 8px 基线
 */
export const ZineClassicSchema: TemplateSchema = {
  id: 'zine-classic',
  name: 'Zine Classic',
  category: 'Editorial',
  supportedRatios: ['16:9', '2:3', 'A4'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0',
    children: [
      // 1. 左侧装饰背景
      {
        type: 'Container',
        layout: 'absolute',
        modular: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 24 },
        className: 'bg-zine-surface/20 border-r border-zine-accent/5',
        children: []
      },

      // 2. 主标题 (Display Atom)
      {
        type: 'Component',
        componentType: 'ZineDisplay',
        modular: { colStart: 2, colSpan: 10, rowStart: 4, rowSpan: 5 },
        bind: 'page.title',
        props: {
          color: 'primary'
        }
      },

      // 3. 装饰线 (Grid based)
      {
        type: 'Container',
        layout: 'absolute',
        modular: { colStart: 2, colSpan: 3, rowStart: 9, rowSpan: 1 },
        className: 'border-t-2 border-zine-accent mt-2',
        children: []
      },

      // 4. 副标题 (Caption Atom)
      {
        type: 'Component',
        componentType: 'ZineCaption',
        bind: 'page.subtitle',
        modular: { colStart: 2, colSpan: 10, rowStart: 10, rowSpan: 1 },
        props: {
          text: 'EDITORIAL DESIGN SYSTEM',
          color: 'accent'
        }
      },

      // 5. 正文 (Body Atom)
      {
        type: 'Component',
        componentType: 'ZineBody',
        modular: { colStart: 2, colSpan: 9, rowStart: 12, rowSpan: 10 },
        bind: 'page.paragraph',
        props: {
          color: 'secondary'
        }
      },

      // 6. 主媒体资产 (Media Atom)
      {
        type: 'Component',
        componentType: 'ZineMedia',
        modular: { colStart: 13, colSpan: 11, rowStart: 2, rowSpan: 21 },
        props: {
          className: 'shadow-2xl z-20',
          imgClassName: 'hover:scale-105 transition-transform duration-1000'
        }
      },

      // 7. 图片说明 (Caption Atom)
      {
        type: 'Component',
        componentType: 'ZineCaption',
        bind: 'page.imageLabel',
        modular: { colStart: 13, colSpan: 11, rowStart: 23, rowSpan: 1 },
        props: {
          text: 'ARCHIVE / NO. 24',
          className: 'text-right opacity-30',
          color: 'secondary'
        }
      }
    ]
  }
};

export default ZineClassicSchema;
