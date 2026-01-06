import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { SlideBlockLabel } from '../ui/slide/SlideBlockLabel';
import AutoFitHeadline from '../AutoFitHeadline';

/**
 * FutureFocus (The Chosen One) - 贺图风格三图布局
 * 终极加固版：全原子化渲染，移除所有字体硬编码。
 */
export default function FutureFocus({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const isPortrait = page.aspectRatio === '2:3';
  const isGalleryVisible = page.visibility?.gallery !== false; 
  
  const displayTitle = page.title || 'READY FOR 2026';
  const displaySubtitle = page.subtitle || "MARIN KITAGAWA / NEW YEAR'S GREETING";
  const displayLabel = page.imageLabel || 'JAN 01';
  const displaySubLabel = page.imageSubLabel || 'FIRST POST OF THE YEAR';
  const displayAction = page.actionText || '26';

  const backgroundColor = page.backgroundColor || '#ffffff';
  const accentColor = page.accentColor || '#F472B6'; 
  const gallery = page.gallery || [];

  const labelParts = displayLabel.split(' ');
  const firstPart = labelParts[0];
  const restPart = labelParts.slice(1).join(' ');

  return (
    <div 
      className={`w-full h-full flex relative overflow-hidden transition-all duration-700 isolate
        ${isPortrait ? 'flex-col' : 'flex-row'}`}
      style={{ backgroundColor }}
    >
      {/* 1. 背景装饰 */}
      <div className={`absolute select-none opacity-[0.03] pointer-events-none text-slate-900 z-0
        ${isPortrait ? 'right-[-40px] bottom-[-60px]' : 'right-[-80px] top-[-100px]'}`}>
        <SlideHeadline 
          page={{...page, title: displayAction}} 
          typography={typography}
          maxSize={isPortrait ? 400 : 720}
          className="!font-black !leading-none !tracking-tighter !italic !opacity-100"
        />
      </div>

      {/* 2. 主视觉区 */}
      <div className={`relative z-10 transition-all duration-700 
        ${isPortrait ? 'w-full h-[65%]' : 'w-[75%] h-full'}`}>
        
        <div className="w-full h-full" style={{
          WebkitMaskImage: isPortrait 
            ? 'linear-gradient(to bottom, black 85%, transparent 100%)'
            : 'linear-gradient(to right, black 85%, transparent 100%)',
          maskImage: isPortrait 
            ? 'linear-gradient(to bottom, black 85%, transparent 100%)'
            : 'linear-gradient(to right, black 85%, transparent 100%)'
        }}>
          <SlideImage 
            page={page} 
            className="w-full h-full scale-[1.05]" 
            rounded="0"
            backgroundColor="transparent"
          />
        </div>
        
        <div className={`absolute z-20 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]
          ${isPortrait ? 'bottom-12 left-10' : 'bottom-24 left-16'}`}>
          <div className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            <SlideSubHeadline 
              page={{...page, subtitle: displaySubtitle}} 
              typography={typography}
              className="mb-2 italic !tracking-[0.1em] !font-medium opacity-90"
              color="#ffffff"
              size={isPortrait ? "1.8rem" : "2rem"}
            />
          </div>
          <SlideHeadline 
            page={{...page, title: displayTitle}} 
            typography={typography}
            maxSize={isPortrait ? 100 : 140} 
            minSize={60} 
            color="#ffffff"
            className="!tracking-tighter !leading-[0.85] uppercase !font-black"
          />
        </div>
      </div>

      {/* 3. 排版区域 */}
      <div className={`relative z-20 flex flex-col justify-center transition-all duration-700
        ${isPortrait ? 'w-full h-[35%] px-10' : 'w-[25%] h-full pr-16'}`}>
        
        <div className={`flex flex-col items-start w-full 
          ${isPortrait ? 'translate-x-0' : 'translate-x-[5%]'}`}>
          
          <div className={`border-l-[6px] pl-8 py-2 animate-in fade-in slide-in-from-left-4 duration-1000 delay-300 w-full max-w-full overflow-hidden
            ${isPortrait ? 'mb-8' : 'mb-12'}`}
            style={{ borderColor: accentColor }}
          >
            <SlideBlockLabel 
              page={page} 
              typography={typography}
              text={displaySubLabel}
              className="!text-xl !font-medium !tracking-tight !italic !opacity-40 mb-1"
            />
            
            <div className="w-full">
              <AutoFitHeadline 
                text={displayLabel}
                maxSize={isPortrait ? 64 : 80}
                minSize={24}
                maxLines={2}
                lineHeight={1}
                weight={900}
                className="text-slate-900 tracking-tighter leading-none uppercase"
                fontFamily={typography?.fieldOverrides?.['title'] || `${typography?.defaultLatin}, ${typography?.defaultCJK}`}
              >
                <span>
                  {firstPart}
                  {restPart && <span className="ml-[0.15em]" style={{ color: accentColor }}>{restPart}</span>}
                </span>
              </AutoFitHeadline>
            </div>
          </div>

          {/* 辅助图组 */}
          {isGalleryVisible && (
            <div className={`flex items-start drop-shadow-[0_45px_80px_rgba(0,0,0,0.25)] animate-in fade-in zoom-in-95 duration-700
              ${isPortrait ? 'flex-row gap-6' : 'flex-col gap-0'}`}>
              
              <div className={`rounded-full border-[5px] border-white shadow-2xl overflow-hidden shrink-0 group hover:scale-110 transition-transform duration-500 z-30
                ${isPortrait ? 'w-32 h-32' : 'w-48 h-48 ml-[-24px]'}`}>
                {gallery[0]?.url ? (
                  <SlideImage 
                    page={page} 
                    src={gallery[0].url} 
                    config={gallery[0].config}
                    className="w-full h-full"
                    rounded="9999px"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-200">Slot 1</div>
                )}
              </div>

              <div className={`bg-white p-4 pb-8 shadow-[0_30px_60px_rgba(0,0,0,0.15)] transition-all duration-500 group border border-slate-100 z-20
                ${isPortrait ? 'w-48 rotate-[-3deg] hover:rotate-0 mt-0' : 'w-64 rotate-[6deg] hover:rotate-0 mt-8 ml-16'}`}>
                <div className="w-full h-44 bg-slate-50 overflow-hidden mb-3">
                  {gallery[1]?.url ? (
                     <SlideImage 
                       page={page} 
                       src={gallery[1].url} 
                       config={gallery[1].config}
                       className="w-full h-full"
                       rounded="0"
                     />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-200">Slot 2</div>
                  )}
                </div>
                {/* 核心修正：辅助图底部描述文字原子化 */}
                <SlideBlockLabel 
                  page={page}
                  typography={typography}
                  text={gallery[1]?.caption || 'ARTWORK // 2026'}
                  className="!text-[11px] !text-center !font-medium !text-slate-400 !italic !opacity-100"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
