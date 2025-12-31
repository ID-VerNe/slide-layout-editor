import React from 'react';
import { PageData } from '../../types';
import { SlideLogo } from '../ui/slide/SlideLogo';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideImageLabel } from '../ui/slide/SlideImageLabel';
import { SlideMetric } from '../ui/slide/SlideMetric';

export default function TestimonialCard({ page }: { page: PageData }) {
  const isVisible = (key: keyof NonNullable<PageData['visibility']>) => page.visibility?.[key] !== false;
  const metrics = page.metrics || [];

  return (
    <div className="w-full h-full flex items-center justify-center p-20">
      {/* 核心卡片容器 */}
      <div className="bg-slate-50/50 rounded-[3.5rem] w-full max-w-[1600px] p-20 flex items-center gap-20 shadow-[0_40px_120px_rgba(0,0,0,0.04)] border border-white/60 relative">
        
        {/* 左侧：人物形象与身份 */}
        <div className="w-[380px] flex flex-col items-center gap-8 shrink-0">
          <SlideImage 
            page={page} 
            className="w-full aspect-square bg-slate-200 rounded-[3rem] border-[6px] border-white shadow-2xl" 
          />
          <SlideImageLabel page={page} />
        </div>

        {/* 右侧：品牌、引言与超大数�?*/}
        <div className="flex-1 flex flex-col justify-center py-4">
          <div className="space-y-10">
            {/* 品牌头部：Logo + 公司�?*/}
            <div className="flex items-center gap-4">
              <SlideLogo page={page} style={{ width: '40px', height: '40px' }} />
              <SlideHeadline 
                page={page} 
                maxSize={36} 
                className="text-slate-900 !tracking-tight !font-black" 
              />
            </div>

            {/* 大号引言文字 */}
            <div className="relative">
              <SlideSubHeadline 
                page={page} 
                size="2.75rem"
                weight={800}
                color="#1e293b"
                className="leading-[1.3] !tracking-tight"
              />
            </div>
          </div>

          {/* 装饰性分割线 */}
          {isVisible('metrics') && metrics.length > 0 && (
            <div className="h-px bg-slate-200/80 w-full my-12" />
          )}

          {/* 底部指标网格：渲染超大数字组�?*/}
          {isVisible('metrics') && metrics.length > 0 && (
            <div className={`grid gap-16 ${
              metrics.length === 1 ? 'grid-cols-1' : 
              metrics.length === 2 ? 'grid-cols-2' : 
              'grid-cols-3'
            }`}>
              {metrics.map((m, idx) => (
                <SlideMetric key={m.id || idx} data={m} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
