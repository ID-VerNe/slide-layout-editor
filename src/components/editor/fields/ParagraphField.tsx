import React from 'react';
import { PageData, CustomFont } from '../../../types';
import { AlignLeft, Type } from 'lucide-react';
import { DebouncedTextArea } from '../../ui/DebouncedBase';
import { FieldToolbar } from './FieldToolbar';
import { FieldWrapper } from './FieldWrapper';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  customFonts: CustomFont[];
}

export const ParagraphField: React.FC<FieldProps> = React.memo(({ page, onUpdate, customFonts }) => {
  const handleChange = (val: string) => {
    onUpdate({ ...page, paragraph: val });
  };

  const handleFontChange = (val: string) => {
    onUpdate({
      ...page,
      // 同步到 bodyFont 并设置局部覆盖
      bodyFont: val,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        paragraph: {
          ...(page.styleOverrides?.paragraph || {}),
          fontFamily: val
        }
      }
    });
  };

  const updateFontSize = (delta: number) => {
    const currentSize = page.styleOverrides?.paragraph?.fontSize;
    onUpdate({
      ...page,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        paragraph: {
          ...(page.styleOverrides?.paragraph || {}),
          fontSize: Math.max(8, (currentSize || 12) + delta)
        }
      }
    });
  };

  const updateLineHeight = (delta: number) => {
    const currentLH = page.styleOverrides?.paragraph?.lineHeight || 1.8;
    onUpdate({
      ...page,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        paragraph: {
          ...(page.styleOverrides?.paragraph || {}),
          lineHeight: parseFloat((currentLH + delta).toFixed(1))
        }
      }
    });
  };

  const actions = (
    <div className="flex items-center gap-2">
      <button 
        onClick={() => updateLineHeight(0.1)}
        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-all"
        title="Increase Line Height"
      >
        <AlignLeft size={12} />
      </button>
    </div>
  );

  return (
    <FieldWrapper 
      page={page} 
      onUpdate={onUpdate} 
      fieldKey="paragraph" 
      label="Narrative Essay" 
      icon={Type}
      actions={actions}
    >
      <div className="relative group/field">
        <FieldToolbar 
            onIncrease={() => updateFontSize(1)} 
            onDecrease={() => updateFontSize(-1)} 
            customFonts={customFonts}
            currentFont={page.styleOverrides?.paragraph?.fontFamily || page.bodyFont}
            onFontChange={handleFontChange}
        />
        <DebouncedTextArea 
            value={page.paragraph || ''} 
            onChange={handleChange} 
            placeholder="Start writing your story here..." 
            rows={12}
            className="text-[13px] leading-relaxed bg-slate-50 border-slate-100 min-h-[300px]"
            style={{ 
              fontFamily: page.styleOverrides?.paragraph?.fontFamily || page.bodyFont,
              lineHeight: page.styleOverrides?.paragraph?.lineHeight || 1.8
            }} 
        />
      </div>
    </FieldWrapper>
  );
});