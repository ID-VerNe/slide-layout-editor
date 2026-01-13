import React, { useRef, useState } from 'react';
import { useFreeformStore } from '../../store/freeformStore';
import { FreeformItem, FreeformConfig } from '../../types/freeform.types';
import { CustomFont, PageData } from '../../types';
import { Section, Label, Slider, Input, TextArea } from '../ui/Base';
import { FontSelect } from '../ui/FontSelect';
import IconPicker from '../ui/IconPicker';
import { saveAsset } from '../../utils/db';
import { useAssetUrl } from '../../hooks/useAssetUrl';
import { LAYOUT_CONFIG } from '../../constants/layout';
import { 
  Layout, 
  Grid, 
  Move, 
  Type, 
  Image as ImageIcon, 
  Palette, 
  Maximize, 
  Upload, 
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Italic,
  Type as TypeIcon,
  SlidersHorizontal,
  RotateCcw,
  // 修正图标导入：确保语义与视觉一致
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  StretchHorizontal,
  StretchVertical
} from 'lucide-react';

interface FreeformPropertiesPanelProps {
  page: PageData;
  items: FreeformItem[];
  onUpdateItem: (id: string, updates: Partial<FreeformItem>) => void;
  config: FreeformConfig;
  onUpdateConfig: (updates: Partial<FreeformConfig>) => void;
  customFonts: CustomFont[];
  onDeleteItem?: (id: string) => void;
}

const AssetPreviewSmall = ({ source }: { source?: string }) => {
  const { url } = useAssetUrl(source);
  return (
    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#264376] transition-colors shrink-0 overflow-hidden">
      {url ? <img src={url} className="w-full h-full object-cover" /> : <ImageIcon size={20} />}
    </div>
  );
};

