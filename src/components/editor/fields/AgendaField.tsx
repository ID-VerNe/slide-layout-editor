import React from 'react';
import { PageData, AgendaData } from '../../../types';
import { Eye, EyeOff, ListOrdered, Plus, X, List, Target } from 'lucide-react';
import { Label, Input, TextArea } from '../../ui/Base';
import IconPicker from '../../ui/IconPicker';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
}

export const AgendaField: React.FC<FieldProps> = ({ page, onUpdate }) => {
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
    if (current.length >= 12) return; 
    onUpdate({
      ...page,
      agenda: [...current, { 
        title: 'New Section', 
        desc: 'Section overview', 
        number: `0${current.length + 1}`, 
        icon: 'LayoutGrid',
        items: ['Key point 1', 'Key point 2']
      }]
    });
  };

  const removeSection = (index: number) => {
    const current = page.agenda || [];
    onUpdate({
      ...page,
      agenda: current.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <button onClick={toggle} className={`p-1.5 rounded-md transition-all ${isVisible ? 'text-[#264376] bg-[#264376]/10' : 'text-slate-300 bg-slate-50'}`}>
            {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <Label icon={ListOrdered} className="mb-0">Agenda Sections</Label>
        </div>
      </div>

      <div className={`space-y-6 ${!isVisible ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
        {(page.agenda || []).map((section, idx) => (
          <div key={idx} className={`relative group p-5 rounded-[2rem] space-y-4 border-2 transition-all shadow-sm ${page.activeIndex === idx ? 'bg-[#264376]/5 border-[#264376]/20' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
            <button onClick={() => removeSection(idx)} className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-slate-100 shadow-md rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 z-10">
              <X size={14} />
            </button>

            {/* 设置为当前活动章节 */}
            <button 
              onClick={() => onUpdate({ ...page, activeIndex: idx })}
              className={`absolute top-4 right-4 flex items-center gap-1.5 px-2 py-1 rounded-lg text-[8px] font-black uppercase transition-all ${page.activeIndex === idx ? 'bg-[#264376] text-white shadow-lg shadow-[#264376]/30' : 'bg-white text-slate-300 border border-slate-100 hover:text-[#264376]'}`}
            >
              <Target size={10} />
              {page.activeIndex === idx ? 'Current' : 'Select'}
            </button>

            <div className="flex gap-3">
              <div className="w-12">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">No.</span>
                <Input value={section.number || ''} onChange={(e) => handleAgendaChange(idx, 'number', e.target.value)} className="text-center font-black" />
              </div>
              <div className="flex-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Section Title</span>
                <Input value={section.title || ''} onChange={(e) => handleAgendaChange(idx, 'title', e.target.value)} className="font-bold" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Icon & Summary</span>
                <IconPicker 
                  value={section.icon || 'LayoutGrid'}
                  onChange={(val) => handleAgendaChange(idx, 'icon', val)}
                />
              </div>
              <Input value={section.desc || ''} onChange={(e) => handleAgendaChange(idx, 'desc', e.target.value)} placeholder="Overview..." className="text-[10px]" />
            </div>

            <div className="space-y-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><List size={10}/> Sub Topics</span>
              <TextArea 
                value={section.items?.join('\n') || ''} 
                onChange={(e) => handleAgendaChange(idx, 'items', e.target.value.split('\n'))}
                rows={3}
                placeholder="Topic A\nTopic B..."
                className="text-[10px] leading-relaxed"
              />
            </div>
          </div>
        ))}

        <button 
          onClick={addSection}
          disabled={(page.agenda?.length || 0) >= 12}
          className="w-full py-4 border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300 hover:text-[#264376] hover:border-[#264376] hover:bg-[#264376]/10 transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] active:scale-95"
        >
          <Plus size={16} strokeWidth={3} />
          Add Section
        </button>
      </div>
    </div>
  );
};