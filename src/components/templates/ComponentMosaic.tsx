import React from 'react';
import { PageData } from '../../types';
import { SlideLogo } from '../ui/slide/SlideLogo';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { SlideBlockLabel } from '../ui/slide/SlideBlockLabel';
import * as LucideIcons from 'lucide-react';

export default function ComponentMosaic({ page }: { page: PageData }) {
  const isVisible = (key: keyof NonNullable<PageData['visibility']>) => page.visibility?.[key] !== false;

  const config = {
    rows: page.mosaicConfig?.rows ?? 3,
    cols: page.mosaicConfig?.cols ?? 5,
    stagger: page.mosaicConfig?.stagger ?? true,
    tileColor: page.mosaicConfig?.tileColor ?? '#ffffff',
    icons: page.mosaicConfig?.icons ?? {}
  };

  const renderCellAsset = (val: string) => {
    if (!val) return <LucideIcons.Plus size={20} strokeWidth={2} className="opacity-5" />;
    
    try {
      const isImage = val.startsWith('data:image') || val.includes('http');
      if (isImage) {
        return <img src={val} className="w-[70%] h-[70%] object-contain" alt="Asset" />;
      }

      const isMaterial = val.includes('_') || /^[a-z]/.test(val);
      if (isMaterial) {
        return (
          <span className="material-symbols-outlined notranslate" style={{ fontSize: '32px', textTransform: 'none', fontStyle: 'normal' }}>
            {val.toLowerCase()}
          </span>
        );
      }

      const Icon = (LucideIcons as any)[val] || (LucideIcons as any)[val.charAt(0).toUpperCase() + val.slice(1)] || LucideIcons.Box;
      return <Icon size={32} strokeWidth={2.5} />;
    } catch (e) {
      return <LucideIcons.AlertCircle size={24} className="text-red-200" />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
      <SlideLogo page={page} className="absolute top-16 left-32" />

      {/* 
        内容主容�?
        使用 grid 12 列布局
      */}
      <div className="grid grid-cols-12 gap-12 z-10 w-full max-w-[1600px] px-20 items-center">
        
        {/* 左侧文字区：占据 5 �?*/}
        <div className="col-span-5 flex flex-col items-start gap-8">
            <SlideHeadline page={page} maxSize={84} className="text-slate-900" />
            <SlideSubHeadline page={page} className="max-w-md" />
            <SlideBlockLabel page={page} />
        </div>

        {/* 
          右侧网格区：占据 7 �?          修正：使�?items-end 使整体向右靠�?        */}
        <div className="col-span-7 flex flex-col justify-center items-end gap-6 overflow-visible">
            {Array.from({ length: config.rows }).map((_, r) => (
            <div 
                key={r} 
                className="flex gap-6 items-center justify-end"
                style={{ 
                  // 修正：向右靠拢时，交错效果应使用 marginRight
                  marginRight: config.stagger && r % 2 !== 0 ? '60px' : '0'
                }}
            >
                {Array.from({ length: config.cols }).map((_, c) => {
                const val = config.icons[`${r}-${c}`];
                return (
                    <div 
                      key={`${r}-${c}`} 
                      className="w-24 h-24 rounded-[1.25rem] shadow-[0_12px_40px_rgba(0,0,0,0.04)] border border-slate-50 flex items-center justify-center text-slate-900 hover:-translate-y-2 hover:shadow-2xl hover:border-[#264376]/20 transition-all duration-500 cursor-pointer relative group/cell"
                      style={{ backgroundColor: config.tileColor }}
                    >
                      {renderCellAsset(val)}
                      
                      {val && !val.startsWith('data:image') && (
                        <div className="absolute -bottom-10 bg-slate-900 text-white text-[8px] font-black uppercase px-2 py-1 rounded opacity-0 group-hover/cell:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-xl">
                          {val.replace(/_/g, ' ')}
                        </div>
                      )}
                    </div>
                );
                })}
            </div>
            ))}
        </div>
      </div>
    </div>
  );
}
