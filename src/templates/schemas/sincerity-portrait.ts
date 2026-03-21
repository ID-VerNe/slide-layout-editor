import { TemplateSchema } from './types';

export const SincerityPortraitSchema: TemplateSchema = {
  id: 'sincerity-portrait',
  name: 'Sincerity Portrait',
  category: 'Gallery',
  supportedRatios: ['2:3'],
  root: {
    type: 'Container',
    layout: 'absolute',
    layoutProps: { inset: 0 },
    className: 'w-full h-full relative p-12 transition-all duration-700 overflow-hidden isolate',
    style: {
      backgroundColor: '{page.backgroundColor ?? theme.colors.background ?? "#FFFFFF"}'
    },
    children: [
      {
        type: 'Container',
        layout: 'absolute',
        layoutProps: { top: '20%', left: 0, right: 0 },
        className: 'w-full text-center px-24 pointer-events-none z-0',
        children: [
          {
            type: 'Component',
            componentType: 'SlideBlockLabel',
            bind: 'page.title',
            props: {
              text: '{page.title ?? "THE SILENCE OF THE FRAME"}',
              className: '!italic !uppercase !font-bold !tracking-[0.5em] !opacity-[0.15] !border-none',
              color: '{theme.colors.primary}',
              style: {
                fontSize: '{page.styleOverrides?.title?.fontSize ? page.styleOverrides.title.fontSize + "px" : "14px"}',
                textAlign: 'center'
              }
            }
          }
        ]
      },
      {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column' },
        className: 'relative z-10 mt-24 ml-8 max-w-[60%] animate-in fade-in slide-in-from-left-8 duration-1000',
        children: [
          {
            type: 'Component',
            componentType: 'SlideHeadline',
            bind: 'page.title',
            props: {
              className: '!text-left !tracking-widest !mb-6 !normal-case',
              maxSize: 42,
              minSize: 24,
              color: '{theme.colors.primary}',
              style: {
                fontFamily: '{page.styleOverrides?.title?.fontFamily ?? theme.typography.headingFont ?? "\'Playfair Display\', serif"}',
                fontWeight: 400,
                lineHeight: 1.2
              }
            }
          },
          {
            type: 'Component',
            componentType: 'SlideSubHeadline',
            bind: 'page.subtitle',
            props: {
              className: '!text-left !tracking-[0.1em] !opacity-90 !mb-8 !italic',
              color: '{theme.colors.secondary}',
              size: '1.1rem'
            }
          },
          {
            type: 'Component',
            componentType: 'SlideParagraph',
            bind: 'page.paragraph',
            props: {
              className: '!text-left !opacity-70',
              size: '0.95rem',
              color: '{theme.colors.secondary}'
            }
          }
        ]
      },
      {
        type: 'Container',
        layout: 'absolute',
        layoutProps: { bottom: 20, right: 12 },
        className: 'animate-in fade-in slide-in-from-bottom-8 duration-1000 z-10',
        style: { width: '70%' },
        children: [
          {
            type: 'Container',
            layout: 'flex',
            className: 'aspect-[3/4] bg-white shadow-[0_50px_140px_rgba(0,0,0,0.1)] overflow-hidden border-[1px] border-slate-100/30',
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
            layoutProps: { justify: 'end' },
            className: 'mt-4 opacity-40',
            children: [
              {
                type: 'Component',
                componentType: 'SlideBlockLabel',
                props: {
                  fieldKey: 'imageLabel',
                  className: '!p-0 !border-none !italic !text-[10px] !tracking-widest',
                  color: '{theme.colors.secondary}'
                }
              }
            ]
          }
        ]
      }
    ]
  }
};
