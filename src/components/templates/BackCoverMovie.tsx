import React from 'react';
import { PageData } from '../../types';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';

/**
 * BackCoverMovie - 电影谢幕风格封底
 * 紧凑版：优化垂直间距，使核心视觉元素更向中心聚焦。
 */
export default function BackCoverMovie({ page }: { page: PageData }) {
  const displayPage = {
    ...page,
    title: page.title || 'THANKS FOR WATCHING',
    subtitle: page.subtitle || 'SEE YOU NEXT YEAR'
  };

  const backgroundColor = page.backgroundColor || '#111111';

  // 映射 logoSize 为图片高度百分比，默认 55%
  const viewportHeight = page.layoutId === 'back-cover-movie' 
    ? (page.logoSize || 55) 
    : 55;

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden px-24 py-12 transition-colors duration-500"
      style={{ backgroundColor }}
    >
      
      {/* 
        1. 核心图片区
        紧凑调整：将 marginBottom 从原来的动态计算大幅减小，保持在 3rem - 5rem 之间
      */}
      <div 
        className="w-[85%] relative group shrink-0 transition-all duration-500 ease-out"
        style={{ 
          height: `${viewportHeight}%`, 
          marginBottom: `${Math.max(3, 6 - (viewportHeight - 50)/8)}rem`,
          WebkitMaskImage: `
            linear-gradient(to right, transparent, black 15%, black 85%, transparent),
            linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)
          `,
          maskImage: `
            linear-gradient(to right, transparent, black 15%, black 85%, transparent),
            linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)
          `,
          WebkitMaskComposite: 'source-in',
          maskComposite: 'intersect',
        }}
      >
        <SlideImage 
          page={page} 
          className="w-full h-full" 
          style={{ filter: 'contrast(1.1) brightness(0.9)' }}
          rounded="0" 
          backgroundColor="transparent"
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/5 via-transparent to-black/20 opacity-30" />
      </div>

      {/* 2. 谢幕文本区域 - 减小垂直间距 (space-y-8 -> space-y-4) */}
      <div className="flex flex-col items-center text-center space-y-4 z-20">
        {/* 主标题 */}
        <div className="relative">
          <SlideHeadline 
            page={displayPage} 
            maxSize={48} 
            minSize={24} 
            color="#ffffff"
            weight={600}
            className="!tracking-[0.5em] uppercase !font-semibold"
            style={{ color: '#ffffff', opacity: 0.8 }}
          />
        </div>

        {/* 装饰线 - 调整粗细和透明度使其更精致 */}
        <div className="w-12 h-[1px] bg-white/10" />

        {/* 副标题 */}
        <div className="relative">
          <SlideSubHeadline 
            page={displayPage} 
            size="13px"
            color="rgba(255,255,255,0.4)"
            className="!tracking-[0.8em] uppercase font-medium"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          />
        </div>
      </div>

    </div>
  );
}
