import React from 'react';
import { PageData } from '../../types';
import { SlideHeadline } from '../ui/slide/SlideHeadline';

/**
 * EditorialBackCover - 极简杂志封底
 * 优化版：加深底部版权信息颜色，提升可读性。
 */
export default function EditorialBackCover({ page }: { page: PageData }) {
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
          maxSize={32} 
          minSize={16}
          weight={300}
          italic={true}
          className="!tracking-[0.4em] !normal-case"
          style={{ 
            color: accentColor,
            fontFamily: "'Playfair Display', serif"
          }}
        />
      </div>

      {/* 2. 底部极小版权信息 */}
      <div className="absolute bottom-16 inset-x-0 flex flex-col items-center gap-3 pointer-events-none">
        {/* 装饰线也稍微加深一点点 (opacity 0.2 -> 0.3) */}
        <div className="w-6 h-[1px] opacity-30" style={{ backgroundColor: accentColor }} />
        <p 
          // 核心修复：移除 opacity-20，颜色设为 #666666 或根据 accentColor 计算出的深灰
          className="text-[7px] font-black tracking-[0.5em] uppercase text-center px-12 leading-loose"
          style={{ color: page.accentColor ? page.accentColor : '#666666' }}
        >
          {displaySubtitle}
        </p>
      </div>

    </div>
  );
}
