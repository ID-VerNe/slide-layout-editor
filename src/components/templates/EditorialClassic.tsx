import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { SlideBlockLabel } from '../ui/slide/SlideBlockLabel';

/**
 * EditorialClassic - 经典留白杂志流
 * 修复版：解除右上角文字硬编码，支持全量编辑。
 */
export default function EditorialClassic({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const displayTitle = page.title || '0.5 DISTANCE';
  const displaySubtitle = page.subtitle || 'from yuu\'s lens';
  const displayLabel = page.imageLabel || 'JANUARY'; 
  const displaySubLabel = page.imageSubLabel || 'VOL.01'; 
  const displayYear = page.actionText || '2026';
  const displayFloatingLabel = page.imageSubLabel || "From Yuu's Lens"; // 映射到可编辑字段

  const displayPage = {
    ...page,
    title: displayTitle,
    subtitle: displaySubtitle,
  };

  const backgroundColor = page.backgroundColor || '#ffffff';
  const accentColor = page.accentColor || '#000000';

  // 字体计算
  const getFontFamily = (field: string, defaultLatin: string) => {
    const fieldFont = typography?.fieldOverrides?.[field];
    if (fieldFont) return fieldFont;
    const latin = typography?.defaultLatin || defaultLatin;
    const cjk = typography?.defaultCJK || "'Noto Serif SC', serif";
    return `${latin}, ${cjk}`;
  };

  const serifFont = getFontFamily('title', "'Crimson Pro', serif");

  return (
    <div 
      className="w-full h-full flex flex-col relative overflow-hidden transition-all duration-700 isolate"
      style={{ backgroundColor }}
    >
      {/* 1. 图片区域 (Top 70%) */}
      <div className="h-[70%] w-full relative overflow-hidden bg-slate-50">
        <SlideImage 
          page={page} 
          className="w-full h-full object-cover" 
          rounded="0"
          backgroundColor="transparent"
        />
        {/* 核心修正：使用 SlideBlockLabel 渲染，解除硬编码 */}
        <div className="absolute top-10 right-10 opacity-40 mix-blend-difference pointer-events-none">
          <SlideBlockLabel 
            page={page} 
            typography={typography}
            text={displayFloatingLabel}
            className="!text-[7.5px] !font-medium !tracking-[0.6em] !uppercase !italic !opacity-100"
          />
        </div>
      </div>

      {/* 2. 留白与标题区域 (Bottom 30%) */}
      <div className="h-[30%] w-full px-16 py-12 flex flex-col items-center justify-between">
        
        {/* 刊名区 */}
        <div className="flex flex-col items-center text-center mt-2">
          <SlideHeadline 
            page={displayPage} 
            typography={typography}
            maxSize={64} 
            minSize={32}
            weight={300}
            italic={true}
            className="!tracking-[0.2em] !normal-case"
            style={{ 
              color: accentColor,
              fontFamily: serifFont
            }}
          />
          <SlideSubHeadline 
            page={displayPage}
            typography={typography}
            className="mt-4 !tracking-[0.8em] uppercase !font-bold opacity-30"
            size="8px"
            color={accentColor}
          />
        </div>

        {/* 底部元数据流 */}
        <div className="w-full flex justify-between items-end border-t border-slate-100 pt-8 pb-2">
          {/* 左侧块：VOL.01 / JANUARY */}
          <div className="text-left flex flex-col justify-end">
            <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase leading-none mb-3">
              {displaySubLabel}
            </span>
            <span 
              className="text-[2.2rem] font-medium tracking-[0.1em] leading-none uppercase" 
              style={{ 
                color: accentColor,
                fontFamily: serifFont
              }}
            >
              {displayLabel}
            </span>
          </div>

          {/* 右侧块：年份 */}
          <div className="text-right">
            <span 
              className="text-[4rem] font-light italic opacity-10 tracking-tighter leading-[0.8]"
              style={{ 
                fontFamily: serifFont,
                marginBottom: '-0.12em',
                fontSize: page.styleOverrides?.actionText?.fontSize ? `${page.styleOverrides.actionText.fontSize}px` : '4rem'
              }}
            >
              {displayYear}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}