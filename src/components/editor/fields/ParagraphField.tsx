import React from 'react';
import { PageData } from '../../../types';
import { AlignLeft, Type } from 'lucide-react';
import { DebouncedTextArea } from '../../ui/DebouncedBase';
import { FieldToolbar } from './FieldToolbar';
import { FieldWrapper } from './FieldWrapper';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
}

/**
 * ParagraphField - 段落编辑器
 * 还原版：恢复 Hover 触发机制。
 */
export const ParagraphField: React.FC<FieldProps> = React.memo(({ page, onUpdate }) => {
  const handleChange = (val: string) => {
    onUpdate({ ...page, paragraph: val });
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
        {/* 还原：Hover 时在文本域右上角浮现 */}
        <FieldToolbar 
          onIncrease={() => updateFontSize(1)} 
          onDecrease={() => updateFontSize(-1)}
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
