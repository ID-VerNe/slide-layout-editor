import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FolderOpen, Save, Settings, Eraser, Layout, Trash2 } from 'lucide-react';
import { PageData } from '../../types';
import { BrandLogo } from '../ui/BrandLogo';

interface SidebarProps {
  pages: PageData[];
  currentPageIndex: number;
  onPageSelect: (index: number) => void;
  onAddPage: () => void;
  onRemovePage: (id: string) => void;
  onClearAll: () => void;
  onImport: () => void;
  onExport: () => void;
  onToggleFontManager: () => void;
  showFontManager: boolean;
  onNavigateHome: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  pages,
  currentPageIndex,
  onPageSelect,
  onAddPage,
  onRemovePage,
  onClearAll,
  onImport,
  onExport,
  onToggleFontManager,
  showFontManager,
  onNavigateHome
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);

  const currentPageId = pages[currentPageIndex]?.id;

  // 核心功能：自动聚焦滚动
  useEffect(() => {
    if (activeBtnRef.current && scrollRef.current) {
      activeBtnRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [currentPageIndex]);

  return (
    <motion.div 
      initial={{ x: -80 }}
      animate={{ x: 0 }}
      className="w-24 bg-white border-r border-neutral-200 flex flex-col items-center z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
    >
      {/* Top Logo */}
      <div className="w-full h-16 flex items-center justify-center shrink-0 border-b border-slate-50">
        <button 
          onClick={onNavigateHome}
          className="w-12 h-12 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          title="Back to Dashboard"
        >
          <BrandLogo className="w-full h-full" />
        </button>
      </div>
      
      {/* Pages List */}
      <div 
        ref={scrollRef}
        className="flex-1 w-full flex flex-col items-center gap-4 overflow-y-auto no-scrollbar pt-6 pb-6"
      >
        <AnimatePresence initial={false}>
          {pages.map((p, idx) => {
            const isActive = idx === currentPageIndex;
            return (
              <div key={p.id} className="relative px-3 w-full group">
                {/* Active Indicator Bar */}
                {isActive && (
                  <motion.div 
                    layoutId="active-bar"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#264376] rounded-r-full z-10"
                  />
                )}
                
                <button
                  ref={isActive ? activeBtnRef : null}
                  onClick={() => onPageSelect(idx)}
                  className={`w-full aspect-[16/10] rounded-lg transition-all flex flex-col items-center justify-center relative overflow-hidden border-2
                    ${isActive 
                      ? 'border-[#264376] bg-white shadow-xl shadow-[#264376]/10' 
                      : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-300 hover:bg-slate-100'}`}
                >
                  {/* Thumbnail Placeholder */}
                  <div className="flex flex-col items-center gap-1 opacity-60">
                    <span className={`text-[10px] font-black ${isActive ? 'text-[#264376]' : 'text-slate-400'}`}>
                      {idx + 1}
                    </span>
                    <Layout size={10} className={isActive ? 'text-[#264376]' : 'text-slate-300'} />
                  </div>

                  {/* Layout Type Name (Hover only) */}
                  <div className="absolute inset-0 bg-[#264376]/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[8px] font-black text-white uppercase tracking-tighter">
                      {p.layoutId.split('-')[0]}
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </AnimatePresence>

        {/* Add Page Button */}
        <button 
          onClick={() => onAddPage()}
          className="w-12 h-12 shrink-0 rounded-2xl border-2 border-dashed border-slate-200 text-slate-300 hover:border-[#264376] hover:text-[#264376] hover:bg-[#264376]/10 flex items-center justify-center transition-all mt-2 active:scale-90"
          title="Add New Slide"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* Bottom Actions */}
      <div className="mt-auto flex flex-col items-center gap-1 pb-4 pt-4 border-t border-slate-50 w-full px-3">
        <ActionButton onClick={onToggleFontManager} icon={Settings} title="Settings" active={showFontManager} />
        <ActionButton onClick={onImport} icon={FolderOpen} title="Import" />
        <ActionButton onClick={onExport} icon={Save} title="Save" />
        <div className="h-px w-8 bg-slate-100 my-1" />
        <ActionButton onClick={() => onRemovePage(currentPageId)} icon={Trash2} title="Delete Slide" danger />
        <ActionButton onClick={onClearAll} icon={Eraser} title="Reset Project" danger />
      </div>
    </motion.div>
  );
};

// Sub-component for clean code
const ActionButton = ({ onClick, icon: Icon, title, active = false, danger = false }: any) => (
  <button 
    onClick={onClick}
    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90
      ${active ? 'bg-[#264376] text-white shadow-lg shadow-[#264376]/20' : 
        danger ? 'text-slate-300 hover:bg-red-50 hover:text-red-500' : 
        'text-slate-400 hover:bg-[#264376]/10 hover:text-[#264376]'}`}
    title={title}
  >
    <Icon size={18} />
  </button>
);

export default Sidebar;