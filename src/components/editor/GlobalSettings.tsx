import React, { useState } from 'react';
import { PageData, CustomFont, CounterStyle, PrintSettings, OrientationType, ProjectTheme } from '../../types';
import { ImageIcon, X, Settings, Hash, AlignLeft, Type, CircleDot, Image as ImageControl, Eye, EyeOff, Printer, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Monitor, Smartphone, Square, Scissors, Palette, RefreshCcw, Type as TypeIcon, UploadCloud, Layers } from 'lucide-react';
import { Label, Input, Slider, Section } from '../ui/Base';
import { FontSelect } from '../ui/FontSelect';
import FontManager from '../FontManager';
import { motion, AnimatePresence } from 'framer-motion';

interface GlobalSettingsProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  customFonts: CustomFont[];
  setCustomFonts: (fonts: CustomFont[]) => void;
  theme: ProjectTheme;
  setTheme: (t: Partial<ProjectTheme>, applyToAll?: boolean) => void;
  imageQuality: number;
  setImageQuality: (q: number) => void;
  minimalCounter: boolean;
  setMinimalCounter: (m: boolean) => void;
  counterColor: string;
  setCounterColor: (c: string) => void;
  printSettings: PrintSettings;
  setPrintSettings: (s: PrintSettings) => void;
}

const ColorToken = ({ label, value, field, theme, onThemeChange }: { label: string, value: string, field: keyof ProjectTheme['colors'], theme: ProjectTheme, onThemeChange: (t: Partial<ProjectTheme>) => void }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</span>
    <div className="flex gap-2 items-center bg-white p-1.5 rounded-xl border border-slate-100 shadow-sm transition-all hover:border-[#264376]/30">
      <div className="relative w-6 h-6 rounded-lg overflow-hidden shrink-0 border border-slate-100 shadow-inner">
        <input type="color" className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer p-0 border-0" value={value || '#000000'} onInput={(e) => onThemeChange({ colors: { ...theme.colors, [field]: (e.target as HTMLInputElement).value } })} />
      </div>
      <Input className="flex-1 !py-0.5 !px-1 font-mono !text-[10px] border-none focus:ring-0 uppercase" value={value || ''} onChange={(e) => onThemeChange({ colors: { ...theme.colors, [field]: e.target.value } })} />
    </div>
  </div>
);

type SettingsTab = 'general' | 'brand' | 'fonts' | 'print';

