import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Settings, Eraser, Trash2 } from 'lucide-react';
import { PageData } from '../../types';
import { BrandLogo } from '../ui/BrandLogo';
import { LAYOUT_CONFIG } from '../../constants/layout';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualPageListProps {
  pages: PageData[];
  currentPageIndex: number;
  onPageSelect: (index: number) => void;
  onAddPage: () => void;
  onRemovePage: (id: string) => void;
  onReorderPages: (newPages: PageData[]) => void;
  onClearAll: () => void;
  onToggleFontManager: () => void;
  showFontManager: boolean;
  onNavigateHome: () => void;
}

const ITEM_HEIGHT = 72; // 每个页面的高度 (w-24 minus px-3 on both sides)
const ITEM_GAP = 16; // 页面之间的间距 (gap-4)

const VirtualPageList: React.FC<VirtualPageListProps> = ({
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
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: pages.length + 1, // +1 for the "Add New Slide" button
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT + ITEM_GAP,
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  // 滚动到当前页面
  useEffect(() => {
    if (currentPageIndex >= 0 && parentRef.current) {
      rowVirtualizer.scrollToIndex(currentPageIndex, {
        align: 'center',
        behavior: 'smooth',
      });
    }
  }, [currentPageIndex, rowVirtualizer]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index || index >= pages.length) return;

    const newPages = [...pages];
    const [draggedPage] = newPages.splice(draggedIndex, 1);
    newPages.splice(index, 0, draggedPage);

    onReorderPages(newPages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const currentPageId = pages[currentPageIndex]?.id;

  const renderPageItem = (index: number, style: React.CSSProperties) => {
    if (index === pages.length) {
      // Render "Add New Slide" button
      return (
        <div style={style} className="px-3 w-full flex items-center justify-center">
          <button 
            onClick={(e) => { e.preventDefault(); onAddPage(); }}
            className="w-12 h-12 shrink-0 rounded-2xl border-2 border-dashed border-slate-200 text-slate-300 hover:border-[#264376] hover:text-[#264376] hover:bg-[#264376]/10 flex items-center justify-center transition-all active:scale-90"
            title="Add New Slide"
          >
            <Plus size={24} strokeWidth={3} />
          </button>
        </div>
      );
    }

    const page = pages[index];
    const isActive = index === currentPageIndex;
    const dims = LAYOUT_CONFIG[page.aspectRatio || '16:9'];
    const isPortrait = dims.height > dims.width;

    return (
      <div
        style={style}
        draggable
        onDragStart={() => handleDragStart(index)}
        onDragOver={(e) => handleDragOver(e, index)}
        onDragEnd={handleDragEnd}
        className={`relative px-3 w-full group cursor-grab active:cursor-grabbing transition-all
          ${draggedIndex === index ? 'opacity-50' : 'opacity-100'}`}
      >
        {isActive && (
          <motion.div 
            layoutId="active-bar"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#264376] rounded-r-full z-10"
          />
        )}
        
        <button
          onClick={() => onPageSelect(index)}
          className={`w-full aspect-square transition-all flex flex-col items-center justify-center relative overflow-hidden border-2 rounded-2xl
            ${isActive 
              ? 'border-[#264376] bg-white shadow-xl shadow-[#264376]/10' 
              : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-300 hover:bg-slate-100'}`}
        >
          <div className="flex flex-col items-center gap-1 opacity-60 pointer-events-none scale-110">
            <div 
              className={`border-[1.5px] rounded-sm transition-all duration-500 flex items-center justify-center
                ${isActive ? 'border-[#264376] bg-[#264376]/5' : 'border-slate-300 bg-white'}
                ${isPortrait ? 'w-6 h-9' : 'w-10 h-6'}`}
            >
              <span className={`text-[8px] font-black ${isActive ? 'text-[#264376]' : 'text-slate-300'}`}>
                {index + 1}
              </span>
            </div>
          </div>
          <div className="absolute inset-0 bg-[#264376]/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <span className="text-[8px] font-black text-white uppercase tracking-tighter">
              {page.layoutId.split('-')[0]}
            </span>
          </div>
        </button>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ x: -80 }}
      animate={{ x: 0 }}
      className="w-24 h-full bg-white border-r border-neutral-200 flex flex-col items-center z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
    >
      <div className="w-full h-16 flex items-center justify-center shrink-0 border-b border-slate-50">
        <button 
          onClick={onNavigateHome}
          className="w-12 h-12 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          title="Back to Dashboard"
        >
          <BrandLogo className="w-full h-full" />
        </button>
      </div>
      
      <div
        ref={parentRef}
        className="flex-1 w-full overflow-y-auto no-scrollbar pt-6 pb-6"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualItem) => (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderPageItem(virtualItem.index, {
                height: `${ITEM_HEIGHT}px`,
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto flex flex-col items-center gap-1 pb-4 pt-4 border-t border-slate-50 w-full px-3">
        <ActionButton onClick={onToggleFontManager} icon={Settings} title="Settings" active={showFontManager} />
        
        <div className="h-px w-8 bg-slate-100 my-1" />
        <ActionButton onClick={() => onRemovePage(currentPageId)} icon={Trash2} title="Delete Slide" danger />
        <ActionButton onClick={onClearAll} icon={Eraser} title="Reset Project" danger />
      </div>
    </motion.div>
  );
};

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

export default VirtualPageList;
