import React from 'react';
import { PageData } from '../../types';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import AutoFitHeadline from '../AutoFitHeadline';

/**
 * FutureFocus (The Chosen One) - 贺图风格三图布局
 * 颜色修复版：利用增强后的 AutoFitHeadline 找回樱花粉。
 */
export default function FutureFocus({ page }: { page: PageData }) {
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
  const gallery = page.gallery || [];

  // 解析标签内容以支持双色渲染
  const labelParts = displayLabel.split(' ');
  const firstPart = labelParts[0];
  const restPart = labelParts.slice(1).join(' ');

  return (
    <div 
      className="w-full h-full flex relative overflow-hidden transition-all duration-700"
      style={{ backgroundColor }}
    >
      {/* 1. 背景装饰 */}
      <div className="absolute right-[-80px] top-[-100px] z-0 select-none opacity-[0.03] pointer-events-none text-slate-900">
        <h1 className="font-black text-[45rem] leading-none tracking-tighter italic">26</h1>
      </div>

      {/* 2. 左侧主视觉区 (75%) */}
      <div className="w-[75%] h-full relative z-10">
        <div className="w-full h-full" style={{
          WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
          maskImage: 'linear-gradient(to right, black 85%, transparent 100%)'
        }}>
          <SlideImage 
            page={page} 
            className="w-full h-full scale-[1.05]" 
            rounded="0"
            backgroundColor="transparent"
          />
        </div>
        
        <div className="absolute bottom-24 left-16 z-20">
          <div className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            <SlideSubHeadline 
              page={displayPage} 
              className="mb-2 italic !tracking-[0.1em] !font-medium opacity-90"
              color="#ffffff"
              size="2rem"
              style={{ fontFamily: "'Crimson Pro', serif" }}
            />
          </div>
          <SlideHeadline 
            page={displayPage} 
            maxSize={140} 
            minSize={80} 
            color="#ffffff"
            className="!tracking-tighter !leading-[0.85] uppercase !font-black"
            style={{ textShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
          />
        </div>
      </div>

      {/* 3. 右侧排版区域 (25%) */}
      <div className="w-[25%] h-full flex flex-col justify-center pr-16 z-20 relative">
        
        <div className="flex flex-col items-start translate-x-[5%] w-full">
          
          <div className="mb-12 border-l-[6px] border-[#F472B6] pl-8 py-2 animate-in fade-in slide-in-from-left-4 duration-1000 delay-300 w-full max-w-full overflow-hidden">
            <p className="text-xl font-medium tracking-tight text-slate-400 italic mb-1" style={{ fontFamily: "'Crimson Pro', serif" }}>
              {displaySubLabel}
            </p>
            
            <div className="w-full">
              <AutoFitHeadline 
                text={displayLabel}
                maxSize={80}
                minSize={24}
                maxLines={2}
                lineHeight={1}
                weight={900}
                className="text-slate-900 tracking-tighter leading-none uppercase"
                fontFamily={page.titleFont || 'Inter'}
              >
                {/* 
                  核心修复：利用增强后的 children 属性，
                  手动拼装双色文本逻辑。
                */}
                <span>
                  {firstPart}
                  {restPart && <span className="text-[#F472B6] ml-[0.15em]">{restPart}</span>}
                </span>
              </AutoFitHeadline>
            </div>
          </div>

          {/* 右侧图组 */}
          <div className="flex flex-col items-start drop-shadow-[0_45px_80px_rgba(0,0,0,0.25)]">
            <div className="w-48 h-48 rounded-full border-[5px] border-white shadow-2xl overflow-hidden shrink-0 group hover:scale-110 transition-transform duration-500 z-30 ml-[-24px]">
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

            <div className="w-64 bg-white p-4 pb-10 shadow-[0_30px_60px_rgba(0,0,0,0.15)] rotate-[6deg] hover:rotate-0 transition-all duration-500 group border border-slate-100 mt-8 ml-16 z-20">
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
        </div>

        <div className="absolute right-12 bottom-16 w-32 h-[1px] bg-slate-200" />
      </div>

    </div>
  );
}