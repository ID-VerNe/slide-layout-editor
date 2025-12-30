import React from 'react';
import { PageData } from '../../../types';
import { Eye, EyeOff, Tag } from 'lucide-react';
import { Label, Input } from '../../ui/Base';
import { FieldToolbar } from './FieldToolbar';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
}

export const ImageLabelField: React.FC<FieldProps> = ({ page, onUpdate }) => {
  const isVisible = page.visibility?.imageLabel !== false;

  const toggle = () => {
    onUpdate({
      ...page,
      visibility: { ...(page.visibility || {}), imageLabel: !isVisible }
    });
  };

  const handleChange = (field: keyof PageData, value: string) => {
    onUpdate({ ...page, [field]: value });
  };

  const updateFontSize = (field: 'imageLabel' | 'imageSubLabel', delta: number) => {
    const defaultSize = field === 'imageLabel' ? 14 : 10;
    const currentSize = page.styleOverrides?.[field]?.fontSize;
    onUpdate({
      ...page,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        [field]: {
          ...(page.styleOverrides?.[field] || {}),
          fontSize: Math.max(8, (currentSize || defaultSize) + delta)
        }
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <button 
          onClick={toggle}
          className={`p-1.5 rounded-md transition-all ${isVisible ? 'text-[#264376] bg-[#264376]/10' : 'text-slate-300 bg-slate-50'}`}
        >
          {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <Label icon={Tag} className="mb-0">Image Label & Sub-label</Label>
      </div>
      
      <div className={`space-y-3 ${!isVisible ? 'opacity-50 grayscale' : ''}`}>
        <div className="space-y-1 group relative">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Main Label (e.g. Name)</span>
          <div className="relative">
            <FieldToolbar 
                onIncrease={() => updateFontSize('imageLabel', 1)} 
                onDecrease={() => updateFontSize('imageLabel', -1)} 
            />
            <Input 
                value={page.imageLabel || ''} 
                onChange={(e) => handleChange('imageLabel', e.target.value)} 
                placeholder="Main label text..." 
                className="text-[10px] font-bold"
            />
          </div>
        </div>
        <div className="space-y-1 group relative">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Sub-label (e.g. Title)</span>
          <div className="relative">
            <FieldToolbar 
                onIncrease={() => updateFontSize('imageSubLabel', 1)} 
                onDecrease={() => updateFontSize('imageSubLabel', -1)} 
            />
            <Input 
                value={page.imageSubLabel || ''} 
                onChange={(e) => handleChange('imageSubLabel', e.target.value)} 
                placeholder="Sub-label text..." 
                className="text-[10px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
