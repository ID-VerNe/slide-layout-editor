import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';

/**
 * BigStatement - 极简金句模板
 * 修复版：透传 typography 状态，感应全局字体。
 */
export default function BigStatement({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const backgroundColor = page.backgroundColor || '#ffffff';
  const pattern = page.backgroundPattern || 'none';

  const getPatternClass = () => {
    switch (pattern) {
      case 'grid': return 'bg-grid-subtle';
      case 'dots': return 'bg-dots-subtle';
      case 'diagonal': return 'bg-diagonal-subtle';
      case 'cross': return 'bg-cross-subtle';
      default: return '';
    }
  };

  return (
    <div 
      className={`w-full h-full flex flex-col items-center justify-center relative px-48 text-center overflow-hidden transition-all duration-700 isolate ${getPatternClass()}`}
      style={{ backgroundColor }}
    >
      {backgroundColor === '#ffffff' && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white pointer-events-none" />
      )}

      <div className="flex flex-col items-center gap-10 max-w-5xl z-10">
        
        <div className="relative">
          <SlideHeadline 
            page={page} 
            typography={typography} // 透传字体状态
            maxSize={84} 
            minSize={48} 
            className="!font-medium leading-[1.2] tracking-tight" 
          />
        </div>

        <SlideSubHeadline 
          page={page} 
          typography={typography} // 透传字体状态
          size="1.1rem"
          color={page.styleOverrides?.subtitle?.color || '#888888'} // 优先感应覆盖样式
          className="!font-bold !tracking-[0.3em] !uppercase !opacity-60"
        />
        
      </div>
    </div>
  );
}
