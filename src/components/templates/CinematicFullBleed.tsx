import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { SlideBlockLabel } from '../ui/slide/SlideBlockLabel';

/**
 * CinematicFullBleed - 全屏电影流封面
 * 修复版：移除硬编码字体，支持底部文字可编辑。
 */
export default function CinematicFullBleed({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const displayTitle = page.title || '0.5 DISTANCE';
  const displaySubtitle = page.subtitle || "NEW YEAR'S SPECIAL EDITION";
  const displayLabel = page.imageLabel || '© 2026';

  const displayPage = {
    ...page,
    title: displayTitle,
    subtitle: displaySubtitle,
  };

  const accentColor = page.accentColor || '#ffffff';

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-950 transition-all duration-700 isolate">
      
      {/* 1. 背景主图 */}
      <div className="absolute inset-0 z-0">
        <SlideImage 
          page={page} 
          className="w-full h-full" 
          rounded="0"
          backgroundColor="transparent"
        />
      </div>

      {/* 2. 悬浮文字层 */}
      <div className="absolute bottom-24 inset-x-0 z-10 flex flex-col items-center text-center px-20">
        <div className="mb-4 overflow-hidden">
          <SlideSubHeadline 
            page={displayPage}
            typography={typography}
            className="!tracking-[0.6em] uppercase !font-black animate-in slide-in-from-bottom-2 duration-1000"
            size="11px"
            color="rgba(255,255,255,0.6)"
          />
        </div>

        <div className="drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]">
          <SlideHeadline 
            page={displayPage} 
            typography={typography}
            maxSize={84} 
            minSize={40}
            weight={300}
            italic={true}
            className="!tracking-[0.3em] !normal-case"
            style={{ color: accentColor }}
          />
        </div>

        {/* 底部微小元数据 - 核心修正：接入 SlideBlockLabel */}
        <div className="mt-12 flex items-center gap-4 opacity-40">
          <div className="w-8 h-[1px] bg-white" />
          <SlideBlockLabel 
            page={page} 
            typography={typography}
            text={displayLabel}
            className="!tracking-[0.4em] !italic !opacity-100"
            color="#ffffff"
          />
          <div className="w-8 h-[1px] bg-white" />
        </div>
      </div>

    </div>
  );
}