import React, { useState, useEffect } from 'react';
import { PageData } from '../../../types';
import { Slider } from '../../ui/Base';
import { Settings2 } from 'lucide-react';

interface Props {
  page: PageData;
  onUpdate: (page: PageData) => void;
  label?: string;
  fieldKey: string;
  min?: number;
  max?: number;
  step?: number;
}

export const GenericNumberField: React.FC<Props> = ({ 
  page, onUpdate, label, fieldKey, min = 0, max = 100, step = 1 
}) => {
  // 同步本地状态
  const [localValue, setLocalValue] = useState<number>((page as any)[fieldKey] ?? 50);

  useEffect(() => {
    const val = (page as any)[fieldKey] ?? 50;
    setLocalValue(val);
  }, [page, fieldKey]);

  const handleChange = (val: number) => {
    setLocalValue(val);
    onUpdate({
      ...page,
      [fieldKey]: val
    });
  };

  return (
    <div className="space-y-4 py-4 border-b border-slate-50 last:border-0 group">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400 group-hover:text-[#2a4a82] transition-colors">
            <Settings2 size={14} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
            {label || fieldKey}
          </span>
        </div>
        <span className="text-[10px] font-mono font-black text-[#2a4a82] bg-[#2a4a82]/5 px-2 py-0.5 rounded">
          {localValue}%
        </span>
      </div>

      <div className="px-1">
        {/* 使用 Base.tsx 中定义的 Slider 接口 */}
        <Slider 
          label={label || fieldKey}
          value={localValue} 
          min={min} 
          max={max} 
          step={step} 
          onChange={handleChange} 
        />
      </div>
    </div>
  );
};
