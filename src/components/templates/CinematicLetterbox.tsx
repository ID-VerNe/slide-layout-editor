import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { useStore } from '../../store/useStore';

/**
 * CinematicLetterbox - 2:3 比例电影感信箱排版 (最终精修版)
 * 特点：字幕直接打在图片内部，文字字号整体略微放大以增强存在感。
 */
export default function CinematicLetterbox({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const theme = useStore((state) => state.theme);
  
  const displayTitle = page.title || 'CINEMATIC';
  const displaySubHeadline = page.subtitle || ''; 
  const displayParagraph = page.paragraph || ''; 
  const displayLabel = page.imageLabel;

  const backgroundColor = page.backgroundColor || theme.colors.background || '#ffffff';
  const titleColor = page.styleOverrides?.title?.color || theme.colors.primary || '#0F172A';
  const secondaryColor = theme.colors.secondary || '#64748B';
  const accentColor = theme.colors.accent || '#264376';
  
  const titleChars = displayTitle.toUpperCase().split('');

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col items-center bg-white isolate"
      style={{ backgroundColor }}
    >
      {/* 1. 图像容器: 略微偏上 */}
      <div className="w-full aspect-[16/9] relative shadow-[0_30px_80px_rgba(0,0,0,0.04)] z-10 mt-[15%] group">
        <SlideImage 
          page={page} 
          className="w-full h-full object-cover" 
          rounded="0" 
          backgroundColor="transparent" 
        />
        
        {/* 核心修改：Paragraph 直接打进图片内部，模拟电影字幕 */}
        <div className="absolute bottom-6 left-16 right-16 z-20 pointer-events-none">
          <SlideSubHeadline 
            page={{ ...page, subtitle: displayParagraph }} 
            typography={typography} 
            className="!text-left !normal-case !font-serif !text-white !opacity-95 !leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
            size="0.85rem" // 稍微放大字号
            color="#FFFFFF"
          />
        </div>

        {/* 遮罩：轻微底部渐变以确保字幕可读性 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60 pointer-events-none" />
      </div>

      {/* 2. 底部标题组: 垂直分布 */}
      <div className="mt-auto mb-[15%] w-full px-[12%] flex flex-col items-center pointer-events-none">
        
        {/* SubHeadline (Top Teaser) - 放大字号 */}
        {displaySubHeadline && (
          <SlideSubHeadline 
            page={{ ...page, subtitle: displaySubHeadline }} 
            typography={typography} 
            className="!text-center !uppercase !opacity-60 !font-sans !tracking-[0.6em] mb-6"
            size="0.7rem" // 稍微放大字号
            color={secondaryColor}
          />
        )}

        {/* 极细分割线 */}
        <div className="w-full h-[0.5px] mb-10 opacity-30" style={{ backgroundColor: accentColor }} />

        {/* 主标题 */}
        <div 
          className="w-full max-w-[92%] flex justify-between items-center"
          style={{ 
            color: titleColor, 
            fontFamily: page.titleFont || theme.typography.headingFont,
          }}
        >
          {titleChars.map((char, i) => (
            <span 
              key={i} 
              className="text-[1.1rem] sm:text-[1.35rem] font-medium uppercase italic"
              style={{ letterSpacing: '0' }}
            >
              {char === ' ' ? '\u00A0\u00A0' : char}
            </span>
          ))}
        </div>
      </div>

      {/* 3. 底部元数据 */}
      <div className="absolute bottom-10 left-16 z-40 pointer-events-none">
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
