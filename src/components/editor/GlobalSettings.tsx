import React from 'react';
import { PageData, CustomFont, CounterStyle } from '../../types';
import { ImageIcon, X, Settings, Hash, AlignLeft, Type, CircleDot } from 'lucide-react';
import { Label, Input, Slider, Section } from '../ui/Base';
import FontManager from '../FontManager';

interface GlobalSettingsProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  customFonts: CustomFont[];
  setCustomFonts: (fonts: CustomFont[]) => void;
}

const GlobalSettings: React.FC<GlobalSettingsProps> = ({ page, onUpdate, customFonts, setCustomFonts }) => {
  const handleChange = (field: keyof PageData, value: any) => {
    onUpdate({ ...page, [field]: value });
  };

  const isVisible = (key: keyof NonNullable<PageData['visibility']>) => {
    return page.visibility?.[key] !== false;
  };

  return (
    <div className="space-y-10 pb-10">
      {/* 1. Global Appearance - Only Patterns now */}
      <Section>
        <Label icon={Settings}>Global Visual Style</Label>
        <div className="space-y-6">
            {/* Background Pattern */}
            <div className="space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Background Pattern</p>
                <div className="grid grid-cols-5 gap-2">
                    {[ { id: 'none', label: 'None' }, { id: 'grid', label: 'Grid' }, { id: 'dots', label: 'Dots' }, { id: 'diagonal', label: 'Lines' }, { id: 'cross', label: 'Plus' } ].map(p => (
                        <button key={p.id} onClick={() => handleChange('backgroundPattern', p.id)} className={`px-1 py-2 flex flex-col items-center justify-center rounded-lg border transition-all ${(page.backgroundPattern || 'none') === p.id ? 'bg-[#264376] border-[#264376] text-white shadow-md shadow-#264376/20' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}><span className="text-[8px] font-black uppercase tracking-tighter">{p.label}</span></button>
                    ))}
                </div>
            </div>
        </div>
      </Section>

      {/* 2. Global Brand Section */}
      <Section className="pt-6 border-t border-slate-100">
        <Label icon={ImageIcon}>Global Branding</Label>
        <div className="space-y-4">
            <div className={`flex items-center gap-2 ${isVisible('logo') ? '' : 'opacity-50'}`}>
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

      {/* 3. Typography Manager */}
      <Section className="pt-6 border-t border-slate-100">
        <Label icon={Type}>Typography (Fonts)</Label>
        <FontManager fonts={customFonts} onFontsChange={setCustomFonts} />
      </Section>

      {/* 4. Page Metadata Section */}
      <Section className="pt-6 border-t border-slate-100">
        <Label icon={Settings}>Global Metadata Style</Label>
        <div className="space-y-6">
            <div className="space-y-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Counter Style (Global)</p>
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