import React from 'react';
import { PageData, CustomFont } from '../../../types';
import { Tag, Palette, RotateCcw } from 'lucide-react';
import { DebouncedTextArea } from '../../ui/DebouncedBase'; // 切换到 TextArea
import { FieldToolbar } from './FieldToolbar';
import { FieldWrapper } from './FieldWrapper';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  customFonts?: CustomFont[];
}

/**
 * ImageLabelField
 * 升级版：支持标签的手动换行。
 */
export const ImageLabelField: React.FC<FieldProps> = React.memo(({ page, onUpdate }) => {
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
    <FieldWrapper page={page} onUpdate={onUpdate} fieldKey="imageLabel" label="Image Labels & Style" icon={Tag}>
      <div className="space-y-5">
        {/* 1. Main Label Input - 现在支持换行 */}
        <div className="space-y-1 group relative">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Main Label (e.g. Name)</span>
          <div className="relative">
            <FieldToolbar onIncrease={() => updateFontSize('imageLabel', 1)} onDecrease={() => updateFontSize('imageLabel', -1)} />
            <DebouncedTextArea 
              value={page.imageLabel || ''} 
              onChange={(val) => handleChange('imageLabel', val)} 
              placeholder="Main text..." 
              rows={2}
              className="text-[10px] font-bold min-h-[60px]" 
            />
          </div>
        </div>

        {/* 2. Sub-label Input - 现在支持换行 */}
        <div className="space-y-1 group relative">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Sub-label (e.g. Title)</span>
          <div className="relative">
            <FieldToolbar onIncrease={() => updateFontSize('imageSubLabel', 1)} onDecrease={() => updateFontSize('imageSubLabel', -1)} />
            <DebouncedTextArea 
              value={page.imageSubLabel || ''} 
              onChange={(val) => handleChange('imageSubLabel', val)} 
              placeholder="Subtext..." 
              rows={2}
              className="text-[10px] min-h-[60px]" 
            />
          </div>
        </div>

        {/* 3. Accent Color Picker */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2">
              <Palette size={12} className="text-[#264376]" />
              <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Accent Style Color</span>
            </div>
            <button 
              onClick={() => handleChange('accentColor', '#F472B6')} 
              className="text-[9px] font-black text-slate-300 hover:text-[#264376] uppercase flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={10} /> Reset
            </button>
          </div>
          
          <div className="flex gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="relative overflow-hidden w-8 h-8 rounded-lg shadow-inner ring-1 ring-slate-200 shrink-0">
              <input 
                type="color" 
                className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer p-0 border-0" 
                value={page.accentColor || '#F472B6'} 
                onChange={(e) => handleChange('accentColor', e.target.value)} 
              />
            </div>
            <div className="flex-1 text-[10px] font-mono text-slate-500 uppercase">{page.accentColor || '#F472B6'}</div>
          </div>
        </div>
      </div>
    </FieldWrapper>
  );
});
