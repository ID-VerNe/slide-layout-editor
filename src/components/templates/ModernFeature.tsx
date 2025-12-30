import React from 'react';
import { PageData } from '../../types';
import { SlideLogo } from '../ui/slide/SlideLogo';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { SlideBlockLabel } from '../ui/slide/SlideBlockLabel';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideImageLabel } from '../ui/slide/SlideImageLabel';

export default function ModernFeature({ page }: { page: PageData }) {
  return (
    <div className="w-full h-full flex items-center px-32 relative overflow-hidden">
      <SlideLogo page={page} className="absolute top-16 left-32" />

      <div className="w-[35%] flex flex-col items-start gap-8 z-10">
        <SlideHeadline page={page} maxSize={84} className="text-slate-900" />
        <SlideSubHeadline page={page} className="max-w-sm" />
        <SlideBlockLabel page={page} />
      </div>

      <div className="flex-1 h-full flex flex-col items-center justify-center pl-12">
        <SlideImage 
          page={page} 
          className="w-full h-[75%] bg-[#EDEDED] rounded-sm shadow-sm" 
        />
        <SlideImageLabel page={page} className="mt-6" />
      </div>
    </div>
  );
}
