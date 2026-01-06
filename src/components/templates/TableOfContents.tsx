import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideLogo } from '../ui/slide/SlideLogo';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { SlideIcon } from '../ui/slide/SlideIcon';

/**
 * TableOfContents - 专业级目录模板
 * 修复版：全面接入原子组件，移除硬编码字体。
 */
export default function TableOfContents({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const agenda = page.agenda || [
    { title: 'Overview', desc: 'Project vision and goals', number: '01', icon: 'LayoutGrid', items: ['Market Analysis', 'Core Logic'] }
  ];

  return (
    <div className="w-full h-full flex flex-col p-24 isolate">
      {/* Header Section */}
      <div className="mb-16 space-y-4 text-center flex flex-col items-center shrink-0">
        <SlideLogo page={page} className="mb-2" />
        <SlideHeadline page={page} typography={typography} maxSize={64} className="text-slate-900 text-center" />
        <SlideSubHeadline page={page} typography={typography} className="text-lg max-w-2xl text-center" />
      </div>

      {/* Grid Container */}
      <div className="flex-1 flex flex-wrap justify-center content-center items-center gap-x-10 gap-y-12 w-full max-w-[1700px] mx-auto overflow-y-auto no-scrollbar pb-20">
        {agenda.map((section, idx) => {
          const isActive = page.activeIndex === idx;
          return (
            <div 
              key={section.id || idx} 
              className={`flex flex-col w-[320px] rounded-[3.5rem] bg-[#F1F3F5] overflow-hidden transition-all duration-500 border border-white shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:-translate-y-2
                ${isActive ? 'ring-4 ring-[#264376]/10 z-10 scale-105 shadow-2xl' : ''}`}
            >
              {/* Top Section */}
              <div className="p-8 pb-5 flex flex-col gap-5 text-left">
                <div className="text-[#264376] h-8 flex items-center">
                  <SlideIcon name={section.icon || 'LayoutGrid'} size={32} weight={isActive ? 700 : 400} strokeWidth={isActive ? 3 : 2.5} />
                </div>
                <div className="space-y-1">
                  <SlideHeadline 
                    page={{...page, title: section.title}} 
                    typography={typography}
                    maxSize={20}
                    minSize={18}
                    className="!normal-case !tracking-tight !font-black !text-slate-900"
                  />
                  <SlideSubHeadline 
                    page={{...page, subtitle: section.desc}} 
                    typography={typography}
                    size="0.65rem"
                    className="!uppercase !font-bold !tracking-widest !text-slate-400"
                  />
                </div>
              </div>

              {/* Middle Section: Index Number */}
              <div className={`px-8 py-6 border-y transition-colors duration-500 ${isActive ? 'bg-[#0F172A] border-[#0F172A]' : 'bg-white/40 border-white/60'}`}>
                <SlideHeadline 
                  page={{...page, title: section.number}} 
                  typography={typography}
                  maxSize={48}
                  minSize={32}
                  className={`!tracking-tighter !font-black ${isActive ? '!text-white' : '!text-slate-900'}`}
                />
              </div>

              {/* Bottom Section: Bullet Items */}
              <div className="p-8 pt-6 flex-1 text-left">
                <ul className="space-y-3">
                  {section.items?.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-[#264376]`} />
                      <SlideSubHeadline 
                        page={{...page, subtitle: item}} 
                        typography={typography}
                        size="0.8rem"
                        className="!font-semibold !leading-tight !text-slate-600"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );Section
        })}
      </div>
    </div>
  );
}
