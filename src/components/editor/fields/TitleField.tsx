import React from 'react';
import { PageData } from '../../../types';
import { Eye, EyeOff } from 'lucide-react';
import { DebouncedTextArea } from '../../ui/DebouncedBase';
import { FieldToolbar } from './FieldToolbar';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  customFonts?: any; 
}

/**
 * TitleField - 优化版
 * 1. 恢复字号调节工具栏。
 * 2. 彻底移除局部字体选择。
 */
export const TitleField: React.FC<FieldProps> = React.memo(({ page, onUpdate }) => {
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

  // 仅保留字号和颜色调节
  const updateFontSize = (delta: number) => {
    const currentSize = page.styleOverrides?.title?.fontSize;
    onUpdate({
      ...page,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        title: {
          ...(page.styleOverrides?.title || {}),
          fontSize: Math.max(12, (currentSize || 120) + delta)
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
    <div className="space-y-2 relative">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className={`p-1.5 rounded-md transition-all ${isVisible ? 'text-[#264376] bg-[#264376]/10' : 'text-slate-300 bg-slate-50'}`}
          >
            {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Headline</span>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
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
        {/* 核心修复：恢复工具栏（仅传控制函数，不传 customFonts 从而隐藏字体选择器） */}
        <FieldToolbar 
          onIncrease={() => updateFontSize(4)} 
          onDecrease={() => updateFontSize(-4)} 
        />
        <DebouncedTextArea 
            rows={2} 
            value={page.title || ''} 
            onChange={handleChange} 
            placeholder="Title..." 
            className={`text-sm font-bold bg-white/50 border-slate-100 hover:border-slate-200 focus:border-[#264376] ${!isVisible ? 'opacity-50 grayscale' : ''}`} 
        />
      </div>
    </div>
  );
});
