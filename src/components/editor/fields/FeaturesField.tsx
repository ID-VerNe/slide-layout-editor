import React, { useState } from 'react';
import { PageData, FeatureData, CustomFont } from '../../../types';
import { Eye, EyeOff, Layout, Plus, X, SlidersHorizontal, RotateCcw, HelpCircle } from 'lucide-react';
import { LUCIDE_ICON_MAP } from '../../../constants/icons';
import { Label, Input, TextArea, Slider } from '../../ui/Base';
import IconPicker from '../../ui/IconPicker';
import { FieldToolbar } from './FieldToolbar';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  customFonts: CustomFont[];
}

export const FeaturesField: React.FC<FieldProps> = ({ page, onUpdate, customFonts }) => {
  const [activeAdjustIdx, setActiveAdjustIdx] = useState<number | null>(null);
  const isVisible = page.visibility?.features !== false;

  // Auto-generate IDs for legacy data
  React.useEffect(() => {
    const features = page.features || [];
    if (features.some(f => !f.id)) {
      const migrated = features.map(f => f.id ? f : { ...f, id: `feat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` });
      onUpdate({ ...page, features: migrated });
    }
  }, [page.features, onUpdate, page]);

  const toggle = () => {
    onUpdate({
      ...page,
      visibility: { ...(page.visibility || {}), features: !isVisible }
    });
  };

  const handleFeatureChange = (index: number, field: keyof FeatureData, value: any) => {
    const newFeatures = [...(page.features || [])];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    onUpdate({ ...page, features: newFeatures });
  };

  const handleImageConfigChange = (index: number, field: 'scale' | 'x' | 'y', value: number) => {
    const feature = (page.features || [])[index];
    const currentConfig = feature.imageConfig || { scale: 1, x: 0, y: 0 };
    handleFeatureChange(index, 'imageConfig', { ...currentConfig, [field]: value });
  };

  const resetAdjustments = (index: number) => {
    handleFeatureChange(index, 'imageConfig', { scale: 1, x: 0, y: 0 });
  };

  const addFeature = () => {
    const currentFeatures = page.features || [];
    if (currentFeatures.length >= 8) return;
    onUpdate({
      ...page,
      features: [...currentFeatures, { 
        id: `feat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: 'New Feature', 
        desc: 'Feature description goes here.', 
        icon: 'Globe' 
      }]
    });
  };

  const removeFeature = (index: number) => {
    const currentFeatures = page.features || [];
    onUpdate({
      ...page,
      features: currentFeatures.filter((_, i) => i !== index)
    });
  };

  const updateFontSize = (field: 'featureTitle' | 'featureDesc', delta: number) => {
    const defaultSize = field === 'featureTitle' ? 14 : 11;
    const currentSize = page.styleOverrides?.[field]?.fontSize;
    onUpdate({
      ...page,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        [field]: {
          ...(page.styleOverrides?.[field] || {}),
          fontSize: Math.max(8, (currentSize || defaultSize) + delta)
        }
      }
    });
  };

  const handleFontChange = (field: 'featureTitle' | 'featureDesc', font: string) => {
    onUpdate({
      ...page,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        [field]: {
          ...(page.styleOverrides?.[field] || {}),
          fontFamily: font
        }
      }
    } as any);
  };

  const renderCellPreview = (val: string) => {
    if (!val) return <Plus size={14} />;
    const isImg = val.startsWith('data:image') || val.includes('http');
    if (isImg) return <img src={val} className="w-full h-full object-cover rounded-md" />;
    const isMaterial = val.includes('_') || /^[a-z]/.test(val);
    if (isMaterial) return <span className="material-symbols-outlined notranslate text-[20px]" style={{ textTransform: 'none' }}>{val.toLowerCase()}</span>;
    
    const PascalName = val.charAt(0).toUpperCase() + val.slice(1);
    const Icon = LUCIDE_ICON_MAP[PascalName] || LUCIDE_ICON_MAP[val] || HelpCircle;
    return <Icon size={20} strokeWidth={2.5} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
        <button 
          onClick={toggle}
          className={`p-1.5 rounded-md transition-all ${isVisible ? 'text-[#264376] bg-[#264376]/10' : 'text-slate-300 bg-slate-50'}`}
        >
          {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <Label icon={Layout} className="mb-0">Features Grid</Label>
      </div>
      
      <div className={`space-y-6 ${!isVisible ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
        {(page.features || []).map((f, idx) => {
          const isImg = f.icon?.startsWith('data:image') || f.icon?.includes('http');
          const isAdjusting = activeAdjustIdx === idx;
          const key = f.id || idx; // Fallback to idx while migration runs

          return (
            <div key={key} className="relative group p-5 bg-slate-50 rounded-[2rem] space-y-4 border border-transparent hover:border-slate-200 transition-all shadow-sm">
              <button 
                onClick={() => removeFeature(idx)}
                className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-slate-100 shadow-md rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 z-10"
              >
                <X size={14} />
              </button>
              
              <div className="flex justify-between items-center border-b border-white pb-3">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Item {idx + 1}</span>
                <div className="flex items-center gap-2">
                  {isImg && (
                    <button 
                      onClick={() => setActiveAdjustIdx(isAdjusting ? null : idx)}
                      className={`p-1.5 rounded-lg transition-all ${isAdjusting ? 'bg-[#264376] text-white' : 'text-slate-400 hover:bg-white hover:text-[#264376]'}`}
                      title="Adjust Image"
                    >
                      <SlidersHorizontal size={14} />
                    </button>
                  )}
                  <IconPicker 
                    value={f.icon || 'Globe'} 
                    onChange={(val) => handleFeatureChange(idx, 'icon', val)}
                    allowedTabs={['icons', 'upload']}
                    trigger={
                      <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-xl hover:border-[#264376] transition-all shadow-sm">
                        <div className="w-5 h-5 flex items-center justify-center text-[#264376]">
                          {renderCellPreview(f.icon || 'Globe')}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Select Asset</span>
                      </button>
                    }
                  />
                </div>
              </div>

              {/* Adjust Panel for this item */}
              {isImg && isAdjusting && (
                <div className="p-4 bg-white rounded-2xl space-y-4 border border-slate-100 animate-in fade-in slide-in-from-top-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Image Positioning</span>
                    <button onClick={() => resetAdjustments(idx)} className="text-[8px] font-black text-slate-400 hover:text-[#264376] uppercase flex items-center gap-1">
                      <RotateCcw size={8} /> Reset
                    </button>
                  </div>
                  <Slider label="Zoom" value={f.imageConfig?.scale || 1} min={0.5} max={3} step={0.05} onChange={(v) => handleImageConfigChange(idx, 'scale', v)} />
                  <Slider label="Move X" value={f.imageConfig?.x || 0} min={-100} max={100} step={1} onChange={(v) => handleImageConfigChange(idx, 'x', v)} />
                  <Slider label="Move Y" value={f.imageConfig?.y || 0} min={-100} max={100} step={1} onChange={(v) => handleImageConfigChange(idx, 'y', v)} />
                </div>
              )}
              
              <div className="space-y-3">
                <div className="relative group/field">
                  <FieldToolbar 
                    onIncrease={() => updateFontSize('featureTitle', 1)} 
                    onDecrease={() => updateFontSize('featureTitle', -1)}
                    customFonts={customFonts}
                    currentFont={(page.styleOverrides as any)?.featureTitle?.fontFamily}
                    onFontChange={(font) => handleFontChange('featureTitle', font)}
                  />
                  <Input 
                    placeholder="Feature Title" 
                    value={f.title || ''} 
                    onChange={(e) => handleFeatureChange(idx, 'title', e.target.value)}
                    className="text-xs font-bold bg-white"
                    style={{ fontFamily: (page.styleOverrides as any)?.featureTitle?.fontFamily }}
                  />
                </div>

                <div className="relative group/field">
                  <FieldToolbar 
                    onIncrease={() => updateFontSize('featureDesc', 1)} 
                    onDecrease={() => updateFontSize('featureDesc', -1)}
                    customFonts={customFonts}
                    currentFont={(page.styleOverrides as any)?.featureDesc?.fontFamily}
                    onFontChange={(font) => handleFontChange('featureDesc', font)}
                  />
                  <TextArea 
                    placeholder="Description text..." 
                    value={f.desc || ''} 
                    rows={2}
                    onChange={(e) => handleFeatureChange(idx, 'desc', e.target.value)}
                    className="text-[11px] bg-white leading-relaxed"
                    style={{ fontFamily: (page.styleOverrides as any)?.featureDesc?.fontFamily }}
                  />
                </div>
              </div>
            </div>
          );
        })}

        <button 
          onClick={addFeature}
          disabled={(page.features?.length || 0) >= 8}
          className="w-full py-4 border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300 hover:text-[#264376] hover:border-[#264376] hover:bg-[#264376]/10 transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] active:scale-95"
        >
          <Plus size={16} strokeWidth={3} />
          Add Feature
        </button>
      </div>
    </div>
  );
};
