import React, { useState } from 'react';
import { PageData } from '../../../types';
import { Eye, EyeOff, Image as ImageIcon, X, SlidersHorizontal, RotateCcw, Monitor } from 'lucide-react';
import { Label, Slider } from '../../ui/Base';
import IconPicker from '../../ui/IconPicker';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
}

export const ImageField: React.FC<FieldProps> = ({ page, onUpdate }) => {
  const [showAdjust, setShowAdjust] = useState(false);
  const isVisible = page.visibility?.image !== false;
  const isBackCover = page.layoutId === 'back-cover-movie';

  const toggleVisibility = () => {
    onUpdate({
      ...page,
      visibility: { ...(page.visibility || {}), image: !isVisible }
    });
  };

  const handleChange = (field: keyof PageData, value: any) => {
    onUpdate({ ...page, [field]: value });
  };

  const handleImageConfigChange = (field: 'scale' | 'x' | 'y', value: number) => {
    const currentConfig = page.imageConfig || { scale: 1, x: 0, y: 0 };
    handleChange('imageConfig', { ...currentConfig, [field]: value });
  };

  const resetAdjustments = () => {
    handleChange('imageConfig', { scale: 1, x: 0, y: 0 });
    if (isBackCover) handleChange('logoSize', 55); // 重置封底视口高度
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleVisibility}
            className={`p-1.5 rounded-md transition-all ${isVisible ? 'text-[#264376] bg-[#264376]/10' : 'text-slate-300 bg-slate-50'}`}
          >
            {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <Label icon={ImageIcon} className="mb-0">Visual Asset</Label>
        </div>
        <div className="flex items-center gap-3">
          {page.image && isVisible && (
            <button 
              onClick={() => setShowAdjust(!showAdjust)}
              className={`text-[10px] font-black uppercase flex items-center gap-1 transition-colors ${showAdjust ? 'text-[#264376]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <SlidersHorizontal size={12} /> {showAdjust ? 'Done' : 'Adjust'}
            </button>
          )}
          {page.image && (
            <button onClick={() => handleChange('image', '')} className="text-[10px] text-red-500 hover:text-red-600 font-bold uppercase flex items-center gap-1 transition-colors">
              <X size={10} /> Remove
            </button>
          )}
        </div>
      </div>
      
      {/* Upload Section */}
      <div className={`flex items-center gap-2 ${!isVisible ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
        <IconPicker 
          value={page.image || ''} 
          onChange={(val) => handleChange('image', val)}
          allowedTabs={['upload']}
          className="w-full"
          trigger={
            <button className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-[#264376] transition-all shadow-sm group">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#264376] transition-colors shrink-0 overflow-hidden">
                  {page.image ? <img src={page.image} className="w-full h-full object-cover" /> : <ImageIcon size={20} />}
                </div>
                <div className="text-left min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Main Visual</p>
                  <p className="text-xs font-bold text-slate-700 truncate">
                    {page.image ? 'Change Asset' : 'Browse Uploads or URL'}
                  </p>
                </div>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-50 text-slate-400 group-hover:text-[#264376] transition-colors">
                <ImageIcon size={16} />
              </div>
            </button>
          }
        />
      </div>

      {/* Adjustments Panel */}
      {page.image && isVisible && showAdjust && (
        <div className="mt-4 p-4 bg-slate-50 rounded-2xl space-y-5 border border-slate-100 animate-in fade-in slide-in-from-top-2">
          
          {/* 特殊逻辑：如果是封底模板，展示 Viewport Height 调节 */}
          {isBackCover && (
            <div className="space-y-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Monitor size={12} className="text-[#264376]" />
                <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Layout Scaling</span>
              </div>
              <Slider 
                label="Viewport Height" 
                value={page.logoSize || 55} 
                min={30} 
                max={80} 
                step={1} 
                onChange={(v) => handleChange('logoSize', v)} 
              />
            </div>
          )}

          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Manual Positioning</span>
            <button onClick={resetAdjustments} className="text-[9px] font-black text-slate-400 hover:text-[#264376] uppercase flex items-center gap-1">
              <RotateCcw size={10} /> Reset
            </button>
          </div>
          
          <Slider label="Scale / Zoom" value={page.imageConfig?.scale || 1} min={0.5} max={3} step={0.05} onChange={(v) => handleImageConfigChange('scale', v)} />
          <Slider label="Move Horizontal" value={page.imageConfig?.x || 0} min={-100} max={100} step={1} onChange={(v) => handleImageConfigChange('x', v)} />
          <Slider label="Move Vertical" value={page.imageConfig?.y || 0} min={-100} max={100} step={1} onChange={(v) => handleImageConfigChange('y', v)} />
        </div>
      )}
    </div>
  );
};
