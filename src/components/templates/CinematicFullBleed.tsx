import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { SlideBlockLabel } from '../ui/slide/SlideBlockLabel';
import { useStore } from '../../store/useStore';

/**
 * CinematicFullBleed - 全屏电影流封面
 * 升级版：支持顶部/底部布局切换，以及标题位置微调。
 */
export default function CinematicFullBleed({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const theme = useStore((state) => state.theme);
  
  const displayTitle = page.title || '0.5 DISTANCE';
  const displaySubtitle = page.subtitle || "NEW YEAR'S SPECIAL EDITION";
  // 核心：页脚内容由 imageLabel 驱动
  const displayLabel = page.imageLabel || '© 2026';

  const isTopMode = page.layoutVariant === 'top';
  // 提取位置偏移量
  const titleY = page.styleOverrides?.title?.translateY || 0;

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

      {/* 2. 顶置模式 - 标题层 */}
      {isTopMode && (
        <div 
          className="absolute top-32 inset-x-0 z-20 flex flex-col items-center text-center px-20 pointer-events-none"
          style={{ transform: `translateY(${titleY}px)` }}
        >
          <div className="drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]">
            <SlideHeadline 
              page={{ ...page, title: displayTitle }} 
              typography={typography}
              maxSize={96} 
              minSize={40}
              weight={300}
              italic={true}
              className="!tracking-[0.4em] !normal-case"
            />
          </div>
        </div>
      )}

      {/* 3. 底部信息层 */}
      <div className="absolute bottom-24 inset-x-0 z-10 flex flex-col items-center text-center px-20">
        
        {/* 在底部模式下，Headline 渲染在这里 */}
        {!isTopMode && (
          <>
            <div className="mb-4 overflow-hidden">
              <SlideSubHeadline 
                page={{ ...page, subtitle: displaySubtitle }}
                typography={typography}
                className="!tracking-[0.6em] uppercase !font-black animate-in slide-in-from-bottom-2 duration-1000"
                size="11px"
              />
            </div>
            <div className="drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)] mb-12">
              <SlideHeadline 
                page={{ ...page, title: displayTitle }} 
                typography={typography}
                maxSize={84} 
                minSize={40}
                weight={300}
                italic={true}
                className="!tracking-[0.3em] !normal-case"
              />
            </div>
          </>
        )}

        {/* 在顶置模式下，Subtitle 紧贴页脚上方 */}
        {isTopMode && (
          <div className="mb-8 overflow-hidden opacity-80">
            <SlideSubHeadline 
              page={{ ...page, subtitle: displaySubtitle }}
              typography={typography}
              className="!tracking-[0.5em] uppercase !font-bold"
              size="10px"
            />
          </div>
        )}

        {/* 通用页脚元数据 */}
        <div className="flex items-center gap-4 opacity-40">
          <div className="w-8 h-[1px]" style={{ backgroundColor: theme.colors.accent }} />
          <SlideBlockLabel 
            page={page} 
            typography={typography}
            text={displayLabel}
            className="!tracking-[0.4em] !italic !opacity-100 !border-none !p-0"
            color={theme.colors.accent}
          />
          <div className="w-8 h-[1px]" style={{ backgroundColor: theme.colors.accent }} />
        </div>
      </div>

    </div>
  );
}
