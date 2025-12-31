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
          fontSize: Math.max(12, (currentSize || 64) + delta)
        }
      }
    });
  };

  return (
    <div className="space-y-2 relative">
      <div className="flex items-center gap-2">
        <button 
          onClick={toggle}
          className={`p-1.5 rounded-md transition-all ${isVisible ? 'text-[#264376] bg-[#264376]/10' : 'text-slate-300 bg-slate-50'}`}
        >
          {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <span className="text-[10px] text-slate-400 font-bold uppercase">Headline</span>
      </div>
      
      {/* 使用 group/field 命名组隔离 */}
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
            value={page.title} 
            onChange={handleChange} 
            placeholder="Title..." 
            className={`text-sm font-bold ${!isVisible ? 'opacity-50 grayscale' : ''}`} 
            style={{ fontFamily: page.titleFont }} 
        />
      </div>
    </div>
  );
}, (prev, next) => {
  return (
    prev.page.layoutId === next.page.layoutId && // 关键修复：确保布局切换时刷新组件
    prev.page.title === next.page.title &&
    prev.page.titleFont === next.page.titleFont &&
    prev.page.visibility?.title === next.page.visibility?.title &&
    prev.page.styleOverrides?.title?.fontSize === next.page.styleOverrides?.title?.fontSize &&
    prev.customFonts === next.customFonts &&
    prev.onUpdate === next.onUpdate
  );
});
