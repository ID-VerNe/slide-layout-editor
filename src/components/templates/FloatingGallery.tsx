import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { useStore } from '../../store/useStore';

/**
 * FloatingGallery - 2:3 比例悬浮画框布局 (全局对齐版)
 * 特点：居中偏上悬浮图像，底部角落 Label 与全局页码位置严格对齐。
 */
export default function FloatingGallery({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const theme = useStore((state) => state.theme);
  
  const displayTitle = page.title || 'REVEAL';
  const displayVerse = page.subtitle || '';
  const displayParagraph = page.paragraph || '';
  const displayLabel = page.imageLabel;

  const backgroundColor = page.backgroundColor || theme.colors.background || '#ffffff';
  const titleColor = page.styleOverrides?.title?.color || theme.colors.primary || '#0F172A';
  const secondaryColor = theme.colors.secondary || '#64748B';
  const accentColor = theme.colors.accent || '#264376';
  
  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col items-center bg-white isolate"
      style={{ backgroundColor }}
    >
      {/* 1. 图像容器: 居中偏上 */}
      <div className="w-full flex flex-col items-center pt-[15%] px-[15%]">
        <div className="w-full aspect-[4/5] relative shadow-[0_40px_100px_rgba(0,0,0,0.06)] bg-slate-50 overflow-hidden z-10">
          <SlideImage 
            page={page} 
            className="w-full h-full object-cover" 
            rounded="0" 
            backgroundColor="transparent" 
          />
        </div>

        {/* 2. 标题与诗意短句 (Poetic Verse) */}
        <div className="mt-[12%] w-full flex flex-col items-center">
          <SlideHeadline 
            page={{ ...page, title: displayTitle }} 
            typography={typography} 
            maxSize={48} 
            minSize={24} 
            className="!tracking-[0.4em] !uppercase !italic !font-light" 
            style={{ color: titleColor }} 
          />
          
          <div className="w-8 h-[0.5px] mt-6 mb-6 opacity-30" style={{ backgroundColor: accentColor }} />

          <SlideSubHeadline 
            page={{ ...page, subtitle: displayVerse }} 
            typography={typography} 
            className="!leading-relaxed !normal-case !font-serif !opacity-60 text-center !tracking-widest"
            size="0.65rem"
            color={secondaryColor}
          />
        </div>
      </div>

      {/* 3. 底部段落 (Paragraph) */}
      <div className="mt-auto w-full pb-[15%] px-[18%] text-center">
        <SlideSubHeadline 
          page={{ ...page, subtitle: displayParagraph }} 
          typography={typography} 
          className="!leading-[1.8] !normal-case !font-serif !opacity-40 text-center"
          size="0.6rem"
          color={secondaryColor}
        />
      </div>

      {/* 4. 底部装饰: 对齐全局页码位置 */}
      {/* 
          核心修复：参考 MetadataOverlay.tsx 中的布局
          bottom: 10 (2.5rem), left: 16 (4rem)
      */}
      <div className="absolute bottom-10 left-16 z-40 pointer-events-none">
        <span 
          className="text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500" 
          style={{ color: page.counterColor || '#64748b', opacity: 0.4 }}
        >
          {displayLabel}
        </span>
      </div>

      {/* 注：右侧页码由全局 MetadataOverlay 自动渲染，此处不再重复渲染以防重叠 */}
    </div>
  );
}
