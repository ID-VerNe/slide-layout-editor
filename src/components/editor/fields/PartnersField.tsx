import React from 'react';
import { PageData, PartnerData } from '../../../types';
import { Eye, EyeOff, Briefcase, Plus, X, HelpCircle } from 'lucide-react';
import { LUCIDE_ICON_MAP } from '../../../constants/icons';
import { Label, Input } from '../../ui/Base';
import IconPicker from '../../ui/IconPicker';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
}

export const PartnersField: React.FC<FieldProps> = ({ page, onUpdate }) => {
  const isVisible = page.visibility?.partners !== false;

  // Auto-generate IDs for legacy data
  React.useEffect(() => {
    const partners = page.partners || [];
    if (partners.some(p => !p.id)) {
      const migrated = partners.map(p => p.id ? p : { ...p, id: `partner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` });
      onUpdate({ ...page, partners: migrated });
    }
  }, [page.partners, onUpdate, page]);

  const toggle = () => {
    onUpdate({
      ...page,
      visibility: { ...(page.visibility || {}), partners: !isVisible }
    });
  };

  const handlePartnerChange = (index: number, field: keyof PartnerData, value: string) => {
    const newPartners = [...(page.partners || [])];
    newPartners[index] = { ...newPartners[index], [field]: value };
    onUpdate({ ...page, partners: newPartners });
  };

  const addPartner = () => {
    const currentPartners = page.partners || [];
    if (currentPartners.length >= 8) return;
    onUpdate({
      ...page,
      partners: [...currentPartners, { 
        id: `partner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: 'New Partner', 
        logo: 'Globe' 
      }]
    });
  };

  const removePartner = (index: number) => {
    const currentPartners = page.partners || [];
    onUpdate({
      ...page,
      partners: currentPartners.filter((_, i) => i !== index)
    });
  };

  const renderCellPreview = (val: string) => {
    if (!val) return <Plus size={14} />;
    
    // 1. 图片处理
    const isImg = val.startsWith('data:image') || val.includes('http');
    if (isImg) return <img src={val} className="w-full h-full object-cover rounded-md" />;
    
    // 2. Material Symbols 处理
    const isMaterial = val.includes('_') || /^[a-z]/.test(val);
    if (isMaterial) {
      return (
        <span className="material-symbols-outlined notranslate text-[18px]" style={{ textTransform: 'none' }}>
          {val.toLowerCase()}
        </span>
      );
    }

    // 3. Lucide 处理
    try {
      const PascalName = val.charAt(0).toUpperCase() + val.slice(1);
      const Icon = LUCIDE_ICON_MAP[PascalName] || LUCIDE_ICON_MAP[val] || HelpCircle;
      return <Icon size={18} strokeWidth={2.5} />;
    } catch (e) {
      return <HelpCircle size={18} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <button onClick={toggle} className={`p-1.5 rounded-md transition-all ${isVisible ? 'text-[#264376] bg-[#264376]/10' : 'text-slate-300 bg-slate-50'}`}>
            {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <Label icon={Briefcase} className="mb-0">Partner Logos</Label>
        </div>
      </div>

      <div className={`space-y-6 ${!isVisible ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
        <div className="space-y-3">
          {(page.partners || []).map((p, idx) => (
            <div key={p.id || idx} className="relative group p-3 bg-slate-50 rounded-xl flex items-center gap-3 border border-transparent hover:border-slate-200 transition-all">
              <button onClick={() => removePartner(idx)} className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-100 shadow-sm rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 z-10">
                <X size={12} />
              </button>
              <IconPicker 
                value={p.logo || ''} 
                onChange={(val) => handlePartnerChange(idx, 'logo', val)}
                trigger={<button className="w-10 h-10 shrink-0 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-[#264376] shadow-sm">{renderCellPreview(p.logo)}</button>}
              />
              <Input placeholder="Company Name" value={p.name || ''} onChange={(e) => handlePartnerChange(idx, 'name', e.target.value)} className="text-[10px] flex-1 bg-white" />
            </div>
          ))}
        </div>

        <button 
          onClick={addPartner}
          disabled={(page.partners?.length || 0) >= 8}
          className="w-full py-3 border-2 border-dashed border-slate-100 rounded-2xl text-slate-300 hover:text-[#264376] hover:border-[#264376] hover:bg-[#264376]/10 transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] active:scale-95"
        >
          <Plus size={14} strokeWidth={3} />
          Add Partner
        </button>
      </div>
    </div>
  );
};