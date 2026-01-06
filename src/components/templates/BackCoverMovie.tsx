import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';

/**
 * BackCoverMovie - 电影谢幕风格封底
 * 修复版：支持全局字体，并确保颜色感应正确。
 */
export default function BackCoverMovie({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const displayPage = {
    ...page,
    title: page.title || 'THANKS FOR WATCHING',
    subtitle: page.subtitle || 'SEE YOU NEXT YEAR'
  };

  const backgroundColor = page.backgroundColor || '#111111';
  const viewportHeight = page.logoSize || 55;

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden px-24 py-12 transition-colors duration-500 isolate"
      style={{ backgroundColor }}
    >
      
      {/* 1. 核心图片区 */}
      <div 
        className="w-[85%] relative group shrink-0 transition-all duration-500 ease-out"
        style={{ 
          height: `${viewportHeight}%`, 
          marginBottom: `4rem`,
          WebkitMaskImage: `
            linear-gradient(to right, transparent, black 10%, black 90%, transparent),
            linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)
          `,
          maskImage: `
            linear-gradient(to right, transparent, black 10%, black 90%, transparent),
            linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)
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
      </div>

      {/* 2. 谢幕文本区域 */}
      <div className="flex flex-col items-center text-center space-y-4 z-20">
        <SlideHeadline 
          page={displayPage} 
          typography={typography}
          maxSize={48} 
          minSize={24} 
          weight={600}
          className="!tracking-[0.5em] uppercase !font-semibold"
          style={{ 
            color: page.styleOverrides?.title?.color || '#ffffff', 
            opacity: 0.8 
          }}
        />

        <div className="w-12 h-[1px] bg-white/10" />

        <SlideSubHeadline 
          page={displayPage} 
          typography={typography}
          size="12px"
          className="!tracking-[0.8em] uppercase !font-medium"
          style={{ 
            color: page.styleOverrides?.subtitle?.color || 'rgba(255,255,255,0.4)' 
          }}
        />
      </div>

    </div>
  );
}