import React, { useState } from 'react';
import { PageData } from '../../../types';
import { Eye, EyeOff } from 'lucide-react';
import { DebouncedTextArea } from '../../ui/DebouncedBase';
import { FieldToolbar } from './FieldToolbar';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData, silent?: boolean) => void;
  label?: string; 
}

export const TitleField: React.FC<FieldProps> = React.memo(({ page, onUpdate, label }) => {
  const [isFocused, setIsFocused] = useState(false);
  const isVisible = page.visibility?.title !== false;

  const toggle = () => {
    onUpdate({
      ...page,
      visibility: { ...(page.visibility || {}), title: !isVisible }
    });
  };

  const handleChange = (val: string) => {
    onUpdate({ ...page, title: val });
  };

  const handleImmediateChange = (val: string) => {
    onUpdate({ ...page, title: val }, true);
  };

  const updateFontSize = (delta: number) => {
    const currentSize = page.styleOverrides?.title?.fontSize;
    onUpdate({
      ...page,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        title: {
          ...(page.styleOverrides?.title || {}),
          fontSize: Math.max(12, (currentSize || 84) + delta)
        }
      }
    });
  };

  const handleColorChange = (color: string) => {
    onUpdate({
      ...page,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        title: {
          ...(page.styleOverrides?.title || {}),
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
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{label || 'Headline'}</span>
        </div>

        {/* 颜色选择器：确保 z-index 高于一切 */}
        <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 relative z-50">
          <div className="w-4 h-4 rounded-full border border-slate-200 relative overflow-hidden shadow-sm">
            <input
              type="color"
              className="absolute -top-1 -left-1 w-6 h-6 cursor-pointer p-0 border-0"
              value={page.styleOverrides?.title?.color || '#0F172A'}
              onChange={(e) => handleColorChange(e.target.value)}
            />
          </div>
          <span className="text-[9px] font-mono text-slate-400 uppercase">
            {page.styleOverrides?.title?.color || '#0F172A'}
          </span>
        </div>
      </div>

      <div className="relative group/field">
        {/* 核心修复：工具栏移入相对容器，并向下偏移 */}
        <div 
          className={`absolute top-2 right-2 z-40 transition-all duration-200 transform
            ${isFocused ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95 pointer-events-none'}`}
        >
          <FieldToolbar
            isFloating={false} // 使用手动定位
            onIncrease={() => updateFontSize(4)}
            onDecrease={() => updateFontSize(-4)}
          />
        </div>
        
        <DebouncedTextArea 
            rows={2} 
            value={page.title || ''} 
            onChange={handleChange} 
            onImmediateChange={handleImmediateChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Name..." 
            className={`text-sm font-bold ${!isVisible ? 'opacity-50 grayscale' : ''}`} 
            style={{ fontFamily: page.styleOverrides?.title?.fontFamily || page.titleFont }} 
        />
      </div>
    </div>
  );
});