export const FreeformPropertiesPanel: React.FC<FreeformPropertiesPanelProps> = ({
  page,
  items,
  onUpdateItem,
  config,
  onUpdateConfig,
  customFonts,
  onDeleteItem,
}) => {
  const selectedItemId = useFreeformStore((state) => state.selectedItemId);
  const selectedItem = items.find((i) => i.id === selectedItemId);
  const [showImageAdjust, setShowImageAdjust] = useState(false);

  const canvasDims = LAYOUT_CONFIG[page.aspectRatio || '16:9'];
  const CANVAS_W = canvasDims.width;
  const CANVAS_H = canvasDims.height;

  const alignElement = (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (!selectedItem) return;
    switch(type) {
      case 'left': onUpdateItem(selectedItem.id, { x: 0 }); break;
      case 'center': onUpdateItem(selectedItem.id, { x: (CANVAS_W - selectedItem.width) / 2 }); break;
      case 'right': onUpdateItem(selectedItem.id, { x: CANVAS_W - selectedItem.width }); break;
      case 'top': onUpdateItem(selectedItem.id, { y: 0 }); break;
      case 'middle': onUpdateItem(selectedItem.id, { y: (CANVAS_H - selectedItem.height) / 2 }); break;
      case 'bottom': onUpdateItem(selectedItem.id, { y: CANVAS_H - selectedItem.height }); break;
    }
  };

  const fitToCanvas = (direction: 'width' | 'height') => {
    if (!selectedItem) return;
    if (direction === 'width') {
      onUpdateItem(selectedItem.id, { x: 0, width: CANVAS_W });
    } else {
      onUpdateItem(selectedItem.id, { y: 0, height: CANVAS_H });
    }
  };

  const handleImageChange = async (val: string) => {
    if (!selectedItem) return;
    const resetConfig = { scale: 1, x: 0, y: 0 };
    if (val.startsWith('data:')) {
      if ((window as any).electronAPI) {
        try {
          const filename = `freeform_upload_${Date.now()}.png`; 
          const result = await (window as any).electronAPI.uploadAsset(filename, val);
          if (result.success && result.url) {
            onUpdateItem(selectedItem.id, { content: { ...selectedItem.content, image: result.url, imageConfig: resetConfig } });
          }
        } catch (e) { console.error('Native upload error:', e); }
      } else {
        const assetId = await saveAsset(val);
        onUpdateItem(selectedItem.id, { content: { ...selectedItem.content, image: assetId, imageConfig: resetConfig } });
      }
    } else {
      onUpdateItem(selectedItem.id, { content: { ...selectedItem.content, image: val, imageConfig: resetConfig } });
    }
  };

  const handleImageConfigChange = (key: 'scale' | 'x' | 'y', val: number) => {
    if (!selectedItem) return;
    const currentConfig = selectedItem.content?.imageConfig || { scale: 1, x: 0, y: 0 };
    onUpdateItem(selectedItem.id, { content: { ...selectedItem.content, imageConfig: { ...currentConfig, [key]: val } } });
  };

  const resetImageConfig = () => {
    if (!selectedItem) return;
    onUpdateItem(selectedItem.id, { content: { ...selectedItem.content, imageConfig: { scale: 1, x: 0, y: 0 } } });
  };

  const handleDelete = () => {
    if (selectedItemId && onDeleteItem) { onDeleteItem(selectedItemId); }
  };

  const renderLayoutSection = () => (
    <Section>
      <Label icon={Move}>Layout & Transform</Label>
      
      {/* 修正后的快速对齐工具栏：图标与动作精准对应 */}
      <div className="flex gap-1 mb-4 bg-slate-50 p-1 rounded-lg border border-slate-100">
        {/* Horizontal Align (Vertical Bars) */}
        <AlignButton icon={AlignStartVertical} onClick={() => alignElement('left')} label="Align Left" />
        <AlignButton icon={AlignCenterVertical} onClick={() => alignElement('center')} label="Align Center" />
        <AlignButton icon={AlignEndVertical} onClick={() => alignElement('right')} label="Align Right" />
        <div className="w-px bg-slate-200 my-1 mx-1" />
        {/* Vertical Align (Horizontal Bars) */}
        <AlignButton icon={AlignStartHorizontal} onClick={() => alignElement('top')} label="Align Top" />
        <AlignButton icon={AlignCenterHorizontal} onClick={() => alignElement('middle')} label="Align Middle" />
        <AlignButton icon={AlignEndHorizontal} onClick={() => alignElement('bottom')} label="Align Bottom" />
      </div>

      <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 items-start">
        {/* Position Column */}
        <div className="space-y-1">
           {/* 核心修复：添加 h-6 并使用 items-center 确保与右侧标题行对齐 */}
           <div className="h-6 flex items-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Position</span>
           </div>
           <div className="flex gap-2">
             <Input type="number" value={Math.round(selectedItem!.x)} onChange={(e) => onUpdateItem(selectedItem!.id, { x: Number(e.target.value) })} className="bg-white !text-[10px] !py-1" placeholder="X" />
             <Input type="number" value={Math.round(selectedItem!.y)} onChange={(e) => onUpdateItem(selectedItem!.id, { y: Number(e.target.value) })} className="bg-white !text-[10px] !py-1" placeholder="Y" />
           </div>
        </div>

        {/* Size Column */}
        <div className="space-y-1">
           <div className="h-6 flex justify-between items-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Size</span>
              <div className="flex gap-1">
                 <button onClick={() => fitToCanvas('width')} className="p-0.5 hover:text-[#264376] text-slate-300 transition-colors" title="Fit Width"><StretchHorizontal size={10}/></button>
                 <button onClick={() => fitToCanvas('height')} className="p-0.5 hover:text-[#264376] text-slate-300 transition-colors" title="Fit Height"><StretchVertical size={10}/></button>
              </div>
           </div>
           <div className="flex gap-2">
             <Input type="number" value={Math.round(selectedItem!.width)} onChange={(e) => onUpdateItem(selectedItem!.id, { width: Number(e.target.value) })} className="bg-white !text-[10px] !py-1" placeholder="W" />
             <Input type="number" value={Math.round(selectedItem!.height)} onChange={(e) => onUpdateItem(selectedItem!.id, { height: Number(e.target.value) })} className="bg-white !text-[10px] !py-1" placeholder="H" />
           </div>
        </div>
      </div>
      
      <div className="space-y-2 mt-4">
        <Slider label="Rotation" value={selectedItem!.rotation || 0} min={-180} max={180} step={1} onChange={(v) => onUpdateItem(selectedItem!.id, { rotation: v })} unit="°" />
        <Slider label="Opacity" value={selectedItem!.opacity ?? 1} min={0} max={1} step={0.01} onChange={(v) => onUpdateItem(selectedItem!.id, { opacity: v })} />
      </div>
    </Section>
  );

  const renderStyleSection = () => (
    <Section>
      <Label icon={Palette}>Appearance</Label>
      <div className="flex gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative overflow-hidden w-10 h-10 rounded-lg shadow-inner ring-1 ring-slate-200 shrink-0">
          <input type="color" className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0" value={selectedItem!.backgroundColor || '#ffffff'} onChange={(e) => onUpdateItem(selectedItem!.id, { backgroundColor: e.target.value })} />
        </div>
        <div className="flex-1">
          <Input type="text" className="font-mono text-xs uppercase bg-white border-slate-200" value={selectedItem!.backgroundColor || ''} onChange={(e) => onUpdateItem(selectedItem!.id, { backgroundColor: e.target.value })} placeholder="#FFFFFF" />
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        <Slider label="Border Width" value={selectedItem!.borderWidth || 0} min={0} max={20} step={1} onChange={(v) => onUpdateItem(selectedItem!.id, { borderWidth: v })} />
        <Slider label="Corner Radius" value={selectedItem!.borderRadius || 0} min={0} max={500} step={1} onChange={(v) => onUpdateItem(selectedItem!.id, { borderRadius: v })} />
        {selectedItem!.borderWidth ? (
             <div className="flex gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm">
             <div className="relative overflow-hidden w-8 h-8 rounded-lg shadow-inner ring-1 ring-slate-200 shrink-0">
               <input type="color" className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer p-0 border-0" value={selectedItem!.borderColor || '#000000'} onChange={(e) => onUpdateItem(selectedItem!.id, { borderColor: e.target.value })} />
             </div>
             <div className="flex-1 text-xs font-mono text-slate-500">Border Color</div>
           </div>
        ) : null}
      </div>
    </Section>
  );

  const renderTextSection = () => {
    if (selectedItem?.type !== 'text') return null;
    return (
      <Section>
        <Label icon={Type}>Typography</Label>
        <TextArea rows={3} value={selectedItem.content?.text || ''} onChange={(e) => onUpdateItem(selectedItem.id, { content: { ...selectedItem.content, text: e.target.value } })} placeholder="Enter text..." />
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
          <FontSelect value={selectedItem.typography?.fontFamily || ''} onChange={(font) => onUpdateItem(selectedItem.id, { typography: { ...selectedItem.typography, fontFamily: font } })} customFonts={customFonts} />
          <div className="grid grid-cols-2 gap-2">
             <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                <button onClick={() => onUpdateItem(selectedItem.id, { typography: { ...selectedItem.typography, fontStyle: selectedItem.typography?.fontStyle === 'italic' ? 'normal' : 'italic' } })} className={`flex-1 flex items-center justify-center rounded hover:bg-slate-50 ${selectedItem.typography?.fontStyle === 'italic' ? 'text-[#264376] bg-slate-50' : 'text-slate-400'}`}><Italic size={14} /></button>
                <div className="w-px bg-slate-100 my-1"/><button onClick={() => onUpdateItem(selectedItem.id, { typography: { ...selectedItem.typography, textTransform: selectedItem.typography?.textTransform === 'uppercase' ? 'none' : 'uppercase' } })} className={`flex-1 flex items-center justify-center rounded hover:bg-slate-50 ${selectedItem.typography?.textTransform === 'uppercase' ? 'text-[#264376] bg-slate-50' : 'text-slate-400'}`}><TypeIcon size={14} /></button>
             </div>
             <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                {[{ align: 'left', icon: AlignLeft }, { align: 'center', icon: AlignCenter }, { align: 'right', icon: AlignRight }, { align: 'justify', icon: AlignJustify }].map(({ align, icon: Icon }) => (
                  <button key={align} onClick={() => onUpdateItem(selectedItem.id, { typography: { ...selectedItem.typography, textAlign: align as any } })} className={`flex-1 flex items-center justify-center rounded hover:bg-slate-50 ${selectedItem.typography?.textAlign === align ? 'text-[#264376] bg-slate-50' : 'text-slate-400'}`}><Icon size={14} /></button>
                ))}
             </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <Slider label="Size" value={selectedItem.typography?.fontSize || 16} min={8} max={200} step={1} onChange={(v) => onUpdateItem(selectedItem.id, { typography: { ...selectedItem.typography, fontSize: v } })} />
            </div>
            <div className="w-10 h-10 relative overflow-hidden rounded-lg shadow-sm ring-1 ring-slate-200 shrink-0">
               <input type="color" className="absolute -top-2 -left-2 w-14 h-14 cursor-pointer p-0 border-0" value={selectedItem.typography?.color || '#000000'} onChange={(e) => onUpdateItem(selectedItem.id, { typography: { ...selectedItem.typography, color: e.target.value } })} />
            </div>
          </div>
          <Slider label="Line Height" value={selectedItem.typography?.lineHeight || 1.5} min={0.8} max={3} step={0.1} onChange={(v) => onUpdateItem(selectedItem.id, { typography: { ...selectedItem.typography, lineHeight: v } })} />
          <Slider label="Letter Spacing" value={selectedItem.typography?.letterSpacing || 0} min={-2} max={10} step={0.1} onChange={(v) => onUpdateItem(selectedItem.id, { typography: { ...selectedItem.typography, letterSpacing: v } })} unit="px" />
        </div>
      </Section>
    );
  };

  const renderImageSection = () => {
    if (selectedItem?.type !== 'image') return null;
    const imgConfig = selectedItem.content?.imageConfig || { scale: 1, x: 0, y: 0 };
    return (
      <Section>
         <div className="flex justify-between items-center mb-2">
            <Label icon={ImageIcon} className="mb-0">Visual Asset</Label>
            {selectedItem.content?.image && (
              <button onClick={() => setShowImageAdjust(!showImageAdjust)} className={`text-[10px] font-black uppercase flex items-center gap-1 transition-colors ${showImageAdjust ? 'text-[#264376]' : 'text-slate-400 hover:text-slate-600'}`}><SlidersHorizontal size={12} /> {showImageAdjust ? 'Done' : 'Adjust'}</button>
            )}
         </div>
         <IconPicker value={selectedItem.content?.image || ''} onChange={handleImageChange} allowedTabs={['upload', 'icons']} className="w-full" trigger={
              <button className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-[#264376] transition-all shadow-sm group">
                <div className="flex items-center gap-3 overflow-hidden"><AssetPreviewSmall source={selectedItem.content?.image} />
                  <div className="text-left min-w-0"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selected Image</p><p className="text-xs font-bold text-slate-700 truncate">{selectedItem.content?.image ? 'Change Source' : 'Browse Uploads or URL'}</p></div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50 text-slate-400 group-hover:text-[#264376] transition-colors"><ImageIcon size={16} /></div>
              </button>
            } />
         {showImageAdjust && selectedItem.content?.image && (
           <div className="mt-4 p-4 bg-slate-50 rounded-2xl space-y-5 border border-slate-100 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-1"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Manual Positioning</span><button onClick={resetImageConfig} className="text-[9px] font-black text-slate-400 hover:text-[#264376] uppercase flex items-center gap-1"><RotateCcw size={10} /> Reset</button></div>
              <Slider label="Scale / Zoom" value={imgConfig.scale || 1} min={0.5} max={3} step={0.05} onChange={(v) => handleImageConfigChange('scale', v)} />
              <Slider label="Move Horiz." value={imgConfig.x || 0} min={-100} max={100} step={1} onChange={(v) => handleImageConfigChange('x', v)} />
              <Slider label="Move Vert." value={imgConfig.y || 0} min={-100} max={100} step={1} onChange={(v) => handleImageConfigChange('y', v)} />
           </div>
         )}
      </Section>
    );
  };

  if (!selectedItem) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
        <Section>
          <Label icon={Grid}>Canvas Settings</Label>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
             <label className="flex items-center justify-between text-sm font-medium text-slate-700 cursor-pointer"><span>Show Grid Overlay</span><input type="checkbox" checked={config.showGridOverlay} onChange={(e) => onUpdateConfig({ showGridOverlay: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-[#264376] focus:ring-[#264376]" /></label>
            <label className="flex items-center justify-between text-sm font-medium text-slate-700 cursor-pointer"><span>Snap to Grid</span><input type="checkbox" checked={config.snapToGrid} onChange={(e) => onUpdateConfig({ snapToGrid: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-[#264376] focus:ring-[#264376]" /></label>
            <label className="flex items-center justify-between text-sm font-medium text-slate-700 cursor-pointer"><span>Smart Guides</span><input type="checkbox" checked={config.showAlignmentGuides} onChange={(e) => onUpdateConfig({ showAlignmentGuides: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-[#264376] focus:ring-[#264376]" /></label>
            <div className="pt-2 border-t border-slate-200"><Slider label="Grid Size" value={config.gridSize} min={10} max={100} step={5} onChange={(v) => onUpdateConfig({ gridSize: v })} unit="px" /></div>
          </div>
        </Section>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 pb-20">
      {renderLayoutSection()}
      {renderTextSection()}
      {renderImageSection()}
      {renderStyleSection()}
      <div className="pt-8 border-t border-slate-100"><button onClick={handleDelete} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={16} /><span className="text-xs font-bold uppercase tracking-widest">Delete Element</span></button></div>
    </div>
  );
};

const AlignButton = ({ icon: Icon, onClick, label }: { icon: any, onClick: () => void, label: string }) => (
  <button onClick={onClick} className="flex-1 flex items-center justify-center p-1.5 rounded hover:bg-white hover:shadow-sm text-slate-400 hover:text-[#264376] transition-all" title={label}><Icon size={14} /></button>
);
