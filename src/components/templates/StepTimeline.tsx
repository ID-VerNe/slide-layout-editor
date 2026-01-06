import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideIcon } from '../ui/slide/SlideIcon';

export default function StepTimeline({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const allFeatures = page.features || [
    { title: 'Monitor Deployments live', desc: 'Track your deployments with clarity, seeing updates take place as they happen.', icon: 'Activity' },
    { title: 'Immediate Issue Detection', desc: 'Spot issues instantly and address them with precise metrics for optimized performance.', icon: 'Zap' },
    { title: 'Revert to a Stable Version', desc: 'With just a few actions, revert to a previous version and restore system health swiftly.', icon: 'RotateCcw' }
  ];

  const count = allFeatures.length;
  const config = {
    cardHeight: count >= 5 ? '120px' : count === 4 ? '160px' : '220px',
    gap: count >= 5 ? 'gap-4' : count === 4 ? 'gap-6' : 'gap-12',
    iconSize: count >= 5 ? 32 : count === 4 ? 48 : 64,
    descLines: count >= 5 ? 'line-clamp-1' : count === 4 ? 'line-clamp-2' : 'line-clamp-3',
    headerMargin: count >= 4 ? 'mb-10' : 'mb-20'
  };

  return (
    <div 
      className={`w-full h-full flex flex-col p-24 relative overflow-hidden transition-all duration-700 isolate`}
      style={{ backgroundColor: page.backgroundColor || '#ffffff' }}
    >
      <div className={`${config.headerMargin} text-center flex flex-col items-center shrink-0 space-y-4 transition-all duration-500`}>
        <SlideHeadline page={page} typography={typography} maxSize={56} className="text-slate-900 !font-medium tracking-tight" />
        <SlideSubHeadline page={page} typography={typography} className="max-w-2xl text-slate-400 text-sm leading-relaxed" />
      </div>

      <div className="flex-1 flex justify-center items-center">
        <div className={`relative flex flex-col ${config.gap} w-full max-w-[1200px] transition-all duration-500`}>
          <div className="absolute left-[31.5px] top-[40px] bottom-[40px] w-px bg-slate-200 z-0" />

          {allFeatures.slice(0, 5).map((step, idx) => {
            const isImg = step.icon?.startsWith('data:image') || step.icon?.includes('http');
            return (
              <div key={step.id || idx} className="flex items-center gap-16 relative z-10 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="w-16 h-16 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0 relative z-20">
                  <span className="text-xs font-black text-slate-300 tracking-tighter">{idx + 1}</span>
                </div>

                <div className="flex-1 flex flex-col gap-1 text-left">
                  {/* 核心修正：时间轴节点文字接入原子组件 */}
                  <SlideHeadline 
                    page={{...page, title: step.title}} 
                    typography={typography}
                    maxSize={20}
                    minSize={16}
                    className="!normal-case !tracking-tight !font-bold"
                  />
                  <SlideSubHeadline 
                    page={{...page, subtitle: step.desc}} 
                    typography={typography}
                    size="0.75rem"
                    className={`!text-slate-400 !leading-relaxed !max-w-sm ${config.descLines}`}
                  />
                </div>

                <div 
                  className="w-[480px] rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white hover:-translate-y-1 transition-all duration-500 overflow-hidden shrink-0"
                  style={{ height: config.cardHeight }}
                >
                  {isImg ? (
                    <SlideImage page={page} src={step.icon} config={step.imageConfig} className="w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#F1F3F5]">
                      <SlideIcon name={step.icon || 'Box'} size={config.iconSize} strokeWidth={1.5} className="text-slate-900" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}