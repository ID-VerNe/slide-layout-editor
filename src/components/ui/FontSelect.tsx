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
        className={`w-full appearance-none bg-white text-xs font-medium text-slate-700 pr-6 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-[#264376]/20 cursor-pointer border border-transparent hover:border-slate-200
          ${compact ? 'py-1 pl-1.5 hover:bg-slate-50' : 'py-1.5 pl-2 hover:bg-slate-50'}`}
      >
        <option value="">Default Font</option>
        
        {customFonts && customFonts.length > 0 && (
          <optgroup label="Uploaded Fonts">
            {customFonts.map(f => (
              <option key={f.family} value={f.family}>{f.name}</option>
            ))}
          </optgroup>
        )}

        <optgroup label="Editorial Serif">
           <option value="'Playfair Display', serif">Playfair Display</option>
           <option value="'Crimson Pro', serif">Crimson Pro</option>
           <option value="'Lora', serif">Lora</option>
           <option value="'Noto Serif SC', serif">Noto Serif SC</option>
        </optgroup>

        <optgroup label="Modern Sans">
           <option value="'Inter', sans-serif">Inter</option>
        </optgroup>
      </select>
      <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  </div>
);