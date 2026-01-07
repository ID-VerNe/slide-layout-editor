import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { SlideBlockLabel } from '../ui/slide/SlideBlockLabel';
import { useStore } from '../../store/useStore';

/**
 * TypographyHero - 文字主角模板
 * 最终加固版：全面感应全局主题 Token。
 */
export default function TypographyHero({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const theme = useStore((state) => state.theme);
  const displayTitle = page.title || 'THE UNSPOKEN LANGUAGE';
  const displaySubtitle = page.subtitle || '"Through the mask, the soul speaks louder than words ever could."';
  const displayLabel = page.imageLabel || 'CHAPTER 02';

  // 核心修正 1：默认底色链接至主题
  const backgroundColor = page.backgroundColor || theme.colors.background || '#FAFAF9';
  const accentColor = page.accentColor || theme.colors.accent || '#000000';

  return (
    <div 
      className="w-full h-full p-16 flex flex-col justify-center transition-all duration-700 overflow-hidden isolate"
      style={{ backgroundColor }}
    >
      <div className="w-full flex flex-col items-center">
        {/* 核心修正 2：装饰线颜色链接至主题 accent */}
        <div className="w-full h-[1px] mb-8 opacity-60" style={{ backgroundColor: accentColor }} />

        <div className="w-full mb-4 pl-6">
          <SlideHeadline page={{...page, title: displayTitle}} typography={typography} maxSize={72} minSize={32} weight={300} italic={true} className="!tracking-[0.3em] !normal-case leading-tight" style={{ color: accentColor, textAlign: 'center' }} />
        </div>

        <div className="w-[70%] text-center mt-8">
          <SlideSubHeadline page={{...page, subtitle: displaySubtitle}} typography={typography} className="!tracking-[0.1em] !font-light leading-relaxed !not-italic" size="1.15rem" color={theme.colors.secondary} style={{ lineHeight: 2.0 }} />
        </div>

        {/* 核心修正 3：装饰线颜色链接至主题 accent */}
        <div className="w-full h-[1px] mt-8 mb-12 opacity-60" style={{ backgroundColor: accentColor }} />

        <div className="animate-in fade-in zoom-in-95 duration-1000 delay-500">
           <SlideBlockLabel page={page} typography={typography} text={displayLabel} className="!uppercase !tracking-[0.5em] !font-black !opacity-25 !border-none !p-0" color={accentColor} style={{ fontSize: '8px' }} />
        </div>
      </div>
    </div>
  );
}
