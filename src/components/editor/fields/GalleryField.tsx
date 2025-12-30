import React, { useState } from 'react';
import { PageData, CustomFont } from '../../../types';
import { Images, Plus, X, SlidersHorizontal, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { Label, Slider } from '../../ui/Base';
import IconPicker from '../../ui/IconPicker';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  customFonts: CustomFont[];
}

export const GalleryField: React.FC<FieldProps> = ({ page, onUpdate, customFonts }) => {
  const [activeAdjustIdx, setActiveAdjustIdx] = useState<number | null>(null);
  const gallery = page.gallery || [];

  const updateGallery = (newGallery: any[]) => {
    onUpdate({ ...page, gallery: newGallery });
  };

  const addImage = () => {
    if (gallery.length >= 6) return;
    updateGallery([...gallery, { url: '', config: { scale: 1, x: 0, y: 0 } }]);
  };

  const removeImage = (idx: number) => {
    const next = gallery.filter((_, i) => i !== idx);
    updateGallery(next);
    if (activeAdjustIdx === idx) setActiveAdjustIdx(null);
  };

  const handleImageChange = (idx: number, url: string) => {
    const next = [...gallery];
    next[idx] = { ...next[idx], url };
    updateGallery(next);
  };

  const handleConfigChange = (idx: number, field: 'scale' | 'x' | 'y', val: number) => {
    const next = [...gallery];
    const currentConfig = next[idx].config || { scale: 1, x: 0, y: 0 };
    next[idx] = { ...next[idx], config: { ...currentConfig, [field]: val } };
    updateGallery(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
        <Label icon={Images} className="mb-0">Gallery Assets</Label>
      </div>

      <div className="space-y-6">
        {gallery.map((item, idx) => (
          <div key={idx} className="relative group p-5 bg-slate-50 rounded-[2rem] space-y-4 border border-transparent hover:border-slate-200 transition-all shadow-sm">
            {/* Remove Button */}
            <button 
              onClick={() => removeImage(idx)}
              className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-slate-100 shadow-md rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 z-10"
            >
              <X size={14} />
            </button>

            {/* Header with Adjust Trigger */}
            <div className="flex justify-between items-center border-b border-white pb-3">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Image Slot {idx + 1}</span>
              {item.url && (
                <button 
                  onClick={() => setActiveAdjustIdx(activeAdjustIdx === idx ? null : idx)}
                  className={`p-1.5 rounded-lg transition-all ${activeAdjustIdx === idx ? 'bg-[#264376] text-white' : 'text-slate-400 hover:bg-white hover:text-[#264376]'}`}
                >
                  <SlidersHorizontal size={14} />
                </button>
              )}
            </div>

            {/* 核心修复：使用统一的 IconPicker 选择器 */}
            <div className="w-full">
              <IconPicker 
                value={item.url} 
                onChange={(url) => handleImageChange(idx, url)}
                allowedTabs={['upload']}
                className="w-full"
                trigger={
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-100 rounded-xl hover:border-[#264376] transition-all shadow-sm group/btn">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover/btn:text-[#264376] transition-colors shrink-0 overflow-hidden">
                        {item.url ? <img src={item.url} className="w-full h-full object-cover" /> : <ImageIcon size={20} />}
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gallery Visual</p>
                        <p className="text-xs font-bold text-slate-700 truncate">
                          {item.url ? 'Change Asset' : 'Browse Uploads or URL'}
                        </p>
                      </div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50 text-slate-400 group-hover/btn:text-[#264376] transition-colors">
                      <Plus size={16} />
                    </div>
                  </button>
                }
              />
            </div>

            {/* Adjustment Panel for this slot */}
            {activeAdjustIdx === idx && item.url && (
              <div className="p-4 bg-white rounded-2xl space-y-4 border border-slate-100 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Image Positioning</span>
                  <button onClick={() => {
                    handleConfigChange(idx, 'scale', 1);
                    handleConfigChange(idx, 'x', 0);
                    handleConfigChange(idx, 'y', 0);
                  }} className="text-[8px] font-black text-slate-400 hover:text-[#264376] uppercase flex items-center gap-1">
                    <RotateCcw size={10} /> Reset
                  </button>
                </div>
                <Slider label="Zoom" value={item.config?.scale || 1} min={0.5} max={3} step={0.05} onChange={(v) => handleConfigChange(idx, 'scale', v)} />
                <Slider label="Move X" value={item.config?.x || 0} min={-100} max={100} step={1} onChange={(v) => handleConfigChange(idx, 'x', v)} />
                <Slider label="Move Y" value={item.config?.y || 0} min={-100} max={100} step={1} onChange={(v) => handleConfigChange(idx, 'y', v)} />
              </div>
            )}
          </div>
        ))}

        {/* Add Button */}
        <button 
          onClick={addImage}
          disabled={gallery.length >= 6}
          className="w-full py-4 border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300 hover:text-[#264376] hover:border-[#264376] hover:bg-[#264376]/10 transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] active:scale-95"
        >
          <Plus size={16} strokeWidth={3} />
          Add Gallery Slot
        </button>
      </div>
    </div>
  );
};