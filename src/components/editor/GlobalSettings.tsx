import React, { useState } from 'react';
import { PageData, CustomFont, CounterStyle, PrintSettings, ProjectTheme } from '../../types';
import { ImageIcon, Settings, Hash, AlignLeft, Type, CircleDot, Image as ImageControl, Eye, EyeOff, Printer, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Monitor, Smartphone, Square, Palette, RefreshCcw, Type as TypeIcon, UploadCloud } from 'lucide-react';
import { Label, Input, Slider, Section } from '../ui/Base';
import { FontSelect } from '../ui/FontSelect';
import FontManager from '../FontManager';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';

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
  counterStyle: CounterStyle;
  setCounterStyle: (s: CounterStyle) => void;
  counterColor: string;
  setCounterColor: (c: string) => void;
  printSettings: PrintSettings;
  setPrintSettings: (s: PrintSettings) => void;
}

const ColorToken = ({ label, value, field, theme, onThemeChange }: { label: string, value: string, field: keyof ProjectTheme['colors'], theme: ProjectTheme, onThemeChange: (t: Partial<ProjectTheme>) => void }) => (
  <div className="flex flex-col gap-2">
    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">{label}</span>
    <div className="flex gap-0 items-center bg-white border border-slate-950">
      <div className="relative w-8 h-8 shrink-0 border-r border-slate-950 overflow-hidden">
        <input type="color" className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer p-0 border-0" value={value || '#000000'} onInput={(e) => onThemeChange({ colors: { ...theme.colors, [field]: (e.target as HTMLInputElement).value } })} />
      </div>
      <Input className="flex-1 !border-none !ring-0 !text-[10px] font-mono uppercase !py-1 !px-2" value={value || ''} onChange={(e) => onThemeChange({ colors: { ...theme.colors, [field]: e.target.value } })} />
    </div>
  </div>
);

type SettingsTab = 'general' | 'print' | 'assets';

