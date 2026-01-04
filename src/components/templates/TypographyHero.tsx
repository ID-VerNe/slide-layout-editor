import React from 'react';
import { PageData } from '../../types';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';

/**
 * TypographyHero - 文字主角模板
 * 核心：文字即图形，利用横线分割层级，高冲击力排版。
 */
export default function TypographyHero({ page }: { page: PageData }) {
  const displayTitle = page.title || 'THE UNSPOKEN LANGUAGE';
  const displaySubtitle = page.subtitle || '"Through the mask, the soul speaks louder than words ever could."';
  const displayLabel = page.imageLabel || 'SECTION 02';

  const backgroundColor = page.backgroundColor || '#FAFAF9';
  const accentColor = page.accentColor || '#000000';

  return (
    <div 
      className="w-full h-full p-16 flex flex-col justify-center transition-all duration-700 overflow-hidden"
      style={{ backgroundColor }}
    >
      {/* 顶部线条 */}
      <div className="w-full h-[1.5px] mb-8 opacity-80" style={{ backgroundColor: accentColor }} />

      {/* 核心大标题 */}
      <div className="space-y-6">
        <SlideHeadline 
          page={{...page, title: displayTitle}} 
          maxSize={80} 
          minSize={40}
          weight={300}
          className="!tracking-tight !normal-case leading-tight"
          style={{ 
            color: accentColor,
            fontFamily: "'Playfair Display', serif",
            textAlign: 'left'
          }}
        />
      </div>

      {/* 中间线条 */}
      <div className="w-full h-[1.5px] mt-8 mb-8 opacity-80" style={{ backgroundColor: accentColor }} />

      {/* 副标题/引言 */}
      <div className="w-[85%]">
        <SlideSubHeadline 
          page={{...page, subtitle: displaySubtitle}}
          className="italic !tracking-normal !font-light leading-relaxed"
          size="1.5rem"
          color="#4b5563"
          style={{ fontFamily: "'Lora', serif" }}
        />
      </div>

      {/* 底部装饰：极小的序号 */}
      <div className="mt-16 animate-in fade-in slide-in-from-left-4 duration-1000 delay-500">
         <span 
           className="font-mono text-5xl font-bold opacity-10 tracking-tighter italic"
           style={{ color: accentColor }}
         >
           {displayLabel}
         </span>
      </div>
    </div>
  );
}
