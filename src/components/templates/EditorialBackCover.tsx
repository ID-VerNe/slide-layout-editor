import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideHeadline } from '../ui/slide/SlideHeadline';

/**
 * EditorialBackCover - 极简杂志封底
 * 修复版：感应全局字体设置。
 */
export default function EditorialBackCover({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const displayTitle = page.title || 'THANKS';
  const displaySubtitle = page.subtitle || 'SlideGrid Studio // All Rights Reserved';

  const backgroundColor = page.backgroundColor || '#ffffff';
  const accentColor = page.accentColor || '#000000';

  return (
    <div 
      className="w-full h-full relative flex flex-col items-center justify-center transition-all duration-700 isolate"
      style={{ backgroundColor }}
    >
      
      {/* 1. 中央缩小版标题 */}
      <div className="max-w-[60%] text-center">
        <SlideHeadline 
          page={{...page, title: displayTitle}} 
          typography={typography}
          maxSize={32} 
          minSize={16}
          weight={300}
          italic={true}
          className="!tracking-[0.4em] !normal-case"
          style={{ color: accentColor }}
        />
      </div>

      {/* 2. 底部极小版权信息 */}
      <div className="absolute bottom-16 inset-x-0 flex flex-col items-center gap-3 pointer-events-none">
        <div className="w-6 h-[1px] opacity-30" style={{ backgroundColor: accentColor }} />
        <p 
          className="text-[7px] font-black tracking-[0.5em] uppercase text-center px-12 leading-loose"
          style={{ 
            color: page.accentColor ? page.accentColor : '#666666',
            // 核心：使用 Subtitle 字体
            fontFamily: typography?.fieldOverrides?.['subtitle'] || `${typography?.defaultLatin}, ${typography?.defaultCJK}`
          }}
        >
          {displaySubtitle}
        </p>
      </div>

    </div>
  );
}