import React, { useState, useMemo } from 'react';
import { PageData, BentoItem, BentoItemType } from '../../../types';
import { LayoutGrid, Plus, X, Type, Image as ImageIcon, Box, Activity, ChevronRight, ChevronLeft, Palette, MousePointer2, Grid3X3, Check, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { FieldWrapper } from './FieldWrapper';
import { Input, Label, Slider } from '../../ui/Base';
import IconPicker from '../../ui/IconPicker';
import { FieldToolbar } from './FieldToolbar';
import Modal from '../../Modal';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
}

export const BentoField: React.FC<FieldProps> = ({ page, onUpdate }) => {
  const [isVisualEditorOpen, setIsVisualEditorOpen] = useState(false);
  const [adjustingIdx, setAdjustingIdx] = useState<number | null>(null); 
  
  const items = page.bentoItems || [];
  const bentoConfig = page.bentoConfig || { rows: 4, cols: 4 };

  const updateItems = (newItems: BentoItem[]) => {
    onUpdate({ ...page, bentoItems: newItems });
  };

  const updateConfig = (updates: Partial<{rows: number, cols: number}>) => {
    onUpdate({ ...page, bentoConfig: { ...bentoConfig, ...updates } });
  };

  const removeItem = (idx: number) => {
    updateItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, updates: Partial<BentoItem>) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], ...updates };
    updateItems(newItems);
  };

  const updateFontSize = (idx: number, delta: number) => {
    const current = items[idx].fontSize || 1;
    updateItem(idx, { fontSize: Math.max(0.5, current + delta * 0.1) });
  };

  return (
    <FieldWrapper page={page} onUpdate={onUpdate} label="Bento Grid" icon={LayoutGrid} fieldKey="features">
      <div className="space-y-4">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-4">
           <Grid3X3 size={16} className="text-slate-400" />
           <div className="flex-1 flex gap-2">
              <div className="flex-1">
                <span className="text-[8px] font-black uppercase text-slate-400 ml-1">Columns</span>
                <Input 
                  type="number" 
                  min={1} max={24}
                  value={bentoConfig.cols} 
                  onChange={(e) => updateConfig({cols: Math.min(24, Math.max(1, parseInt(e.target.value) || 1))})} 
                  className="font-mono text-xs font-bold py-1"
                />
              </div>
              <div className="flex-1">
                <span className="text-[8px] font-black uppercase text-slate-400 ml-1">Rows</span>
                <Input 
                  type="number" 
                  min={1} max={20}
                  value={bentoConfig.rows} 
                  onChange={(e) => updateConfig({rows: Math.min(20, Math.max(1, parseInt(e.target.value) || 1))})} 
                  className="font-mono text-xs font-bold py-1"
                />
              </div>
           </div>
        </div>

        <button onClick={() => setIsVisualEditorOpen(true)} className="w-full py-4 bg-[#264376] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-[#264376]/20 hover:brightness-110 transition-all flex items-center justify-center gap-3 active:scale-95">
          <MousePointer2 size={16} /> Open Visual Grid Designer
        </button>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4 relative group/field">
              <FieldToolbar 
                onIncrease={() => updateFontSize(idx, 1)} 
                onDecrease={() => updateFontSize(idx, -1)}
              />

              <div className="flex items-center gap-2 mb-2 border-b border-slate-50 pb-3">
                 <div className="flex bg-slate-100 rounded-lg p-0.5">
                    <button onClick={() => updateItem(idx, { type: 'metric' })} className={`p-1.5 rounded-md ${item.type === 'metric' ? 'bg-white shadow-sm text-[#264376]' : 'text-slate-400'}`} title="Metric"><Activity size={14}/></button>
                    <button onClick={() => updateItem(idx, { type: 'icon-text' })} className={`p-1.5 rounded-md ${item.type === 'icon-text' ? 'bg-white shadow-sm text-[#264376]' : 'text-slate-400'}`} title="Icon & Text"><Box size={14}/></button>
                    <button onClick={() => updateItem(idx, { type: 'image' })} className={`p-1.5 rounded-md ${item.type === 'image' ? 'bg-white shadow-sm text-[#264376]' : 'text-slate-400'}`} title="Image"><ImageIcon size={14}/></button>
                    <button onClick={() => updateItem(idx, { type: 'feature-list' })} className={`p-1.5 rounded-md ${item.type === 'feature-list' ? 'bg-white shadow-sm text-[#264376]' : 'text-slate-400'}`} title="Text Only"><Type size={14}/></button>
                 </div>
                 <span className="text-[8px] font-black text-slate-300 uppercase ml-2">{item.colSpan}x{item.rowSpan}</span>
                 {item.type === 'image' && item.image && (
                   <button 
                     onClick={() => setAdjustingIdx(adjustingIdx === idx ? null : idx)}
                     className={`p-1.5 rounded-lg ml-2 transition-all ${adjustingIdx === idx ? 'bg-amber-100 text-amber-600' : 'text-slate-300 hover:bg-slate-50'}`}
                   >
                     <SlidersHorizontal size={14} />
                   </button>
                 )}
                 <button onClick={() => removeItem(idx)} className="ml-auto p-1 text-slate-300 hover:text-red-500"><X size={14}/></button>
              </div>

              <div className="space-y-2">
                {item.type === 'metric' && (
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Value" value={item.value || ''} onChange={(e) => updateItem(idx, { value: e.target.value })} className="font-bold" />
                    <Input placeholder="Label" value={item.title || ''} onChange={(e) => updateItem(idx, { title: e.target.value })} />
                  </div>
                )}
                {item.type === 'image' && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <IconPicker value={item.image || ''} onChange={(v) => updateItem(idx, { image: v })} allowedTabs={['upload', 'map']} />
                      <Input placeholder="Label" value={item.title || ''} onChange={(e) => updateItem(idx, { title: e.target.value })} className="flex-1" />
                    </div>
                    {adjustingIdx === idx && (
                      <div className="p-3 bg-slate-50 rounded-xl space-y-4 border border-slate-100 animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Image Focus</span>
                          <button onClick={() => updateItem(idx, { imageConfig: { scale: 1, x: 0, y: 0 } })} className="text-[8px] font-black text-slate-400 hover:text-[#264376] uppercase flex items-center gap-1"><RotateCcw size={10}/> Reset</button>
                        </div>
                        <Slider label="Scale" value={item.imageConfig?.scale || 1} min={0.5} max={3} step={0.05} onChange={(v) => updateItem(idx, { imageConfig: { ...(item.imageConfig || {x:0,y:0}), scale: v } })} />
                        <Slider label="X Pos" value={item.imageConfig?.x || 0} min={-100} max={100} step={1} onChange={(v) => updateItem(idx, { imageConfig: { ...(item.imageConfig || {scale:1,y:0}), x: v } })} />
                        <Slider label="Y Pos" value={item.imageConfig?.y || 0} min={-100} max={100} step={1} onChange={(v) => updateItem(idx, { imageConfig: { ...(item.imageConfig || {scale:1,x:0}), y: v } })} />
                      </div>
                    )}
                  </div>
                )}
                {item.type === 'icon-text' && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <IconPicker value={item.icon || 'Box'} onChange={(v) => updateItem(idx, { icon: v })} />
                      <Input placeholder="Title" value={item.title || ''} onChange={(e) => updateItem(idx, { title: e.target.value })} className="flex-1 font-bold" />
                    </div>
                    <Input placeholder="Subtitle" value={item.subtitle || ''} onChange={(e) => updateItem(idx, { subtitle: e.target.value })} />
                  </div>
                )}
                {item.type === 'feature-list' && (
                  <div className="space-y-2">
                    <Input placeholder="Title" value={item.title || ''} onChange={(e) => updateItem(idx, { title: e.target.value })} className="font-bold" />
                    <Input placeholder="Subtitle" value={item.subtitle || ''} onChange={(e) => updateItem(idx, { subtitle: e.target.value })} />
                  </div>
                )}
                <div className="flex gap-1.5 pt-1">
                  {(['light', 'dark', 'accent', 'glass'] as const).map(t => (
                    <button key={t} onClick={() => updateItem(idx, { theme: t })} className={`w-3.5 h-3.5 rounded-full border transition-all ${item.theme === t ? 'ring-2 ring-[#264376] scale-110' : ''} ${t === 'light' ? 'bg-slate-100' : t === 'dark' ? 'bg-slate-900' : t === 'accent' ? 'bg-[#264376]' : 'bg-slate-300/50'}`} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Modal isOpen={isVisualEditorOpen} onClose={() => setIsVisualEditorOpen(false)} title="Bento Grid Designer" maxWidth="max-w-5xl" type="custom">
           <BentoVisualDesigner rows={bentoConfig.rows} cols={bentoConfig.cols} currentItems={items} onSave={(newItems) => { updateItems(newItems); setIsVisualEditorOpen(false); }} />
        </Modal>
      </div>
    </FieldWrapper>
  );
};

const BentoVisualDesigner = ({ rows, cols, currentItems, onSave }: { rows: number; cols: number; currentItems: BentoItem[]; onSave: (items: BentoItem[]) => void }) => {
  const [items, setItems] = useState<BentoItem[]>(currentItems);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());

  const isOccupied = (x: number, y: number) => {
    return items.some(item => x >= item.x && x < item.x + item.colSpan && y >= item.y && y < item.y + item.rowSpan);
  };

  const toggleCell = (x: number, y: number) => {
    if (isOccupied(x, y)) return;
    const key = `${x}-${y}`;
    const newSelected = new Set(selectedCells);
    if (newSelected.has(key)) newSelected.delete(key);
    else newSelected.add(key);
    setSelectedCells(newSelected);
  };

  const selectionInfo = useMemo(() => {
    if (selectedCells.size === 0) return null;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    selectedCells.forEach(key => {
      const [x, y] = key.split('-').map(Number);
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    });
    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    const isValid = selectedCells.size === width * height;
    return { x: minX, y: minY, w: width, h: height, isValid };
  }, [selectedCells]);

  const createItem = (x: number, y: number, w: number, h: number) => {
    const newItem: BentoItem = {
      id: `bento-${Date.now()}`,
      type: 'metric',
      x, y, colSpan: w, rowSpan: h,
      theme: 'light',
      title: 'New Item',
      fontSize: 1 
    };
    setItems(prev => [...prev, newItem]);
    setSelectedCells(new Set());
  };

  const handleDoubleClickOnCell = (x: number, y: number) => {
    // 1. 如果有合法选择，合并选择
    if (selectionInfo?.isValid) {
      createItem(selectionInfo.x, selectionInfo.y, selectionInfo.w, selectionInfo.h);
    } 
    // 2. 如果没有选择（由于双击触发了两次 toggle 导致 state 为空），直接在此处创建 1x1
    else {
      createItem(x, y, 1, 1);
    }
  };

  return (
    <div className="space-y-8 p-6" onContextMenu={(e) => { e.preventDefault(); setSelectedCells(new Set()); }}>
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">Step 1: Paint your layout</h4>
          <p className="text-xs text-slate-400 font-medium text-slate-400">
            Click to select • <span className="text-blue-600 font-bold underline">Double-Click</span> to create
          </p>
        </div>
        <div className="flex gap-3">
          <button disabled={!selectionInfo?.isValid} onClick={() => selectionInfo && createItem(selectionInfo.x, selectionInfo.y, selectionInfo.w, selectionInfo.h)} className={`px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${selectionInfo?.isValid ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>
            Create Selection
          </button>
          <button onClick={() => onSave(items)} className="px-8 py-2.5 bg-[#264376] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-[#264376]/20 transition-all hover:brightness-110">Save & Exit</button>
        </div>
      </div>

      <div 
        className="grid gap-2.5 bg-slate-100 p-4 rounded-[2.5rem] aspect-[16/10] relative select-none cursor-crosshair overflow-hidden" 
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
      >
        {Array.from({ length: rows * cols }).map((_, i) => {
          const x = (i % cols) + 1;
          const y = Math.floor(i / cols) + 1;
          const isSelected = selectedCells.has(`${x}-${y}`);
          const occupied = isOccupied(x, y);
          return (
            <div 
              key={`bg-${i}`} 
              onClick={() => toggleCell(x, y)}
              onDoubleClick={() => handleDoubleClickOnCell(x, y)}
              style={{ gridColumn: x, gridRow: y }}
              className={`rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center
                ${occupied ? 'bg-slate-200/50 border-transparent opacity-0 pointer-events-none' : 
                  isSelected ? 'bg-blue-500 border-blue-600 shadow-inner' : 'bg-white border-slate-200 hover:border-blue-300'}`}
            >
              {isSelected && <Check size={12} className="text-white" />}
            </div>
          );
        })}
        {items.map((item) => (
          <div 
            key={item.id} 
            onDoubleClick={(e) => { e.stopPropagation(); setItems(items.filter(i => i.id !== item.id)); }}
            className="rounded-xl bg-[#264376] text-white flex flex-col items-center justify-center border-2 border-white shadow-lg animate-in zoom-in-95 duration-200 cursor-help group transition-transform active:scale-95" 
            style={{ gridColumn: `${item.x} / span ${item.colSpan}`, gridRow: `${item.y} / span ${item.rowSpan}`, zIndex: 10 }}
          >
            <span className="text-[10px] font-black uppercase opacity-60 leading-none">{item.colSpan}x{item.rowSpan}</span>
            <X size={12} className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </div>
  );
};