import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideIcon } from '../ui/slide/SlideIcon';
import { useStore } from '../../store/useStore';

/**
 * StepTimeline - 纵向步骤时间轴布局
 * 最终加固版：全面感应全局主题 Token。
 */
export default function StepTimeline({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const theme = useStore((state) => state.theme);
  const allFeatures = page.features || [
    { title: 'Step 01', desc: 'Description of the first step.', icon: 'Activity' },
    { title: 'Step 02', desc: 'Description of the second step.', icon: 'Zap' },
    { title: 'Step 03', desc: 'Description of the third step.', icon: 'RotateCcw' }
  ];

  const count = allFeatures.length;
  const config = {
    cardHeight: count >= 5 ? '120px' : count === 4 ? '160px' : '220px',
    gap: count >= 5 ? 'gap-4' : count === 4 ? 'gap-6' : 'gap-12',
    iconSize: count >= 5 ? 32 : count === 4 ? 48 : 64,
    headerMargin: count >= 4 ? 'mb-10' : 'mb-20'
  };

  return (
    <div className="w-full h-full flex flex-col p-24 relative overflow-hidden transition-all duration-700 isolate" style={{ backgroundColor: page.backgroundColor || theme.colors.background }}>
      <div className={`${config.headerMargin} text-center flex flex-col items-center shrink-0 space-y-4`}>
        <SlideHeadline page={page} typography={typography} maxSize={56} />
        <SlideSubHeadline page={page} typography={typography} className="max-w-2xl text-sm" color={theme.colors.secondary} />
      </div>

      <div className="flex-1 flex justify-center items-center">
        <div className={`relative flex flex-col ${config.gap} w-full max-w-[1200px]`}>
          {/* 核心修正 1：纵向线链接至主题 accent (透明度补正) */}
          <div className="absolute left-[31.5px] top-[40px] bottom-[40px] w-px opacity-20" style={{ backgroundColor: theme.colors.accent }} />

          {allFeatures.slice(0, 5).map((step, idx) => {
            const isImg = step.icon?.startsWith('data:image') || step.icon?.includes('http');
            return (
              <div key={idx} className="flex items-center gap-16 relative z-10 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="w-16 h-16 rounded-full bg-white border shadow-sm flex items-center justify-center shrink-0 relative z-20" style={{ borderColor: `${theme.colors.accent}33` }}>
                  {/* 核心修正 2：节点数字链接至主题 accent */}
                  <span className="text-xs font-black tracking-tighter" style={{ color: theme.colors.accent }}>{idx + 1}</span>
                </div>

                <div className="flex-1 flex flex-col gap-1 text-left">
                  <SlideHeadline page={{...page, title: step.title}} typography={typography} maxSize={20} minSize={16} className="!normal-case !tracking-tight !font-bold" />
                  <SlideSubHeadline page={{...page, subtitle: step.desc}} typography={typography} size="0.75rem" className="!leading-relaxed !max-w-sm line-clamp-2" color={theme.colors.secondary} />
                </div>

                <div className="w-[480px] rounded-[2.5rem] shadow-xl border border-white/50 overflow-hidden shrink-0" style={{ height: config.cardHeight, backgroundColor: theme.colors.surface }}>
                  {isImg ? <SlideImage page={page} src={step.icon} className="w-full h-full" /> : <div className="w-full h-full flex items-center justify-center opacity-80" style={{ color: theme.colors.primary }}><SlideIcon name={step.icon || 'Box'} size={config.iconSize} strokeWidth={1.5} /></div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
