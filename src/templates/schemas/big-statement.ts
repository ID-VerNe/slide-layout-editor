import { TemplateSchema } from './types';

export const BigStatementSchema: TemplateSchema = {
  id: 'big-statement',
  name: 'Big Statement',
  category: 'General',
  supportedRatios: ['16:9', '1:1'], // 从现有的支持列表中获取
  root: {
    type: 'Container',
    layout: 'flex',
    layoutProps: {
      direction: 'column',
      align: 'center',
      justify: 'center',
    },
    // 处理背景图案动态类名和渐变
    className: 'w-full h-full relative px-48 text-center overflow-hidden transition-all duration-700 isolate bg-pattern-{page.backgroundPattern}',
    style: {
      backgroundColor: '{page.backgroundColor ?? theme.colors.background ?? "#ffffff"}'
    },
    children: [
      {
        type: 'Conditional',
        condition: '{page.backgroundColor === "#ffffff"}',
        then: {
          type: 'Container',
          layout: 'absolute',
          layoutProps: { inset: 0 },
          className: 'bg-gradient-to-br from-slate-50 to-white pointer-events-none',
          children: []
        }
      },
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: {
          direction: 'column',
          align: 'center',
          gap: '2.5rem', // gap-10 = 2.5rem
        },
        className: 'max-w-5xl z-10',
        children: [
          {
            type: 'Container',
            layout: 'flex',
            className: 'relative',
            children: [
              {
                type: 'Component',
                componentType: 'SlideHeadline',
                bind: 'page.title',
                props: {
                  maxSize: 84,
                  minSize: 48,
                  className: '!font-medium leading-[1.2] tracking-tight'
                }
              }
            ]
          },
          {
            type: 'Component',
            componentType: 'SlideSubHeadline',
            bind: 'page.subtitle',
            props: {
              size: '1.1rem',
              color: '{page.styleOverrides?.subtitle?.color ?? theme.colors.secondary}',
              className: '!font-bold !tracking-[0.3em] !uppercase !opacity-60'
            }
          }
        ]
      }
    ]
  }
};
