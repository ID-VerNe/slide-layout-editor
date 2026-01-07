import React from 'react';
import { PageData } from '../../../types';
import { List, Plus, X } from 'lucide-react';
import { DebouncedInput } from '../../ui/DebouncedBase';
import { FieldToolbar } from './FieldToolbar';
import { FieldWrapper } from './FieldWrapper';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
}

/**
 * BulletsField - 列表项编辑器
 * 还原美学版：恢复单项 hover 浮现调节按钮，解决重叠遮挡。
 */
export const BulletsField: React.FC<FieldProps> = React.memo(({ page, onUpdate }) => {
  const bullets = page.bullets || [];

  const handleBulletChange = (idx: number, val: string) => {
    const next = [...bullets];
    next[idx] = val;
    onUpdate({ ...page, bullets: next });
  };

  const addBullet = () => {
    onUpdate({ ...page, bullets: [...bullets, 'New Item'] });
  };

  const removeBullet = (idx: number) => {
    onUpdate({ ...page, bullets: bullets.filter((_, i) => i !== idx) });
  };

  const updateFontSize = (delta: number) => {
    const currentSize = page.styleOverrides?.bullets?.fontSize;
    onUpdate({
      ...page,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        bullets: {
          ...(page.styleOverrides?.bullets || {}),
          fontSize: Math.max(8, (currentSize || 10) + delta)
        }
      }
    });
  };

  return (
    <FieldWrapper 
      page={page} 
      onUpdate={onUpdate} 
      fieldKey="bullets" 
      label="List Items" 
      icon={List}
    >
      <div className="space-y-2 mt-1">
        {bullets.map((bullet, idx) => (
          <div key={idx} className="relative group/field flex items-center gap-2">
            {/* 核心回归：只有鼠标移入这个 Item，才会在它的右上角浮现调节按钮 */}
            <FieldToolbar 
              onIncrease={() => updateFontSize(1)} 
              onDecrease={() => updateFontSize(-1)}
            />
            <DebouncedInput 
              value={bullet} 
              onChange={(val) => handleBulletChange(idx, val)} 
              placeholder="Item text..."
              className="text-[10px] bg-slate-50 border-transparent hover:border-slate-200 focus:bg-white"
              style={{ fontFamily: page.styleOverrides?.bullets?.fontFamily || page.bodyFont }}
            />
            <button 
              onClick={() => removeBullet(idx)} 
              className="p-2 text-slate-300 hover:text-red-500 transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button 
          onClick={addBullet}
          className="w-full py-2 mt-2 border-2 border-dashed border-slate-100 rounded-xl text-slate-300 hover:text-[#264376] hover:border-[#264376] transition-all flex items-center justify-center gap-2 font-black text-[9px] uppercase tracking-widest active:scale-95"
        >
          <Plus size={12} /> Add Item
        </button>
      </div>
    </FieldWrapper>
  );
});