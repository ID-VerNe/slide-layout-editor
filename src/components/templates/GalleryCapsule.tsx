import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { OutlineText } from '../ui/slide/OutlineText';

/**
 * GalleryCapsule - 胶囊马赛克图库
 * 修复版：彻底移除硬编码字体，接入全局字体感应。
 */
export default function GalleryCapsule({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const isPortrait = page.aspectRatio === '2:3';
  
  const title = page.title || 'COLLECTION';
  const imageLabel = page.imageLabel || 'PHOTOGRAPHY';
  const imageSubLabel = page.imageSubLabel || 'PORTFOLIO';

  const gallery = page.gallery || [];
  const variant = page.layoutVariant || 'under';

  const slots = isPortrait 
    ? [
        { y: '40px', h: '45%', delay: 0 },
        { y: '-30px', h: '50%', delay: 100 },
        { y: '20px', h: '48%', delay: 200 },
        { y: '-10px', h: '45%', delay: 300 }
      ]
    : [
        { y: '60px', h: '60%', delay: 0 },
        { y: '-40px', h: '70%', delay: 100 },
        { y: '20px', h: '65%', delay: 200 },
        { y: '-20px', h: '60%', delay: 300 }
      ];

  const isMinimal = variant === 'minimal';
  const isTextOver = variant === 'over';
  const isTextUnder = variant === 'under' || !variant;

  // 获取全局字体
  const titleFont = typography?.fieldOverrides?.['title'] || `${typography?.defaultLatin}, ${typography?.defaultCJK}`;

  return (
    <div
      key={page.id + variant + page.aspectRatio}
      className={`w-full h-full flex items-center justify-center overflow-hidden relative transition-all duration-1000 isolate
        ${isMinimal ? (isPortrait ? 'gap-6 px-16' : 'gap-12 px-40') : (isPortrait ? 'gap-4 px-10' : 'gap-8 px-24')}`}
      style={{ backgroundColor: page.backgroundColor || '#ffffff' }}
    >
      <div className={`absolute inset-0 opacity-[0.02] pointer-events-none transition-opacity ${isMinimal ? 'opacity-[0.01]' : ''}`}
        style={{ backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

      {/* --- 方案 A: Text Behind --- */}
      {isTextUnder && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-0 pointer-events-none px-20">
          <SlideSubHeadline page={page} typography={typography} className="mb-4 !opacity-20 uppercase !tracking-[1em] !text-[10px]" />
          <div className="flex flex-col items-center leading-[0.75]">
            <SlideHeadline
              page={page}
              typography={typography}
              maxSize={isPortrait ? 200 : 320}
              minSize={80}
              className="!text-black/[0.04] !font-[1000] !tracking-tighter text-center leading-[0.8]"
            />
          </div>
        </div>
      )}

      {/* --- 方案 C: Minimal (左上角内容) --- */}
      {isMinimal && (
        <div className={`absolute z-20 text-left pointer-events-none animate-in fade-in slide-in-from-left-8 duration-1000 
          ${isPortrait ? 'top-16 left-12 max-w-[400px]' : 'top-24 left-32 max-w-[600px]'}`}>
          <p className="text-[10px] font-black tracking-[0.5em] text-slate-300 uppercase mb-1">
            {imageSubLabel}
          </p>
          <div className="relative">
            <SlideSubHeadline
              page={page}
              typography={typography}
              color="#94a3b8"
              className="!font-black !tracking-tight !break-words"
              size={isPortrait ? "2.5rem" : "3.5rem"}
            />
          </div>
        </div>
      )}

      {/* 2. 核心胶囊阵列 */}
      {slots.map((slot, idx) => {
        const item = gallery[idx];
        return (
          <div
            key={idx}
            className="flex-1 max-w-[280px] animate-in fade-in slide-in-from-bottom-8 transition-all duration-1000 ease-out z-10"
            style={{
              height: slot.h,
              transform: `translateY(${slot.y})`,
              animationDelay: `${slot.delay}ms`
            }}
          >
            <div className={`w-full h-full rounded-full overflow-hidden border-white shadow-[0_30px_80px_rgba(0,0,0,0.06)] group
              ${isPortrait ? 'border-[4px]' : 'border-[6px]'}`}>
              {item?.url ? (
                <SlideImage
                  page={page}
                  src={item.url}
                  config={item.config}
                  className="w-full h-full"
                  rounded="9999px"
                />
              ) : (
                <div className="w-full h-full bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-100">
                  <span className="text-[8px] font-black text-slate-200 uppercase tracking-widest">Slot {idx + 1}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* --- 方案 B: Text Front --- */}
      {isTextOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none px-20">
          <SlideSubHeadline page={page} typography={typography} className="mb-4 !text-slate-900 !opacity-60 uppercase !tracking-[0.5em] !text-xs" />
          <SlideHeadline
            page={page}
            typography={typography}
            maxSize={isPortrait ? 200 : 320}
            minSize={80}
            className="!text-[#264376] !font-[1000] !tracking-tighter text-center leading-[0.8] drop-shadow-2xl"
          />
        </div>
      )}

      {/* --- 方案 C: Minimal (右下角内容) --- */}
      {isMinimal && (
        <div className={`absolute z-50 text-right pointer-events-none animate-in fade-in slide-in-from-right-8 duration-1000 
          ${isPortrait ? 'bottom-16 right-12' : 'bottom-24 right-32'}`}>
          <div className="flex flex-col items-end gap-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] leading-none m-0 mr-[-0.3em]">
              {imageLabel}
            </p>

            <div className="w-12 h-0.5 bg-slate-900/80 m-0" />

            <div className={`relative flex justify-end 
              ${isPortrait ? 'w-[80vw] max-w-[500px]' : 'w-[60vw] max-w-[1000px]'}`}>
              <OutlineText
                text={title}
                fontSize={isPortrait ? (page.styleOverrides?.title?.fontSize ? page.styleOverrides.title.fontSize * 0.7 : 90) : (page.styleOverrides?.title?.fontSize || 140)}
                strokeColor={page.styleOverrides?.title?.color || "#0F172A"}
                strokeWidth={isPortrait ? 1.5 : 2.5}
                fontFamily={titleFont}
                fontWeight={900}
                textAlign="right"
                lineHeight={0.9}
                letterSpacing="-0.05em"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
