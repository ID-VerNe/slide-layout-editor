import React from 'react';
import { PageData } from '../../../types';
import { Palette, RotateCcw } from 'lucide-react';
import { Label } from '../../ui/Base';
import { useStore } from '../../../store/useStore';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
}

export const ColorField: React.FC<FieldProps> = ({ page, onUpdate }) => {
  const ds = useStore(s => s.designSystem);
  
  const handleChange = (val: string) => {
    onUpdate({ ...page, backgroundColor: val });
  };

  const isZine = page.layoutId.startsWith('zine-');
  const tokens = ds.tokens.colors;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-1">
        <Label icon={Palette} className="mb-0">Page Background</Label>
        <button 
          onClick={() => handleChange(tokens.background)} 
          className="text-[9px] font-black text-slate-400 hover:text-zine-accent uppercase flex items-center gap-1 transition-colors"
        >
          <RotateCcw size={10} /> Reset to System
        </button>
      </div>
      
      {isZine ? (
        <div className="grid grid-cols-5 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm">
          {Object.entries(tokens).map(([key, val]) => (
            <button
              key={key}
              onClick={() => handleChange(val)}
              className={`w-full aspect-square rounded-lg border-2 transition-all ${page.backgroundColor === val ? 'border-zine-accent scale-110 shadow-md' : 'border-white shadow-sm hover:border-slate-200'}`}
              style={{ backgroundColor: val }}
              title={key.toUpperCase()}
            />
          ))}
        </div>
      ) : (
        <div className="flex gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm">
          <div className="relative overflow-hidden w-10 h-10 rounded-lg shadow-inner ring-1 ring-slate-200 shrink-0">
            <input 
              type="color" 
              className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0" 
              value={page.backgroundColor || '#ffffff'} 
              onChange={(e) => handleChange(e.target.value)} 
            />
          </div>
          <div className="flex-1">
            <input 
              type="text" 
              className="w-full font-mono text-xs uppercase bg-white border-slate-200 p-2 rounded-lg" 
              value={page.backgroundColor || '#ffffff'} 
              onChange={(e) => handleChange(e.target.value)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};
