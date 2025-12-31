import React from 'react';
import { PageData } from '../../types';
import { SlideLogo } from '../ui/slide/SlideLogo';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { SlideBlockLabel } from '../ui/slide/SlideBlockLabel';
import { SlideIcon } from '../ui/slide/SlideIcon';

export default function PlatformHero({ page }: { page: PageData }) {
  const isVisible = (key: keyof NonNullable<PageData['visibility']>) => page.visibility?.[key] !== false;

  // 默认数据
  const defaultFeatures = [
    { title: 'Robust Infrastructure', desc: 'Reliable and scalable infrastructure.', icon: 'Globe' },
    { title: 'Easy Setup', desc: 'Quick and simple configuration.', icon: 'Zap' },
    { title: 'Effortless Scaling', desc: 'Built to handle increased demand.', icon: 'Wrench' },
    { title: 'Low Maintenance', desc: 'Focus on building, not tasks.', icon: 'Wrench' }
  ];

  const features = page.features || defaultFeatures;

  // 动态网格列数逻辑
  const gridCols = features.length === 1 ? 'grid-cols-1 max-w-xl mx-auto' : 
                   features.length === 2 ? 'grid-cols-2 max-w-4xl mx-auto' :
                   features.length === 3 ? 'grid-cols-3' :
                   'grid-cols-4';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-24 text-center">
      {/* Top Header Section */}
      <div className="flex flex-col items-center gap-6 mb-20 max-w-4xl">
        <SlideLogo page={page} />
        <SlideSubHeadline page={page} className="text-xs font-black uppercase tracking-[0.4em] text-slate-400" />
        <SlideHeadline page={page} maxSize={84} className="text-slate-900" />
        <SlideBlockLabel page={page} className="mt-4 px-8 py-3" />
      </div>

      {/* Bottom Grid Section: 动态排版 */}
      {isVisible('features') && features.length > 0 && (
        <div className={`w-full grid border-t border-slate-100 ${gridCols}`}>
          {features.map((f, idx) => (
            <div key={f.id || idx} className="flex flex-col items-start text-left p-10 border-r last:border-r-0 border-slate-100 gap-4 group">
              <div className="text-slate-900 group-hover:text-[#264376] transition-colors flex items-center h-10">
                <SlideIcon name={f.icon || 'Globe'} size={24} />
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium line-clamp-3">{f.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}