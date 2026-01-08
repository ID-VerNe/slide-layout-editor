import React from 'react';
import { PageData } from '../../../types';
import { Eye, EyeOff } from 'lucide-react';
import { DebouncedInput } from '../../ui/DebouncedBase';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData, silent?: boolean) => void;
}

export const SubtitleField: React.FC<FieldProps> = React.memo(({ page, onUpdate }) => {
  const isVisible = page.visibility?.subtitle !== false;

  const toggle = () => {
    onUpdate({
      ...page,
      visibility: { ...(page.visibility || {}), subtitle: !isVisible }
    });
  };

  const handleChange = (val: string) => {
    onUpdate({ ...page, subtitle: val });
  };

  const handleImmediateChange = (val: string) => {
    onUpdate({ ...page, subtitle: val }, true);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className={`p-1.5 rounded-md transition-all ${isVisible ? 'text-[#264376] bg-[#264376]/10' : 'text-slate-300 bg-slate-50'}`}
        >
          {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Subtitle</span>
      </div>

      <DebouncedInput 
        value={page.subtitle || ''} 
        onChange={handleChange} 
        onImmediateChange={handleImmediateChange}
        placeholder="Subtitle..." 
        className={!isVisible ? 'opacity-50 grayscale' : ''} 
      />
    </div>
  );
});
