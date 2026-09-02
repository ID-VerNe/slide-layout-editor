import React, { useState } from 'react';
import { PageData } from '../../../types';
import { Image as ImageIcon, SlidersHorizontal, Plus, Trash2 } from 'lucide-react';
import IconPicker from '../../ui/IconPicker';
import { FieldWrapper } from './FieldWrapper';
import { Slider } from '../../ui/Base';
import { useAssetUrl } from '../../../hooks/useAssetUrl';
import { getContainerAspectRatioFromPage } from '../../../utils/imageGeometry';
import { saveAsset } from '../../../utils/db';
import { nativeFs } from '../../../utils/native-fs';
import { logger } from '../../../utils/logger';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  fieldKey?: string;
  label?: string;
  pages?: PageData[];
}

const AssetPreviewSmall = ({ source }: { source?: string }) => {
  const { url } = useAssetUrl(source);
  return (
    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#264376] transition-colors shrink-0 overflow-hidden">
      {url ? <img src={url} className="w-full h-full object-cover" /> : <ImageIcon size={20} />}
    </div>
  );
};

export const ImageField: React.FC<FieldProps> = React.memo(({ page, onUpdate, pages, fieldKey = 'image', label = 'Visual Asset' }) => {
  const [showAdjust, setShowAdjust] = useState(false);
  const configKey = fieldKey === 'image' ? 'imageConfig' : `${fieldKey}Config`;
  const isVisible = page.visibility?.[fieldKey] !== false;
  const displayLabel = (label === 'Visual Asset' && fieldKey === 'signature') ? 'Artist Signature' : label;

  const { dimensions } = useAssetUrl((page as any)[fieldKey]);
  const containerRatio = getContainerAspectRatioFromPage(page, fieldKey) || 1;
  const imageRatio = (dimensions.width && dimensions.height) ? (dimensions.width / dimensions.height) : null;
  const currentScale = (page as any)[configKey]?.scale !== undefined ? (page as any)[configKey].scale : 1;

  // 判断是否允许平移：若无多余裁切余量，则锁死（Ban）该方向
  const canMoveHoriz = currentScale > 1 || (imageRatio !== null && imageRatio > containerRatio + 0.02);
  const canMoveVert = currentScale > 1 || (imageRatio !== null && imageRatio < containerRatio - 0.02);

  const handleImageSelect = async (val: string) => {
    logger.action('ImageField', 'SelectAsset', { fieldKey, val: val ? val.slice(0, 60) : '' });
    const resetConfig = { scale: 1, x: 0, y: 0 };
    if (val.startsWith('data:')) {
      if (nativeFs.isElectron()) {
        try {
          const filename = `asset_upload_${Date.now()}.png`; 
          const result = await nativeFs.uploadAsset(filename, val);
          if (result.success && result.url) {
            onUpdate({ ...page, [fieldKey]: result.url, [configKey]: resetConfig });
          }
        } catch (e) { console.error('Native upload error:', e); }
      } else {
        const assetId = await saveAsset(val);
        onUpdate({ ...page, [fieldKey]: assetId, [configKey]: resetConfig });
      }
    } else {
      onUpdate({ ...page, [fieldKey]: val, [configKey]: resetConfig });
    }
  };

  const handleConfigChange = (key: string, val: number) => {
    logger.action('ImageField', 'ChangeConfig', { fieldKey, [key]: val });
    const currentConfig = (page as any)[configKey] || { scale: 1, x: 0, y: 0 };
    onUpdate({
      ...page,
      [configKey]: { ...currentConfig, [key]: val }
    });
  };

  const handleFit = () => {
    logger.action('ImageField', 'FitToContainer', { fieldKey });
    // 重置为居中适配：scale=1, 居中显示
    onUpdate({
      ...page,
      [configKey]: { scale: 1, x: 0, y: 0 }
    });
  };

  const handleRemove = () => {
    logger.action('ImageField', 'RemoveAsset', { fieldKey });
    onUpdate({ ...page, [fieldKey]: '' });
  };

  return (
    <FieldWrapper page={page} onUpdate={onUpdate} fieldKey={fieldKey} label={displayLabel} icon={ImageIcon}>
      <div className="space-y-3">
        <div className="flex gap-2">
          <IconPicker
            value={(page as any)[fieldKey] || ''}
            onChange={handleImageSelect}
            allowedTabs={['upload', 'icons', 'map', 'history']}
            className="flex-1"
            pages={pages}
            trigger={
              <button className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-[#264376] transition-all shadow-sm group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <AssetPreviewSmall source={(page as any)[fieldKey]} />
                  <div className="text-left min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selected Asset</p>
                    <p className="text-xs font-bold text-slate-700 truncate">{(page as any)[fieldKey] ? 'Change Source' : 'Browse Library'}</p>
                  </div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50 text-slate-400 group-hover:text-[#264376] transition-colors">
                  <Plus size={16} />
                </div>
              </button>
            }
          />
          
          {(page as any)[fieldKey] && (
            <button 
              onClick={() => setShowAdjust(!showAdjust)}
              className={`p-3 rounded-xl border transition-all ${showAdjust ? 'bg-[#264376] border-[#264376] text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
              title="Adjust Image"
            >
              <SlidersHorizontal size={18} />
            </button>
          )}
        </div>

        {showAdjust && (page as any)[fieldKey] && (
          <div className="p-4 bg-slate-50 rounded-2xl space-y-5 border border-slate-100 animate-in fade-in slide-in-from-top-2">
            <div className="flex gap-2">
              <button 
                onClick={handleFit} 
                className="flex-1 py-2.5 flex items-center justify-center gap-2 text-[#264376] hover:bg-blue-50 rounded-xl transition-colors font-bold text-[10px] uppercase tracking-widest border border-blue-200"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M9 9h6v6H9z"/>
                </svg>
                Fit to Container
              </button>
            </div>
            <Slider 
              label="Scale" 
              value={(page as any)[configKey]?.scale !== undefined ? (page as any)[configKey].scale : 1} 
              min={1} 
              max={3} 
              step={0.05} 
              onChange={(v) => handleConfigChange('scale', v)} 
            />
            <Slider 
              label={canMoveHoriz ? "Move Horiz." : "Move Horiz. (Locked)"} 
              value={canMoveHoriz ? ((page as any)[configKey]?.x || 0) : 0} 
              min={-100} 
              max={100} 
              step={1} 
              disabled={!canMoveHoriz}
              onChange={(v) => handleConfigChange('x', v)} 
            />
            <Slider 
              label={canMoveVert ? "Move Vert." : "Move Vert. (Locked)"} 
              value={canMoveVert ? ((page as any)[configKey]?.y || 0) : 0} 
              min={-100} 
              max={100} 
              step={1} 
              disabled={!canMoveVert}
              onChange={(v) => handleConfigChange('y', v)} 
            />
            <button onClick={handleRemove} className="w-full py-2.5 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold text-[10px] uppercase tracking-widest border border-red-100 mt-2">
              <Trash2 size={14} /> Remove Asset
            </button>
          </div>
        )}
      </div>
    </FieldWrapper>
  );
});