const GlobalSettings: React.FC<GlobalSettingsProps> = ({ 
  page, onUpdate, customFonts, setCustomFonts,
  imageQuality, setImageQuality, minimalCounter, setMinimalCounter,
  counterStyle, setCounterStyle,
  printSettings, setPrintSettings
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const handleChange = (field: keyof PageData, value: any) => onUpdate({ ...page, [field]: value });
  
  const updatePrintField = (field: keyof PrintSettings, value: any) => {
    if (!printSettings) return;
    setPrintSettings({ ...printSettings, [field]: value });
  };

  return (
    <div className="flex flex-col h-[75vh]">
      <div className="flex gap-8 border-b border-slate-950 mb-12 shrink-0 px-2">
        {(['general', 'assets', 'print'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-slate-950' : 'text-slate-300 hover:text-slate-500'}`}>
            <div className="flex items-center gap-3">
              {tab === 'general' && <Settings size={14} strokeWidth={3} />}
              {tab === 'assets' && <UploadCloud size={14} strokeWidth={3} />}
              {tab === 'print' && <Printer size={14} strokeWidth={3} />}
              {tab === 'general' ? 'General' : tab}
            </div>
            {activeTab === tab && <motion.div layoutId="activeTab" className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-slate-950" />}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pr-4">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
            
            {activeTab === 'general' && (
              <div className="space-y-16">
                <Section>
                  <Label icon={ImageControl}>Export & Processing</Label>
                  <div className="space-y-8 bg-white p-8 border border-slate-200">
                    <div className="flex justify-between items-center mb-2"><span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">WebP Quality</span><span className="text-xs font-mono font-black text-slate-950">{Math.round(imageQuality * 100)}%</span></div>
                    <Slider label="Output Compression" value={imageQuality} min={0.1} max={1.0} step={0.01} onChange={setImageQuality} />
                  </div>
                </Section>
                <Section>
                  <Label icon={Hash}>Pagination Control</Label>
                  <div className="space-y-10">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4"><span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Counter Style</span><div className="flex border border-slate-200 p-1 gap-1">{[ { id: 'number', icon: Hash }, { id: 'alpha', icon: AlignLeft }, { id: 'roman', icon: TypeIcon }, { id: 'dots', icon: CircleDot } ].map(s => (<button key={s.id} onClick={() => setCounterStyle(s.id as CounterStyle)} className={`flex-1 p-3 flex items-center justify-center transition-all ${(counterStyle || 'number') === s.id ? 'bg-slate-950 text-white' : 'text-slate-300 hover:text-slate-900'}`}><s.icon size={16} strokeWidth={3} /></button>))}</div></div>
                      <div className="space-y-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Editor Mode</span>
                        <button 
                          onClick={() => setMinimalCounter(!minimalCounter)} 
                          className={`w-full py-4 border-2 transition-all flex items-center justify-center gap-3 active:scale-95 ${minimalCounter ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 text-slate-300 hover:border-slate-950 bg-white'}`}
                        >
                          {minimalCounter ? <EyeOff size={16} strokeWidth={3} /> : <Eye size={16} strokeWidth={3} />}
                          <span className="text-[11px] font-black uppercase tracking-[0.1em]">Minimal UI</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </Section>
                <Section><Label icon={CircleDot}>Texture Patterns</Label><div className="grid grid-cols-5 gap-0 border border-slate-200">{[ { id: 'none', label: 'None' }, { id: 'grid', label: 'Grid' }, { id: 'dots', label: 'Dots' }, { id: 'diagonal', label: 'Lines' }, { id: 'cross', label: 'Plus' } ].map(p => (<button key={p.id} onClick={() => handleChange('backgroundPattern', p.id)} className={`py-4 flex flex-col items-center justify-center border-r border-slate-100 last:border-r-0 transition-all ${(page.backgroundPattern || 'none') === p.id ? 'bg-slate-950 text-white' : 'bg-white text-slate-400 hover:bg-slate-50'}`}><span className="text-[9px] font-black uppercase tracking-widest">{p.label}</span></button>))}</div></Section>
              </div>
            )}

            {activeTab === 'assets' && (
              <div className="space-y-8">
                <Section><div className="mb-8 border-l-4 border-slate-950 pl-4"><Label icon={UploadCloud} className="mb-1">Local Asset Library</Label><p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Woff2 / TTF Container</p></div><FontManager fonts={customFonts} onFontsChange={setCustomFonts} /></Section>
              </div>
            )}

            {activeTab === 'print' && (
              <div className="space-y-16">
                <Section>
                  <div className="flex items-center justify-between mb-10"><Label icon={Printer} className="mb-0">Mechanical Print Engine</Label><button onClick={() => updatePrintField('enabled', !printSettings?.enabled)} className={`flex items-center gap-3 px-6 py-3 border-2 transition-all ${printSettings?.enabled ? 'bg-slate-950 text-white border-slate-950' : 'bg-white border-slate-200 text-slate-300 hover:border-slate-950 hover:text-slate-950'}`}><span className="text-[10px] font-black uppercase tracking-[0.2em]">{printSettings?.enabled ? 'Engine Active' : 'Off-Line'}</span></button></div>
                  <div className={`space-y-12 transition-all duration-500 ${printSettings?.enabled ? 'opacity-100' : 'opacity-20 grayscale pointer-events-none'}`}>
                    <div className="grid grid-cols-3 gap-8">
                      <div className="space-y-2"><span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Width (mm)</span><Input type="number" value={printSettings?.widthMm || 100} onChange={(e) => updatePrintField('widthMm', parseFloat(e.target.value))} className="font-mono text-xs !py-3" /></div>
                      <div className="space-y-2"><span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Height (mm)</span><Input type="number" value={printSettings?.heightMm || 145} onChange={(e) => updatePrintField('heightMm', parseFloat(e.target.value))} className="font-mono text-xs !py-3" /></div>
                      <div className="space-y-2"><span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Gutter (mm)</span><Input type="number" value={printSettings?.gutterMm || 10} onChange={(e) => updatePrintField('gutterMm', parseFloat(e.target.value))} className="font-mono text-xs text-slate-950 font-black !py-3" /></div>
                    </div>
                    
                    <div className="space-y-8">
                      <p className="text-[11px] font-black text-slate-950 uppercase tracking-[0.2em] border-b border-slate-950 pb-2">Strategies</p>
                      <div className="grid grid-cols-1 gap-6">
                        {[ { id: 'landscape', label: 'Landscape', icon: Monitor }, { id: 'portrait', label: 'Portrait', icon: Smartphone } ].map(ori => { 
                          const config = printSettings?.configs?.[ori.id as 'landscape' | 'portrait'] || { bindingSide: 'left', trimSide: 'bottom' }; 
                          const SideBtn = ({ side, type, icon: Icon }: any) => (
                            <button onClick={() => { if (!printSettings) return; const nc = { ...printSettings.configs }; nc[ori.id as 'landscape' | 'portrait'] = { ...nc[ori.id as 'landscape' | 'portrait'], [type]: side }; updatePrintField('configs', nc); }} className={`p-3 border transition-all ${config[type as 'bindingSide' | 'trimSide'] === side ? 'bg-slate-950 text-white border-slate-950' : 'bg-white border-slate-200 text-slate-300 hover:border-slate-950 hover:text-slate-950'}`}><Icon size={14} strokeWidth={3} /></button>
                          ); 
                          return (
                            <div key={ori.id} className="bg-white p-8 border border-slate-200 flex items-center justify-between">
                              <div className="flex flex-col gap-2"><div className="flex items-center gap-3"><ori.icon size={16} strokeWidth={3} className="text-slate-950" /><span className="text-[11px] font-black uppercase text-slate-950 tracking-[0.1em]">{ori.label}</span></div></div>
                              <div className="flex gap-12">
                                <div className="space-y-3 text-center"><span className="text-[8px] font-black uppercase text-slate-400 block tracking-[0.3em]">Spine</span><div className="flex gap-1"><SideBtn side="left" type="bindingSide" icon={ArrowLeft} /><SideBtn side="right" type="bindingSide" icon={ArrowRight} /><SideBtn side="top" type="bindingSide" icon={ArrowUp} /><SideBtn side="bottom" type="bindingSide" icon={ArrowDown} /></div></div>
                                <div className="space-y-3 text-center"><span className="text-[8px] font-black uppercase text-slate-400 block tracking-[0.3em]">Cut</span><div className="flex gap-1"><SideBtn side="left" type="trimSide" icon={ArrowLeft} /><SideBtn side="right" type="trimSide" icon={ArrowRight} /><SideBtn side="top" type="trimSide" icon={ArrowUp} /><SideBtn side="bottom" type="trimSide" icon={ArrowDown} /></div></div>
                              </div>
                            </div>
                          ); 
                        })}
                      </div>
                    </div>

                    <div className="pt-10 border-t border-slate-950 space-y-6">
                      <p className="text-[11px] font-black text-slate-950 uppercase tracking-[0.2em]">Visual Helpers</p>
                      <div className="grid grid-cols-3 gap-6">
                        <HelperToggle label="Spine Projection" active={!!printSettings?.showGutterShadow} onClick={() => updatePrintField('showGutterShadow', !printSettings?.showGutterShadow)} />
                        <HelperToggle label="Cut Guidelines" active={!!printSettings?.showTrimShadow} onClick={() => updatePrintField('showTrimShadow', !printSettings?.showTrimShadow)} />
                        <HelperToggle label="Logic Frame" active={!!printSettings?.showContentFrame} onClick={() => updatePrintField('showContentFrame', !printSettings?.showContentFrame)} />
                      </div>
                    </div>
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

const HelperToggle = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-3 p-4 border-2 transition-all ${active ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-100 text-slate-300 hover:border-slate-950'}`}>
    <span className="text-[9px] font-black uppercase text-center tracking-widest leading-tight">{label}</span>
    {active ? <Eye size={16} strokeWidth={3} /> : <EyeOff size={16} strokeWidth={3} />}
  </button>
);

export default GlobalSettings;