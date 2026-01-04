import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Plus, FolderOpen, Settings, Eraser, Layout, Trash2, Download } from 'lucide-react';
import { PageData } from '../../types';
import { BrandLogo } from '../ui/BrandLogo';
import { LAYOUT_CONFIG } from '../../constants/layout';

interface SidebarProps {
  pages: PageData[];
  currentPageIndex: number;
  onPageSelect: (index: number) => void;
  onAddPage: () => void;
  onRemovePage: (id: string) => void;
  onReorderPages: (newPages: PageData[]) => void; // 新增：排序回调
  onClearAll: () => void;
  onImport: () => void;
  onExport: () => void;
  onToggleFontManager: () => void;
  showFontManager: boolean;
  onNavigateHome: () => void;
}

/**
 * Sidebar - 侧边栏
 * 升级版：支持 Reorder 拖拽排序。
 */
const Sidebar: React.FC<SidebarProps> = ({
  pages,
  currentPageIndex,
  onPageSelect,
  onAddPage,
  onRemovePage,
  onReorderPages,
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
      
      {/* Pages List - 替换为 Reorder.Group */}
      <Reorder.Group 
        axis="y" 
        values={pages} 
        onReorder={onReorderPages}
        className="flex-1 w-full flex flex-col items-center gap-6 overflow-y-auto no-scrollbar pt-6 pb-6"
        ref={scrollRef}
      >
        {pages.map((p, idx) => {
          const isActive = idx === currentPageIndex;
          const dims = LAYOUT_CONFIG[p.aspectRatio || '16:9'];
          const isPortrait = dims.height > dims.width;

          return (
            <Reorder.Item 
              key={p.id} 
              value={p}
              className="relative px-3 w-full group cursor-grab active:cursor-grabbing"
            >
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
                className={`w-full transition-all flex flex-col items-center justify-center relative overflow-hidden border-2 rounded-xl
                  ${isActive 
                    ? 'border-[#264376] bg-white shadow-xl shadow-[#264376]/10' 
                    : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-300 hover:bg-slate-100'}
                  ${isPortrait ? 'aspect-[2/3]' : 'aspect-[16/10]'}`}
              >
                {/* Thumbnail Placeholder */}
                <div className="flex flex-col items-center gap-1 opacity-60 pointer-events-none">
                  <span className={`text-[10px] font-black ${isActive ? 'text-[#264376]' : 'text-slate-400'}`}>
                    {idx + 1}
                  </span>
                  <Layout size={isPortrait ? 14 : 10} className={isActive ? 'text-[#264376]' : 'text-slate-300'} />
                </div>

                {/* Layout Type Name (Hover only) */}
                <div className="absolute inset-0 bg-[#264376]/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="text-[8px] font-black text-white uppercase tracking-tighter">
                    {p.layoutId.split('-')[0]}
                  </span>
                </div>
              </button>
            </Reorder.Item>
          );
        })}

        {/* Add Page Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            onAddPage();
          }}
          className="w-12 h-12 shrink-0 rounded-2xl border-2 border-dashed border-slate-200 text-slate-300 hover:border-[#264376] hover:text-[#264376] hover:bg-[#264376]/10 flex items-center justify-center transition-all mt-2 active:scale-90"
          title="Add New Slide"
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </Reorder.Group>

      {/* Bottom Actions */}
      <div className="mt-auto flex flex-col items-center gap-1 pb-4 pt-4 border-t border-slate-50 w-full px-3">
        <ActionButton onClick={onToggleFontManager} icon={Settings} title="Settings" active={showFontManager} />
        <ActionButton onClick={onImport} icon={FolderOpen} title="Import Project" />
        <ActionButton onClick={onExport} icon={Download} title="Download (.slgrid)" />
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