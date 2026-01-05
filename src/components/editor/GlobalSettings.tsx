import React from 'react';
import { PageData, CustomFont, CounterStyle, PrintSettings, OrientationType } from '../../types';
import { ImageIcon, X, Settings, Hash, AlignLeft, Type, CircleDot, Image as ImageControl, Eye, EyeOff, Printer, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import { Label, Input, Slider, Section } from '../ui/Base';
import FontManager from '../FontManager';

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
}

const GlobalSettings: React.FC<GlobalSettingsProps> = ({ 
  page, 
  onUpdate, 
  customFonts, 
  setCustomFonts,
  imageQuality,
  setImageQuality,
  minimalCounter,
  setMinimalCounter,
  counterColor,
  setCounterColor,
  printSettings,
  setPrintSettings
}) => {
  const handleChange = (field: keyof PageData, value: any) => {
    onUpdate({ ...page, [field]: value });
  };

  const updatePrintSetting = (field: keyof PrintSettings, value: any) => {
    setPrintSettings({ ...printSettings, [field]: value });
  };

  const updateOrientationConfig = (ori: OrientationType, field: 'bindingSide' | 'trimSide', value: any) => {
    // 核心修复：确保 configs 即使在旧数据中不存在也能正确初始化
    const currentConfigs = printSettings.configs || {
      landscape: { bindingSide: 'bottom', trimSide: 'right' },
      portrait: { bindingSide: 'left', trimSide: 'bottom' },
      square: { bindingSide: 'left', trimSide: 'bottom' }
    };
    const newConfigs = { ...currentConfigs };
    newConfigs[ori] = { ...newConfigs[ori], [field]: value };
    setPrintSettings({ ...printSettings, configs: newConfigs });
  };

  const SideButton = ({ ori, side, type, active, icon: Icon }: any) => (
    <button 
      onClick={() => updateOrientationConfig(ori, type, side)}
      className={`p-2 rounded-lg border transition-all ${active ? 'bg-[#264376] border-[#264376] text-white shadow-md' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
      title={`${side.toUpperCase()} ${type === 'bindingSide' ? 'Binding' : 'Trim'}`}
    >
      <Icon size={12} />
    </button>
  );

  const orientations: { id: OrientationType; label: string }[] = [
    { id: 'landscape', label: 'Landscape (16:9)' },
    { id: 'portrait', label: 'Portrait (2:3)' },
    { id: 'square', label: 'Square (1:1)' }
  ];

  const sides = [
    { id: 'left', icon: ArrowLeft },
    { id: 'right', icon: ArrowRight },
    { id: 'top', icon: ArrowUp },
    { id: 'bottom', icon: ArrowDown }
  ];

  return (
    <div className="space-y-10 pb-10">
      {/* 1. Print & Binding - Advanced Configuration */}
      <Section>
        <div className="flex items-center justify-between mb-6">
          <Label icon={Printer} className="mb-0">Print & Binding Engine</Label>
          <button 
            onClick={() => updatePrintSetting('enabled', !printSettings.enabled)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${printSettings.enabled ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-100 text-slate-400'}`}
          >
            {printSettings.enabled ? <Eye size={12} /> : <EyeOff size={12} />}
            <span className="text-[9px] font-black uppercase tracking-widest">{printSettings.enabled ? 'System Active' : 'Disabled'}</span>
          </button>
        </div>

        <div className={`space-y-8 transition-all duration-500 ${printSettings.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale'}`}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Paper Width (mm)</span>
              <Input type="number" value={printSettings.widthMm} onChange={(e) => updatePrintSetting('widthMm', parseFloat(e.target.value))} className="font-mono text-xs" />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Paper Height (mm)</span>
              <Input type="number" value={printSettings.heightMm} onChange={(e) => updatePrintSetting('heightMm', parseFloat(e.target.value))} className="font-mono text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Binding Gutter (mm)</span>
              <Input type="number" value={printSettings.gutterMm} onChange={(e) => updatePrintSetting('gutterMm', parseFloat(e.target.value))} className="font-mono text-xs text-amber-600 font-bold" />
            </div>
          </div>

          {/* Per-Orientation Config */}
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Binding & Trim Strategy</p>
            
            <div className="grid grid-cols-1 gap-4">
              {orientations.map(ori => {
                // 核心修复：增加对 configs 的存在性检查，防止在旧数据上崩溃
                const config = (printSettings.configs && printSettings.configs[ori.id]) 
                  || { bindingSide: 'left', trimSide: 'bottom' };
                return (
                  <div key={ori.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-700">{ori.label}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      {/* Binding Side Selector */}
                      <div className="space-y-2">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter block">Binding Edge (Spine)</span>
                        <div className="flex gap-1.5">
                          {sides.map(s => (
                            <SideButton key={s.id} ori={ori.id} side={s.id} type="bindingSide" icon={s.icon} active={config.bindingSide === s.id} />
                          ))}
                        </div>
                      </div>

                      {/* Trim Side Selector */}
                      <div className="space-y-2">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter block">Primary Trim Edge</span>
                        <div className="flex gap-1.5">
                          {sides.map(s => (
                            <SideButton key={s.id} ori={ori.id} side={s.id} type="trimSide" icon={s.icon} active={config.trimSide === s.id} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* 2. Global Visual Style */}
      <Section className="pt-6 border-t border-slate-100">
        <Label icon={Settings}>Global Visual Style</Label>
        <div className="space-y-8">
            <div className="space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Background Pattern</p>
                <div className="grid grid-cols-5 gap-2">
                    {[ { id: 'none', label: 'None' }, { id: 'grid', label: 'Grid' }, { id: 'dots', label: 'Dots' }, { id: 'diagonal', label: 'Lines' }, { id: 'cross', label: 'Plus' } ].map(p => (
                        <button key={p.id} onClick={() => handleChange('backgroundPattern', p.id)} className={`px-1 py-2 flex flex-col items-center justify-center rounded-lg border transition-all ${(page.backgroundPattern || 'none') === p.id ? 'bg-[#264376] border-[#264376] text-white shadow-md shadow-#264376/20' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}><span className="text-[8px] font-black uppercase tracking-tighter">{p.label}</span></button>
                    ))}
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-900">
                    <ImageControl size={12} className="text-[#264376]" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Image Compression</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#264376] bg-[#264376]/5 px-2 py-0.5 rounded">
                    JPEG {Math.round(imageQuality * 100)}%
                  </span>
                </div>
                <Slider label="Quality Level" value={imageQuality} min={0.1} max={1.0} step={0.01} onChange={setImageQuality} />
            </div>
        </div>
      </Section>

      {/* 3. Global Brand Section */}
      <Section className="pt-6 border-t border-slate-100">
        <Label icon={ImageIcon}>Global Branding</Label>
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Input type="text" placeholder="Logo URL..." value={page.logo || ''} onChange={(e) => handleChange('logo', e.target.value)} />
                <label className="cursor-pointer bg-slate-50 p-2.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                <ImageIcon size={18} />
                <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => handleChange('logo', reader.result as string);
                    reader.readAsDataURL(file);
                    }
                }} />
                </label>
                {page.logo && <button onClick={() => handleChange('logo', '')} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><X size={16} /></button>}
            </div>
            {page.logo && (
                <Slider label="Logo Size" value={page.logoSize || 80} min={20} max={400} step={2} onChange={(v) => handleChange('logoSize', v)} />
            )}
        </div>
      </Section>

      {/* 4. Typography Manager */}
      <Section className="pt-6 border-t border-slate-100">
        <Label icon={Type}>Typography (Fonts)</Label>
        <FontManager fonts={customFonts} onFontsChange={setCustomFonts} />
      </Section>

      {/* 5. Page Metadata Section */}
      <Section className="pt-6 border-t border-slate-100">
        <Label icon={Settings}>Global Metadata Style</Label>
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Counter Style & Color</p>
                  <button 
                    onClick={() => {
                      handleChange('minimalCounter', !minimalCounter);
                    }}
                    className={`flex items-center gap-2 px-2 py-1 rounded-md transition-all ${minimalCounter ? 'bg-[#264376] text-white' : 'bg-slate-100 text-slate-400 hover:text-slate-600'}`}
                  >
                    {minimalCounter ? <EyeOff size={10} /> : <Eye size={10} />}
                    <span className="text-[8px] font-black uppercase tracking-tighter">Minimal UI</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                    {[ { id: 'number', icon: Hash }, { id: 'alpha', icon: AlignLeft }, { id: 'roman', icon: Type }, { id: 'dots', icon: CircleDot } ].map(s => (
                        <button key={s.id} onClick={() => handleChange('counterStyle', s.id as CounterStyle)}
                            className={`p-2 flex items-center justify-center rounded-lg border transition-all ${(page.counterStyle || 'number') === s.id ? 'bg-[#264376] border-[#264376] text-white shadow-md shadow-#264376/20' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                            title={s.id.toUpperCase()}
                        >
                            <s.icon size={14} />
                        </button>
                    ))}
                </div>

                <div className="flex gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
                  <div className="relative overflow-hidden w-8 h-8 rounded-lg shadow-sm ring-1 ring-slate-200 shrink-0">
                    <input 
                      type="color" 
                      className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer p-0 border-0" 
                      value={page.counterColor || '#64748b'} 
                      onChange={(e) => handleChange('counterColor', e.target.value)} 
                    />
                  </div>
                  <div className="flex-1 text-[10px] font-mono font-bold text-slate-500 uppercase">
                    {page.counterColor || '#64748b'}
                  </div>
                </div>
            </div>
            
            <div className="space-y-2">
               <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 block">Footer Metadata (Global)</span>
               <Input type="text" className="text-[10px]" placeholder="Confidential / Project Title" value={page.footer || ''} onChange={(e) => handleChange('footer', e.target.value)} />
            </div>
        </div>
      </Section>
    </div>
  );
};

export default GlobalSettings;