import React from 'react';

interface FieldToolbarProps {
  onIncrease: () => void;
  onDecrease: () => void;
  // 恢复为默认悬浮模式
  isFloating?: boolean; 
}

/**
 * FieldToolbar - 极简悬浮字号调节器
 * 还原版：恢复 absolute 定位与 hover 触发逻辑，保持 UI 极简美学。
 */
export const FieldToolbar: React.FC<FieldToolbarProps> = ({ 
  onIncrease, 
  onDecrease, 
  isFloating = true 
}) => {
  const containerClass = isFloating 
    ? "absolute -top-9 right-0 flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-lg shadow-xl z-40 opacity-0 group-hover/field:opacity-100 transition-all scale-95 group-hover/field:scale-100 pointer-events-auto"
    : "flex items-center transition-all";

  return (
    <div className={containerClass}>
      <div className="flex items-center gap-0.5 bg-slate-50 rounded-md p-0.5 border border-slate-100">
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDecrease(); }}
          className="px-1.5 py-0.5 text-[10px] font-black text-slate-400 hover:text-[#264376] hover:bg-white rounded transition-all active:scale-90 flex items-center"
          title="Decrease Size"
        >
          A<sup className="text-[7px] ml-0.5">-</sup>
        </button>
        <div className="w-px h-2.5 bg-slate-200 mx-0.5" />
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onIncrease(); }}
          className="px-1.5 py-0.5 text-[10px] font-black text-slate-400 hover:text-[#264376] hover:bg-white rounded transition-all active:scale-90 flex items-center"
          title="Increase Size"
        >
          A<sup className="text-[7px] ml-0.5">+</sup>
        </button>
      </div>
    </div>
  );
};
