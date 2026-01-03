import React from 'react';
import { PageData, CustomFont } from '../../../types';
import { Layout, AlignLeft, AlignRight, Layers, ArrowUp, ArrowDown, Wind } from 'lucide-react';
import { FieldWrapper } from './FieldWrapper';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  customFonts?: CustomFont[];
}

/**
 * VariantField
 * 修复版：移除所有危险的自定义 memo 比较逻辑。
 * 确保在切换视觉方案(Visual Scheme)时，不会因为持有旧的 page 引用而覆盖掉刚才改好的文字或背景。
 */
export const VariantField: React.FC<FieldProps> = React.memo(({ page, onUpdate }) => {
  const current = page.layoutVariant;
  const isCapsule = page.layoutId === 'gallery-capsule';

  const setVariant = (val: string) => {
    onUpdate({ ...page, layoutVariant: val });
  };

  // 针对胶囊马赛克模板提供三种视觉方案切换
  if (isCapsule) {
    const safeCurrent = current || 'under';
    return (
      <FieldWrapper page={page} onUpdate={onUpdate} fieldKey="variant" label="Visual Scheme" icon={Layers}>
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setVariant('under')}
            className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl transition-all font-bold text-[8px] uppercase tracking-tighter
              ${safeCurrent === 'under' ? 'bg-white text-[#264376] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <ArrowDown size={14} /> Text Behind
          </button>
          <button
            onClick={() => setVariant('over')}
            className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl transition-all font-bold text-[8px] uppercase tracking-tighter
              ${safeCurrent === 'over' ? 'bg-white text-[#264376] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <ArrowUp size={14} /> Text Front
          </button>
          <button
            onClick={() => setVariant('minimal')}
            className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl transition-all font-bold text-[8px] uppercase tracking-tighter
              ${safeCurrent === 'minimal' ? 'bg-white text-[#264376] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Wind size={14} /> Minimal
          </button>
        </div>
      </FieldWrapper>
    );
  }

  // 默认的左右对齐模式
  const safeCurrent = current === 'left' ? 'left' : 'right';
  return (
    <FieldWrapper page={page} onUpdate={onUpdate} fieldKey="variant" label="Layout Orientation" icon={Layout}>
      <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-2xl">
        <button
          onClick={() => setVariant('right')}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest
            ${safeCurrent === 'right' ? 'bg-white text-[#264376] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <AlignRight size={16} /> Image Right
        </button>
        <button
          onClick={() => setVariant('left')}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest
            ${safeCurrent === 'left' ? 'bg-white text-[#264376] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <AlignLeft size={16} /> Image Left
        </button>
      </div>
    </FieldWrapper>
  );
});
