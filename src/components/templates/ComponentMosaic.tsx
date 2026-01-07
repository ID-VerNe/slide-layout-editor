import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideLogo } from '../ui/slide/SlideLogo';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { SlideBlockLabel } from '../ui/slide/SlideBlockLabel';
import { SlideIcon } from '../ui/slide/SlideIcon';
import { useStore } from '../../store/useStore';

/**
 * ComponentMosaic - 碎片组件马赛克布局
 * 最终加固版：全面感应全局主题 Token。
 */
export default function ComponentMosaic({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const theme = useStore((state) => state.theme);
  
  const config = {
    rows: page.mosaicConfig?.rows ?? 3,
    cols: page.mosaicConfig?.cols ?? 5,
    stagger: page.mosaicConfig?.stagger ?? true,
    // 核心修复 1：背景色优先感应 theme.colors.surface
    tileColor: page.mosaicConfig?.tileColor || theme.colors.surface || '#ffffff',
    icons: page.mosaicConfig?.icons ?? {}
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden isolate">
      <SlideLogo page={page} className="absolute top-16 left-32" />

      <div className="grid grid-cols-12 gap-12 z-10 w-full max-w-[1600px] px-20 items-center">
        
        {/* 左侧文字区 */}
        <div className="col-span-5 flex flex-col items-start gap-8">
            <SlideHeadline page={page} typography={typography} maxSize={84} className="text-slate-900" />
            <SlideSubHeadline page={page} typography={typography} className="max-w-md" />
            <SlideBlockLabel page={page} typography={typography} />
        </div>

        {/* 右侧网格区 */}
        <div className="col-span-7 flex flex-col justify-center items-end gap-6 overflow-visible">
            {Array.from({ length: config.rows }).map((_, r) => (
            <div 
                key={r} 
                className="flex gap-6 items-center justify-end"
                style={{ 
                  marginRight: config.stagger && r % 2 !== 0 ? '60px' : '0'
                }}
            >
                {Array.from({ length: config.cols }).map((_, c) => {
                const val = config.icons[`${r}-${c}`];
                const isImage = val?.startsWith('data:image') || val?.includes('http');
                
                return (
                    <div 
                      key={`${r}-${c}`} 
                      className="w-24 h-24 rounded-[1.25rem] shadow-[0_12px_40px_rgba(0,0,0,0.04)] border border-black/[0.03] flex items-center justify-center hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 cursor-pointer relative group/cell"
                      style={{ 
                        backgroundColor: config.tileColor,
                        color: theme.colors.primary 
                      }}
                    >
                      <SlideIcon name={val} size={isImage ? 64 : 32} strokeWidth={2.5} />
                      
                      {val && !isImage && (
                        <div 
                          // 核心修复 2：悬浮背景链接至主题 primary
                          className="absolute -bottom-10 text-white text-[8px] font-black uppercase px-2 py-1 rounded opacity-0 group-hover/cell:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-xl"
                          style={{ backgroundColor: theme.colors.primary }}
                        >
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