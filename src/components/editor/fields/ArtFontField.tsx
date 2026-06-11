import React from 'react';
import { PageData } from '../../../types';
import { Type, Maximize, Scissors, Ghost } from 'lucide-react';
import { Input } from '../../ui/Base';
import { FieldWrapper } from './FieldWrapper';
import { PresetSelect } from '../../ui/PresetSelect';
import { FONT_SIZE_PRESETS, LETTER_SPACING_PRESETS } from '../../../constants/editorPresets';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  label?: string;
  fieldKey?: string;
}

export const ArtFontField: React.FC<FieldProps> = React.memo(({ page, onUpdate, label, fieldKey = 'artFont' }) => {
  const value = (page as any)[fieldKey] || '';
  const style = page.styleOverrides?.[fieldKey] || {};

  const updateStyle = (updates: any) => {
    onUpdate({
      ...page,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        [fieldKey]: {
          ...style,
          ...updates
        }
      }
    });
  };

  return (
    <FieldWrapper 
      page={page} 
      onUpdate={onUpdate} 
      fieldKey={fieldKey as any} 
      label={label || "Art Typography"} 
      icon={Type}
    >
      <div className="space-y-4">
        {/* 文字内容 */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
           <Input 
             placeholder="Type art text..." 
             value={value} 
             onChange={(e) => onUpdate({ ...page, [fieldKey]: e.target.value })} 
             className="font-black text-xl tracking-tight uppercase"
           />
        </div>

        {/* 样式控制组 */}
        <div className="grid grid-cols-2 gap-2">
           {/* 字号控制 */}
           <PresetSelect
             value={style.fontSize || 120}
             options={FONT_SIZE_PRESETS}
             onChange={(val) => updateStyle({ fontSize: val })}
             label="Size"
           />

           {/* 描边控制 */}
           <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                <Scissors size={10} /> Stroke
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => updateStyle({ strokeWidth: Math.max(0.5, (style.strokeWidth || 2) - 0.5) })}
                  className="flex-1 py-2 bg-white border border-slate-200 hover:border-slate-950 text-slate-950 text-xs font-black transition-all"
                >
                  −
                </button>
                <div className="flex-1 py-2 bg-white border border-slate-200 text-center text-xs font-black text-slate-950">
                  {(style.strokeWidth || 2).toFixed(1)}
                </div>
                <button
                  onClick={() => updateStyle({ strokeWidth: (style.strokeWidth || 2) + 0.5 })}
                  className="flex-1 py-2 bg-white border border-slate-200 hover:border-slate-950 text-slate-950 text-xs font-black transition-all"
                >
                  +
                </button>
              </div>
           </div>
        </div>

        {/* 模式与透明度 */}
        <div className="flex gap-2">
           <button 
             onClick={() => updateStyle({ mode: style.mode === 'solid' ? 'outline' : 'solid' })}
             className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase border transition-all ${
               style.mode === 'solid' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-slate-200'
             }`}
           >
             {style.mode === 'solid' ? 'Solid Fill' : 'Outline Only'}
           </button>
           
           <div className="flex-1 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between px-3">
              <Ghost size={12} className="text-slate-400" />
              <input 
                type="range" 
                min="0.1" max="1" step="0.1" 
                value={style.opacity || 1} 
                onChange={(e) => updateStyle({ opacity: parseFloat(e.target.value) })}
                className="w-16 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
           </div>
        </div>
      </div>
    </FieldWrapper>
  );
});
