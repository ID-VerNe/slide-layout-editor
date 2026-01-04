import React, { useState } from 'react';
import { PageData } from '../../../types';
import { PenTool, Image as ImageIcon, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Slider } from '../../ui/Base';
import { FieldWrapper } from './FieldWrapper';
import IconPicker from '../../ui/IconPicker';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
}

/**
 * SignatureField - 本人签名组件
 * 增强版：支持 Adjust 微调功能，控制签名的大小。
 */
export const SignatureField: React.FC<FieldProps> = React.memo(({ page, onUpdate }) => {
  const [showAdjust, setShowAdjust] = useState(false);

  const handleChange = (val: string) => {
    onUpdate({ ...page, signature: val });
  };

  const handleSizeChange = (val: number) => {
    // 借用 logoSize 字段或 styleOverrides，此处建议存入专用字段以防冲突
    // 我们暂时统一存入 styleOverrides.signature.fontSize (映射为图片高度)
    onUpdate({
      ...page,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        signature: {
          ...(page.styleOverrides?.signature || {}),
          fontSize: val
        }
      }
    });
  };

  const actions = (
    <div className="flex items-center gap-3">
      {page.signature && (
        <button 
          onClick={() => setShowAdjust(!showAdjust)}
          className={`text-[10px] font-black uppercase flex items-center gap-1 transition-colors ${showAdjust ? 'text-[#264376]' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <SlidersHorizontal size={12} /> {showAdjust ? 'Done' : 'Adjust'}
        </button>
      )}
    </div>
  );

  return (
    <FieldWrapper 
      page={page} 
      onUpdate={onUpdate} 
      fieldKey="signature" 
      label="Artist Signature" 
      icon={PenTool}
      actions={actions}
    >
      <div className="space-y-4">
        <IconPicker 
          value={page.signature || ''} 
          onChange={handleChange}
          allowedTabs={['upload']}
          className="w-full"
          trigger={
            <button className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-[#264376] transition-all shadow-sm group text-left">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#264376] transition-colors shrink-0 overflow-hidden">
                  {page.signature ? (
                    <img src={page.signature} className="w-full h-full object-contain mix-blend-multiply" alt="Sig" />
                  ) : (
                    <ImageIcon size={20} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Signature Asset</p>
                  <p className="text-xs font-bold text-slate-700 truncate">
                    {page.signature ? 'Change Signature' : 'Upload Image'}
                  </p>
                </div>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-50 text-slate-400 group-hover:text-[#264376] transition-colors">
                <PenTool size={16} />
              </div>
            </button>
          }
        />

        {/* Adjustments Panel */}
        {page.signature && showAdjust && (
          <div className="p-4 bg-slate-50 rounded-2xl space-y-5 border border-slate-100 animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Scaling & Size</span>
              <button 
                onClick={() => handleSizeChange(80)} 
                className="text-[9px] font-black text-slate-400 hover:text-[#264376] uppercase flex items-center gap-1"
              >
                <RotateCcw size={10} /> Reset
              </button>
            </div>
            
            <Slider 
              label="Signature Height" 
              value={page.styleOverrides?.signature?.fontSize || 80} 
              min={20} 
              max={300} 
              step={2} 
              onChange={handleSizeChange} 
            />
          </div>
        )}
      </div>
    </FieldWrapper>
  );
});
