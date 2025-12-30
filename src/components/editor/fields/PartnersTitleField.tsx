import React from 'react';
import { PageData } from '../../../types';
import { Eye, EyeOff, Type } from 'lucide-react';
import { Label, Input } from '../../ui/Base';
import { FieldToolbar } from './FieldToolbar';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
}

export const PartnersTitleField: React.FC<FieldProps> = ({ page, onUpdate }) => {
  const isVisible = page.visibility?.partnersTitle !== false;

  const toggle = () => {
    onUpdate({
      ...page,
      visibility: { ...(page.visibility || {}), partnersTitle: !isVisible }
    });
  };

  const handleChange = (val: string) => {
    onUpdate({ ...page, partnersTitle: val });
  };

  const updateFontSize = (delta: number) => {
    const currentSize = page.styleOverrides?.partnersTitle?.fontSize;
    onUpdate({
      ...page,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        partnersTitle: {
          ...(page.styleOverrides?.partnersTitle || {}),
          fontSize: Math.max(8, (currentSize || 10) + delta)
        }
      }
    });
  };

  return (
    <div className="space-y-4 group relative">
      <div className="flex items-center gap-2 mb-1">
        <button 
          onClick={toggle}
          className={`p-1.5 rounded-md transition-all ${isVisible ? 'text-[#264376] bg-[#264376]/10' : 'text-slate-300 bg-slate-50'}`}
        >
          {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <Label icon={Type} className="mb-0">Partner Section Heading</Label>
      </div>
      
      <div className={`relative ${!isVisible ? 'opacity-50 grayscale' : ''}`}>
        <FieldToolbar 
            onIncrease={() => updateFontSize(1)} 
            onDecrease={() => updateFontSize(-1)} 
        />
        <Input 
          placeholder="e.g. Used by leading companies" 
          value={page.partnersTitle || ''} 
          onChange={(e) => handleChange(e.target.value)} 
          className="text-xs font-bold"
        />
      </div>
    </div>
  );
};
