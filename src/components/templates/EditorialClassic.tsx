import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { SlideBlockLabel } from '../ui/slide/SlideBlockLabel';

/**
 * EditorialClassic - 经典留白杂志流
 * 最终加固版：底边对齐元数据全部原子化，支持全量编辑与字号调节。
 */
export default function EditorialClassic({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const displayTitle = page.title || '0.5 DISTANCE';
  const displaySubtitle = page.subtitle || 'from yuu\'s lens';
  const displayLabel = page.imageLabel || 'JANUARY'; 
  const displaySubLabel = page.imageSubLabel || 'VOL.01'; 
  const displayYear = page.actionText || '2026';
  const displayFloatingLabel = page.imageSubLabel || "From Yuu's Lens"; 

  const displayPage = {
    ...page,
    title: displayTitle,
    subtitle: displaySubtitle,
  };

  const backgroundColor = page.backgroundColor || '#ffffff';
  const accentColor = page.accentColor || '#000000';

  return (
    <div 
      className="w-full h-full flex flex-col relative overflow-hidden transition-all duration-700 isolate"
      style={{ backgroundColor }}
    >
      {/* 1. 图片区域 */}
      <div className="h-[70%] w-full relative overflow-hidden bg-slate-50">
        <SlideImage 
          page={page} 
          className="w-full h-full object-cover" 
          rounded="0"
          backgroundColor="transparent"
        />
        <div className="absolute top-10 right-10 opacity-40 mix-blend-difference pointer-events-none">
          <SlideBlockLabel 
            page={page} 
            typography={typography}
            text={displayFloatingLabel}
            className="!text-[7.5px] !font-medium !tracking-[0.6em] !uppercase !italic !opacity-100"
          />
        </div>
      </div>

      {/* 2. 留白与标题区域 */}
      <div className="h-[30%] w-full px-16 py-12 flex flex-col items-center justify-between">
        
        <div className="flex flex-col items-center text-center mt-2">
          <SlideHeadline 
            page={displayPage} 
            typography={typography}
            maxSize={64} 
            minSize={32}
            weight={300}
            italic={true}
            className="!tracking-[0.2em] !normal-case"
            style={{ color: accentColor }}
          />
          <SlideSubHeadline 
            page={displayPage}
            typography={typography}
            className="mt-4 !tracking-[0.8em] uppercase !font-bold !opacity-30"
            size="8px"
            color={accentColor}
          />
        </div>

        {/* 底部元数据流 - 核心修正：全原子化渲染 */}
        <div className="w-full flex justify-between items-end border-t border-slate-100 pt-8 pb-2">
          
          {/* 左侧：刊号与月份 */}
          <div className="text-left flex flex-col justify-end items-start gap-3">
            <SlideSubHeadline 
              page={{...page, subtitle: displaySubLabel}} 
              typography={typography}
              size="10px"
              className="!font-black !text-slate-400 !tracking-widest !uppercase !leading-none !m-0"
            />
            <SlideHeadline 
              page={{...page, title: displayLabel}} 
              typography={typography}
              maxSize={36}
              minSize={24}
              className="!font-medium !tracking-[0.1em] !leading-none !uppercase !normal-case"
              style={{ color: accentColor }}
            />
          </div>

          {/* 右侧：年份 */}
          <div className="text-right">
            <SlideHeadline 
              page={{...page, title: displayYear}} 
              typography={typography}
              maxSize={64} 
              className="!font-light !italic !opacity-10 !tracking-tighter !leading-[0.8] !normal-case"
              style={{ marginBottom: '-0.12em' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
