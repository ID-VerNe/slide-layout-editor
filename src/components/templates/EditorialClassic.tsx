import React from 'react';
import { PageData } from '../../types';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';

/**
 * EditorialClassic - 经典留白杂志流
 * 视觉进化版：针对本模板特定的副标题微调（更小字号、双倍字距）。
 */
export default function EditorialClassic({ page }: { page: PageData }) {
  const displayTitle = page.title || '0.5 DISTANCE';
  const displaySubtitle = page.subtitle || 'The Portrait Photography Collection';
  const displayLabel = page.imageLabel || 'JANUARY'; 
  const displaySubLabel = page.imageSubLabel || 'VOL.01'; 

  const displayPage = {
    ...page,
    title: displayTitle,
    subtitle: displaySubtitle,
  };

  const backgroundColor = page.backgroundColor || '#ffffff';
  const accentColor = page.accentColor || '#000000';

  return (
    <div 
      className="w-full h-full flex flex-col relative overflow-hidden bg-white transition-all duration-700"
      style={{ backgroundColor }}
    >
      {/* 1. 图片区域 (Top 70%) */}
      <div className="h-[70%] w-full relative overflow-hidden bg-slate-50">
        <SlideImage 
          page={page} 
          className="w-full h-full" 
          rounded="0"
          backgroundColor="transparent"
        />
        <div className="absolute top-10 right-10 opacity-40 mix-blend-difference pointer-events-none">
          <p 
            className="text-[7.5px] font-medium tracking-[0.6em] uppercase italic"
            style={{ fontFamily: "'Crimson Pro', serif" }}
          >
            From Yuu's Lens
          </p>
        </div>
      </div>

      {/* 2. 留白与标题区域 (Bottom 30%) */}
      <div className="h-[30%] w-full px-16 py-12 flex flex-col items-center justify-between">
        
        {/* 刊名区 */}
        <div className="flex flex-col items-center text-center mt-2">
          <SlideHeadline 
            page={displayPage} 
            maxSize={64} 
            minSize={32}
            className="!tracking-[0.2em] !font-light italic"
            style={{ 
              color: accentColor,
              fontFamily: "'Crimson Pro', serif" 
            }}
          />
          {/* 
            局部微调：
            1. size 从 10px 缩小至 8px
            2. tracking 从 0.4em 倍增至 0.8em
          */}
          <SlideSubHeadline 
            page={displayPage}
            className="mt-4 !tracking-[0.8em] uppercase !font-bold opacity-30"
            size="8px"
            color={accentColor}
          />
        </div>

        {/* 底部元数据流 */}
        <div className="w-full flex justify-between items-end border-t border-slate-100 pt-8 pb-2">
          {/* 左侧块 */}
          <div className="text-left flex flex-col justify-end">
            <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase leading-none mb-3">
              {displaySubLabel}
            </span>
            <span 
              className="text-[2.2rem] font-medium tracking-[0.1em] leading-none uppercase" 
              style={{ 
                color: accentColor,
                fontFamily: "'Crimson Pro', serif"
              }}
            >
              {displayLabel}
            </span>
          </div>

          {/* 右侧块：2026 */}
          <div className="text-right">
            <span 
              className="text-[4rem] font-light italic opacity-10 tracking-tighter leading-[0.8]" 
              style={{ 
                fontFamily: "'Crimson Pro', serif",
                marginBottom: '-0.12em' 
              }}
            >
              2026
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
