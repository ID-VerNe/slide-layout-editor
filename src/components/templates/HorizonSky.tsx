import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { useStore } from '../../store/useStore';

/**
 * HorizonSky - 2:3 比例空灵感“天空/大地”布局 (精修版)
 * 特点：顶部巨大留白，副标题+主标题+段落居中排列。
 * 细节：Image Label 悬浮在分割线上方，与下方图像对称。
 */
export default function HorizonSky({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const theme = useStore((state) => state.theme);
  
  const displayTitle = page.title || 'ETHEREAL';
  const displaySubtitle = page.subtitle || ''; // 标题上方的 Teaser
  const displayParagraph = page.paragraph || ''; // 标题下方的 Verse
  const displayLabel = page.imageLabel;

  const backgroundColor = page.backgroundColor || theme.colors.background || '#ffffff';
  const titleColor = page.styleOverrides?.title?.color || theme.colors.primary || '#0F172A';
  const secondaryColor = theme.colors.secondary || '#64748B';
  const accentColor = theme.colors.accent || '#264376';

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col bg-white isolate"
      style={{ backgroundColor }}
    >
      {/* 1. 上半部分: “天空” (Sky) 负空间 */}
      <div className="flex-1 flex flex-col items-center justify-center px-[15%] pt-[5%]">
        
        {/* 副标题 (Top Teaser) - 参考 Vertical Column 字号 */}
        {displaySubtitle && (
          <SlideSubHeadline 
            page={{ ...page, subtitle: displaySubtitle }} 
            typography={typography} 
            className="!text-center !uppercase !opacity-50 !font-sans !tracking-[0.5em] mb-4"
            size="0.8rem"
            color={secondaryColor}
          />
        )}

        {/* 主标题: 优雅衬线体 */}
        <h1 
          className="text-[2.4rem] font-medium tracking-[0.5em] text-center mb-6 uppercase"
          style={{ 
            color: titleColor,
            fontFamily: page.titleFont || theme.typography.headingFont
          }}
        >
          {displayTitle}
        </h1>

        {/* 段落文本 (Minimal Verse) - 参考 Vertical Column 字号 */}
        {displayParagraph && (
          <SlideSubHeadline 
            page={{ ...page, subtitle: displayParagraph }} 
            typography={typography} 
            className="!text-center !italic !normal-case !opacity-50 !font-serif !tracking-wide"
            size="0.75rem"
            color={secondaryColor}
          />
        )}
      </div>

      {/* 2. 核心分割区: Image Label + Hairline */}
      <div className="w-full relative flex flex-col items-center">
        {/* Image Label: 放置在分割线正上方，距离与下方图片间距相等 */}
        {displayLabel && (
          <div className="mb-6"> {/* 这里的 mb-6 与下方图片容器的 mt-6 形成对称 */}
            <span 
              className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40" 
              style={{ color: secondaryColor }}
            >
              {displayLabel}
            </span>
          </div>
        )}

        {/* 地平线 (Hairline) */}
        <div 
          className="w-full h-[0.5px] opacity-20" 
          style={{ backgroundColor: accentColor }} 
        />
      </div>

      {/* 3. 下半部分: “大地” (Earth) 图像区域 */}
      <div className="h-1/2 w-full flex flex-col items-center relative pt-6"> {/* pt-6 与上方 label 间距对称 */}
        <div className="w-[70%] aspect-square mb-0 overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.02)]">
          <SlideImage 
            page={page} 
            className="w-full h-full object-cover" 
            rounded="0" 
            backgroundColor="transparent" 
          />
        </div>
      </div>

      {/* 4. 底部元数据: 仅保留右下角页码（如果开启） */}
      <div className="absolute bottom-10 right-16 z-40 pointer-events-none">
        {/* 此处 MetadataOverlay 会自动渲染页码 */}
      </div>
    </div>
  );
}
