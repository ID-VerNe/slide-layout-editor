import React, { useState } from 'react';
import { PageData, ResumeSection, ResumeItem } from '../../../types';
import { Plus, X, List, Clock, MapPin, ChevronUp, ChevronDown, Trash2, GripVertical, Settings2, LayoutList, Type, ArrowUp, ArrowDown, ArrowRightCircle, ArrowLeftCircle } from 'lucide-react';
import { Input, TextArea } from '../../ui/Base';
import { Reorder, AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../../../store/useStore';

interface ResumeContentHubProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
}

export const ResumeContentHub: React.FC<ResumeContentHubProps> = ({ page, onUpdate }) => {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(page.resumeSections?.[0]?.id || null);
  const sections = page.resumeSections || [];
  const { pages, currentPageIndex } = useStore.getState();

  const activeSection = sections.find(s => s.id === activeSectionId);

  const updateSections = (newSections: ResumeSection[]) => {
    onUpdate({ ...page, resumeSections: newSections });
  };

  const moveSectionToPage = (sectionId: string, direction: 'prev' | 'next') => {
    const targetPageIndex = direction === 'next' ? currentPageIndex + 1 : currentPageIndex - 1;
    const targetPage = pages[targetPageIndex];
    if (!targetPage || targetPage.layoutId !== 'academic-hybrid-resume') {
      window.alert(direction === 'next' ? "Please add a new Resume page first." : "No previous Resume page found.");
      return;
    }
    const sectionToMove = sections.find(s => s.id === sectionId);
    if (!sectionToMove) return;
    const remainingSections = sections.filter(s => s.id !== sectionId);
    updateSections(remainingSections);
    const targetSections = [...(targetPage.resumeSections || [])];
    const sameTitleIndex = targetSections.findIndex(s => s.title === sectionToMove.title);
    if (sameTitleIndex > -1) {
      targetSections[sameTitleIndex] = { ...targetSections[sameTitleIndex], items: [...sectionToMove.items, ...targetSections[sameTitleIndex].items] };
    } else {
      targetSections.push(sectionToMove);
    }
    useStore.setState({ pages: pages.map((p, i) => i === targetPageIndex ? { ...targetPage, resumeSections: targetSections } : p) });
    if (activeSectionId === sectionId) setActiveSectionId(remainingSections[0]?.id || null);
  };

  const addSection = () => {
    const id = `section-${Date.now()}`;
    const newSection: ResumeSection = { id, title: 'NEW SECTION', items: [{ id: `item-${Date.now()}`, title: 'New Entry', time: '2024' }] };
    updateSections([...sections, newSection]);
    setActiveSectionId(id);
  };

  const updateItem = (itemId: string, updates: Partial<ResumeItem>) => {
    updateSections(sections.map(s => s.id === activeSectionId ? { ...s, items: s.items.map(i => i.id === itemId ? { ...i, ...updates } : i) } : s));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (!activeSection) return;
    const newItems = [...activeSection.items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    updateSections(sections.map(s => s.id === activeSectionId ? { ...s, items: newItems } : s));
  };

  return (
    // 核心修复 1：设定固定高度 75vh 并确保内容不溢出外部
    <div className="flex gap-8 h-[75vh] overflow-hidden">
      
      {/* 1. LEFT SIDEBAR */}
      <div className="w-72 flex flex-col gap-4 border-r border-slate-100 pr-6 shrink-0 h-full overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sections</span>
          <button onClick={addSection} className="p-1 text-[#264376] hover:bg-slate-50 rounded transition-all"><Plus size={16}/></button>
        </div>
        <Reorder.Group axis="y" values={sections} onReorder={updateSections} className="space-y-2 flex-1 overflow-y-auto no-scrollbar">
          {sections.map((s) => (
            <Reorder.Item key={s.id} value={s} className={`relative group cursor-pointer rounded-xl border-2 transition-all p-3 flex items-center gap-2 ${activeSectionId === s.id ? 'border-[#264376] bg-[#264376]/5 shadow-sm' : 'border-transparent hover:bg-slate-50'}`} onClick={() => setActiveSectionId(s.id)}>
              <GripVertical size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              <div className="flex-1 min-w-0"><p className={`text-[10px] font-black uppercase truncate ${activeSectionId === s.id ? 'text-[#264376]' : 'text-slate-500'}`}>{s.title}</p></div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={(e) => { e.stopPropagation(); moveSectionToPage(s.id, 'prev'); }} className="p-1 text-slate-300 hover:text-[#264376]" title="Move to Prev Page"><ArrowLeftCircle size={16} /></button>
                <button onClick={(e) => { e.stopPropagation(); moveSectionToPage(s.id, 'next'); }} className="p-1 text-slate-300 hover:text-[#264376]" title="Move to Next Page"><ArrowRightCircle size={16} /></button>
              </div>
              <button onClick={(e) => { e.stopPropagation(); updateSections(sections.filter(sec => sec.id !== s.id)); }} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500"><X size={14} /></button>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      {/* 2. MAIN CONTENT: 右侧编辑区 */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {!activeSection ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-4"><LayoutList size={48} strokeWidth={1} /><p className="text-xs font-black uppercase tracking-widest">Select an outline to manage</p></div>
        ) : (
          <div className="flex-1 flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-end gap-6 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shrink-0">
              <div className="flex-1 space-y-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Outline Title</span>
                <Input value={activeSection.title} onChange={(e) => updateSections(sections.map(s => s.id === activeSection.id ? { ...s, title: e.target.value.toUpperCase() } : s))} className="!text-xl font-black !bg-white !text-[#264376] border-none shadow-sm" />
              </div>
              <button onClick={() => updateSections(sections.map(s => s.id === activeSectionId ? { ...s, items: [...s.items, { id: `item-${Date.now()}`, title: 'New Entry', time: '2024' }] } : s))} className="px-6 py-3 bg-[#264376] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all">Add Entry Item</button>
            </div>

            {/* 核心修复 2：Entries 列表增加 overflow-y-auto 并确保占据剩余空间 */}
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
              <div className="space-y-6 pb-20">
                {activeSection.items.map((item, idx) => (
                  <div key={item.id} className="bg-white rounded-[2rem] border-2 border-slate-50 p-6 shadow-sm hover:border-[#264376]/20 transition-all relative group/item">
                    <div className="absolute -top-2 -right-2 flex gap-1 z-10">
                      {idx > 0 && <button onClick={() => moveItem(idx, 'up')} className="w-8 h-8 bg-white border border-slate-100 shadow-md rounded-full flex items-center justify-center text-slate-400 hover:text-[#264376] transition-all"><ArrowUp size={14}/></button>}
                      {idx < activeSection.items.length - 1 && <button onClick={() => moveItem(idx, 'down')} className="w-8 h-8 bg-white border border-slate-100 shadow-md rounded-full flex items-center justify-center text-slate-400 hover:text-[#264376] transition-all"><ArrowDown size={14}/></button>}
                      <button onClick={() => updateSections(sections.map(s => s.id === activeSectionId ? { ...s, items: s.items.filter(i => i.id !== item.id) } : s))} className="w-8 h-8 bg-white border border-slate-100 shadow-md rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 transition-all"><Trash2 size={14}/></button>
                    </div>
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div className="space-y-1.5"><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Type size={10}/> Institution / Company</span><Input value={item.title} onChange={(e) => updateItem(item.id, { title: e.target.value })} className="font-bold text-xs" /></div>
                      <div className="space-y-1.5"><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Clock size={10}/> Timeline</span><Input value={item.time || ''} onChange={(e) => updateItem(item.id, { time: e.target.value })} className="font-mono text-xs" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div className="space-y-1.5"><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Settings2 size={10}/> Degree / Role</span><Input value={item.subtitle || ''} onChange={(e) => updateItem(item.id, { subtitle: e.target.value })} className="italic text-xs" /></div>
                      <div className="space-y-1.5"><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><MapPin size={10}/> Location</span><Input value={item.location || ''} onChange={(e) => updateItem(item.id, { location: e.target.value })} className="text-xs" /></div>
                    </div>
                    <div className="space-y-1.5"><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><List size={10}/> Details</span><TextArea value={item.description || ''} onChange={(e) => updateItem(item.id, { description: e.target.value })} rows={4} className="text-[11px] leading-relaxed" placeholder="Supports - for bullets" /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};