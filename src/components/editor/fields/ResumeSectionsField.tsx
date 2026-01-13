import React, { useState } from 'react';
import { PageData } from '../../../types';
import { LayoutGrid, Edit3 } from 'lucide-react';
import Modal from '../../Modal';
import { ResumeContentHub } from './ResumeContentHub';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
}

/**
 * ResumeSectionsField - 唤起器组件
 * 只保留一个进入“内容中心”的入口，保持侧边栏清爽
 */
export const ResumeSectionsField: React.FC<FieldProps> = ({ page, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2 mb-4">
        <div className="flex items-center gap-2">
          <LayoutGrid size={16} className="text-slate-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resume Data</span>
        </div>
      </div>

      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-6 px-4 bg-[#264376] text-white rounded-2xl shadow-xl shadow-[#264376]/20 flex flex-col items-center justify-center gap-3 group hover:brightness-110 active:scale-95 transition-all"
      >
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:rotate-12 transition-transform">
          <Edit3 size={20} />
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Open Content Hub</p>
          <p className="text-[8px] opacity-60 font-bold uppercase mt-1">Manage Sections & Entries</p>
        </div>
      </button>

      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="Resume Content Hub" 
        type="custom" 
        maxWidth="max-w-6xl"
      >
        <ResumeContentHub page={page} onUpdate={onUpdate} />
      </Modal>
    </div>
  );
};