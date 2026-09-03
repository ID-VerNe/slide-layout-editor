import React from 'react';
import { MousePointer2, Maximize2 } from 'lucide-react';

interface DividerStyleSectionProps {
  currentThickness: number | string;
  onThicknessChange: (thickness: number) => void;
  currentLength: string;
  onLengthChange: (length: string) => void;
}

/**
 * DividerStyleSection - 分割线专属粗细与长度配置区
 */
export const DividerStyleSection: React.FC<DividerStyleSectionProps> = ({
  currentThickness,
  onThicknessChange,
  currentLength,
  onLengthChange,
}) => {
  const numericThickness = parseFloat(currentThickness as string) || 1;
  const numericLength = parseFloat(currentLength as string) || 100;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <MousePointer2 size={12} />
          <span>Thickness</span>
        </div>
        <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => onThicknessChange(Math.max(0.5, numericThickness - 0.5))}
            className="w-full py-1 text-xs font-black hover:bg-white rounded transition-all active:scale-90"
          >
            -
          </button>
          <span className="w-full text-center text-[10px] font-black truncate px-1">
            {currentThickness}
          </span>
          <button
            type="button"
            onClick={() => onThicknessChange(numericThickness + 0.5)}
            className="w-full py-1 text-xs font-black hover:bg-white rounded transition-all active:scale-90"
          >
            +
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <Maximize2 size={12} />
          <span>Length</span>
        </div>
        <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => onLengthChange(Math.max(10, numericLength - 10) + '%')}
            className="w-full py-1 text-xs font-black hover:bg-white rounded transition-all active:scale-90"
          >
            -
          </button>
          <span className="w-full text-center text-[10px] font-black">{currentLength}</span>
          <button
            type="button"
            onClick={() => onLengthChange(Math.min(100, numericLength + 10) + '%')}
            className="w-full py-1 text-xs font-black hover:bg-white rounded transition-all active:scale-90"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};
