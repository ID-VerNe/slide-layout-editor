import React, { useState } from 'react';
import { PageData } from '../../../types';
import { Image as ImageIcon, SlidersHorizontal, Plus, Trash2 } from 'lucide-react';
import IconPicker from '../../ui/IconPicker';
import { FieldWrapper } from './FieldWrapper';
import { Slider } from '../../ui/Base';
import { useAssetUrl } from '../../../hooks/useAssetUrl';
import { saveAsset } from '../../../utils/db';
import { nativeFs } from '../../../utils/native-fs';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
}

const AssetPreviewSmall = ({ source }: { source?: string }) => {
  const { url } = useAssetUrl(source);
  return (
    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#264376] transition-colors shrink-0 overflow-hidden">
      {url ? <img src={url} className="w-full h-full object-cover" /> : <ImageIcon size={20} />}
    </div>
  );
};

export const ImageField: React.FC<FieldProps> = React.memo(({ page, onUpdate }) => {
  const [showAdjust, setShowAdjust] = useState(false);
  const isVisible = page.visibility?.image !== false;

  const handleImageSelect = async (val: string) => {
    const resetConfig = { scale: 1, x: 0, y: 0 };
    if (val.startsWith('data:')) {
      if (nativeFs.isElectron()) {
        try {
          const filename = `asset_upload_${Date.now()}.png`; 
          const result = await nativeFs.uploadAsset(filename, val);
          if (result.success && result.url) {
            onUpdate({ ...page, image: result.url, imageConfig: resetConfig });
          }
        } catch (e) { console.error('Native upload error:', e); }
      } else {
        const assetId = await saveAsset(val);
        onUpdate({ ...page, image: assetId, imageConfig: resetConfig });
      }
    } else {
      onUpdate({ ...page, image: val, imageConfig: resetConfig });
    }
  };

  const handleConfigChange = (key: string, val: number) => {
    const currentConfig = page.imageConfig || { scale: 1, x: 0, y: 0 };
    onUpdate({
      ...page,
      imageConfig: { ...currentConfig, [key]: val }
    });
  };

  const handleRemove = () => onUpdate({ ...page, image: '' });

  return (
    <FieldWrapper page={page} onUpdate={onUpdate} fieldKey="image" label="Visual Asset" icon={ImageIcon}>
      <div className="space-y-3">
        <div className="flex gap-2">
          <IconPicker 
            value={page.image || ''} 
            onChange={handleImageSelect}
            allowedTabs={['upload', 'icons', 'map']} 
            className="flex-1"
            trigger={
              <button className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-[#264376] transition-all shadow-sm group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <AssetPreviewSmall source={page.image} />
                  <div className="text-left min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selected Asset</p>
                    <p className="text-xs font-bold text-slate-700 truncate">{page.image ? 'Change Source' : 'Browse Library'}</p>
                  </div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50 text-slate-400 group-hover:text-[#264376] transition-colors">
                  <Plus size={16} />
                </div>
              </button>
            }
          />
          
          {page.image && (
            <button 
              onClick={() => setShowAdjust(!showAdjust)}
              className={`p-3 rounded-xl border transition-all ${showAdjust ? 'bg-[#264376] border-[#264376] text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
              title="Adjust Image"
            >
              <SlidersHorizontal size={18} />
            </button>
          )}
        </div>

        {showAdjust && page.image && (
          <div className="p-4 bg-slate-50 rounded-2xl space-y-5 border border-slate-100 animate-in fade-in slide-in-from-top-2">
            <Slider label="Scale" value={page.imageConfig?.scale || 1} min={0.5} max={3} step={0.1} onChange={(v) => handleConfigChange('scale', v)} />
            <Slider label="Move Horiz." value={page.imageConfig?.x || 0} min={-100} max={100} step={1} onChange={(v) => handleConfigChange('x', v)} />
            <Slider label="Move Vert." value={page.imageConfig?.y || 0} min={-100} max={100} step={1} onChange={(v) => handleConfigChange('y', v)} />
            <button onClick={handleRemove} className="w-full py-2.5 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold text-[10px] uppercase tracking-widest border border-red-100 mt-2">
              <Trash2 size={14} /> Remove Asset
            </button>
          </div>
        )}
      </div>
    </FieldWrapper>
  );
});
