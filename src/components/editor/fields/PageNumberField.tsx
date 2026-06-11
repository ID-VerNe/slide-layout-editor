import React from 'react';
import { PageData } from '../../../types';
import { Eye, EyeOff, Hash, Type, AlignLeft, AlignRight, Zap } from 'lucide-react';
import { Label, Input } from '../../ui/Base';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
}

export const PageNumberField: React.FC<FieldProps> = ({ page, onUpdate }) => {
  const isVisible = page.pageNumber !== false;
  const alignment = page.folioAlignment || 'auto';

  const toggle = () => {
    onUpdate({
      ...page,
      pageNumber: !isVisible
    });
  };

  const handleAlignment = (val: 'left' | 'right' | 'auto') => {
    onUpdate({ ...page, folioAlignment: val });
  };

  const handleTextChange = (val: string) => {
    onUpdate({ ...page, pageNumberText: val });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <button 
            onClick={toggle}
            className={`p-1.5 rounded-md transition-all ${isVisible ? 'text-zine-accent bg-zine-accent/10' : 'text-slate-300 bg-slate-50'}`}
          >
            {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <Label icon={Hash} className="mb-0">Folio (Page No.)</Label>
        </div>

        {/* 左右对齐切换 */}
        {isVisible && (
          <div className="flex bg-slate-100 p-0.5 rounded-md">
            <button 
              onClick={() => handleAlignment('left')}
              className={`p-1 rounded ${alignment === 'left' ? 'bg-white shadow-sm text-zine-accent' : 'text-slate-400'}`}
              title="Align Left"
            >
              <AlignLeft size={12} />
            </button>
            <button 
              onClick={() => handleAlignment('auto')}
              className={`p-1 rounded ${alignment === 'auto' ? 'bg-white shadow-sm text-zine-accent' : 'text-slate-400'}`}
              title="Auto (Based on Variant)"
            >
              <Zap size={12} />
            </button>
            <button 
              onClick={() => handleAlignment('right')}
              className={`p-1 rounded ${alignment === 'right' ? 'bg-white shadow-sm text-zine-accent' : 'text-slate-400'}`}
              title="Align Right"
            >
              <AlignRight size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};