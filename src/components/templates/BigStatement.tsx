import React from 'react';
import { PageData } from '../../types';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';

export default function BigStatement({ page }: { page: PageData }) {
  // 核心修复：确保背景颜色和花纹完全联动
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
      className={`w-full h-full flex flex-col items-center justify-center relative px-48 text-center overflow-hidden transition-all duration-700 ${getPatternClass()}`}
      style={{ backgroundColor }}
    >
      {/* 
        如果背景是纯白，增加一个极淡的渐变，增强质感 
      */}
      {backgroundColor === '#ffffff' && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white pointer-events-none" />
      )}

      {/* 核心内容容器 */}
      <div className="flex flex-col items-center gap-10 max-w-5xl z-10">
        
        {/* 1. 主标题 (金句内容) */}
        <div className="relative">
          <SlideHeadline 
            page={page} 
            maxSize={84} 
            minSize={48} 
            className="!font-medium leading-[1.2] tracking-tight" 
          />
        </div>

        {/* 2. 副标题 (署名或说明) */}
        <SlideSubHeadline 
          page={page} 
          size="1.1rem"
          color="#888888"
          className="font-bold tracking-widest uppercase"
        />
        
      </div>
    </div>
  );
}