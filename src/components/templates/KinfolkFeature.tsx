import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { SlideBlockLabel } from '../ui/slide/SlideBlockLabel';
import { useStore } from '../../store/useStore';

/**
 * KinfolkFeature - 大片开篇布局
 * 最终加固版：全面感应全局主题 Token。
 */
export default function KinfolkFeature({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const theme = useStore((state) => state.theme);
  const isImageRight = page.layoutVariant === 'right';
  
  const displayTitle = page.title || 'KITAGAWA';
  const displaySubtitle = page.subtitle || 'Capturing the subtle emotions hidden behind the mask.';
  const displayLabel = page.imageLabel;

  const backgroundColor = page.backgroundColor || theme.colors.background || '#f8f8f7';
  const titleColor = page.styleOverrides?.title?.color || theme.colors.primary || '#1c1917';
  
  const safePadding = '4rem'; 

  return (
    <div 
      className={`w-full h-full relative overflow-hidden flex flex-col transition-all duration-700
        ${isImageRight ? 'items-end' : 'items-start'} isolate`}
      style={{ backgroundColor, paddingLeft: isImageRight ? '0' : safePadding, paddingRight: isImageRight ? safePadding : '0', paddingTop: safePadding, paddingBottom: '2.5rem' }}
    >
      <div className="w-[75%] h-[70%] relative bg-white border-[6px] border-white shadow-[0_30px_80px_rgba(0,0,0,0.04)] overflow-hidden z-10">
        <SlideImage page={page} className="w-full h-full object-cover" rounded="0" backgroundColor="transparent" />
        <div className={`absolute bottom-6 ${isImageRight ? 'right-8 text-right' : 'left-8 text-left'}`}>
          <SlideBlockLabel page={page} typography={typography} text={displayLabel} className="!text-[7px] !font-black !tracking-[0.4em] !uppercase !text-white/60 !opacity-100 mix-blend-difference !border-none !p-0" color={theme.colors.primary} />
        </div>
      </div>

      <div className={`absolute top-0 w-[25%] h-full flex flex-col items-center justify-start z-20 pointer-events-none px-4`} style={{ paddingTop: safePadding, paddingBottom: safePadding, left: isImageRight ? '0' : 'auto', right: isImageRight ? 'auto' : '0' }}>
        <div style={{ writingMode: 'vertical-rl' }}>
          <SlideHeadline page={page} typography={typography} maxSize={96} minSize={48} weight={400} className="!tracking-[0.15em] !normal-case" style={{ color: titleColor }} />
        </div>
      </div>

      <div className={`mt-auto w-2/3 z-10 flex flex-col ${isImageRight ? 'items-end text-right' : 'items-start'}`} style={{ paddingBottom: '0.15rem' }}>
        {/* 核心修正：简介上方的横线链接至 accent */}
        <div className="w-10 h-[1.5px] mb-6 opacity-80" style={{ backgroundColor: theme.colors.accent }} />
        <SlideSubHeadline page={{...page, subtitle: displaySubtitle}} typography={typography} className={`!tracking-[0.2em] !font-bold !uppercase !m-0 !p-0 !whitespace-pre-line !leading-[1.2] ${isImageRight ? 'text-right' : 'text-left'}`} size="0.75rem" color={theme.colors.secondary} style={{ marginBottom: '-0.25rem' }} />
      </div>
    </div>
  );
}