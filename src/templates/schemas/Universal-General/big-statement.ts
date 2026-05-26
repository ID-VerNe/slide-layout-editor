import { TemplateSchema } from '../types';

/**
 * BigStatementSchema - 24x24 模块化迁移
 * 强调极端的居中对齐与文字张力
 */
export const BigStatementSchema: TemplateSchema = {
  id: 'big-statement',
  name: 'Big Statement',
  category: 'General',
  supportedRatios: ['16:9', '1:1', '2:3'],
  root: {
    type: 'Container',
    layout: 'modular',
    layoutProps: { columns: 24, rows: 24, gap: 'spacing.none' },
    className: 'w-full h-full relative p-0 overflow-hidden',
    children: [
      // 1. 渐变背景叠加
      {
        type: 'Container',
        layout: 'absolute',
        modular: { colStart: 1, colSpan: 24, rowStart: 1, rowSpan: 24 },
        className: 'bg-gradient-to-br from-zine-surface/10 to-transparent pointer-events-none',
        children: []
      },

      // 2. 居中标题 (Display)
      {
        type: 'Component',
        componentType: 'ZineDisplay',
        modular: { colStart: 3, colSpan: 20, rowStart: 9, rowSpan: 7 },
        bind: 'page.title',
        props: {
          align: 'center',
          tracking: -0.025,
          serif: true,
          color: 'primary'
        }
      },

      // 3. 装饰分割线
      {
        type: 'Container',
        layout: 'absolute',
        modular: { colStart: 11, colSpan: 4, rowStart: 16, rowSpan: 1 },
        className: 'border-t-4 border-zine-accent mt-4',
        children: []
      },

      // 4. 副标题 (Caption)
      {
        type: 'Component',
        componentType: 'ZineCaption',
        modular: { colStart: 3, colSpan: 20, rowStart: 18, rowSpan: 1 },
        bind: 'page.subtitle',
        props: {
          align: 'center',
          tracking: 0.4,
          sans: true,
          bold: true,
          className: 'opacity-50',
          color: 'secondary'
        }
      }
    ]
  }
};
