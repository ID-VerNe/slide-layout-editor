import React from 'react';
import { PageData, CustomFont } from '../../../types';
import { Eye, EyeOff, List, Plus, X } from 'lucide-react';
import { Label } from '../../ui/Base';
import { DebouncedInput } from '../../ui/DebouncedBase';
import { FieldToolbar } from './FieldToolbar';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  customFonts: CustomFont[];
}

export const BulletsField: React.FC<FieldProps> = React.memo(({ page, onUpdate, customFonts }) => {
  const isVisible = (page.visibility as any)?.bullets !== false;
  const bullets = page.bullets || [];

  const toggle = () => {
    onUpdate({
      ...page,
      visibility: { ...(page.visibility || {}), bullets: !isVisible } as any
    });
  };

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
    } as any);
  };

  const handleFontChange = (font: string) => {
    onUpdate({
      ...page,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        bullets: {
          ...(page.styleOverrides?.bullets || {}),
          fontFamily: font
        }
      }
    } as any);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <button 
          onClick={toggle}
          className={`p-1.5 rounded-md transition-all ${isVisible ? 'text-[#264376] bg-[#264376]/10' : 'text-slate-300 bg-slate-50'}`}
        >
          {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <Label icon={List} className="mb-0">List Items</Label>
      </div>

      <div className={`space-y-3 ${!isVisible ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
        {bullets.map((bullet, idx) => (
          <div key={idx} className="relative group/field flex items-center gap-2">
            <FieldToolbar 
              onIncrease={() => updateFontSize(1)} 
              onDecrease={() => updateFontSize(-1)}
              customFonts={customFonts}
              currentFont={(page.styleOverrides as any)?.bullets?.fontFamily}
              onFontChange={handleFontChange}
            />
            <DebouncedInput 
              value={bullet} 
              onChange={(val) => handleBulletChange(idx, val)} 
              placeholder="Item text..."
              className="text-[10px]"
              style={{ fontFamily: (page.styleOverrides as any)?.bullets?.fontFamily }}
            />
            <button onClick={() => removeBullet(idx)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
              <X size={14} />
            </button>
          </div>
        ))}
        <button 
          onClick={addBullet}
          className="w-full py-2 border-2 border-dashed border-slate-100 rounded-xl text-slate-300 hover:text-[#264376] hover:border-[#264376] transition-all flex items-center justify-center gap-2 font-black text-[9px] uppercase tracking-widest"
        >
          <Plus size={12} /> Add Item
        </button>
      </div>
    </div>
  );
}, (prev, next) => {
  return (
    prev.page.layoutId === next.page.layoutId && // 关键修复：确保布局切换时刷新组件
    JSON.stringify(prev.page.bullets) === JSON.stringify(next.page.bullets) &&
    (prev.page.visibility as any)?.bullets === (next.page.visibility as any)?.bullets &&
    (prev.page.styleOverrides as any)?.bullets?.fontSize === (next.page.styleOverrides as any)?.bullets?.fontSize &&
    (prev.page.styleOverrides as any)?.bullets?.fontFamily === (next.page.styleOverrides as any)?.bullets?.fontFamily &&
    prev.customFonts === next.customFonts &&
    prev.onUpdate === next.onUpdate
  );
});