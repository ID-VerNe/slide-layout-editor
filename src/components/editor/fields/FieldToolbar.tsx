import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { CustomFont } from '../../../types';
import { FontSelect } from '../../ui/FontSelect';

interface FieldToolbarProps {
  onIncrease: () => void;
  onDecrease: () => void;
  // 字体相关
  customFonts?: CustomFont[];
  currentFont?: string;
  onFontChange?: (font: string) => void;
}

/**
 * FieldToolbar 组件
 * 核心修复：使用 group-focus-within/field 命名组，防止在列表组件中多个工具栏同时显示的问题。
 */
export const FieldToolbar: React.FC<FieldToolbarProps> = ({ 
  onIncrease, 
  onDecrease,
  customFonts,
  currentFont,
  onFontChange
}) => {
  return (
    <div className="absolute -top-10 right-0 flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl px-2 py-1 z-30 opacity-0 group-focus-within/field:opacity-100 transition-all scale-90 group-focus-within/field:scale-100 pointer-events-none group-focus-within/field:pointer-events-auto origin-bottom-right">
      
      {/* 字体选择器整合 */}
      {onFontChange && (
        <>
          <div className="min-w-[100px] max-w-[140px]">
            <FontSelect 
              customFonts={customFonts || []} 
              value={currentFont} 
              onChange={onFontChange} 
              compact={true}
            />
          </div>
          <div className="w-px h-4 bg-slate-100 mx-1" />
        </>
      )}

      {/* 字号调整 */}
      <div className="flex items-center gap-0.5">
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDecrease(); }}
          className="p-1.5 hover:bg-[#264376]/10 rounded-lg text-[#264376] transition-colors flex items-center gap-0.5"
          title="Decrease Size"
        >
          <span className="text-[10px] font-black tracking-tighter">A</span>
          <Minus size={10} strokeWidth={3} />
        </button>
        
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onIncrease(); }}
          className="p-1.5 hover:bg-[#264376]/10 rounded-lg text-[#264376] transition-colors flex items-center gap-0.5"
          title="Increase Size"
        >
          <span className="text-[10px] font-black tracking-tighter">A</span>
          <Plus size={10} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};