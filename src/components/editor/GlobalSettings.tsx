import React, { useState } from 'react';
import { PageData, CustomFont, CounterStyle, PrintSettings, OrientationType, TypographySettings } from '../../types';
import { ImageIcon, X, Settings, Hash, AlignLeft, Type, CircleDot, Image as ImageControl, Eye, EyeOff, Printer, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Monitor, Smartphone, Square, Scissors, Layout, Type as TypeIcon, Layers, Languages, MousePointer2 } from 'lucide-react';
import { Label, Input, Slider, Section } from '../ui/Base';
import FontManager from '../FontManager';
import { FontSelect } from '../ui/FontSelect';

interface GlobalSettingsProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  customFonts: CustomFont[];
  setCustomFonts: (fonts: CustomFont[]) => void;
  imageQuality: number;
  setImageQuality: (q: number) => void;
  minimalCounter: boolean;
  setMinimalCounter: (m: boolean) => void;
  counterColor: string;
  setCounterColor: (c: string) => void;
  printSettings: PrintSettings;
  setPrintSettings: (s: PrintSettings) => void;
  typography: TypographySettings;
  setTypography: (t: TypographySettings) => void;
}

const GlobalSettings: React.FC<GlobalSettingsProps> = ({ 
  page, onUpdate, customFonts, setCustomFonts, imageQuality, setImageQuality,
  minimalCounter, setMinimalCounter, counterColor, setCounterColor,
  typography,
  setTypography
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'fonts' | 'print'>('general');

  // 核心修复：防止 typography 未定义导致崩溃
  if (!typography) return <div className="p-20 text-center animate-pulse text-slate-300 font-black uppercase">Initializing Engine...</div>;

  const handleChange = (field: keyof PageData, value: any) => {
    onUpdate({ ...page, [field]: value });
  };

  const updatePrintSetting = (field: keyof PrintSettings, value: any) => {
    setPrintSettings({ ...printSettings, [field]: value });
  };

  const updateTypography = (updates: Partial<TypographySettings>) => {
    setTypography({ ...typography, ...updates });
  };

  const updateFieldOverride = (field: string, font: string) => {
    const newOverrides = { ...typography.fieldOverrides };
    if (!font) delete newOverrides[field];
    else newOverrides[field] = font;
    updateTypography({ fieldOverrides: newOverrides });
  };

  const SideButton = ({ ori, side, type, active, icon: Icon }: any) => (
    <button onClick={() => {
      const newConfigs = { ...printSettings.configs };
      newConfigs[ori] = { ...newConfigs[ori], [type]: side };
      setPrintSettings({ ...printSettings, configs: newConfigs });
    }} className={`p-2 rounded-lg border transition-all ${active ? 'bg-[#264376] border-[#264376] text-white shadow-md' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}><Icon size={12} /></button>
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
        {[ {id: 'general', icon: Layout, label: 'Style & Brand'}, {id: 'fonts', icon: TypeIcon, label: 'Typography'}, {id: 'print', icon: Printer, label: 'Print & Binding'} ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === t.id ? 'bg-white text-[#264376] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><t.icon size={14} /> {t.label}</button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500 grid grid-cols-2 gap-x-12">
          <Section><Label icon={Settings}>Global Visual Style</Label>
            <div className="space-y-8">
                <div className="space-y-2"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Background Pattern</p><div className="grid grid-cols-5 gap-2">{[ { id: 'none', label: 'None' }, { id: 'grid', label: 'Grid' }, { id: 'dots', label: 'Dots' }, { id: 'diagonal', label: 'Lines' }, { id: 'cross', label: 'Plus' } ].map(p => (<button key={p.id} onClick={() => handleChange('backgroundPattern', p.id)} className={`px-1 py-2 flex flex-col items-center justify-center rounded-lg border transition-all ${(page.backgroundPattern || 'none') === p.id ? 'bg-[#264376] border-[#264376] text-white shadow-md shadow-#264376/20' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}><span className="text-[8px] font-black uppercase tracking-tighter">{p.label}</span></button>))}</div></div>
                <div className="space-y-4 pt-4 border-t border-slate-50"><div className="flex items-center justify-between"><div className="flex items-center gap-2 text-slate-900"><ImageControl size={12} className="text-[#264376]" /><span className="text-[9px] font-black uppercase tracking-widest">WebP Quality</span></div><span className="text-[10px] font-mono font-bold text-[#264376] bg-[#264376]/5 px-2 py-0.5 rounded">{Math.round(imageQuality * 100)}%</span></div><Slider label="Resolution vs Volume" value={imageQuality} min={0.1} max={1.0} step={0.01} onChange={setImageQuality} /></div>
            </div>
          </Section>
          <Section><Label icon={ImageIcon}>Global Branding</Label>
            <div className="space-y-4"><div className="flex items-center gap-2"><Input type="text" placeholder="Logo URL..." value={page.logo || ''} onChange={(e) => handleChange('logo', e.target.value)} /><label className="cursor-pointer bg-slate-50 p-2.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"><ImageIcon size={18} /><input type="file" className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => handleChange('logo', reader.result as string); reader.readAsDataURL(file); } }} /></label>{page.logo && <button onClick={() => handleChange('logo', '')} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><X size={16} /></button>}</div>{page.logo && (<Slider label="Logo Size" value={page.logoSize || 80} min={20} max={400} step={2} onChange={(v) => handleChange('logoSize', v)} />)}</div>
          </Section>
          <Section className="col-span-2 pt-6 border-t border-slate-100"><Label icon={Settings}>Global Metadata Style</Label>
            <div className="grid grid-cols-2 gap-12">
                <div className="space-y-4"><div className="flex items-center justify-between"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Counter Style & Color</p><button onClick={() => handleChange('minimalCounter', !minimalCounter)} className={`flex items-center gap-2 px-2 py-1 rounded-md transition-all ${minimalCounter ? 'bg-[#264376] text-white' : 'bg-slate-100 text-slate-400 hover:text-slate-600'}`}>{minimalCounter ? <EyeOff size={10} /> : <Eye size={10} />}<span className="text-[8px] font-black uppercase tracking-tighter">Minimal UI</span></button></div><div className="grid grid-cols-4 gap-2">{[ { id: 'number', icon: Hash }, { id: 'alpha', icon: AlignLeft }, { id: 'roman', icon: Type }, { id: 'dots', icon: CircleDot } ].map(s => (<button key={s.id} onClick={() => handleChange('counterStyle', s.id as CounterStyle)} className={`p-2 flex items-center justify-center rounded-lg border transition-all ${(page.counterStyle || 'number') === s.id ? 'bg-[#264376] border-[#264376] text-white shadow-md shadow-#264376/20' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`} title={s.id.toUpperCase()}><s.icon size={14} /></button>))}</div><div className="flex gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2"><div className="relative overflow-hidden w-8 h-8 rounded-lg shadow-sm ring-1 ring-slate-200 shrink-0"><input type="color" className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer p-0 border-0" value={page.counterColor || '#64748b'} onChange={(e) => handleChange('counterColor', e.target.value)} /></div><div className="flex-1 text-[10px] font-mono font-bold text-slate-500 uppercase">{page.counterColor || '#64748b'}</div></div></div>
                <div className="space-y-4"><span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 block">Footer Metadata (Global)</span><Input type="text" className="text-sm py-3" placeholder="Confidential / Project Title" value={page.footer || ''} onChange={(e) => handleChange('footer', e.target.value)} /><p className="text-[10px] text-slate-400 italic">This text appears at the bottom of every page.</p></div>
            </div>
          </Section>
        </div>
      )}

      {activeTab === 'fonts' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* 粗略调整 */}
          <Section>
            <Label icon={Languages}>Rough Adjustment (Default Grouping)</Label>
            <p className="text-[11px] text-slate-400 mb-6 -mt-2">Define base fonts for different character sets. These apply unless overridden below.</p>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#264376]">Latin (English/Numbers)</span>
                <FontSelect value={typography.defaultLatin} onChange={(v) => updateTypography({defaultLatin: v})} customFonts={customFonts} />
              </div>
              <div className="space-y-3 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#264376]">CJK (Chinese/Japanese/Korean)</span>
                <FontSelect value={typography.defaultCJK} onChange={(v) => updateTypography({defaultCJK: v})} customFonts={customFonts} />
              </div>
            </div>
          </Section>

          {/* 精细调整 */}
          <Section className="pt-6 border-t border-slate-100">
            <Label icon={MousePointer2}>Fine-grained Adjustment (Field Overrides)</Label>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {[
                {id: 'title', label: 'Main Headlines'},
                {id: 'subtitle', label: 'Sub-descriptions'},
                {id: 'paragraph', label: 'Narrative Essays'},
                {id: 'bullets', label: 'List Items'},
                {id: 'imageLabel', label: 'Image Labels'},
                {id: 'metrics', label: 'Data Metrics'},
                {id: 'footer', label: 'Footer Text'}
              ].map(f => (
                <div key={f.id} className="p-4 bg-white rounded-2xl border border-slate-100 space-y-2 shadow-sm">
                  <span className="text-[9px] font-black uppercase text-slate-400">{f.label}</span>
                  <FontSelect 
                    value={typography.fieldOverrides[f.id] || ''} 
                    onChange={(v) => updateFieldOverride(f.id, v)} 
                    customFonts={customFonts} 
                    compact 
                  />
                </div>
              ))}
            </div>
          </Section>

          <Section className="pt-6 border-t border-slate-100"><Label icon={Layers}>Custom Font Assets</Label><FontManager fonts={customFonts} onFontsChange={setCustomFonts} /></Section>
        </div>
      )}

      {activeTab === 'print' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
          <Section>
            <div className="flex items-center justify-between mb-6"><Label icon={Printer} className="mb-0">Print & Binding Engine</Label><button onClick={() => updatePrintSetting('enabled', !printSettings.enabled)} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${printSettings.enabled ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-100 text-slate-400'}`}>{printSettings.enabled ? <Eye size={12} /> : <EyeOff size={12} />}<span className="text-[9px] font-black uppercase tracking-widest">{printSettings.enabled ? 'System Active' : 'Disabled'}</span></button></div>
            <div className={`space-y-8 transition-all duration-500 ${printSettings.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale'}`}>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6"><div className="grid grid-cols-2 gap-4"><div className="space-y-1"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Paper Width (mm)</span><Input type="number" value={printSettings.widthMm} onChange={(e) => updatePrintSetting('widthMm', parseFloat(e.target.value))} className="font-mono" /></div><div className="space-y-1"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Paper Height (mm)</span><Input type="number" value={printSettings.heightMm} onChange={(e) => updatePrintSetting('heightMm', parseFloat(e.target.value))} className="font-mono" /></div></div><div className="space-y-1"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Gutter Depth (mm)</span><Input type="number" value={printSettings.gutterMm} onChange={(e) => updatePrintSetting('gutterMm', parseFloat(e.target.value))} className="font-mono text-amber-600 font-bold" /></div><div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100"><p className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-1">Viewport Controls</p><div className="grid grid-cols-3 gap-2"><button onClick={() => updatePrintSetting('showGutterShadow', !printSettings.showGutterShadow)} className={`flex flex-col items-center gap-2 p-2 rounded-xl border transition-all ${printSettings.showGutterShadow ? 'bg-white border-[#264376] text-[#264376] shadow-sm' : 'bg-transparent border-transparent text-slate-400'}`}><div className="p-1.5 bg-slate-100 rounded-lg">{printSettings.showGutterShadow ? <Eye size={12} /> : <EyeOff size={12} />}</div><span className="text-[8px] font-bold uppercase">Gutter</span></button><button onClick={() => updatePrintSetting('showTrimShadow', !printSettings.showTrimShadow)} className={`flex flex-col items-center gap-2 p-2 rounded-xl border transition-all ${printSettings.showTrimShadow ? 'bg-white border-[#264376] text-[#264376] shadow-sm' : 'bg-transparent border-transparent text-slate-400'}`}><div className="p-1.5 bg-slate-100 rounded-lg">{printSettings.showTrimShadow ? <Eye size={12} /> : <EyeOff size={12} />}</div><span className="text-[8px] font-bold uppercase">Trim</span></button><button onClick={() => updatePrintSetting('showContentFrame', !printSettings.showContentFrame)} className={`flex flex-col items-center gap-2 p-2 rounded-xl border transition-all ${printSettings.showContentFrame ? 'bg-white border-[#264376] text-[#264376] shadow-sm' : 'bg-transparent border-transparent text-slate-400'}`}><div className="p-1.5 bg-slate-100 rounded-lg">{printSettings.showContentFrame ? <Square size={12} /> : <Scissors size={12} />}</div><span className="text-[8px] font-bold uppercase">Frame</span></button></div></div></div>
                <div className="space-y-4"><p className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Binding Strategy</p>{[ { id: 'landscape', label: 'Landscape', icon: Monitor }, { id: 'portrait', label: 'Portrait', icon: Smartphone }, { id: 'square', label: 'Square', icon: Square } ].map(ori => { const config = (printSettings.configs && printSettings.configs[ori.id as OrientationType]) || { bindingSide: 'left', trimSide: 'bottom' }; return (<div key={ori.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100"><div className="flex items-center gap-2 mb-3"><ori.icon size={12} className="text-slate-400" /><span className="text-[10px] font-bold text-slate-700">{ori.label}</span></div><div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><span className="text-[8px] font-black text-slate-400 uppercase block">Binding</span><div className="flex gap-1"><SideButton ori={ori.id} side="left" type="bindingSide" icon={ArrowLeft} active={config.bindingSide === 'left'} /><SideButton ori={ori.id} side="right" type="bindingSide" icon={ArrowRight} active={config.bindingSide === 'right'} /><SideButton ori={ori.id} side="top" type="bindingSide" icon={ArrowUp} active={config.bindingSide === 'top'} /><SideButton ori={ori.id} side="bottom" type="bindingSide" icon={ArrowDown} active={config.bindingSide === 'bottom'} /></div></div><div className="space-y-1.5"><span className="text-[8px] font-black text-slate-400 uppercase block">Cut</span><div className="flex gap-1"><SideButton ori={ori.id} side="left" type="trimSide" icon={ArrowLeft} active={config.trimSide === 'left'} /><SideButton ori={ori.id} side="right" type="trimSide" icon={ArrowRight} active={config.trimSide === 'right'} /><SideButton ori={ori.id} side="top" type="trimSide" icon={ArrowUp} active={config.trimSide === 'top'} /><SideButton ori={ori.id} side="bottom" type="trimSide" icon={ArrowDown} active={config.trimSide === 'bottom'} /></div></div></div></div>); })}</div>
              </div>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
};

export default GlobalSettings;