import React from 'react';
import { PageData, AgendaData } from '../../../types';
import { Eye, EyeOff, ListOrdered, Plus, X, List, Target } from 'lucide-react';
import { Label, Input, TextArea } from '../../ui/Base';
import IconPicker from '../../ui/IconPicker';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  label?: string;
  // 以下为支持简历模板的自定义标签 Props
  titleLabel?: string;
  subtitleLabel?: string;
  timeLabel?: string;
  locationLabel?: string;
}

export const AgendaField: React.FC<FieldProps> = ({ 
  page, onUpdate, label, 
  titleLabel, subtitleLabel, timeLabel, locationLabel 
}) => {
  const isVisible = page.visibility?.agenda !== false;

  const toggle = () => {
    onUpdate({
      ...page,
      visibility: { ...(page.visibility || {}), agenda: !isVisible }
    });
  };

  const handleAgendaChange = (index: number, field: keyof AgendaData, value: any) => {
    const newAgenda = [...(page.agenda || [])];
    newAgenda[index] = { ...newAgenda[index], [field]: value };
    onUpdate({ ...page, agenda: newAgenda });
  };

  const addSection = () => {
    const current = page.agenda || [];
    onUpdate({
      ...page,
      agenda: [...current, { 
        id: `agenda-${Date.now()}`,
        title: 'New Entry', 
        subtitle: 'Sub-entry details',
        time: '2020-2024',
        location: 'City, Country',
        items: []
      }]
    });
  };

  const removeSection = (index: number) => {
    const current = page.agenda || [];
    onUpdate({ ...page, agenda: current.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <button onClick={toggle} className={`p-1.5 rounded-md transition-all ${isVisible ? 'text-[#264376] bg-[#264376]/10' : 'text-slate-300 bg-slate-50'}`}>
            {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <Label icon={ListOrdered} className="mb-0">{label || 'Agenda Sections'}</Label>
        </div>
      </div>

      <div className={`space-y-6 ${!isVisible ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
        {(page.agenda || []).map((section, idx) => (
          <div key={section.id || idx} className="relative group p-5 rounded-[2rem] bg-slate-50 border-2 border-transparent hover:border-slate-200 transition-all space-y-4">
            <button onClick={() => removeSection(idx)} className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-slate-100 shadow-md rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10"><X size={14}/></button>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{titleLabel || 'Section Title'}</span>
                <Input value={section.title || ''} onChange={(e) => handleAgendaChange(idx, 'title', e.target.value)} className="font-bold bg-white" />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{timeLabel || 'Dates'}</span>
                <Input value={section.time || ''} onChange={(e) => handleAgendaChange(idx, 'time', e.target.value)} className="bg-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{subtitleLabel || 'Subtitle'}</span>
                <Input value={section.subtitle || ''} onChange={(e) => handleAgendaChange(idx, 'subtitle', e.target.value)} className="italic bg-white" />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{locationLabel || 'Location'}</span>
                <Input value={section.location || ''} onChange={(e) => handleAgendaChange(idx, 'location', e.target.value)} className="bg-white" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Details / Description</span>
              <TextArea value={section.description || ''} onChange={(e) => handleAgendaChange(idx, 'description', e.target.value)} rows={2} className="text-[10px] bg-white" />
            </div>
          </div>
        ))}
        
        <button onClick={addSection} className="w-full py-4 border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300 hover:text-[#264376] hover:border-[#264376] hover:bg-[#264376]/10 transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase active:scale-95">
          <Plus size={16} /> Add Entry
        </button>
      </div>
    </div>
  );
};
