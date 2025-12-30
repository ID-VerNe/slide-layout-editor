import React from 'react';
import { PageData, FeatureData } from '../../types';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { SlideImage } from '../ui/slide/SlideImage';
import * as LucideIcons from 'lucide-react';

export default function StepTimeline({ page }: { page: PageData }) {
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

  const renderIcon = (name: string) => {
    const isMaterial = name.includes('_') || /^[a-z]/.test(name);
    if (isMaterial) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-[#F1F3F5]">
          <span className="material-symbols-outlined notranslate" style={{ fontSize: `${config.iconSize}px`, color: '#0F172A' }}>{name.toLowerCase()}</span>
        </div>
      );
    }
    try {
      const PascalName = name.charAt(0).toUpperCase() + name.slice(1);
      const Icon = (LucideIcons as any)[PascalName] || (LucideIcons as any)[name] || LucideIcons.Box;
      return (
        <div className="w-full h-full flex items-center justify-center bg-[#F1F3F5]">
          <Icon size={config.iconSize} strokeWidth={1.5} className="text-slate-900" />
        </div>
      );
    } catch (e) { return null; }
  };

  const titleStyle = (page.styleOverrides as any)?.featureTitle || {};
  const descStyle = (page.styleOverrides as any)?.featureDesc || {};

  return (
    <div 
      className={`w-full h-full flex flex-col p-24 relative overflow-hidden transition-all duration-700`}
      style={{ backgroundColor: page.backgroundColor || '#ffffff' }}
    >
      <div className={`${config.headerMargin} text-center flex flex-col items-center shrink-0 space-y-4 transition-all duration-500`}>
        <SlideHeadline page={page} maxSize={56} className="text-slate-900 !font-medium tracking-tight" />
        <SlideSubHeadline page={page} className="max-w-2xl text-slate-400 text-sm leading-relaxed" />
      </div>

      <div className="flex-1 flex justify-center items-center">
        <div className={`relative flex flex-col ${config.gap} w-full max-w-[1200px] transition-all duration-500`}>
          <div className="absolute left-[31.5px] top-[40px] bottom-[40px] w-px bg-slate-200 z-0" />

          {allFeatures.slice(0, 5).map((step, idx) => {
            const isImg = step.icon?.startsWith('data:image') || step.icon?.includes('http');
            return (
              <div key={idx} className="flex items-center gap-16 relative z-10 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="w-16 h-16 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0 relative z-20">
                  <span className="text-xs font-black text-slate-300 tracking-tighter">{idx + 1}</span>
                </div>

                <div className="flex-1 flex flex-col gap-1 text-left">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight line-clamp-1" style={{ fontSize: titleStyle.fontSize ? `${titleStyle.fontSize}px` : undefined, fontFamily: titleStyle.fontFamily }}>{step.title}</h3>
                  <p className={`text-xs text-slate-400 leading-relaxed max-w-sm ${config.descLines}`} style={{ fontSize: descStyle.fontSize ? `${descStyle.fontSize}px` : undefined, fontFamily: descStyle.fontFamily }}>{step.desc}</p>
                </div>

                {/* 
                  统一使用 SlideImage 原子组件
                  自动继承 X 和 Y 轴的安全平移算法
                */}
                <div 
                  className="w-[480px] rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white hover:-translate-y-1 transition-all duration-500 overflow-hidden shrink-0"
                  style={{ height: config.cardHeight }}
                >
                  {isImg ? (
                    <SlideImage 
                      page={page} 
                      src={step.icon} 
                      config={step.imageConfig} 
                      className="w-full h-full"
                    />
                  ) : renderIcon(step.icon || 'Box')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}