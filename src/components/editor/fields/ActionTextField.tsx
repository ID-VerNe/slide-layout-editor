import React, { useState } from 'react';
import { PageData } from '../../../types';
import { Eye, EyeOff, Type } from 'lucide-react';
import { DebouncedInput } from '../../ui/DebouncedBase';
import { FieldToolbar } from './FieldToolbar';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData, silent?: boolean) => void;
}

export const ActionTextField: React.FC<FieldProps> = React.memo(({ page, onUpdate }) => {
  const [isFocused, setIsFocused] = useState(false);
  const isVisible = page.visibility?.actionText !== false;

  const toggle = () => {
    onUpdate({
      ...page,
      visibility: {
        ...(page.visibility || {}),
        actionText: !isVisible
      }
    });
  };

  const handleChange = (val: string) => {
    onUpdate({ ...page, actionText: val });
  };

  const handleImmediateChange = (val: string) => {
    onUpdate({ ...page, actionText: val }, true);
  };

  const updateFontSize = (delta: number) => {
    const currentSize = page.styleOverrides?.actionText?.fontSize;
    onUpdate({
      ...page,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        actionText: {
          ...(page.styleOverrides?.actionText || {}),
          fontSize: Math.max(8, (currentSize || 12) + delta)
        }
      }
    });
  };

  const handleColorChange = (color: string) => {
    onUpdate({
      ...page,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        actionText: {
          ...(page.styleOverrides?.actionText || {}),
          color: color
        }
      }
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className={`p-1.5 rounded-md transition-all ${isVisible ? 'text-[#264376] bg-[#264376]/10' : 'text-slate-300 bg-slate-50'}`}
          >
            {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Action Text</span>
        </div>

        {/* 颜色选择器 */}
        <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 relative z-50">
          <div className="w-4 h-4 rounded-full border border-slate-200 relative overflow-hidden shadow-sm">
            <input
              type="color"
              className="absolute -top-1 -left-1 w-6 h-6 cursor-pointer p-0 border-0"
              value={page.styleOverrides?.actionText?.color || '#264376'}
              onChange={(e) => handleColorChange(e.target.value)}
            />
          </div>
          <span className="text-[9px] font-mono text-slate-400 uppercase">
            {page.styleOverrides?.actionText?.color || '#264376'}
          </span>
        </div>
      </div>

      <div className="relative group/field">
        <div 
          className={`absolute top-2 right-2 z-40 transition-all duration-200 transform
            ${isFocused ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95 pointer-events-none'}`}
        >
          <FieldToolbar
            isFloating={false}
            onIncrease={() => updateFontSize(1)}
            onDecrease={() => updateFontSize(-1)}
          />
        </div>
        
        <DebouncedInput 
          value={page.actionText || ''} 
          onChange={handleChange} 
          onImmediateChange={handleImmediateChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Action button text..." 
          className={!isVisible ? 'opacity-50 grayscale' : ''} 
        />
      </div>
    </div>
  );
});