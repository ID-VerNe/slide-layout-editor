import React from 'react';
import { PageData } from '../../../types';
import { Eye, EyeOff } from 'lucide-react';
import { DebouncedInput } from '../../ui/DebouncedBase';
import { FieldToolbar } from './FieldToolbar';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
}

export const ActionTextField: React.FC<FieldProps> = React.memo(({ page, onUpdate }) => {
  const isVisible = page.visibility?.actionText !== false;

  const toggle = () => {
    onUpdate({
      ...page,
      visibility: { ...(page.visibility || {}), actionText: !isVisible }
    });
  };

  const handleChange = (val: string) => {
    onUpdate({ ...page, actionText: val });
  };

  const updateFontSize = (delta: number) => {
    const currentSize = page.styleOverrides?.actionText?.fontSize;
    onUpdate({
      ...page,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        actionText: {
          ...(page.styleOverrides?.actionText || {}),
          fontSize: Math.max(8, (currentSize || 13) + delta)
        }
      }
    });
  };

  return (
    <div className="space-y-2 group relative">
      <div className="flex items-center gap-2 mb-1">
        <button 
          onClick={toggle}
          className={`p-1.5 rounded-md transition-all ${isVisible ? 'text-[#264376] bg-[#264376]/10' : 'text-slate-300 bg-slate-50'}`}
        >
          {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <span className="text-[10px] text-slate-400 font-bold uppercase">Block Label</span>
      </div>
      
      <div className="relative">
        <FieldToolbar 
            onIncrease={() => updateFontSize(1)} 
            onDecrease={() => updateFontSize(-1)} 
        />
        <DebouncedInput 
            value={page.actionText || ''} 
            onChange={handleChange} 
            placeholder="Label text..." 
            className={!isVisible ? 'opacity-50 grayscale' : ''} 
        />
      </div>
    </div>
  );
}, (prev, next) => {
  return (
    prev.page.actionText === next.page.actionText &&
    prev.page.visibility?.actionText === next.page.visibility?.actionText &&
    prev.page.styleOverrides?.actionText?.fontSize === next.page.styleOverrides?.actionText?.fontSize &&
    prev.onUpdate === next.onUpdate
  );
});
