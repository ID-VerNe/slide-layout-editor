import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { SlideMetric } from '../ui/slide/SlideMetric';
import { useStore } from '../../store/useStore';

/**
 * EpiloguePillar - 2:3 比例终章/版权页布局
 * 特点：右侧 45% 瘦高立柱图像，左侧 55% 冷清档案感留白。
 * 构图：顶部极小标题，中下部严谨版权信息块，底部签名。
 */
export default function EpiloguePillar({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const theme = useStore((state) => state.theme);
  
  const displayTitle = page.title || 'P I L O G U E';
  const displayParagraph = page.paragraph || ''; 
  const displayLabel = page.imageLabel;
  const metrics = page.metrics || [];

  const backgroundColor = page.backgroundColor || theme.colors.background || '#ffffff';
  const titleColor = page.styleOverrides?.title?.color || theme.colors.primary || '#0F172A';
  const secondaryColor = theme.colors.secondary || '#64748B';
  const accentColor = theme.colors.accent || '#264376';

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex bg-white isolate"
      style={{ backgroundColor }}
    >
      {/* 1. 左侧文本区域: 52% 宽度 */}
      <div className="w-[52%] h-full flex flex-col px-16 py-20 z-20">
        
        {/* 顶部: 极小终章标题 */}
        <div className="mb-auto">
          <h2 
            className="text-[12px] font-black uppercase tracking-[1em] opacity-30"
            style={{ 
              color: titleColor,
              fontFamily: theme.typography.headingFont 
            }}
          >
            {displayTitle}
          </h2>
        </div>

        {/* 中下部: 版权信息块 (Colophon) */}
        <div className="mt-auto mb-10 flex flex-col max-w-[90%]">
          
          {/* 结构化信息 (Metrics) */}
          {metrics.length > 0 && (
            <div className="grid grid-cols-2 gap-x-12 gap-y-6 border-b pb-8" style={{ borderColor: `${accentColor}15` }}>
              {metrics.map((m, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-25" style={{ color: secondaryColor }}>
                    {m.label}
                  </span>
                  <span className="text-[12px] font-medium tracking-tight font-mono uppercase" style={{ color: titleColor }}>
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 补充叙述文本 (Monospace) */}
          {displayParagraph && (
            <div 
              className="mt-6 text-[14px] italic font-medium leading-[1.8] tracking-wider opacity-60 font-mono text-justify"
              style={{ color: secondaryColor }}
            >
              {displayParagraph}
            </div>
          )}

          {/* 底部: 手写签名 (右对齐于信息块) */}
          {page.signature && (
            <div className="mt-8 self-end flex justify-end">
              <img 
                src={page.signature} 
                style={{ height: `${page.styleOverrides?.signature?.fontSize || 60}px` }} 
                className="w-auto mix-blend-multiply opacity-80" 
                alt="Signature" 
              />
            </div>
          )}
        </div>
      </div>

      {/* 2. 右侧立柱图像: 48% 宽度 (稍微加宽) */}
      <div className="w-[48%] h-full relative flex flex-col items-center justify-center py-16 pr-16 pl-4 bg-white">
        <div className="w-full h-full relative overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.03)]">
          <SlideImage 
            page={page} 
            className="w-full h-full object-cover" 
            rounded="0" 
            backgroundColor="#F8FAFC" 
          />
        </div>
      </div>

      {/* 3. 全局元数据: 图片标注底边对齐图片底边 */}
      <div className="absolute bottom-16 left-16 z-40 pointer-events-none">
        <span 
          className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30" 
          style={{ color: secondaryColor }}
        >
          {displayLabel}
        </span>
      </div>
    </div>
  );
}
