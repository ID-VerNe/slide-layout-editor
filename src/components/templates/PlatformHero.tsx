import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideLogo } from '../ui/slide/SlideLogo';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { SlideBlockLabel } from '../ui/slide/SlideBlockLabel';
import { SlideIcon } from '../ui/slide/SlideIcon';
import { useStore } from '../../store/useStore';

/**
 * PlatformHero - 平台核心架构布局
 * 最终加固版：全面感应全局主题 Token。
 */
export default function PlatformHero({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const theme = useStore((state) => state.theme);
  const isVisible = (key: keyof NonNullable<PageData['visibility']>) => page.visibility?.[key] !== false;

  const defaultFeatures = [
    { title: 'Robust Infrastructure', desc: 'Reliable and scalable infrastructure.', icon: 'Globe' },
    { title: 'Easy Setup', desc: 'Quick and simple configuration.', icon: 'Zap' },
    { title: 'Effortless Scaling', desc: 'Built to handle increased demand.', icon: 'Wrench' },
    { title: 'Low Maintenance', desc: 'Focus on building, not tasks.', icon: 'Wrench' }
  ];

  const features = page.features || defaultFeatures;
  const gridCols = features.length === 1 ? 'grid-cols-1 max-w-xl mx-auto' : 
                   features.length === 2 ? 'grid-cols-2 max-w-4xl mx-auto' :
                   features.length === 3 ? 'grid-cols-3' :
                   'grid-cols-4';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-24 text-center isolate">
      <div className="flex flex-col items-center gap-6 mb-20 max-w-4xl">
        <SlideLogo page={page} />
        {/* 核心修正 1：副标题链接至主题 secondary */}
        <SlideSubHeadline page={page} typography={typography} className="!text-xs !font-black !uppercase !tracking-[0.4em]" color={theme.colors.secondary} />
        <SlideHeadline page={page} typography={typography} maxSize={84} />
        <SlideBlockLabel page={page} typography={typography} className="mt-4 px-8 py-3" />
      </div>

      {isVisible('features') && features.length > 0 && (
        // 核心修正 2：分割线感应主题 accent
        <div className="w-full grid border-t" style={{ gridTemplateColumns: `repeat(${features.length > 4 ? 4 : features.length}, 1fr)`, borderColor: `${theme.colors.accent}22` }}>
          {features.map((f, idx) => (
            <div key={f.id || idx} className="flex flex-col items-start text-left p-10 border-r last:border-r-0 gap-4 group transition-colors" style={{ borderColor: `${theme.colors.accent}22` }}>
              <div className="group-hover:scale-110 transition-transform flex items-center h-10" style={{ color: theme.colors.accent }}>
                <SlideIcon name={f.icon || 'Globe'} size={24} />
              </div>
              <SlideHeadline page={{...page, title: f.title}} typography={typography} maxSize={20} minSize={16} className="!normal-case !tracking-tight" />
              <SlideSubHeadline page={{...page, subtitle: f.desc}} typography={typography} size="0.875rem" className="!leading-relaxed !font-medium line-clamp-3" color={theme.colors.secondary} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}