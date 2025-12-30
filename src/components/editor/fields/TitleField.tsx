import React from 'react';
import { PageData, CustomFont } from '../../../types';
import { Eye, EyeOff } from 'lucide-react';
import { TextArea } from '../../ui/Base';
import { FieldToolbar } from './FieldToolbar';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  customFonts: CustomFont[];
}

export const TitleField: React.FC<FieldProps> = ({ page, onUpdate, customFonts }) => {
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
        <TextArea 
            rows={2} 
            value={page.title} 
            onChange={(e) => handleChange(e.target.value)} 
            placeholder="Title..." 
            className={`text-sm font-bold ${!isVisible ? 'opacity-50 grayscale' : ''}`} 
            style={{ fontFamily: page.titleFont }} 
        />
      </div>
    </div>
  );
};