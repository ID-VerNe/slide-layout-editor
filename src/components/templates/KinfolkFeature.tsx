import React from 'react';
import { PageData } from '../../types';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';

/**
 * KinfolkFeature - 大片开篇布局
 * 修正版：无论图在左还是在右，标题始终保持正常的垂直阅读顺序（从上往下）。
 */
export default function KinfolkFeature({ page }: { page: PageData }) {
  const isImageRight = page.layoutVariant === 'right';
  
  const displayTitle = page.title || 'KITAGAWA';
  const displaySubtitle = page.subtitle || 'Capturing the subtle emotions hidden behind the mask.';
  const displayLabel = page.imageLabel;

  const backgroundColor = page.backgroundColor || '#f8f8f7';
  const titleColor = page.styleOverrides?.title?.color || '#1c1917';
  
  const customFontSize = page.styleOverrides?.title?.fontSize;
  const fontSize = customFontSize ? `${customFontSize}px` : '6rem';

  const safePadding = '4rem'; 

  return (
    <div 
      className={`w-full h-full relative overflow-hidden flex flex-col transition-all duration-700
        ${isImageRight ? 'items-end' : 'items-start'} isolate`}
      style={{ 
        backgroundColor: backgroundColor, // 确保此处颜色是实心的
        paddingLeft: isImageRight ? '0' : safePadding,
        paddingRight: isImageRight ? safePadding : '0',
        paddingTop: safePadding,
        paddingBottom: '2.5rem' 
      }}
    >
      
      {/* 1. 主图区域 */}
      <div className="w-[75%] h-[70%] relative bg-white border-[6px] border-white shadow-[0_30px_80px_rgba(0,0,0,0.04)] overflow-hidden z-10">
        <SlideImage 
          page={page} 
          className="w-full h-full object-cover" 
          rounded="0"
          backgroundColor="transparent"
        />
        
        <div className={`absolute bottom-6 ${isImageRight ? 'right-8 text-right' : 'left-8 text-left'}`}>
          <p className="text-[7px] font-black tracking-[0.4em] uppercase text-white/60 mix-blend-difference">
            {displayLabel}
          </p>
        </div>
      </div>

      {/* 2. 垂直标题 - 始终保持正常竖排方向 */}
      <div 
        className={`absolute top-0 w-[25%] h-full flex flex-col items-center justify-start z-20 pointer-events-none px-4`}
        style={{ paddingTop: safePadding, paddingBottom: safePadding, left: isImageRight ? '0' : 'auto', right: isImageRight ? 'auto' : '0' }}
      >
        <h1 
          className="font-normal leading-none tracking-[0.15em] uppercase whitespace-nowrap transition-all duration-700"
          style={{ 
            writingMode: 'vertical-rl',
            fontFamily: page.titleFont || "'Inter', sans-serif",
            color: titleColor,
            fontSize: fontSize,
            marginTop: '0px',
            // 核心修复：移除所有翻转/旋转变换，保持正常垂直排版
            transform: 'none'
          }}
        >
          {displayTitle}
        </h1>
      </div>

      {/* 3. 底部简介 */}
      <div 
        className={`mt-auto w-2/3 z-10 flex flex-col ${isImageRight ? 'items-end text-right' : 'items-start'}`} 
        style={{ paddingBottom: '0.15rem' }}
      >
        <div className="w-10 h-[1.5px] bg-slate-900 mb-6" />
        <SlideSubHeadline 
          page={{...page, subtitle: displaySubtitle}}
          className={`!tracking-[0.2em] !font-bold !uppercase !m-0 !p-0 !whitespace-pre-line !leading-[1.2]
            ${isImageRight ? 'text-right' : 'text-left'}`}
          size="0.75rem"
          color="#a8a29e"
          style={{ 
            fontFamily: page.bodyFont || "'Inter', sans-serif",
            marginBottom: '-0.25rem' 
          }}
        />
      </div>

    </div>
  );
}
