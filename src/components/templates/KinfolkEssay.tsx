import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideParagraph } from '../ui/slide/SlideParagraph';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { SlideMetric } from '../ui/slide/SlideMetric';

/**
 * KinfolkEssay - 叙事内页布局
 * 修复版：全面接入原子组件，感应全局字体。
 */
export default function KinfolkEssay({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const subtitle = page.subtitle || 'SHENZHEN / 2026';
  const metrics = page.metrics || [
    { label: 'CAMERA', value: 'Sony A7R5' },
    { label: 'LENS', value: '50mm F1.2 GM' },
    { label: 'CHARACTER', value: 'Marin Kitagawa' },
    { label: 'DATE', value: '2026.01.15' }
  ];

  const backgroundColor = page.backgroundColor || '#ffffff';

  return (
    <div 
      className="w-full h-full px-32 py-20 flex flex-col justify-between transition-all duration-700 isolate"
      style={{ backgroundColor }}
    >
      
      {/* 顶部标题区域 */}
      <div className="border-b-[1.5px] border-slate-900 pb-8 flex justify-between items-baseline relative">
        <div className="flex-1 mr-8">
          <SlideHeadline 
            page={page} 
            typography={typography}
            maxSize={48} 
            minSize={24}
            weight={300}
            italic={true}
            className="!tracking-tight !normal-case"
            style={{ textAlign: 'left' }}
          />
        </div>
        
        {/* 日期：接入 SlideSubHeadline */}
        <SlideSubHeadline 
          page={{...page, subtitle}} 
          typography={typography}
          className="!text-[10px] !font-black !uppercase !tracking-[0.3em] !opacity-40 mb-[-1.5px] shrink-0"
        />
      </div>

      {/* 中部正文 */}
      <div className="flex-1 py-12 flex flex-col items-center">
        <div className="w-full max-w-[90%] relative flex flex-col items-start">
          <SlideParagraph 
            page={page} 
            typography={typography}
            dropCap={true} 
            size="14px"
            className="text-slate-700"
          />
          
          {page.signature && (
            <div className="mt-2 self-end flex justify-end animate-in fade-in slide-in-from-right-4 duration-1000">
              <img 
                src={page.signature} 
                style={{ height: `${page.styleOverrides?.signature?.fontSize || 80}px` }}
                className="w-auto mix-blend-multiply opacity-80" 
                alt="Artist Signature" 
              />
            </div>
          )}
        </div>
      </div>

      {/* 底部参数网格 - 核心修正：接入 SlideMetric 原子组件 */}
      <div className="border-t border-slate-100 pt-10">
        <div className="grid grid-cols-2 gap-y-10 gap-x-16">
          {metrics.slice(0, 4).map((m, idx) => (
            <SlideMetric 
              key={idx}
              data={m}
              page={page}
              typography={typography}
              valueClassName="!text-xs !font-bold !tracking-tight !text-slate-800"
              labelClassName="!text-[9px] !font-black !text-slate-300 !tracking-[0.4em]"
            />
          ))}
        </div>
      </div>

    </div>
  );
}