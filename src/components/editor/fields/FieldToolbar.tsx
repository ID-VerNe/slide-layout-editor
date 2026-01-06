import React from 'react';
import { CustomFont } from '../../../types';
import { Type } from 'lucide-react';
import { FontSelect } from '../../ui/FontSelect';

interface FieldToolbarProps {
  onIncrease: () => void;
  onDecrease: () => void;
  // 以下字段变为可选，如果不传则不显示字体选择
  customFonts?: CustomFont[];
  currentFont?: string;
  onFontChange?: (v: string) => void;
}

/**
 * FieldToolbar - 智能工具栏
 * 优化版：将 - 和 + 修改为右上角标，提升视觉直觉。
 */
export const FieldToolbar: React.FC<FieldToolbarProps> = ({ 
  onIncrease, 
  onDecrease, 
  customFonts, 
  currentFont, 
  onFontChange 
}) => {
  return (
    <div className="absolute -top-10 right-0 flex items-center gap-1.5 bg-white border border-slate-200 p-1.5 rounded-xl shadow-xl z-20 opacity-0 group-hover/field:opacity-100 transition-all scale-95 group-hover/field:scale-100 pointer-events-auto">
      
      {/* 字体选择器 (可选渲染) */}
      {onFontChange && customFonts && (
        <div className="flex items-center gap-2 pr-2 border-r border-slate-100 mr-1">
          <Type size={12} className="text-slate-400 ml-1" />
          <div className="w-32">
            <FontSelect 
              value={currentFont} 
              onChange={onFontChange} 
              customFonts={customFonts} 
              compact 
            />
          </div>
        </div>
      )}

      {/* 字号调节 (必备) */}
      <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-0.5">
        <button 
          onClick={(e) => { e.preventDefault(); onDecrease(); }}
          className="px-2 py-1 text-[11px] font-black text-slate-400 hover:text-[#264376] hover:bg-white rounded-md transition-all active:scale-90 flex items-center"
          title="Decrease Size"
        >
          A<sup className="text-[8px] ml-0.5 mt-[-2px]">-</sup>
        </button>
        <div className="w-px h-3 bg-slate-200 mx-0.5" />
        <button 
          onClick={(e) => { e.preventDefault(); onIncrease(); }}
          className="px-2 py-1 text-[11px] font-black text-slate-400 hover:text-[#264376] hover:bg-white rounded-md transition-all active:scale-90 flex items-center"
          title="Increase Size"
        >
          A<sup className="text-[8px] ml-0.5 mt-[-2px]">+</sup>
        </button>
      </div>
    </div>
  );
};