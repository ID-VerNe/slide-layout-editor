import React from 'react';
import { PageData } from '../../types';
import { SlideImage } from '../ui/slide/SlideImage';

/**
 * FilmDiptych - 胶片双联画模板
 * 核心：两张竖构图照片并排，极简说明位于底部中心。
 */
export default function FilmDiptych({ page }: { page: PageData }) {
  const gallery = page.gallery || [];
  const displayLabel = page.imageLabel || 'SEQUENCE 04 · MOVEMENT STUDY';
  
  const backgroundColor = page.backgroundColor || '#FAFAF9';
  const accentColor = page.accentColor || '#000000';

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center p-8 transition-all duration-700 overflow-hidden"
      style={{ backgroundColor }}
    >
      {/* 容器：两张图并排，中间留极窄缝隙 */}
      <div className="flex flex-row gap-2.5 w-full h-[82%] animate-in fade-in zoom-in-95 duration-1000">
        
        {/* 左图 */}
        <div className="flex-1 h-full relative group bg-slate-50 overflow-hidden">
          {gallery[0]?.url ? (
            <SlideImage 
              page={page} src={gallery[0].url} config={gallery[0].config}
              className="w-full h-full object-cover" rounded="0"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-slate-200">A.</div>
          )}
          <span className="absolute bottom-4 left-4 text-[8px] text-white font-mono opacity-0 group-hover:opacity-60 transition-opacity">SIDE A</span>
        </div>

        {/* 右图 */}
        <div className="flex-1 h-full relative group bg-slate-50 overflow-hidden">
          {gallery[1]?.url ? (
            <SlideImage 
              page={page} src={gallery[1].url} config={gallery[1].config}
              className="w-full h-full object-cover" rounded="0"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-slate-200">B.</div>
          )}
          <span className="absolute bottom-4 left-4 text-[8px] text-white font-mono opacity-0 group-hover:opacity-60 transition-opacity">SIDE B</span>
        </div>

      </div>

      {/* 底部总说明 */}
      <div className="absolute bottom-8 w-full text-center px-12">
        <p 
          className="text-[8px] font-black tracking-[0.4em] uppercase opacity-20"
          style={{ color: accentColor }}
        >
          {displayLabel}
        </p>
      </div>
    </div>
  );
}
