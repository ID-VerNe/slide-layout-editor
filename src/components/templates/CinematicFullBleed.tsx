import React from 'react';
import { PageData } from '../../types';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';

/**
 * CinematicFullBleed (方案 B) - 全屏电影流封面
 * 核心设计：
 * 1. 图片 100% 铺满，无渐变，保留电影宽银幕感。
 * 2. 文字全部反白，悬浮于图片负空间。
 * 3. 极简主义：移除所有装饰线，仅保留纯粹的排版张力。
 */
export default function CinematicFullBleed({ page }: { page: PageData }) {
  const displayTitle = page.title || '0.5 DISTANCE';
  const displaySubtitle = page.subtitle || "NEW YEAR'S SPECIAL EDITION";

  const displayPage = {
    ...page,
    title: displayTitle,
    subtitle: displaySubtitle,
  };

  const accentColor = page.accentColor || '#ffffff';

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-950 transition-all duration-700">
      
      {/* 1. 背景主图 - 全屏铺满 (Full Bleed) */}
      <div className="absolute inset-0 z-0">
        <SlideImage 
          page={page} 
          className="w-full h-full" 
          rounded="0"
          backgroundColor="transparent"
        />
      </div>

      {/* 2. 悬浮文字层 - 放在底部中心以获得最强稳定性 */}
      <div className="absolute bottom-24 inset-x-0 z-10 flex flex-col items-center text-center px-20">
        {/* 副标题：放在主标题上方，增加层级感 */}
        <div className="mb-4 overflow-hidden">
          <SlideSubHeadline 
            page={displayPage}
            className="!tracking-[0.6em] uppercase !font-black animate-in slide-in-from-bottom-2 duration-1000"
            size="11px"
            color="rgba(255,255,255,0.6)"
          />
        </div>

        {/* 主标题：极细、大间距、带投影 */}
        <div className="drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]">
          <SlideHeadline 
            page={displayPage} 
            maxSize={84} 
            minSize={40}
            className="!tracking-[0.3em] !font-light italic"
            style={{ 
              color: accentColor,
              fontFamily: "'Crimson Pro', serif"
            }}
          />
        </div>

        {/* 底部微小元数据 */}
        <div className="mt-12 flex items-center gap-4 opacity-40">
          <div className="w-8 h-[1px] bg-white" />
          <p className="text-[10px] font-medium tracking-[0.4em] text-white uppercase italic">© 2026</p>
          <div className="w-8 h-[1px] bg-white" />
        </div>
      </div>

    </div>
  );
}
