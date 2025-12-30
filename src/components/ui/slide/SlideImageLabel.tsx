import React from 'react';
import { PageData } from '../../../types';

interface SlideImageLabelProps {
  page: PageData;
  className?: string;
}

export const SlideImageLabel: React.FC<SlideImageLabelProps> = ({ page, className = "" }) => {
  const isVisible = page.visibility?.imageLabel !== false;
  const hasContent = page.imageLabel || page.imageSubLabel;
  if (!isVisible || !hasContent) return null;

  const labelSize = page.styleOverrides?.imageLabel?.fontSize;
  const subLabelSize = page.styleOverrides?.imageSubLabel?.fontSize;

  return (
    <div className={`text-center space-y-1 ${className}`} style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
      {page.imageLabel && (
        <p 
            className="font-black text-slate-900 uppercase tracking-tighter text-xl leading-tight"
            style={{ fontSize: labelSize ? `${labelSize}px` : undefined }}
        >
          {page.imageLabel}
        </p>
      )}
      {page.imageSubLabel && (
        <p 
            className="text-xs font-bold text-slate-400 uppercase tracking-widest"
            style={{ fontSize: subLabelSize ? `${subLabelSize}px` : undefined }}
        >
          {page.imageSubLabel}
        </p>
      )}
    </div>
  );
};
