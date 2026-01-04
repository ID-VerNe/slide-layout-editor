import React from 'react';
import { PageData } from '../../types';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import AutoFitHeadline from '../AutoFitHeadline';

/**
 * FutureFocus (The Chosen One) - 贺图风格三图布局
 * 混排适配版：支持 16:9 和 2:3 动态比例，并支持 Gallery Assets 显隐控制及自定义强调色。
 */
export default function FutureFocus({ page }: { page: PageData }) {
  const isPortrait = page.aspectRatio === '2:3';
  const isGalleryVisible = page.visibility?.gallery !== false; 
  
  const displayTitle = page.title || 'READY FOR 2026';
  const displaySubtitle = page.subtitle || "MARIN KITAGAWA / NEW YEAR'S GREETING";
  const displayLabel = page.imageLabel || 'JAN 01';
  const displaySubLabel = page.imageSubLabel || 'FIRST POST OF THE YEAR';

  const displayPage = {
    ...page,
    title: displayTitle,
    subtitle: displaySubtitle,
    imageLabel: displayLabel,
    imageSubLabel: displaySubLabel
  };

  const backgroundColor = page.backgroundColor || '#ffffff';
  const accentColor = page.accentColor || '#F472B6'; // 动态强调色
  const gallery = page.gallery || [];

  // 解析标签内容以支持双色渲染
  const labelParts = displayLabel.split(' ');
  const firstPart = labelParts[0];
  const restPart = labelParts.slice(1).join(' ');

  return (
    <div 
      className={`w-full h-full flex relative overflow-hidden transition-all duration-700 
        ${isPortrait ? 'flex-col' : 'flex-row'}`}
      style={{ backgroundColor }}
    >
      {/* 1. 背景装饰 */}
      <div className={`absolute select-none opacity-[0.03] pointer-events-none text-slate-900 z-0
        ${isPortrait ? 'right-[-40px] bottom-[-60px]' : 'right-[-80px] top-[-100px]'}`}>
        <h1 className={`${isPortrait ? 'text-[25rem]' : 'text-[45rem]'} font-black leading-none tracking-tighter italic`}>26</h1>
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
        
        {/* 文字叠加层 */}
        <div className={`absolute z-20 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]
          ${isPortrait ? 'bottom-12 left-10' : 'bottom-24 left-16'}`}>
          <div className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            <SlideSubHeadline 
              page={displayPage} 
              className="mb-2 italic !tracking-[0.1em] !font-medium opacity-90"
              color="#ffffff"
              size={isPortrait ? "1.8rem" : "2rem"}
              style={{ fontFamily: "'Crimson Pro', serif" }}
            />
          </div>
          <SlideHeadline 
            page={displayPage} 
            maxSize={isPortrait ? 100 : 140} 
            minSize={60} 
            color="#ffffff"
            className="!tracking-tighter !leading-[0.85] uppercase !font-black"
            style={{ textShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
          />
        </div>
      </div>

      {/* 3. 排版区域 */}
      <div className={`relative z-20 flex flex-col justify-center transition-all duration-700
        ${isPortrait ? 'w-full h-[35%] px-10' : 'w-[25%] h-full pr-16'}`}>
        
        <div className={`flex flex-col items-start w-full 
          ${isPortrait ? 'translate-x-0' : 'translate-x-[5%]'}`}>
          
          {/* 日期信息块 - 使用动态强调色 accentColor */}
          <div className={`border-l-[6px] pl-8 py-2 animate-in fade-in slide-in-from-left-4 duration-1000 delay-300 w-full max-w-full overflow-hidden
            ${isPortrait ? 'mb-8' : 'mb-12'}`}
            style={{ borderColor: accentColor }}
          >
            <p className="text-xl font-medium tracking-tight text-slate-400 italic mb-1" style={{ fontFamily: "'Crimson Pro', serif" }}>
              {displaySubLabel}
            </p>
            
            <div className="w-full">
              <AutoFitHeadline 
                text={displayLabel}
                maxSize={isPortrait ? 64 : 80}
                minSize={24}
                maxLines={2}
                lineHeight={1}
                weight={900}
                className="text-slate-900 tracking-tighter leading-none uppercase"
                fontFamily={page.titleFont || 'Inter'}
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
                <p className="text-[11px] text-center font-medium text-slate-400 italic" style={{ fontFamily: "'Crimson Pro', serif" }}>
                  MARIN K. // 2026
                </p>
              </div>
            </div>
          )}
        </div>

        <div className={`absolute w-32 h-[1px] bg-slate-200 
          ${isPortrait ? 'right-10 top-1/2 -translate-y-1/2 rotate-90 opacity-0' : 'right-12 bottom-16'}`} />
      </div>

    </div>
  );
}
