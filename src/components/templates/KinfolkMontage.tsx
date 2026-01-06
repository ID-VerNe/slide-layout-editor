import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideBlockLabel } from '../ui/slide/SlideBlockLabel';

/**
 * KinfolkMontage - 艺术拼贴布局
 * 终极加固版：支持全局字体，原子化垂直标签。
 */
export default function KinfolkMontage({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const gallery = page.gallery || [];
  const label = page.imageLabel || 'SCENE 04 — THE TOUCH';
  const backgroundColor = page.backgroundColor || '#ffffff';
  const accentColor = page.accentColor || '#000000';

  // 统一边距锚点
  const sidePadding = '5rem';

  return (
    <div 
      className="w-full h-full relative flex flex-col transition-all duration-700 isolate"
      style={{ backgroundColor, padding: sidePadding }} 
    >
      
      {/* 1. 图片 B (氛围大图) */}
      <div className="absolute bottom-40 right-12 w-[75%] aspect-square bg-white border-[6px] border-white shadow-[0_40px_100px_rgba(0,0,0,0.06)] z-10 overflow-hidden">
        {gallery[1]?.url ? (
          <SlideImage 
            page={page} src={gallery[1].url} config={gallery[1].config}
            className="w-full h-full object-cover" rounded="0"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-200 uppercase tracking-widest">Atmosphere Slot</div>
        )}
      </div>

      {/* 2. 图片 A (局部聚焦) */}
      <div className="w-[55%] aspect-[4/3] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.12)] z-20 overflow-hidden relative group border-[6px] border-white">
        {gallery[0]?.url ? (
          <SlideImage 
            page={page} src={gallery[0].url} config={gallery[0].config}
            className="w-full h-full object-cover grayscale-[0.05] group-hover:grayscale-0 transition-all duration-1000" 
            rounded="0"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-200 uppercase tracking-widest">Detail Focus</div>
        )}
      </div>

      {/* 
        3. 侧边垂直注脚 
        核心修正：接入 SlideBlockLabel 并垂直旋转
      */}
      <div 
        className="absolute origin-bottom-left -rotate-90 pointer-events-none"
        style={{ bottom: '2.5rem', left: sidePadding }}
      >
        <SlideBlockLabel 
          page={page}
          typography={typography}
          text={label}
          className="!text-[7px] !font-black !tracking-[0.6em] !uppercase !opacity-40 !m-0 !p-0"
          color={accentColor}
          style={{ marginBottom: '-0.25rem' }}
        />
      </div>

    </div>
  );
}
