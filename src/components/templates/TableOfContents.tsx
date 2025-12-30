import React from 'react';
import { PageData } from '../../types';
import { SlideLogo } from '../ui/slide/SlideLogo';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import * as LucideIcons from 'lucide-react';

export default function TableOfContents({ page }: { page: PageData }) {
  const isVisible = (key: keyof NonNullable<PageData['visibility']>) => page.visibility?.[key] !== false;

  const agenda = page.agenda || [
    { title: 'Overview', desc: 'Project vision and goals', number: '01', icon: 'LayoutGrid', items: ['Market Analysis', 'Core Logic'] }
  ];

  // 稳健的图标渲染引�?(支持 Lucide �?Material Symbols)
  const renderIcon = (name: string, size = 32, isActive = false) => {
    if (!name) return <LucideIcons.LayoutGrid size={size} strokeWidth={2} className="opacity-20" />;
    
    // 1. 判定是否�?Material Symbols (小写开头或包含下划�?
    const isMaterial = name.includes('_') || /^[a-z]/.test(name);
    
    if (isMaterial) {
      return (
        <span 
          className="material-symbols-outlined notranslate" 
          style={{ 
            fontSize: `${size}px`, 
            fontVariationSettings: `'FILL' 0, 'wght' ${isActive ? 700 : 400}, 'GRAD' 0, 'opsz' 24`,
            display: 'inline-block',
            lineHeight: 1,
            textTransform: 'none'
          }}
        >
          {name.toLowerCase()}
        </span>
      );
    }

    // 2. 判定�?Lucide 图标
    try {
      const PascalName = name.charAt(0).toUpperCase() + name.slice(1);
      const Icon = (LucideIcons as any)[PascalName] || (LucideIcons as any)[name] || LucideIcons.LayoutGrid;
      return <Icon size={size} strokeWidth={isActive ? 3 : 2.5} />;
    } catch (e) {
      return <LucideIcons.LayoutGrid size={size} />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-24">
      <style dangerouslySetInnerHTML={{ __html: `.material-symbols-outlined { text-transform: none !important; }` }} />
      
      {/* Header Section: 置顶居中 */}
      <div className="mb-16 space-y-4 text-center flex flex-col items-center shrink-0">
        <SlideLogo page={page} className="mb-2" />
        <SlideHeadline page={page} maxSize={64} className="text-slate-900 text-center" />
        <SlideSubHeadline page={page} className="text-lg max-w-2xl text-center" />
      </div>

      {/* Grid Container: 动态垂直居�?*/}
      <div className="flex-1 flex flex-wrap justify-center content-center items-center gap-x-10 gap-y-12 w-full max-w-[1700px] mx-auto overflow-y-auto no-scrollbar pb-20">
        {agenda.map((section, idx) => {
          const isActive = page.activeIndex === idx;
          return (
            <div 
              key={idx} 
              className={`flex flex-col w-[320px] rounded-[3rem] bg-[#F1F3F5] overflow-hidden transition-all duration-500 border border-white shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:-translate-y-2
                ${isActive ? 'ring-4 ring-#264376/10 z-10 scale-105 shadow-2xl' : ''}`}
            >
              {/* Top Section: 卡片头部 */}
              <div className="p-8 pb-5 flex flex-col gap-5 text-left">
                <div className="text-[#264376] h-8 flex items-center">
                  {renderIcon(section.icon || 'LayoutGrid', 32, isActive)}
                </div>
                <div>
                  <h4 className="text-xl font-black uppercase tracking-tight text-slate-900">
                    {section.title}
                  </h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-1 text-slate-400">
                    {section.desc}
                  </p>
                </div>
              </div>

              {/* Middle Section: 只有这里在激活时变黑 */}
              <div className={`px-8 py-6 border-y transition-colors duration-500 ${isActive ? 'bg-[#0F172A] border-[#0F172A]' : 'bg-white/40 border-white/60'}`}>
                <span className={`text-5xl font-[1000] tracking-tighter transition-colors ${isActive ? 'text-white' : 'text-slate-900'}`}>
                  {section.number}
                </span>
              </div>

              {/* Bottom Section: 卡片底部列表 */}
              <div className="p-8 pt-6 flex-1 text-left">
                <ul className="space-y-2.5">
                  {section.items?.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-[#264376]`} />
                      <span className="text-[13px] font-semibold leading-tight text-slate-600">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
