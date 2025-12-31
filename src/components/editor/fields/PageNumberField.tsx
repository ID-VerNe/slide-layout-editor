import React from 'react';
import { PageData } from '../../../types';
import { Eye, EyeOff, Hash, Type } from 'lucide-react';
import { Label, Input } from '../../ui/Base';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
}

export const PageNumberField: React.FC<FieldProps> = ({ page, onUpdate }) => {
  const isVisible = page.pageNumber !== false;

  const toggle = () => {
    onUpdate({
      ...page,
      pageNumber: !isVisible
    });
  };

  const handleTextChange = (val: string) => {
    onUpdate({ ...page, pageNumberText: val });
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
        <Label icon={Hash} className="mb-0">Page Number</Label>
      </div>

      {!isVisible && (
        <div className="pl-8 space-y-2 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <Type size={10} className="text-slate-400" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fallback Text</span>
          </div>
          <Input 
            value={page.pageNumberText || ''} 
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="e.g. END OF FILE"
            className="text-[10px]"
          />
          <p className="text-[8px] text-slate-400 italic">This text replaces the page number.</p>
        </div>
      )}
    </div>
  );
};