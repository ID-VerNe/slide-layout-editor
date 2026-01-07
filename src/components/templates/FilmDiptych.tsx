import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideBlockLabel } from '../ui/slide/SlideBlockLabel';

/**
 * FilmDiptych - 胶片双联画模板
 * 最终加固版：全原子化渲染，支持字号微调。
 */
export default function FilmDiptych({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const gallery = page.gallery || [];
  const variant = page.layoutVariant || 'horizontal';
  const isVertical = variant === 'vertical';
  
  const displayLabel = page.imageLabel || 'SEQUENCE 04 · MOVEMENT STUDY';
  const backgroundColor = page.backgroundColor || '#FAFAF9';
  const accentColor = page.accentColor || '#a8a29e';

  return (
    <div 
      className="w-full h-full relative flex flex-col transition-all duration-700 overflow-hidden items-center justify-center p-20 isolate"
      style={{ backgroundColor }}
    >
      {/* 核心内容区 */}
      <div 
        className={`flex w-full h-full animate-in fade-in zoom-in-95 duration-1000
          ${isVertical ? 'flex-col gap-12' : 'flex-row gap-3'}`}
      >
        
        <div 
          className={`relative group bg-slate-50 overflow-hidden shadow-sm transition-all duration-700
            ${isVertical ? 'h-[70%] w-full' : 'flex-1 h-full'}`}
        >
          {gallery[0]?.url ? (
            <SlideImage 
              page={page} src={gallery[0].url} config={gallery[0].config}
              className="w-full h-full object-cover" rounded="0"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-200 uppercase tracking-tighter">Frame A</div>
          )}
        </div>

        <div 
          className={`relative group bg-slate-50 overflow-hidden shadow-sm transition-all duration-700
            ${isVertical ? 'h-[30%] w-full' : 'flex-1 h-full'}`}
        >
          {gallery[1]?.url ? (
            <SlideImage 
              page={page} src={gallery[1].url} config={gallery[1].config}
              className="w-full h-full object-cover" rounded="0"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-200 uppercase tracking-tighter">Frame B</div>
          )}
        </div>

      </div>

      {/* 底部中心标签 - 核心修正：接入 SlideBlockLabel */}
      <div 
        className="absolute inset-x-0 flex justify-center items-end pointer-events-none"
        style={{ bottom: '2.5rem' }}
      >
        <SlideBlockLabel 
          page={page}
          typography={typography}
          text={displayLabel}
          className="!text-[0.75rem] !font-bold !tracking-[0.2em] !uppercase !opacity-100 !leading-none !m-0"
          color={accentColor}
          style={{ marginBottom: '-0.25rem' }}
        />
      </div>
    </div>
  );
}
