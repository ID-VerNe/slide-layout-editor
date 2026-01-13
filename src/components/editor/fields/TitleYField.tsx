import React from 'react';
import { PageData } from '../../../types';
import { MoveVertical, RotateCcw } from 'lucide-react';
import { Slider } from '../../ui/Base';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  label?: string;
}

/**
 * TitleYField - 控制标题垂直位置的偏移量
 * 作用于 styleOverrides.title.translateY
 */
export const TitleYField: React.FC<FieldProps> = ({ page, onUpdate, label }) => {
  const currentY = page.styleOverrides?.title?.translateY || 0;

  const handleChange = (val: number) => {
    onUpdate({
      ...page,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        title: {
          ...(page.styleOverrides?.title || {}),
          translateY: val
        }
      }
    });
  };

  const reset = () => handleChange(0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MoveVertical size={14} className="text-slate-400" />
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{label || 'Vertical Position'}</span>
        </div>
        <button onClick={reset} className="text-[9px] font-black text-slate-300 hover:text-[#264376] flex items-center gap-1 uppercase transition-colors">
          <RotateCcw size={10} /> Reset
        </button>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
        <Slider 
          value={currentY} 
          min={-500} 
          max={500} 
          step={1} 
          onChange={handleChange} 
          unit="px"
        />
        <div className="flex justify-between mt-2 px-1">
          <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">Higher</span>
          <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">Lower</span>
        </div>
      </div>
    </div>
  );
};