const GlobalSettings: React.FC<GlobalSettingsProps> = ({ 
  page, onUpdate, customFonts, setCustomFonts, theme, setTheme,
  imageQuality, setImageQuality, minimalCounter, setMinimalCounter,
  counterColor, setCounterColor, printSettings, setPrintSettings
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [syncing, setSyncing] = useState(false);

  if (!theme || !theme.colors) return null;

  const handleChange = (field: keyof PageData, value: any) => onUpdate({ ...page, [field]: value });
  
  const updatePrintField = (field: keyof PrintSettings, value: any) => {
    if (!printSettings) return;
    setPrintSettings({ ...printSettings, [field]: value });
  };

  const handleSyncTheme = () => {
    setSyncing(true);
    setTheme({}, true);
    setTimeout(() => setSyncing(false), 800);
  };

  return (
    <div className="flex flex-col h-[75vh]">
      <div className="flex gap-6 border-b border-slate-100 mb-8 shrink-0 px-2">
        {(['general', 'brand', 'fonts', 'print'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-[#264376]' : 'text-slate-300 hover:text-slate-500'}`}>
            <div className="flex items-center gap-2">
              {tab === 'general' && <Settings size={14} />}
              {tab === 'brand' && <Palette size={14} />}
              {tab === 'fonts' && <TypeIcon size={14} />}
              {tab === 'print' && <Printer size={14} />}
              {tab === 'general' ? 'General' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </div>
            {activeTab === tab && <motion.div layoutId="activeTab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#264376] rounded-full" />}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pr-4">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
            
            {activeTab === 'general' && (
              <div className="space-y-10 animate-in fade-in">
                <Section>
                  <Label icon={ImageControl}>Export & Processing</Label>
                  <div className="space-y-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                    <div className="flex justify-between items-center mb-2"><span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">WebP Quality</span><span className="text-xs font-mono font-bold text-[#264376]">{Math.round(imageQuality * 100)}%</span></div>
                    <Slider value={imageQuality} min={0.1} max={1.0} step={0.01} onChange={setImageQuality} />
                  </div>
                </Section>
                <Section>
                  <Label icon={Hash}>Pagination</Label>
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Counter Style</span><div className="flex bg-slate-100 p-1 rounded-xl gap-1">{[ { id: 'number', icon: Hash }, { id: 'alpha', icon: AlignLeft }, { id: 'roman', icon: TypeIcon }, { id: 'dots', icon: CircleDot } ].map(s => (<button key={s.id} onClick={() => handleChange('counterStyle', s.id as CounterStyle)} className={`flex-1 p-2 flex items-center justify-center rounded-lg transition-all ${(page.counterStyle || 'number') === s.id ? 'bg-white text-[#264376] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><s.icon size={14} /></button>))}</div></div>
                      <div className="space-y-3">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">UI Mode</span>
                        <button 
                          onClick={() => setMinimalCounter(!minimalCounter)} 
                          className={`w-full py-2.5 rounded-xl border-2 transition-all flex items-center justify-center gap-3 active:scale-95 ${minimalCounter ? 'border-[#264376] bg-[#264376] text-white shadow-lg' : 'border-slate-100 text-slate-400 hover:border-slate-200 bg-white'}`}
                        >
                          {minimalCounter ? <EyeOff size={14} /> : <Eye size={14} />}
                          <span className="text-[10px] font-black uppercase">Minimal UI</span>
                        </button>
                      </div>
                    </div>
                    {/* 已移除 Global Footer Text 输入框 */}
                  </div>
                </Section>
                <Section><Label icon={CircleDot}>Background Pattern</Label><div className="grid grid-cols-5 gap-3">{[ { id: 'none', label: 'None' }, { id: 'grid', label: 'Grid' }, { id: 'dots', label: 'Dots' }, { id: 'diagonal', label: 'Lines' }, { id: 'cross', label: 'Plus' } ].map(p => (<button key={p.id} onClick={() => handleChange('backgroundPattern', p.id)} className={`py-3 flex flex-col items-center justify-center rounded-xl border-2 transition-all ${(page.backgroundPattern || 'none') === p.id ? 'border-[#264376] bg-[#264376]/5 text-[#264376]' : 'border-slate-50 bg-slate-50/50 text-slate-300 hover:border-slate-200'}`}><span className="text-[8px] font-black uppercase tracking-tighter">{p.label}</span></button>))}</div></Section>
              </div>
            )}

            {/* TAB: Brand & Theme */}
            {activeTab === 'brand' && (
              <div className="space-y-10 animate-in fade-in">
                <Section>
                  <div className="flex items-center justify-between mb-6">
                    <Label icon={Palette} className="mb-0">Brand & Theme Tokens</Label>
                    <button onClick={handleSyncTheme} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-black text-[9px] uppercase tracking-widest shadow-sm ${syncing ? 'bg-emerald-500 text-white animate-pulse' : 'bg-[#264376]/5 text-[#264376] hover:bg-[#264376] hover:text-white'}`}><RefreshCcw size={12} className={syncing ? 'animate-spin' : ''} />{syncing ? 'Syncing...' : 'Apply to all'}</button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    <ColorToken label="Brand Primary" value={theme.colors.primary} field="primary" theme={theme} onThemeChange={setTheme} />
                    <ColorToken label="Brand Accent" value={theme.colors.accent} field="accent" theme={theme} onThemeChange={setTheme} />
                    <ColorToken label="Text Body" value={theme.colors.secondary} field="secondary" theme={theme} onThemeChange={setTheme} />
                    <ColorToken label="Page Canvas" value={theme.colors.background} field="background" theme={theme} onThemeChange={setTheme} />
                    <div className="col-span-2 pt-2"><ColorToken label="Surface / Modules" value={theme.colors.surface} field="surface" theme={theme} onThemeChange={setTheme} /></div>
                  </div>
                  <div className="mt-10 pt-8 border-t border-slate-50 space-y-8">
                    <div className="flex items-center gap-2 text-slate-900"><TypeIcon size={12} className="text-[#264376]" /><span className="text-[9px] font-black uppercase tracking-widest">Global Font Pairing</span></div>
                    
                    <div className="space-y-4">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Hero Headings (Title)</span>
                      <div className="grid grid-cols-2 gap-6">
                        <FontSelect label="English (EN)" value={theme.typography?.headingFont} onChange={(v) => setTheme({ typography: { ...theme.typography, headingFont: v } })} customFonts={customFonts} />
                        <FontSelect label="Chinese (ZH)" value={theme.typography?.headingFontZH} onChange={(v) => setTheme({ typography: { ...theme.typography, headingFontZH: v } })} customFonts={customFonts} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Body Paragraphs</span>
                      <div className="grid grid-cols-2 gap-6">
                        <FontSelect label="English (EN)" value={theme.typography?.bodyFont} onChange={(v) => setTheme({ typography: { ...theme.typography, bodyFont: v } })} customFonts={customFonts} />
                        <FontSelect label="Chinese (ZH)" value={theme.typography?.bodyFontZH} onChange={(v) => setTheme({ typography: { ...theme.typography, bodyFontZH: v } })} customFonts={customFonts} />
                      </div>
                    </div>
                  </div>
                </Section>
              </div>
            )}

            {/* TAB: Typography */}
            {activeTab === 'fonts' && (
              <div className="space-y-6 animate-in fade-in">
                <Section><div className="mb-6"><Label icon={UploadCloud} className="mb-1">Local Asset Manager</Label><p className="text-[10px] text-slate-400 font-medium">Upload .woff2 or .ttf files.</p></div><FontManager fonts={customFonts} onFontsChange={setCustomFonts} /></Section>
              </div>
            )}

            {/* TAB: Print & Binding */}
            {activeTab === 'print' && (
              <div className="space-y-10 animate-in fade-in">
                <Section>
                  <div className="flex items-center justify-between mb-8"><Label icon={Printer} className="mb-0">Print Engine</Label><button onClick={() => updatePrintField('enabled', !printSettings?.enabled)} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${printSettings?.enabled ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-100 text-slate-400'}`}><span className="text-[9px] font-black uppercase tracking-widest">{printSettings?.enabled ? 'Live Active' : 'Enable'}</span></button></div>
                  <div className={`space-y-10 transition-all duration-500 ${printSettings?.enabled ? 'opacity-100' : 'opacity-30 grayscale pointer-events-none'}`}>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-1"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Width (mm)</span><Input type="number" value={printSettings?.widthMm || 100} onChange={(e) => updatePrintField('widthMm', parseFloat(e.target.value))} className="font-mono text-xs" /></div>
                      <div className="space-y-1"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Height (mm)</span><Input type="number" value={printSettings?.heightMm || 145} onChange={(e) => updatePrintField('heightMm', parseFloat(e.target.value))} className="font-mono text-xs" /></div>
                      <div className="space-y-1"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Gutter (mm)</span><Input type="number" value={printSettings?.gutterMm || 10} onChange={(e) => updatePrintField('gutterMm', parseFloat(e.target.value))} className="font-mono text-xs text-amber-600 font-bold" /></div>
                    </div>
                    <div className="space-y-6">
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">Strategies</p>
                      <div className="grid grid-cols-1 gap-4">{[ { id: 'landscape', label: 'Landscape', icon: Monitor }, { id: 'portrait', label: 'Portrait', icon: Smartphone } ].map(ori => { const config = printSettings?.configs?.[ori.id as 'landscape' | 'portrait'] || { bindingSide: 'left', trimSide: 'bottom' }; const SideBtn = ({ side, type, icon: Icon }: any) => (<button onClick={() => { if (!printSettings) return; const nc = { ...printSettings.configs }; nc[ori.id as 'landscape' | 'portrait'] = { ...nc[ori.id as 'landscape' | 'portrait'], [type]: side }; updatePrintField('configs', nc); }} className={`p-2 rounded-lg border transition-all ${config[type as 'bindingSide' | 'trimSide'] === side ? 'bg-[#264376] text-white shadow-md' : 'bg-white text-slate-300 hover:border-slate-200'}`}><Icon size={12} /></button>); return (<div key={ori.id} className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 flex items-center justify-between"><div className="flex flex-col gap-1"><div className="flex items-center gap-2"><ori.icon size={12} className="text-[#264376]" /><span className="text-[10px] font-black uppercase text-slate-700">{ori.label}</span></div></div><div className="flex gap-10"><div className="space-y-2 text-center"><span className="text-[7px] font-black uppercase text-slate-400 block tracking-widest">Spine</span><div className="flex gap-1"><SideBtn side="left" type="bindingSide" icon={ArrowLeft} /><SideBtn side="right" type="bindingSide" icon={ArrowRight} /><SideBtn side="top" type="bindingSide" icon={ArrowUp} /><SideBtn side="bottom" type="bindingSide" icon={ArrowDown} /></div></div><div className="space-y-2 text-center"><span className="text-[7px] font-black uppercase text-slate-400 block tracking-widest">Cut</span><div className="flex gap-1"><SideBtn side="left" type="trimSide" icon={ArrowLeft} /><SideBtn side="right" type="trimSide" icon={ArrowRight} /><SideBtn side="top" type="trimSide" icon={ArrowUp} /><SideBtn side="bottom" type="trimSide" icon={ArrowDown} /></div></div></div></div>); })}</div></div>
                  </div>
                </Section>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GlobalSettings;
