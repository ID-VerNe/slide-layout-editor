import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideBlockLabel } from '../ui/slide/SlideBlockLabel';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { useStore } from '../../store/useStore';

/**
 * MicroAnchor - 极致留白模板
 * 最终加固版：全面感应全局主题 Token。
 */
export default function MicroAnchor({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const theme = useStore((state) => state.theme);
  const isRight = page.layoutVariant === 'right';
  
  const displayTopText = page.title || 'THE SILENCE OF THE FRAME';
  
  // 核心修复 1：默认底色链接至主题
  const backgroundColor = page.backgroundColor || theme.colors.background || '#FAFAF9';
  const imageWidth = '18rem'; 

  return (
    <div 
      className="w-full h-full relative p-12 transition-all duration-700 overflow-hidden isolate"
      style={{ backgroundColor }}
    >
      {/* 1. 顶部彩蛋文字 - 核心修复 2：颜色链接至 primary (默认) */}
      <div className="absolute top-[25%] left-0 w-full text-center px-24 pointer-events-none">
        <SlideBlockLabel 
          page={page}
          typography={typography}
          text={displayTopText}
          className="!italic !uppercase !font-bold !tracking-[0.5em] !opacity-40 !border-none"
          color={theme.colors.primary}
          style={{ 
            fontSize: page.styleOverrides?.title?.fontSize ? `${page.styleOverrides.title.fontSize}px` : '11px',
            textAlign: 'center'
          }}
        />
      </div>

      <div 
        className={`absolute w-fit animate-in fade-in slide-in-from-bottom-4 duration-1000 flex flex-col
          ${isRight ? 'right-16 items-end' : 'left-16 items-start'}`}
        style={{ bottom: '2.5rem' }} 
      >
        <div 
          className="aspect-[3/4] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.06)] overflow-hidden mb-8 border-[1px] border-slate-50"
          style={{ width: imageWidth }}
        >
          <SlideImage page={page} className="w-full h-full object-cover" rounded="0" backgroundColor="transparent" />
        </div>

        <div className="relative" style={{ width: imageWidth }}>
          {/* 核心重构：改用 SlideSubHeadline 以完美支持换行 */}
          <SlideSubHeadline 
            page={page}
            typography={typography}
            className={`!tracking-[0.2em] !font-bold !uppercase !opacity-100 !leading-[1.4] !m-0 !p-0 ${isRight ? '!text-right' : '!text-left'}`}
            color={theme.colors.secondary}
            size="0.75rem"
          />
        </div>
      </div>
    </div>
  );
}