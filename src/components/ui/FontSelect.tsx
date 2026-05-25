import React from 'react';
import { ChevronDown } from 'lucide-react';
import { CustomFont } from '../../types';

interface FontSelectProps {
  value?: string;
  onChange: (v: string) => void;
  label?: string;
  customFonts: CustomFont[];
  compact?: boolean;
}

export const FontSelect: React.FC<FontSelectProps> = ({ value, onChange, label, customFonts = [], compact = false }) => (
  <div className={`flex flex-col gap-1 w-full ${compact ? 'gap-0' : ''}`}>
    {label && !compact && <span className="text-[10px] uppercase font-bold text-slate-400">{label}</span>}
    <div className="relative group">
      <select 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none bg-white text-xs font-black uppercase tracking-widest text-slate-900 pr-8 rounded-none transition-all focus:outline-none focus:border-slate-950 cursor-pointer border border-slate-200
          ${compact ? 'py-1 pl-1.5' : 'py-2.5 pl-3'}`}
      >
        <optgroup label="Zine Spec: Serif (Han/EN)">
           <option value="'Noto Serif SC', serif">Noto Serif SC</option>
           <option value="'Playfair Display', serif">Playfair Display</option>
           <option value="'Crimson Pro', serif">Crimson Pro</option>
        </optgroup>

        <optgroup label="Zine Spec: Sans (Latin)">
           <option value="'Inter', sans-serif">Inter</option>
        </optgroup>
      </select>
      <ChevronDown size={14} strokeWidth={3} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-950 pointer-events-none" />
    </div>
  </div>
);