import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { SlideBlockLabel } from '../ui/slide/SlideBlockLabel';
import { useStore } from '../../store/useStore';

/**
 * TypographyHero - 文字主角模板
 * 最终加固版：采用极低透明度线条，营造呼吸感。
 */
export default function TypographyHero({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const theme = useStore((state) => state.theme);
  const displayTitle = page.title || 'THE UNSPOKEN LANGUAGE';
  const displaySubtitle = page.subtitle || '"Through the mask, the soul speaks louder than words ever could."';
  const displayLabel = page.imageLabel || 'CHAPTER 02';

  const backgroundColor = page.backgroundColor || theme.colors.background || '#FAFAF9';
  const accentColor = page.accentColor || theme.colors.accent || theme.colors.primary || '#000000';

  return (
    <div 
      className="w-full h-full p-24 flex flex-col justify-center transition-all duration-700 overflow-hidden isolate"
      style={{ backgroundColor }}
    >
      <div className="w-full flex flex-col items-center mx-auto">
        
        {/* 上分割线 - 降低透明度至 0.15 */}
        <div 
          className="w-full border-t mb-12 transition-colors duration-500" 
          style={{ borderColor: accentColor, opacity: 0.35 }}
        />

        {/* 主标题区 */}
        <div className="w-full mb-6">
          <SlideHeadline 
            page={{...page, title: displayTitle}} 
            typography={typography} 
            maxSize={84} 
            minSize={32} 
            weight={300} 
            italic={true} 
            className="!tracking-[0.4em] !normal-case leading-tight" 
            color={accentColor}
            style={{ textAlign: 'center' }} 
          />
        </div>

        {/* 副标题区 */}
        <div className="w-full max-w-[800px] text-center mt-6 mb-12 px-10">
          <SlideSubHeadline 
            page={{...page, subtitle: displaySubtitle}} 
            typography={typography} 
            className="!tracking-[0.15em] !font-light leading-relaxed !not-italic" 
            size="1.2rem" 
            color={theme.colors.secondary} 
            style={{ lineHeight: 2.2 }} 
          />
        </div>

        {/* 下分割线 - 降低透明度至 0.15 */}
        <div 
          className="w-full border-t mt-4 mb-16 transition-colors duration-500" 
          style={{ borderColor: accentColor, opacity: 0.35 }}
        />

        {/* 底部元数据标签 */}
        <div className="animate-in fade-in zoom-in-95 duration-1000 delay-500">
           <SlideBlockLabel 
             page={page} 
             typography={typography} 
             text={displayLabel} 
             className="!uppercase !tracking-[0.6em] !font-black !opacity-40 !border-none !p-0" 
             color={accentColor} 
             style={{ fontSize: '9px' }} 
           />
        </div>
      </div>
    </div>
  );
}
