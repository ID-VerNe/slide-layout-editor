import React from 'react';
import { PageData } from '../../types';
import { SlideHeadline } from '../ui/slide/SlideHeadline';

/**
 * KinfolkEssay - 叙事内页布局
 * 修复版：正确响应 page.backgroundColor。
 */
export default function KinfolkEssay({ page }: { page: PageData }) {
  const title = page.title || 'Winter Light';
  const subtitle = page.subtitle || 'SHENZHEN / 2026';
  const bodyText = page.actionText || 'The light in January always feels different. It strikes the surface of the mask with a harshness that softens only in the late afternoon. We spent three hours waiting for this specific shadow...';
  const metrics = page.metrics || [
    { label: 'CAMERA', value: 'Sony A7R5' },
    { label: 'LENS', value: '50mm F1.2 GM' },
    { label: 'CHARACTER', value: 'Marin Kitagawa' },
    { label: 'DATE', value: '2026.01.15' }
  ];

  const backgroundColor = page.backgroundColor || '#ffffff';

  return (
    <div 
      className="w-full h-full px-16 py-20 flex flex-col justify-between transition-all duration-700"
      style={{ backgroundColor }}
    >
      
      {/* 顶部：标题与刊号线 */}
      <div className="border-b-[1.5px] border-slate-900 pb-6 flex justify-between items-end">
        <h2 className="text-4xl font-light italic text-slate-900 tracking-tight" style={{ fontFamily: "'Crimson Pro', serif" }}>
          {title}
        </h2>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          {subtitle}
        </span>
      </div>

      {/* 中部：正文叙事 */}
      <div className="flex-1 py-12">
        <div className="max-w-[85%]">
          <p className="text-[13px] leading-[2.2] text-slate-600 text-justify font-serif" style={{ fontFamily: "'Crimson Pro', serif" }}>
            <span className="float-left text-6xl mt-[-4px] mr-3 font-medium text-slate-900 leading-none">
              {bodyText.charAt(0)}
            </span>
            {bodyText.slice(1)}
          </p>
        </div>
      </div>

      {/* 底部：详细参数 */}
      <div className="border-t border-slate-100 pt-8 grid grid-cols-2 gap-y-8 gap-x-12">
        {metrics.slice(0, 4).map((m, idx) => (
          <div key={idx} className="space-y-1.5">
            <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">{m.label}</h4>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-tight">{m.value}</p>
          </div>
        ))}
      </div>

    </div>
  );
}