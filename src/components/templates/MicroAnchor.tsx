import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideBlockLabel } from '../ui/slide/SlideBlockLabel';

/**
 * MicroAnchor - 极致留白模板
 * 终极加固版：全原子化渲染，感应全局字体。
 */
export default function MicroAnchor({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const isRight = page.layoutVariant === 'right';
  
  const displayTopText = page.title || 'THE SILENCE OF THE FRAME';
  const displayBottomLabel = page.subtitle || 'FIG. 05 · THE AMBIENCE';
  
  const backgroundColor = page.backgroundColor || '#FAFAF9';
  
  const imageWidth = '18rem'; 

  return (
    <div 
      className="w-full h-full relative p-12 transition-all duration-700 overflow-hidden isolate"
      style={{ backgroundColor }}
    >
      {/* 1. 顶部彩蛋文字 - 核心修正：接入 SlideBlockLabel */}
      <div className="absolute top-[25%] left-0 w-full text-center px-24 pointer-events-none">
        <SlideBlockLabel 
          page={page}
          typography={typography}
          text={displayTopText}
          className="!italic !uppercase !font-bold !tracking-[0.5em] !opacity-40"
          color={page.styleOverrides?.title?.color || '#6b7280'}
          style={{ 
            fontSize: page.styleOverrides?.title?.fontSize ? `${page.styleOverrides.title.fontSize}px` : '11px',
            textAlign: 'center'
          }}
        />
      </div>

      {/* 2. 图片锚点容器 */}
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

        {/* 底部标签 - 核心修正：接入 SlideBlockLabel */}
        <div className="relative" style={{ width: imageWidth }}>
          <SlideBlockLabel 
            page={page}
            typography={typography}
            text={displayBottomLabel}
            className="!tracking-[0.2em] !font-bold !uppercase !opacity-100 !leading-[1.4]"
            color="#a8a29e"
            style={{ 
              fontSize: page.styleOverrides?.subtitle?.fontSize ? `${page.styleOverrides.subtitle.fontSize}px` : '0.75rem',
              textAlign: isRight ? 'right' : 'left',
              marginBottom: '-0.1rem' 
            }}
          />
        </div>
      </div>
    </div>
  );
}
