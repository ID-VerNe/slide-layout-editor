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
 * SubtitleField
 * 升级版：将 Input 替换为 TextArea，支持通过回车进行手动换行。
 */
export const SubtitleField: React.FC<FieldProps> = React.memo(({ page, onUpdate, customFonts }) => {
  const isVisible = page.visibility?.subtitle !== false;

  const toggle = () => {
    onUpdate({
      ...page,
      visibility: { ...(page.visibility || {}), subtitle: !isVisible }
    });
  };

  const handleChange = (val: string) => {
    onUpdate({ ...page, subtitle: val });
  };

  const handleFontChange = (val: string) => {
    onUpdate({ ...page, bodyFont: val });
  };

  const updateFontSize = (delta: number) => {
    const currentSize = page.styleOverrides?.subtitle?.fontSize;
    onUpdate({
      ...page,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        subtitle: {
          ...(page.styleOverrides?.subtitle || {}),
          fontSize: Math.max(8, (currentSize || 28) + delta)
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
        <span className="text-[10px] text-slate-400 font-bold uppercase">Sub-description</span>
      </div>
      
      <div className="relative group/field">
        <FieldToolbar 
            onIncrease={() => updateFontSize(2)} 
            onDecrease={() => updateFontSize(-2)} 
            customFonts={customFonts}
            currentFont={page.bodyFont}
            onFontChange={handleFontChange}
        />
        {/* 核心改动：使用 TextArea 支持多行输入 */}
        <DebouncedTextArea 
            value={page.subtitle || ''} 
            onChange={handleChange} 
            placeholder="Subtitle..." 
            rows={3}
            className={`text-xs ${!isVisible ? 'opacity-50 grayscale' : ''}`} 
            style={{ fontFamily: page.bodyFont }} 
        />
      </div>
    </div>
  );
});
