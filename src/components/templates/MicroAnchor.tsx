import React from 'react';
import { PageData } from '../../types';
import { SlideImage } from '../ui/slide/SlideImage';

/**
 * MicroAnchor - 极致留白模板
 * 黄金复刻版：Headline 搬回中心上方，保持极致的空灵感。
 */
export default function MicroAnchor({ page }: { page: PageData }) {
  const isRight = page.layoutVariant === 'right';
  
  const displayTopText = page.title || 'THE SILENCE OF THE FRAME';
  const displayBottomLabel = page.subtitle || 'FIG. 05 · THE AMBIENCE';
  
  const backgroundColor = page.backgroundColor || '#FAFAF9';
  
  const editorialSubStyle = {
    color: '#a8a29e',
    fontSize: '0.75rem',
    fontWeight: 700,
    tracking: '0.2em',
    fontFamily: page.bodyFont || "'Inter', sans-serif"
  };

  const imageWidth = '18rem'; 

  return (
    <div 
      className="w-full h-full relative p-12 transition-all duration-700 overflow-hidden isolate"
      style={{ backgroundColor }}
    >
      {/* 1. 顶部彩蛋文字 - 回归水平居中 */}
      <div className="absolute top-[25%] left-0 w-full text-center px-24 pointer-events-none">
        <p 
          className="italic !uppercase !font-bold !tracking-[0.5em] whitespace-pre-line opacity-40"
          style={{ 
            fontFamily: page.titleFont || editorialSubStyle.fontFamily, 
            color: page.styleOverrides?.title?.color || '#6b7280',
            fontSize: page.styleOverrides?.title?.fontSize ? `${page.styleOverrides.title.fontSize}px` : '11px'
          }}
        >
          {displayTopText}
        </p>
      </div>

      {/* 2. 图片锚点容器 - 保持 1.5 倍尺寸与底部对齐 */}
      <div 
        className={`absolute w-fit animate-in fade-in slide-in-from-bottom-4 duration-1000 flex flex-col
          ${isRight ? 'right-16 items-end' : 'left-16 items-start'}`}
        style={{ bottom: '2.5rem' }} 
      >
        <div 
          className="aspect-[3/4] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.06)] overflow-hidden mb-8 border-[1px] border-slate-50"
          style={{ width: imageWidth }}
        >
          <SlideImage 
            page={page} 
            className="w-full h-full object-cover" 
            rounded="0"
            backgroundColor="transparent"
          />
        </div>

        <div 
          className="relative"
          style={{ width: imageWidth }}
        >
          <p 
            className="!tracking-[0.2em] !font-bold !uppercase leading-[1.4] break-all whitespace-pre-line"
            style={{ 
              color: page.styleOverrides?.subtitle?.color || editorialSubStyle.color,
              fontSize: page.styleOverrides?.subtitle?.fontSize ? `${page.styleOverrides.subtitle.fontSize}px` : editorialSubStyle.fontSize,
              fontFamily: page.styleOverrides?.subtitle?.fontFamily || editorialSubStyle.fontFamily,
              textAlign: isRight ? 'right' : 'left',
              marginBottom: '-0.1rem' 
            }}
          >
            {displayBottomLabel}
          </p>
        </div>
      </div>
    </div>
  );
}