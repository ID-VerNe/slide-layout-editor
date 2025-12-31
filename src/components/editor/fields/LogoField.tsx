import React from 'react';
import { PageData } from '../../../types';
import { Eye, EyeOff } from 'lucide-react';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
}

export const LogoField: React.FC<FieldProps> = React.memo(({ page, onUpdate }) => {
  const isVisible = page.visibility?.logo !== false;

  const toggle = () => {
    onUpdate({
      ...page,
      visibility: { ...(page.visibility || {}), logo: !isVisible }
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <button 
          onClick={toggle}
          className={`p-1.5 rounded-md transition-all ${isVisible ? 'text-[#264376] bg-[#264376]/10' : 'text-slate-300 bg-slate-50'}`}
        >
          {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <span className="text-[10px] text-slate-400 font-bold uppercase">Show Logo</span>
      </div>
    </div>
  );
}, (prev, next) => {
  return (
    prev.page.visibility?.logo === next.page.visibility?.logo &&
    prev.onUpdate === next.onUpdate
  );
});
