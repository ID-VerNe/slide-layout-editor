import React from 'react';
import { PageData } from '../../../types';
import { Eye, EyeOff, LayoutGrid, Plus } from 'lucide-react';
import { Label, Slider } from '../../ui/Base';
import IconPicker from '../../ui/IconPicker';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
}

export const MosaicField: React.FC<FieldProps> = ({ page, onUpdate }) => {
  const isVisible = page.visibility?.mosaic !== false; // Mosaic usually doesn't have a toggle but let's keep it consistent

  const toggle = () => {
    onUpdate({
      ...page,
      visibility: { ...(page.visibility || {}), mosaic: !isVisible }
    });
  };

  const handleChange = (field: keyof PageData, value: any) => {
    onUpdate({ ...page, [field]: value });
  };

  // Helper to render cell preview in editor
  const renderCellPreview = (val: string) => {
    if (!val) return <Plus size={14} />;
    const isImg = val.startsWith('data:image') || val.includes('http');
    if (isImg) return <img src={val} className="w-full h-full object-cover rounded-md" />;
    return <span className="material-symbols-outlined notranslate text-[20px]" style={{ textTransform: 'none' }}>{val.toLowerCase()}</span>;
  };

  return (
    <div className="space-y-6">
      <Label icon={LayoutGrid}>Mosaic Grid Config</Label>
      <div className="grid grid-cols-2 gap-4">
        <Slider label="Rows" value={page.mosaicConfig?.rows || 3} min={1} max={5} step={1} onChange={(v) => {
          const current = page.mosaicConfig || { rows: 3, cols: 5, stagger: true, icons: {} };
          handleChange('mosaicConfig', { ...current, rows: v });
        }} />
        <Slider label="Cols" value={page.mosaicConfig?.cols || 5} min={1} max={8} step={1} onChange={(v) => {
          const current = page.mosaicConfig || { rows: 3, cols: 5, stagger: true, icons: {} };
          handleChange('mosaicConfig', { ...current, cols: v });
        }} />
      </div>
      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Stagger Rows</span>
        <input type="checkbox" checked={page.mosaicConfig?.stagger !== false} onChange={(e) => {
          const current = page.mosaicConfig || { rows: 3, cols: 5, stagger: true, icons: {} };
          handleChange('mosaicConfig', { ...current, stagger: e.target.checked });
        }} />
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tile Color</span>
        <div className="flex items-center gap-2">
          <div className="relative overflow-hidden w-6 h-6 rounded shadow-sm ring-1 ring-slate-200">
            <input 
              type="color" 
              className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer p-0 border-0" 
              value={page.mosaicConfig?.tileColor || '#ffffff'} 
              onChange={(e) => {
                const current = page.mosaicConfig || { rows: 3, cols: 5, stagger: true, icons: {} };
                handleChange('mosaicConfig', { ...current, tileColor: e.target.value });
              }} 
            />
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-100 rounded-3xl border-2 border-slate-200 border-dashed">
        <div className="flex flex-col gap-3 items-center overflow-x-auto pb-2 no-scrollbar">
          {Array.from({ length: page.mosaicConfig?.rows || 3 }).map((_, r) => (
            <div key={r} className="flex gap-3 shrink-0" style={{ marginLeft: (page.mosaicConfig?.stagger !== false && r % 2 !== 0) ? '16px' : '0' }}>
              {Array.from({ length: page.mosaicConfig?.cols || 5 }).map((_, c) => {
                const key = `${r}-${c}`;
                const val = page.mosaicConfig?.icons?.[key] || '';
                return (
                  <IconPicker key={c} value={val} onChange={(newVal) => {
                    const current = page.mosaicConfig || { rows: 3, cols: 5, stagger: true, icons: {} };
                    handleChange('mosaicConfig', { ...current, icons: { ...current.icons, [key]: newVal } });
                  }}
                  trigger={<button className="w-10 h-10 rounded-lg flex items-center justify-center transition-all border-2 bg-white border-slate-200">{renderCellPreview(val)}</button>}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
