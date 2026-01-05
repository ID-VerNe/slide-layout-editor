import React from 'react';
import { PageData } from '../../types';
import { SlideImage } from '../ui/slide/SlideImage';

/**
 * FilmDiptych - 胶片双联画模板
 * 雅致版：
 * 1. 进一步缩小图片占比 (p-20)，增加留白。
 * 2. 底部中央放置可编辑的 Main Label。
 * 3. 文字底边与全局页码点完美对齐。
 */
export default function FilmDiptych({ page }: { page: PageData }) {
  const gallery = page.gallery || [];
  const variant = page.layoutVariant || 'horizontal';
  const isVertical = variant === 'vertical';
  
  const displayLabel = page.imageLabel || 'SEQUENCE 04 · MOVEMENT STUDY';
  const backgroundColor = page.backgroundColor || '#FAFAF9';
  const accentColor = page.accentColor || '#a8a29e';

  return (
    <div 
      className="w-full h-full relative flex flex-col transition-all duration-700 overflow-hidden items-center justify-center p-20"
      style={{ backgroundColor }}
    >
      {/* 核心内容区 */}
      <div 
        className={`flex w-full h-full animate-in fade-in zoom-in-95 duration-1000
          ${isVertical ? 'flex-col gap-12' : 'flex-row gap-3'}`}
      >
        
        {/* 左图 / 上图 */}
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
            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-200">A</div>
          )}
        </div>

        {/* 右图 / 下图 */}
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
            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-200">B</div>
          )}
        </div>

      </div>

      {/* 
        底部中心可编辑文本 
        对齐核心：bottom: 2.5rem 配合 mb-[-0.25rem] 冲齐页码点
      */}
      <div 
        className="absolute inset-x-0 flex justify-center items-end pointer-events-none"
        style={{ bottom: '2.5rem' }}
      >
        <p 
          className="text-[0.75rem] font-bold tracking-[0.2em] uppercase leading-none"
          style={{ 
            color: accentColor,
            fontFamily: page.bodyFont || "'Inter', sans-serif",
            marginBottom: '-0.25rem' // 像素级底边对齐
          }}
        >
          {displayLabel}
        </p>
      </div>
    </div>
  );
}