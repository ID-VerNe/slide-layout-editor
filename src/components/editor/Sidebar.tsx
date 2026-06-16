import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Plus, Settings, Eraser, Layout, Trash2 } from 'lucide-react';
import { PageData } from '../../types';
import { BrandLogo } from '../ui/BrandLogo';
import { LAYOUT_CONFIG } from '../../constants/layout';
import { nativeFs } from '../../utils/native-fs';
import { useUI } from '../../context/UIContext';
import VirtualPageList from './VirtualPageList';
import ActionButton from '../ui/ActionButton';

interface SidebarProps {
  pages: PageData[];
  currentPageIndex: number;
  onPageSelect: (index: number) => void;
  onAddPage: () => void;
  onRemovePage: (id: string) => void;
  onReorderPages: (newPages: PageData[]) => void; 
  onClearAll: () => void;
  onImport: () => void;
  onExport: () => void;
  onToggleFontManager: () => void;
  showFontManager: boolean;
  onNavigateHome: () => void;
  onNativeSave: () => void;
  onNativeSaveAs: () => void;
  onNativeOpen: () => void;
}

const VIRTUAL_SCROLL_THRESHOLD = 30;

const Sidebar: React.FC<SidebarProps> = (props) => {
  const {
    pages,
    currentPageIndex,
    onPageSelect,
    onAddPage,
    onRemovePage,
    onReorderPages,
    onClearAll,
    onToggleFontManager,
    showFontManager,
    onNavigateHome
  } = props;

  const scrollRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);

  const { confirm } = useUI();

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

  const handleRemoveCurrentPage = () => {
    if (!currentPageId) return;
    confirm('Delete Slide', 'Are you sure you want to delete the current slide? This cannot be undone.', () => {
      onRemovePage(currentPageId);
    });
  };

  const handleClearAll = () => {
    confirm('Reset Project', 'This will reset the project to its initial state. All unsaved changes will be lost. Continue?', () => {
      onClearAll();
    });
  };

  // Use virtual scroll for large projects
  if (pages.length >= VIRTUAL_SCROLL_THRESHOLD) {
    return <VirtualPageList {...props} />;
  }

  return (
    <motion.div 
      initial={{ x: -80 }}
      animate={{ x: 0 }}
      className="w-24 bg-white border-r border-zine-accent flex flex-col items-center z-50"
    >
      <div className="w-full h-16 flex items-center justify-center shrink-0 border-b border-zine-accent/10">
        <button 
          onClick={onNavigateHome}
          className="w-12 h-12 flex items-center justify-center grayscale hover:grayscale-0 transition-all"
          title="Back to Dashboard"
        >
          <BrandLogo className="w-full h-full" />
        </button>
      </div>
      
      <Reorder.Group 
        axis="y" 
        values={pages} 
        onReorder={onReorderPages}
        className="flex-1 w-full flex flex-col items-center gap-0 overflow-y-auto no-scrollbar"
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
              className="relative w-full group cursor-grab active:cursor-grabbing border-b border-zine-accent/5 last:border-b-0"
            >
              <button
                ref={isActive ? activeBtnRef : null}
                onClick={() => onPageSelect(idx)}
                className={`w-full aspect-square transition-all flex flex-col items-center justify-center relative overflow-hidden
                  ${isActive 
                    ? 'bg-zine-accent text-white' 
                    : 'bg-white text-zine-secondary hover:bg-zine-surface'}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div 
                    className={`border-[1px] transition-all duration-300 flex items-center justify-center
                      ${isActive ? 'border-white bg-white/10' : 'border-zine-accent/20 bg-transparent'}
                      ${isPortrait ? 'w-5 h-7' : 'w-8 h-5'}`}
                  >
                    <span className={`text-[9px] font-black font-mono tracking-tighter ${isActive ? 'text-white' : 'text-zine-accent/30'}`}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                </div>
                
                {/* ID Overlay */}
                <div className={`absolute bottom-1 right-1 px-1 text-[7px] font-black uppercase tracking-widest ${isActive ? 'text-zine-accent/40' : 'text-zine-accent/20'}`}>
                  {p.layoutId.split('-')[0]}
                </div>

                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />
                )}
              </button>
            </Reorder.Item>
          );
        })}

        <button 
          onClick={(e) => { e.preventDefault(); onAddPage(); }}
          className="w-full aspect-square shrink-0 border-b border-zine-accent/10 text-zine-secondary hover:bg-zine-surface hover:text-zine-accent flex items-center justify-center transition-all"
          title="Add New Slide"
        >
          <Plus size={20} strokeWidth={3} />
        </button>
      </Reorder.Group>

      <div className="mt-auto flex flex-col items-center w-full border-t border-zine-accent divide-y divide-zine-accent/10">
        <ActionButton onClick={onToggleFontManager} icon={Settings} title="Settings" active={showFontManager} />
        <ActionButton onClick={handleRemoveCurrentPage} icon={Trash2} title="Delete Slide" danger />
        <ActionButton onClick={handleClearAll} icon={Eraser} title="Reset Project" danger />
      </div>
    </motion.div>
  );
};

export default Sidebar;
