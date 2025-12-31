import React from 'react';
import { PageData } from '../../../types';
import { Palette, RotateCcw } from 'lucide-react';
import { Label, Input } from '../../ui/Base';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
}

export const ColorField: React.FC<FieldProps> = ({ page, onUpdate }) => {
  const handleChange = (val: string) => {
    onUpdate({ ...page, backgroundColor: val });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-1">
        <Label icon={Palette} className="mb-0">Page Background</Label>
        <button 
          onClick={() => handleChange('#1b1b1f')} 
          className="text-[9px] font-black text-slate-400 hover:text-[#264376] uppercase flex items-center gap-1 transition-colors"
        >
          <RotateCcw size={10} /> Reset Theme
        </button>
      </div>
      
      <div className="flex gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative overflow-hidden w-10 h-10 rounded-lg shadow-inner ring-1 ring-slate-200 shrink-0">
          <input 
            type="color" 
            className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0" 
            value={page.backgroundColor || '#1b1b1f'} 
            onChange={(e) => handleChange(e.target.value)} 
          />
        </div>
        <div className="flex-1">
          <Input 
            type="text" 
            className="font-mono text-xs uppercase bg-white border-slate-200" 
            value={page.backgroundColor || '#1b1b1f'} 
            onChange={(e) => handleChange(e.target.value)} 
          />
        </div>
      </div>
    </div>
  );
};
