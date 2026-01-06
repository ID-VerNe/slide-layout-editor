import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideLogo } from '../ui/slide/SlideLogo';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { SlideBlockLabel } from '../ui/slide/SlideBlockLabel';
import * as LucideIcons from 'lucide-react';

export default function CommunityHub({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const isVisible = (key: keyof NonNullable<PageData['visibility']>) => page.visibility?.[key] !== false;

  const partners = page.partners || [
    { name: 'shadcn/ui', logo: 'Layers' },
    { name: 'Sketch', logo: 'Diamond' },
    { name: 'tailwindcss', logo: 'Zap' }
  ];

  const testimonials = page.testimonials || [
    { name: 'Emily Johnson', quote: 'Joining the Innovators Community has completely transformed my approach to product development.', avatar: 'person' },
    { name: 'Alex Smith', quote: 'Being part of this community has helped me stay up-to-date with the latest trends in innovation.', avatar: 'person' },
    { name: 'Sarah Parker', quote: 'The Innovators Community has been instrumental in connecting me with like-minded professionals.', avatar: 'person' }
  ];

  const renderIcon = (name: string, size = 20) => {
    const isImg = name.startsWith('data:image') || name.includes('http');
    if (isImg) return <img src={name} className="w-full h-full object-contain" alt="Logo" />;
    const isMaterial = name.includes('_') || /^[a-z]/.test(name);
    if (isMaterial) return <span className="material-symbols-outlined notranslate" style={{ fontSize: `${size}px` }}>{name.toLowerCase()}</span>;
    const PascalName = name.charAt(0).toUpperCase() + name.slice(1);
    const Icon = (LucideIcons as any)[PascalName] || (LucideIcons as any)[name] || LucideIcons.Globe;
    return <Icon size={size} strokeWidth={2.5} />;
  };

  return (
    <div className="w-full h-full flex overflow-hidden isolate">
      <div className="w-[45%] h-full flex items-center justify-center z-10 bg-white shadow-2xl shadow-slate-200/50 relative">
        <div className="flex flex-col items-start gap-12 max-w-[80%]">
          <SlideLogo page={page} className="mb-4" />
          
          <div className="space-y-8 text-left">
            <SlideHeadline page={page} typography={typography} maxSize={72} className="text-slate-900" />
            <SlideSubHeadline page={page} typography={typography} className="text-lg max-w-md" />
            <SlideBlockLabel page={page} typography={typography} className="mt-4 px-8 py-3" />
          </div>

          {(isVisible('partnersTitle') || isVisible('partners')) && (partners.length > 0 || page.partnersTitle) && (
            <div className="space-y-6 pt-12 border-t border-slate-50 w-full text-left">
              {isVisible('partnersTitle') && page.partnersTitle && (
                <SlideBlockLabel 
                  page={page} 
                  typography={typography}
                  text={page.partnersTitle}
                  className="!text-[10px] !font-black !uppercase !tracking-[0.3em] !text-slate-300"
                />
              )}
              {isVisible('partners') && (
                <div className="flex flex-wrap gap-8 items-center">
                  {partners.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-2 grayscale hover:grayscale-0 opacity-40 hover:opacity-100 transition-all cursor-pointer">
                      <div className="w-6 h-6 flex items-center justify-center text-slate-900">{renderIcon(p.logo, 20)}</div>
                      <SlideBlockLabel 
                        page={page} 
                        typography={typography}
                        text={p.name}
                        className="!text-xs !font-black !text-slate-900 !tracking-tight !opacity-100"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 h-full flex flex-col justify-center px-20 gap-6 bg-slate-50/50 relative">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
             style={{ backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        
        {isVisible('testimonials') && testimonials.map((t, idx) => (
          <div 
            key={idx} 
            className="bg-white p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-white flex gap-6 items-start animate-in fade-in slide-in-from-right-12"
            style={{ animationDelay: `${idx * 150}ms` }}
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 shrink-0 overflow-hidden border-2 border-slate-50 flex items-center justify-center text-slate-400">
              {renderIcon(t.avatar, 24)}
            </div>
            <div className="space-y-2 text-left">
              <SlideHeadline 
                page={{...page, title: t.name}} 
                typography={typography}
                maxSize={16}
                minSize={14}
                className="!normal-case !tracking-tight !font-black !text-slate-900"
              />
              <SlideSubHeadline 
                page={{...page, subtitle: `"${t.quote}"`}} 
                typography={typography}
                size="0.75rem"
                className="!text-slate-500 !leading-relaxed !font-medium"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}