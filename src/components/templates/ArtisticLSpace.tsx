import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { useStore } from '../../store/useStore';

/**
 * ArtisticLSpace - 2:3 比例专属艺术布局 (全局对齐版)
 * 特点：出血大图与 L 型负空间。支持左右镜像，且 Label 与全局页码对齐。
 */
export default function ArtisticLSpace({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const theme = useStore((state) => state.theme);
  
  // 默认是右侧布局 (isRight = true)
  const isRight = page.layoutVariant !== 'left';
  
  const displayTitle = page.title || 'SILENCE';
  const displayParagraph = page.subtitle || 'The whispers of the soul are found in the empty spaces between our thoughts.';
  const displayLabel = page.imageLabel;

  const backgroundColor = page.backgroundColor || theme.colors.background || '#ffffff';
  const titleColor = page.styleOverrides?.title?.color || theme.colors.primary || '#0F172A';
  const accentColor = theme.colors.accent || '#264376';
  
  const titleChars = displayTitle.split('');

  return (
    <div 
      className="w-full h-full relative overflow-hidden"
      style={{ backgroundColor }}
    >
      {/* 1. 图像位置: 绝对出血 75% x 75% */}
      <div 
        className={`absolute bottom-0 w-[75%] h-[75%] ${isRight ? 'right-0' : 'left-0'}`}
      >
        <SlideImage 
          page={page} 
          className="w-full h-full object-cover" 
          rounded="0" 
          backgroundColor="transparent" 
        />
      </div>

      {/* 2. 留白策略: 25% 垂直留白通道 (放置垂直标题) */}
      <div 
        className={`absolute top-0 w-[25%] h-full flex flex-col items-center justify-end z-20 pb-16 pointer-events-none ${isRight ? 'left-0' : 'right-0'}`}
      >
        <div 
          className="flex flex-col items-center gap-1"
          style={{ color: titleColor, fontFamily: page.titleFont || theme.typography.headingFont }}
        >
          {titleChars.map((char, i) => (
            <span 
              key={i} 
              className="text-[3.5rem] font-normal leading-none uppercase tracking-tighter"
              style={{ fontSize: 'clamp(2rem, 8vh, 4rem)' }}
            >
              {char}
            </span>
          ))}
        </div>
      </div>

      {/* 3. 留白策略: 顶部 25% 水平留白通道 (放置手记) */}
      <div className={`absolute top-0 left-0 w-full h-[25%] pt-[6%] z-30 px-[4%]`}>
        <div className={`w-full max-w-[21%] ${isRight ? 'ml-auto' : 'mr-auto'}`}>
          <div className={`flex flex-col ${isRight ? 'items-end text-right' : 'items-start text-left'}`}>
            <SlideSubHeadline 
              page={{ ...page, subtitle: displayParagraph }} 
              typography={typography} 
              className="!italic !leading-relaxed !normal-case !font-serif !opacity-80"
              size="0.65rem"
              color={theme.colors.secondary}
            />
            <div className="w-6 h-[1px] mt-4" style={{ backgroundColor: accentColor }} />
          </div>
        </div>
      </div>

      {/* 4. 底部装饰: 对齐全局页码位置 (动态镜像) */}
      {/* 
          核心修复：参考 MetadataOverlay.tsx 中的布局
          如果 Image 在右 (isRight)，页码在左，则 Label 在右。
          如果 Image 在左 (!isRight)，页码在右，则 Label 在左。
      */}
      <div className={`absolute bottom-10 z-40 pointer-events-none ${isRight ? 'right-16 text-right' : 'left-16 text-left'}`}>
        <span 
          className="text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500" 
          style={{ color: page.counterColor || '#64748b', opacity: 0.4 }}
        >
          {displayLabel}
        </span>
      </div>
    </div>
  );
}
