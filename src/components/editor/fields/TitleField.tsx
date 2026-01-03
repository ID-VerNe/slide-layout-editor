import React from 'react';
import { PageData, CustomFont } from '../../../types';
import { Eye, EyeOff } from 'lucide-react';
import { DebouncedTextArea } from '../../ui/DebouncedBase';
import { FieldToolbar } from './FieldToolbar';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  customFonts: CustomFont[];
}

/**
 * TitleField
 * 修复版：移除危险的自定义 memo 比较逻辑，确保组件永远同步最新的页面状态。
 */
export const TitleField: React.FC<FieldProps> = React.memo(({ page, onUpdate, customFonts }) => {
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

  const handleFontChange = (val: string) => {
    onUpdate({ ...page, titleFont: val });
  };

  const updateFontSize = (delta: number) => {
    const currentSize = page.styleOverrides?.title?.fontSize;
    onUpdate({
      ...page,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        title: {
          ...(page.styleOverrides?.title || {}),
          fontSize: Math.max(12, (currentSize || 140) + delta)
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className={`p-1.5 rounded-md transition-all ${isVisible ? 'text-[#264376] bg-[#264376]/10' : 'text-slate-300 bg-slate-50'}`}
          >
            {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <span className="text-[10px] text-slate-400 font-bold uppercase">Headline</span>
        </div>

        {/* 颜色选择器 */}
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
        <FieldToolbar
          onIncrease={() => updateFontSize(4)}
          onDecrease={() => updateFontSize(-4)}
          customFonts={customFonts}
          currentFont={page.titleFont}
          onFontChange={handleFontChange}
        />
        <DebouncedTextArea
          rows={2}
          value={page.title || ''}
          onChange={handleChange}
          placeholder="Title..."
          className={`text-sm font-bold ${!isVisible ? 'opacity-50 grayscale' : ''}`}
          style={{ fontFamily: page.titleFont }}
        />
      </div>
    </div>
  );
});