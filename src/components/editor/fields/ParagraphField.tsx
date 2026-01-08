import React from 'react';
import { PageData } from '../../../types';
import { Eye, EyeOff } from 'lucide-react';
import { DebouncedTextArea } from '../../ui/DebouncedBase';
import { FieldToolbar } from './FieldToolbar';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData, silent?: boolean) => void;
}

export const ParagraphField: React.FC<FieldProps> = React.memo(({ page, onUpdate }) => {
  const isVisible = page.visibility?.paragraph !== false;

  const toggle = () => {
    onUpdate({
      ...page,
      visibility: { ...(page.visibility || {}), paragraph: !isVisible }
    });
  };

  const handleChange = (val: string) => {
    onUpdate({ ...page, paragraph: val });
  };

  const handleImmediateChange = (val: string) => {
    onUpdate({ ...page, paragraph: val }, true);
  };

  const updateFontSize = (delta: number) => {
    const currentSize = page.styleOverrides?.paragraph?.fontSize;
    onUpdate({
      ...page,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        paragraph: {
          ...(page.styleOverrides?.paragraph || {}),
          fontSize: Math.max(8, (currentSize || 24) + delta)
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
        <span className="text-[10px] text-slate-400 font-bold uppercase">Body Text</span>
      </div>

      <div className="relative group/field">
        <FieldToolbar
          isFloating
          onIncrease={() => updateFontSize(2)}
          onDecrease={() => updateFontSize(-2)}
        />
        <DebouncedTextArea 
            rows={5} 
            value={page.paragraph || ''} 
            onChange={handleChange} 
            onImmediateChange={handleImmediateChange}
            placeholder="Write something..." 
            className={`text-sm leading-relaxed ${!isVisible ? 'opacity-50 grayscale' : ''}`}
            style={{ fontFamily: page.styleOverrides?.paragraph?.fontFamily || page.bodyFont }} 
        />
      </div>
    </div>
  );
});
