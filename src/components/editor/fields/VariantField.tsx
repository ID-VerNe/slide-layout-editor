import React from 'react';
import { PageData, CustomFont } from '../../../types';
import { Layout, AlignLeft, AlignRight, Layers, ArrowUp, ArrowDown, Wind, Columns, Rows } from 'lucide-react';
import { FieldWrapper } from './FieldWrapper';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  customFonts?: CustomFont[];
}

/**
 * VariantField
 * 增强版：为 Film Diptych 提供横向/纵向切换图标。
 */
export const VariantField: React.FC<FieldProps> = React.memo(({ page, onUpdate }) => {
  const current = page.layoutVariant;
  const isCapsule = page.layoutId === 'gallery-capsule';
  const isDiptych = page.layoutId === 'film-diptych';

  const setVariant = (val: string) => {
    onUpdate({ ...page, layoutVariant: val });
  };

  // 1. 胶囊马赛克专用
  if (isCapsule) {
    const safeCurrent = current || 'under';
    return (
      <FieldWrapper page={page} onUpdate={onUpdate} fieldKey="variant" label="Visual Scheme" icon={Layers}>
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl">
          <button onClick={() => setVariant('under')} className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl transition-all font-bold text-[8px] uppercase tracking-tighter ${safeCurrent === 'under' ? 'bg-white text-[#264376] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><ArrowDown size={14} /> Text Behind</button>
          <button onClick={() => setVariant('over')} className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl transition-all font-bold text-[8px] uppercase tracking-tighter ${safeCurrent === 'over' ? 'bg-white text-[#264376] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><ArrowUp size={14} /> Text Front</button>
          <button onClick={() => setVariant('minimal')} className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl transition-all font-bold text-[8px] uppercase tracking-tighter ${safeCurrent === 'minimal' ? 'bg-white text-[#264376] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><Wind size={14} /> Minimal</button>
        </div>
      </FieldWrapper>
    );
  }

  // 2. 双联画专用：横向并排 vs 纵向堆叠
  if (isDiptych) {
    const safeCurrent = current || 'horizontal';
    return (
      <FieldWrapper page={page} onUpdate={onUpdate} fieldKey="variant" label="Split Direction" icon={Layout}>
        <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-2xl">
          <button onClick={() => setVariant('horizontal')} className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest ${safeCurrent === 'horizontal' ? 'bg-white text-[#264376] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
            <Columns size={16} /> Horizontal
          </button>
          <button onClick={() => setVariant('vertical')} className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest ${safeCurrent === 'vertical' ? 'bg-white text-[#264376] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
            <Rows size={16} /> Vertical
          </button>
        </div>
      </FieldWrapper>
    );
  }

  // 3. 默认的左右对齐模式
  const safeCurrent = current === 'right' ? 'right' : 'left';
  return (
    <FieldWrapper page={page} onUpdate={onUpdate} fieldKey="variant" label="Layout Orientation" icon={Layout}>
      <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-2xl">
        <button onClick={() => setVariant('left')} className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest ${safeCurrent === 'left' ? 'bg-white text-[#264376] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><AlignLeft size={16} /> Image Left</button>
        <button onClick={() => setVariant('right')} className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest ${safeCurrent === 'right' ? 'bg-white text-[#264376] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><AlignRight size={16} /> Image Right</button>
      </div>
    </FieldWrapper>
  );
});
