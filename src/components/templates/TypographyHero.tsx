import React from 'react';
import { PageData } from '../../types';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';

/**
 * TypographyHero - 文字主角模板
 * 衬线体统一版：所有正文内容应用衬线体，保持高级的纸媒质感。
 */
export default function TypographyHero({ page }: { page: PageData }) {
  const displayTitle = page.title || 'THE UNSPOKEN LANGUAGE';
  const displaySubtitle = page.subtitle || '"Through the mask, the soul speaks louder than words ever could."';
  const displayLabel = page.imageLabel || 'CHAPTER 02';

  const backgroundColor = page.backgroundColor || '#FAFAF9';
  const accentColor = page.accentColor || '#000000';

  return (
    <div 
      className="w-full h-full p-16 flex flex-col justify-center transition-all duration-700 overflow-hidden isolate"
      style={{ backgroundColor }}
    >
      
      <div className="w-full flex flex-col items-center">
        
        {/* 顶部线条 */}
        <div className="w-full h-[1px] mb-8 opacity-60" style={{ backgroundColor: accentColor }} />

        {/* 1. 核心大标题 - Serif */}
        <div className="w-full mb-4 pl-6">
          <SlideHeadline 
            page={{...page, title: displayTitle}} 
            maxSize={72} 
            minSize={32}
            weight={300}
            italic={true}
            className="!tracking-[0.3em] !normal-case leading-tight"
            style={{ 
              color: accentColor,
              fontFamily: page.titleFont || "'Playfair Display', serif",
              textAlign: 'center'
            }}
          />
        </div>

        {/* 2. 副标题 / 引言 - 强制应用 Serif (Lora) */}
        <div className="w-[70%] text-center mt-8">
          <SlideSubHeadline 
            page={{...page, subtitle: displaySubtitle}}
            className="!tracking-[0.1em] !font-light leading-relaxed !not-italic"
            size="1.15rem" 
            color="#4b5563"
            style={{ 
              // 核心修复：应用衬线体
              fontFamily: page.bodyFont || "'Lora', serif",
              lineHeight: 2.0 
            }}
          />
        </div>

        {/* 中间/底部线条 */}
        <div className="w-full h-[1px] mt-8 mb-12 opacity-60" style={{ backgroundColor: accentColor }} />

        {/* 3. 极稀疏元数据 (保持 Sans 以增加设计对比度) */}
        <div className="animate-in fade-in zoom-in-95 duration-1000 delay-500">
           <p 
             className="uppercase !tracking-[0.5em] font-black"
             style={{ 
               color: accentColor, 
               fontFamily: "'Inter', sans-serif",
               fontSize: '8px',
               opacity: 0.25
             }}
           >
             {displayLabel}
           </p>
        </div>

      </div>

    </div>
  );
}
