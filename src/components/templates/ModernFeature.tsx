import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideLogo } from '../ui/slide/SlideLogo';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { SlideBlockLabel } from '../ui/slide/SlideBlockLabel';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideImageLabel } from '../ui/slide/SlideImageLabel';

/**
 * ModernFeature - 现代简约图文布局
 * 修复版：补全 typography 状态透传。
 */
export default function ModernFeature({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  return (
    <div className="w-full h-full flex items-center px-32 relative overflow-hidden isolate">
      <SlideLogo page={page} className="absolute top-16 left-32" />

      <div className="w-[35%] flex flex-col items-start gap-8 z-10">
        <SlideHeadline page={page} typography={typography} maxSize={84} className="text-slate-900" />
        <SlideSubHeadline page={page} typography={typography} className="max-w-sm" />
        <SlideBlockLabel page={page} typography={typography} />
      </div>

      <div className="flex-1 h-full flex flex-col items-center justify-center pl-12">
        <SlideImage 
          page={page} 
          className="w-full h-[75%] bg-[#EDEDED] rounded-sm shadow-sm" 
        />
        <SlideImageLabel page={page} typography={typography} className="mt-6" />
      </div>
    </div>
  );
}