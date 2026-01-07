import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideLogo } from '../ui/slide/SlideLogo';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideImageLabel } from '../ui/slide/SlideImageLabel';
import { SlideMetric } from '../ui/slide/SlideMetric';
import { useStore } from '../../store/useStore';

/**
 * TestimonialCard - 证言卡片
 * 最终加固版：全面感应全局主题 Token。
 */
export default function TestimonialCard({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const theme = useStore((state) => state.theme);
  const isVisible = (key: keyof NonNullable<PageData['visibility']>) => page.visibility?.[key] !== false;
  const metrics = page.metrics || [];

  return (
    <div className="w-full h-full flex items-center justify-center p-20 isolate" style={{ backgroundColor: page.backgroundColor || theme.colors.background }}>
      {/* 核心修正 1：卡片背景链接至 surface (配合透明度叠加) */}
      <div 
        className="rounded-[3.5rem] w-full max-w-[1600px] p-20 flex items-center gap-20 shadow-2xl border border-white/60 relative"
        style={{ backgroundColor: `${theme.colors.surface}88`, backdropFilter: 'blur(20px)' }}
      >
        <div className="w-[380px] flex flex-col items-center gap-8 shrink-0">
          <SlideImage page={page} className="w-full aspect-square bg-slate-200 rounded-[3rem] border-[6px] border-white shadow-2xl" />
          <SlideImageLabel page={page} typography={typography} color={theme.colors.secondary} />
        </div>

        <div className="flex-1 flex flex-col justify-center py-4">
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <SlideLogo page={page} style={{ width: '40px', height: '40px' }} />
              <SlideHeadline page={page} typography={typography} maxSize={36} color={theme.colors.primary} className="!tracking-tight !font-black !normal-case" />
            </div>

            <div className="relative">
              {/* 核心修正 2：引言文字链接至 primary */}
              <SlideSubHeadline page={page} typography={typography} size="2.75rem" color={theme.colors.primary} className="!leading-[1.3] !tracking-tight !font-[1000]" />
            </div>
          </div>

          {isVisible('metrics') && metrics.length > 0 && <div className="h-px bg-current opacity-10 w-full my-12" style={{ color: theme.colors.accent }} />}

          {isVisible('metrics') && metrics.length > 0 && (
            <div className={`grid gap-16 ${metrics.length === 1 ? 'grid-cols-1' : metrics.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {metrics.map((m, idx) => (
                <SlideMetric key={idx} data={m} page={page} typography={typography} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
