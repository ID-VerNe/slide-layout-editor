import React from 'react';
import { PageData } from '../../../types';
import { Layout, AlignLeft, AlignRight, Layers, ArrowUp, ArrowDown, Wind, Columns, Rows } from 'lucide-react';
import { FieldWrapper } from './FieldWrapper';

interface VariantOption {
  value: string;
  label: string;
}

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  label?: string;
  options?: VariantOption[]; // 支持 Schema 传入选项
}

/**
 * VariantField - 动态布局切换器
 * 核心升级：优先支持从 Schema 传入的自定义 options。
 */
export const VariantField: React.FC<FieldProps> = React.memo(({ page, onUpdate, label, options }) => {
  const current = page.layoutVariant;

  const setVariant = (val: string) => {
    onUpdate({ ...page, layoutVariant: val });
  };

  // --- A. 如果 Schema 传入了 options，执行动态渲染 ---
  if (options && options.length > 0) {
    const safeCurrent = current || options[0].value;
    return (
      <FieldWrapper page={page} onUpdate={onUpdate} fieldKey="variant" label={label || "Layout Orientation"} icon={Layout}>
        <div className={`grid gap-2 p-1 bg-slate-100 rounded-2xl`} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
          {options.map((opt) => (
            <button 
              key={opt.value}
              onClick={() => setVariant(opt.value)} 
              className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-black text-[9px] uppercase tracking-widest
                ${safeCurrent === opt.value ? 'bg-white text-[#264376] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FieldWrapper>
    );
  }

  // --- B. 否则：回退到旧有的硬编码逻辑 (为了保持对老项目的兼容) ---
  const isCapsule = page.layoutId === 'gallery-capsule';
  const isDiptych = page.layoutId === 'film-diptych';

  if (isCapsule) {
    const safeCurrent = current || 'under';
    return (
      <FieldWrapper page={page} onUpdate={onUpdate} fieldKey="variant" label="Visual Scheme" icon={Layers}>
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl">
          <button onClick={() => setVariant('under')} className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl transition-all font-bold text-[8px] uppercase tracking-tighter ${safeCurrent === 'under' ? 'bg-white text-[#264376] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><ArrowDown size={14} /> Under</button>
          <button onClick={() => setVariant('over')} className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl transition-all font-bold text-[8px] uppercase tracking-tighter ${safeCurrent === 'over' ? 'bg-white text-[#264376] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><ArrowUp size={14} /> Over</button>
          <button onClick={() => setVariant('minimal')} className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl transition-all font-bold text-[8px] uppercase tracking-tighter ${safeCurrent === 'minimal' ? 'bg-white text-[#264376] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><Wind size={14} /> Minimal</button>
        </div>
      </FieldWrapper>
    );
  }

  if (isDiptych) {
    const safeCurrent = current || 'horizontal';
    return (
      <FieldWrapper page={page} onUpdate={onUpdate} fieldKey="variant" label="Split Direction" icon={Layout}>
        <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-2xl">
          <button onClick={() => setVariant('horizontal')} className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest ${safeCurrent === 'horizontal' ? 'bg-white text-[#264376] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><Columns size={16} /> Horizontal</button>
          <button onClick={() => setVariant('vertical')} className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest ${safeCurrent === 'vertical' ? 'bg-white text-[#264376] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><Rows size={16} /> Vertical</button>
        </div>
      </FieldWrapper>
    );
  }

  const safeCurrent = current === 'right' ? 'right' : 'left';
  return (
    <FieldWrapper page={page} onUpdate={onUpdate} fieldKey="variant" label={label || "Layout Orientation"} icon={Layout}>
      <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-2xl">
        <button onClick={() => setVariant('left')} className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest ${safeCurrent === 'left' ? 'bg-white text-[#264376] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><AlignLeft size={16} /> Image Left</button>
        <button onClick={() => setVariant('right')} className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest ${safeCurrent === 'right' ? 'bg-white text-[#264376] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><AlignRight size={16} /> Image Right</button>
      </div>
    </FieldWrapper>
  );
});