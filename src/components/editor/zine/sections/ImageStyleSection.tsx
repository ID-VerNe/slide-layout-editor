import React from 'react';
import { MousePointer2 } from 'lucide-react';

interface ImageStyleSectionProps {
  currentRounded: string;
  onRoundedChange: (rounding: string) => void;
}

/**
 * ImageStyleSection - 图片专属圆角与边框配置区
 */
export const ImageStyleSection: React.FC<ImageStyleSectionProps> = ({
  currentRounded,
  onRoundedChange,
}) => {
  const numericRadius = parseFloat(currentRounded) || 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <MousePointer2 size={12} />
        <span>Rounding</span>
      </div>
      <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => onRoundedChange(Math.max(0, numericRadius - 4) + 'px')}
          className="w-full py-1 text-xs font-black hover:bg-white rounded transition-all active:scale-90"
        >
          -
        </button>
        <span className="w-full text-center text-[10px] font-black truncate px-1">
          {currentRounded}
        </span>
        <button
          type="button"
          onClick={() => onRoundedChange((numericRadius + 4) + 'px')}
          className="w-full py-1 text-xs font-black hover:bg-white rounded transition-all active:scale-90"
        >
          +
        </button>
      </div>
    </div>
  );
};
