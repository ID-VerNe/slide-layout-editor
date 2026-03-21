import { TemplateSchema } from './types';

export const MicroAnchorSchema: TemplateSchema = {
  id: 'micro-anchor',
  name: 'Micro Anchor',
  category: 'Gallery',
  supportedRatios: ['2:3'],
  root: {
    type: 'Container',
    layout: 'absolute',
    layoutProps: { inset: 0 },
    className: 'w-full h-full relative p-12 transition-all duration-700 overflow-hidden isolate',
    style: {
      backgroundColor: '{page.backgroundColor ?? theme.colors.background ?? "#FAFAF9"}'
    },
    children: [
      {
        type: 'Container',
        layout: 'absolute',
        layoutProps: { top: '25%', left: 0, right: 0 },
        className: 'w-full text-center px-24 pointer-events-none',
        children: [
          {
            type: 'Component',
            componentType: 'SlideBlockLabel',
            bind: 'page.title',
            props: {
              text: '{page.title ?? "THE SILENCE OF THE FRAME"}',
              className: '!italic !uppercase !font-bold !tracking-[0.5em] !opacity-40 !border-none',
              color: '{theme.colors.primary}',
              style: {
                fontSize: '{page.styleOverrides?.title?.fontSize ? page.styleOverrides.title.fontSize + "px" : "11px"}',
                textAlign: 'center'
              }
            }
          }
        ]
      },
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: {
          direction: 'column',
          align: '{page.layoutVariant === "right" ? "end" : "start"}' as any,
        },
        className: 'absolute w-fit animate-in fade-in slide-in-from-bottom-4 duration-1000 {page.layoutVariant === "right" ? "right-16" : "left-16"}',
        style: { bottom: '2.5rem' },
        children: [
          {
            type: 'Container',
            layout: 'flex',
            className: 'aspect-[3/4] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.06)] overflow-hidden mb-8 border-[1px] border-slate-50',
            style: { width: '18rem' },
            children: [
              {
                type: 'Component',
                componentType: 'SlideImage',
                props: {
                  className: 'w-full h-full object-cover',
                  rounded: '0',
                  backgroundColor: 'transparent'
                }
              }
            ]
          },
          {
            type: 'Container',
            layout: 'flex',
            className: 'relative',
            style: { width: '18rem' },
            children: [
              {
                type: 'Component',
                componentType: 'SlideSubHeadline',
                bind: 'page.subtitle',
                props: {
                  className: '!tracking-[0.2em] !font-bold !uppercase !opacity-100 !leading-[1.4] !m-0 !p-0 {page.layoutVariant === "right" ? "!text-right" : "!text-left"}',
                  color: '{theme.colors.secondary}',
                  size: '0.75rem'
                }
              }
            ]
          }
        ]
      }
    ]
  }
};
