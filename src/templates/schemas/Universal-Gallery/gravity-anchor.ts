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
              text: '{page.title || "CASE FILE : AKO"}',
              className: '!tracking-[0.6em] !text-zine-secondary !font-black text-center',
              color: 'secondary'
            }
          },
          // 序言文本
          {
            type: 'Component',
            componentType: 'ZineBody',
            bind: 'page.paragraph',
            props: {
              className: '!text-center !italic !leading-loose !max-w-xl',
              color: 'primary'
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
            modular: { colStart: 2, colSpan: 12, rowStart: 12, rowSpan: 1 }, // 这里的 rowStart 是相对于 Container 的，但 LayoutRenderer 处理 modular 是全局还是局部的？
            // 修正：resolveBaseProps 处理 modular。如果父容器是 absolute，子容器的 modular 是基于父容器的网格还是全局？
            // LayoutRenderer 中 Container layout === 'modular' 会创建网格。
            // 这里我们直接用 absolute 定位在图片容器内。
            style: { position: 'absolute', bottom: '24px', left: '24px', mixBlendMode: 'difference' },
            props: {
              text: '{page.imageLabel || "08:42 AM · CROWNE PLAZA"}',
              className: '!font-mono !text-white !opacity-70',
              color: 'secondary'
            }
          }
        ]
      }
    ]
  }
};
