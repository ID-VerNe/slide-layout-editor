import React from 'react';
import { PageData } from '../../types';
import { SlideLogo } from '../ui/slide/SlideLogo';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { SlideImage } from '../ui/slide/SlideImage';
import { ArrowRight } from 'lucide-react';

export default function EditorialSplit({ page }: { page: PageData }) {
  const isVariantRight = page.layoutVariant !== 'left'; 
  const isVisible = (key: keyof NonNullable<PageData['visibility']>) => page.visibility?.[key] !== false;

  // 获取样式覆盖
  const footerStyle = (page.styleOverrides as any)?.footer || {};
  const bulletsStyle = (page.styleOverrides as any)?.bullets || {};
  const subtitleStyle = (page.styleOverrides as any)?.subtitle || {};
  const imageLabelStyle = (page.styleOverrides as any)?.imageLabel || {};
  const imageSubLabelStyle = (page.styleOverrides as any)?.imageSubLabel || {};

  return (
    <div 
      className={`w-full h-full flex p-20 relative overflow-hidden transition-all duration-700 gap-16 ${isVariantRight ? 'flex-row' : 'flex-row-reverse'}`}
      style={{ backgroundColor: page.backgroundColor || '#ffffff' }}
    >
      {/* 
        Side Sidebar: 文字展示区 
      */}
      <div className="w-[32%] h-full flex flex-col justify-between py-12 z-10 text-left">
        
        {/* 顶部：元数据（由 footer 字段驱动） */}
        <div className="space-y-6">
          <SlideLogo page={page} className="mb-4" />
          <div className="opacity-40">
            <p 
              className="text-[8px] font-medium tracking-[0.2em] leading-loose uppercase whitespace-pre-line"
              style={{ 
                fontSize: footerStyle.fontSize ? `${footerStyle.fontSize}px` : undefined,
                fontFamily: footerStyle.fontFamily 
              }}
            >
              {page.footer || 'EDITORIAL METADATA\nLOCATED IN TOKYO, JAPAN\nREF. 2025-SLE'}
            </p>
          </div>
          
          {/* 导航列表（由 bullets 字段驱动） */}
          {isVisible('bullets' as any) && (page.bullets?.length || 0) > 0 && (
            <div className="pt-8 space-y-2">
              {page.bullets?.map((item, idx) => (
                <p 
                  key={idx} 
                  className="text-[10px] font-bold tracking-widest text-slate-900/60 hover:text-[#264376] cursor-pointer transition-colors uppercase"
                  style={{ 
                    fontSize: bulletsStyle.fontSize ? `${bulletsStyle.fontSize}px` : undefined,
                    fontFamily: bulletsStyle.fontFamily 
                  }}
                >
                  {item}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* 底部：核心品牌区 */}
        <div className="space-y-4">
          <div className="space-y-1">
            {page.subtitle && (
              <p 
                className="text-[10px] font-black uppercase tracking-[0.4em] text-[#264376]"
                style={{ 
                  fontSize: subtitleStyle.fontSize ? `${subtitleStyle.fontSize}px` : undefined,
                  fontFamily: subtitleStyle.fontFamily 
                }}
              >
                {page.subtitle}
              </p>
            )}
            <SlideHeadline 
              page={page} 
              maxSize={72} 
              className="text-slate-900 !font-black !tracking-tighter" 
            />
          </div>
          <div className="h-px w-16 bg-slate-200" />
          <p className="text-[9px] font-medium uppercase tracking-[0.5em] text-slate-300 tracking-widest">PUBLISHED EDITION</p>
        </div>
      </div>

      {/* 
        Main Area: 大图展示与信息展板
      */}
      <div className="flex-1 h-full relative group">
        
        <SlideImage 
          page={page} 
          className="w-full h-full shadow-2xl" 
          rounded="3.5rem"
        />

        {/* 
          信息展板 (Floating Info Panel)
        */}
        {isVisible('imageLabel') && (page.imageLabel || page.imageSubLabel) && (
          <div className={`absolute bottom-12 ${isVariantRight ? 'right-12' : 'left-12'} bg-white/95 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-white/50 max-w-[380px] animate-in fade-in slide-in-from-bottom-6 duration-700 z-30`}>
            <div className="flex items-center gap-4 mb-4">
              <span 
                className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900"
                style={{ 
                  fontSize: imageSubLabelStyle.fontSize ? `${imageSubLabelStyle.fontSize}px` : undefined,
                  fontFamily: imageSubLabelStyle.fontFamily 
                }}
              >
                {page.imageSubLabel || 'Information'}
              </span>
            </div>
            
            <p 
              className="text-sm font-bold text-slate-900 leading-relaxed mb-8"
              style={{ 
                fontSize: imageLabelStyle.fontSize ? `${imageLabelStyle.fontSize}px` : undefined,
                fontFamily: imageLabelStyle.fontFamily 
              }}
            >
              {page.imageLabel}
            </p>
            
            {isVisible('actionText') && page.actionText && (
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <button className="flex items-center gap-3 text-slate-900 hover:text-[#264376] transition-all group/more">
                  <div className="w-6 h-6 rounded-full bg-[#264376] flex items-center justify-center text-white scale-90 group-hover/more:scale-110 transition-transform">
                    <ArrowRight size={14} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{page.actionText}</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}