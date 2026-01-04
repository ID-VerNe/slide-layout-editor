import React from 'react';
import { PageData } from '../../types';
import { SlideParagraph } from '../ui/slide/SlideParagraph';
import { SlideHeadline } from '../ui/slide/SlideHeadline';

/**
 * KinfolkEssay - 叙事内页布局
 * 像素级微调版：日期对齐基准线，首字比例优化，签名距离拉近。
 */
export default function KinfolkEssay({ page }: { page: PageData }) {
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
      
      {/* 
        顶部：标题区域
        对齐核心：让右侧日期的基线坐落在底部的装饰线上
      */}
      <div className="border-b-[1.5px] border-slate-900 pb-8 flex justify-between items-baseline relative">
        <div className="flex-1 mr-8">
          <SlideHeadline 
            page={page} 
            maxSize={48} 
            minSize={24}
            weight={300}
            italic={true}
            className="!tracking-tight !normal-case"
            style={{ textAlign: 'left' }}
          />
        </div>
        {/* 
          日期对齐：
          使用 mb-[-1.5px] 强制文字基线与父容器的 border-b 冲齐
        */}
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] shrink-0 mb-[-1.5px]">
          {subtitle}
        </span>
      </div>

      {/* 中部：正文叙事 */}
      <div className="flex-1 py-12 flex flex-col items-center">
        <div className="w-full max-w-[90%] relative flex flex-col items-start">
          <SlideParagraph 
            page={page} 
            dropCap={true} 
            size="14px"
            className="text-slate-700"
          />
          
          {/* 
            本人签名区域：
            优化：将 mt-8 缩小至 mt-2，形成紧凑的“结语”感
          */}
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

      {/* 底部：参数网格 */}
      <div className="border-t border-slate-100 pt-10">
        <div className="grid grid-cols-2 gap-y-10 gap-x-16">
          {metrics.slice(0, 4).map((m, idx) => (
            <div key={m.id || idx} className="space-y-2 flex flex-col items-start">
              <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] leading-none m-0">
                {m.label}
              </h4>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-tight leading-none m-0">
                {m.value}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
