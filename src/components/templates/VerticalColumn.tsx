import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { useStore } from '../../store/useStore';

/**
 * VerticalColumn - 2:3 比例垂直边栏布局 (精修版 v3)
 * 特点：左侧 65% 出血大图，右侧 35% 边栏。
 * 构图：[段落] | [副标题] | [主标题] 三个垂直块并排，全体居中，竖线自适应。
 */
export default function VerticalColumn({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const theme = useStore((state) => state.theme);
  
  const isRightLayout = page.layoutVariant === 'right';
  
  const displayTitle = page.title || 'ZENITH';
  const displaySubtitle = page.subtitle || ''; 
  const displayParagraph = page.paragraph || ''; 
  const displayLabel = page.imageLabel;

  const backgroundColor = page.backgroundColor || theme.colors.background || '#ffffff';
  const titleColor = page.styleOverrides?.title?.color || theme.colors.primary || '#0F172A';
  const secondaryColor = theme.colors.secondary || '#64748B';
  const accentColor = theme.colors.accent || '#264376';
  
  const titleChars = displayTitle.split('');
  const subtitleChars = displaySubtitle.split('');
  const paragraphChars = displayParagraph.split('');

  return (
    <div 
      className={`w-full h-full relative overflow-hidden flex bg-white isolate ${isRightLayout ? 'flex-row-reverse' : 'flex-row'}`}
      style={{ backgroundColor }}
    >
      {/* 1. 图像位置: 出血大图, 宽度 65% */}
      <div className={`w-[65%] h-full relative overflow-hidden z-10 ${isRightLayout ? 'shadow-[-20px_0_60px_rgba(0,0,0,0.03)]' : 'shadow-[20px_0_60px_rgba(0,0,0,0.03)]'}`}>
        <SlideImage 
          page={page} 
          className="w-full h-full object-cover" 
          rounded="0" 
          backgroundColor="transparent" 
        />
      </div>

      {/* 2. 右侧垂直边栏: 宽度 35% */}
      <div className="w-[35%] h-full relative flex flex-col items-center z-20 px-6 py-20 bg-white">
        
        {/* 核心排版组: 段落(竖) | 副标题(竖) | 垂直标题(竖) - 上端对齐，整体居中 */}
        <div className="flex-1 flex items-center justify-center w-full">
          <div className="flex items-start gap-6 h-fit max-h-[85%]">
            
            {/* 段落文本 (最左侧，支持自动换行/分列) */}
            {displayParagraph && (
              <div 
                className="opacity-40 italic text-[0.75rem] font-medium leading-[1.8] tracking-[0.1em] [writing-mode:vertical-rl] [text-orientation:upright] max-h-[70%] text-left pt-1"
                style={{ 
                  color: secondaryColor,
                  fontFamily: theme.typography.serifFont
                }}
              >
                {displayParagraph}
              </div>
            )}

            {/* 副标题与自适应竖线组: 竖线长度锚定副标题，并留出半个字母空位 */}
            {displaySubtitle ? (
              <div className="relative flex items-start h-fit">
                {/* 第一根竖向分隔线 (左侧) */}
                {displayParagraph && (
                  <div 
                    className="absolute -left-3 top-[0.4rem] bottom-[0.4rem] w-[0.5px] opacity-15" 
                    style={{ backgroundColor: accentColor }} 
                  />
                )}

                {/* 副标题 (中间，垂直堆叠) */}
                <div 
                  className="flex flex-col items-center gap-1.5 opacity-60 uppercase tracking-[0.4em] pt-0.5"
                  style={{ 
                    color: secondaryColor,
                    fontFamily: theme.typography.sansFont
                  }}
                >
                  {subtitleChars.map((char, i) => (
                    <span key={i} className="text-[0.8rem] font-bold leading-none">
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  ))}
                </div>

                {/* 第二根竖向分隔线 (右侧) */}
                <div 
                  className="absolute -right-3 top-[0.4rem] bottom-[0.4rem] w-[0.5px] opacity-20" 
                  style={{ backgroundColor: accentColor }} 
                />
              </div>
            ) : (
              /* 如果没有副标题，但在段落和主标题间需要一根基础分割线 */
              displayParagraph && (
                <div className="w-[0.5px] h-32 opacity-15" style={{ backgroundColor: accentColor }} />
              )
            )}

            {/* 主标题 (最右侧，垂直堆叠) */}
            <div 
              className="flex flex-col items-center gap-2"
              style={{ 
                color: titleColor, 
                fontFamily: page.titleFont || theme.typography.headingFont 
              }}
            >
              {titleChars.map((char, i) => (
                <span 
                  key={i} 
                  className="text-[2.2rem] font-black leading-none uppercase tracking-tighter"
                >
                  {char}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 底部留白，不再放置 paragraph */}
        <div className="w-full mt-auto mb-10 h-6"></div>
      </div>

      {/* 3. 全局元数据: 图片标注位置随图像移动 */}
      <div className={`absolute bottom-10 z-40 pointer-events-none ${isRightLayout ? 'right-16' : 'left-16'}`}>
        <span 
          className="text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500" 
          style={{ color: '#ffffff', mixBlendMode: 'difference', opacity: 0.6 }}
        >
          {displayLabel}
        </span>
      </div>
    </div>
  );
}
