import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideLogo } from '../ui/slide/SlideLogo';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { SlideIcon } from '../ui/slide/SlideIcon';
import { useStore } from '../../store/useStore';

/**
 * TableOfContents - 目录模板
 * 最终加固版：全面感应全局主题 Token。
 */
export default function TableOfContents({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const theme = useStore((state) => state.theme);
  const agenda = page.agenda || [{ title: 'Overview', desc: 'Introduction', number: '01', icon: 'LayoutGrid', items: ['Vision', 'Scope'] }];

  return (
    <div className="w-full h-full flex flex-col p-24 isolate" style={{ backgroundColor: page.backgroundColor || theme.colors.background }}>
      <div className="mb-16 space-y-4 text-center flex flex-col items-center shrink-0">
        <SlideLogo page={page} className="mb-2" />
        <SlideHeadline page={page} typography={typography} maxSize={64} className="text-center" />
        <SlideSubHeadline page={page} typography={typography} className="text-lg max-w-2xl text-center" color={theme.colors.secondary} />
      </div>

      <div className="flex-1 flex flex-wrap justify-center content-center items-center gap-x-10 gap-y-12 w-full max-w-[1700px] mx-auto overflow-y-auto no-scrollbar pb-20">
        {agenda.map((section, idx) => {
          const isActive = page.activeIndex === idx;
          return (
            <div 
              key={idx} 
              // 核心修正 1：未激活卡片背景链接至 surface
              className={`flex flex-col w-[320px] rounded-[3.5rem] overflow-hidden transition-all duration-500 border border-white shadow-xl hover:-translate-y-2 ${isActive ? 'ring-4 ring-current/10 z-10 scale-105' : ''}`}
              style={{ backgroundColor: theme.colors.surface, color: theme.colors.accent }}
            >
              <div className="p-8 pb-5 flex flex-col gap-5 text-left">
                <div className="h-8 flex items-center" style={{ color: theme.colors.accent }}>
                  <SlideIcon name={section.icon || 'LayoutGrid'} size={32} weight={isActive ? 700 : 400} />
                </div>
                <div className="space-y-1">
                  <SlideHeadline page={{...page, title: section.title}} typography={typography} maxSize={20} minSize={18} className="!normal-case !tracking-tight !font-black" color={theme.colors.primary} />
                  <SlideSubHeadline page={{...page, subtitle: section.desc}} typography={typography} size="0.65rem" className="!uppercase !font-bold !tracking-widest !m-0" color={theme.colors.secondary} />
                </div>
              </div>

              {/* 核心修正 2：激活状态背景链接至 primary */}
              <div className={`px-8 py-6 border-y transition-colors duration-500 ${isActive ? '' : 'bg-white/40 border-white/60'}`} style={isActive ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary } : {}}>
                <SlideHeadline page={{...page, title: section.number}} typography={typography} maxSize={48} minSize={32} className={`!tracking-tighter !font-black ${isActive ? '!text-white' : ''}`} color={isActive ? '#ffffff' : theme.colors.primary} />
              </div>

              <div className="p-8 pt-6 flex-1 text-left">
                <ul className="space-y-3">
                  {section.items?.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      {/* 核心修正 3：小圆点链接至 accent */}
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: theme.colors.accent }} />
                      <SlideSubHeadline page={{...page, subtitle: item}} typography={typography} size="0.8rem" className="!font-semibold !leading-tight" color={theme.colors.secondary} />
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