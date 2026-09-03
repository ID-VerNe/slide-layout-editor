import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Settings, Eraser, Trash2 } from 'lucide-react';
import { PageData } from '../../types';
import { BrandLogo } from '../ui/BrandLogo';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useUI } from '../../context/UIContext';
import ActionButton from '../ui/ActionButton';
import { useDragReorder } from './virtual-page-list/useDragReorder';
import { VirtualPageListItem } from './virtual-page-list/VirtualPageListItem';

interface VirtualPageListProps {
  pages: PageData[];
  currentPageIndex: number;
  onPageSelect: (index: number) => void;
  onAddPage: () => void;
  onRemovePage: (id: string) => void;
  onReorderPages: (newPages: PageData[]) => void;
  onClearAll: () => void;
  onImport?: () => void;
  onExport?: () => void;
  onToggleFontManager: () => void;
  showFontManager: boolean;
  onNavigateHome: () => void;
  onNativeSave?: () => void;
  onNativeSaveAs?: () => void;
  onNativeOpen?: () => void;
}

const ITEM_HEIGHT = 72; // 每个页面的高度
const ITEM_GAP = 16; // 页面之间的间距

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
  onNavigateHome,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const { confirm } = useUI();

  const {
    draggedIndex,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useDragReorder({ pages, onReorderPages });

  const rowVirtualizer = useVirtualizer({
    count: pages.length + 1, // +1 for the "Add New Slide" button
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT + ITEM_GAP,
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  // 滚动到当前选中的页面
  useEffect(() => {
    if (currentPageIndex >= 0 && parentRef.current) {
      rowVirtualizer.scrollToIndex(currentPageIndex, {
        align: 'center',
        behavior: 'smooth',
      });
    }
  }, [currentPageIndex, rowVirtualizer]);

  const handleClearAll = () => {
    confirm('Clear Project', 'Are you sure you want to clear all pages and reset the project? This action cannot be undone.', onClearAll);
  };

  const handleRemoveCurrentPage = () => {
    if (pages.length <= 1) {
      return;
    }
    const cur = pages[currentPageIndex];
    if (!cur) return;
    confirm('Delete Page', 'Are you sure you want to delete this page?', () => {
      onRemovePage(cur.id);
    });
  };

  return (
    <motion.div
      initial={{ x: -80 }}
      animate={{ x: 0 }}
      className="w-24 h-full bg-white border-r border-neutral-200 flex flex-col items-center z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
    >
      <div className="w-full h-16 flex items-center justify-center shrink-0 border-b border-slate-50">
        <button
          type="button"
          onClick={onNavigateHome}
          className="w-12 h-12 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          title="Back to Dashboard"
        >
          <BrandLogo className="w-full h-full" />
        </button>
      </div>

      <div ref={parentRef} className="flex-1 w-full overflow-y-auto no-scrollbar pt-6 pb-6">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualItem) => {
            const index = virtualItem.index;
            const isAddButton = index === pages.length;

            if (isAddButton) {
              return (
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
                  <div style={{ height: `${ITEM_HEIGHT}px` }} className="px-3 w-full">
                    <button
                      type="button"
                      onClick={onAddPage}
                      className="w-full aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-300 hover:text-zine-accent hover:border-zine-accent hover:bg-slate-50 transition-all group"
                      title="Add New Slide"
                    >
                      <Plus size={24} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              );
            }

            const page = pages[index];
            return (
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
                <VirtualPageListItem
                  page={page}
                  index={index}
                  isActive={index === currentPageIndex}
                  isDragged={draggedIndex === index}
                  style={{ height: `${ITEM_HEIGHT}px` }}
                  onPageSelect={onPageSelect}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-auto flex flex-col items-center gap-1 pb-4 pt-4 border-t border-slate-50 w-full px-3">
        <ActionButton onClick={onToggleFontManager} icon={Settings} title="Settings" active={showFontManager} size="sm" />
        <div className="h-px w-8 bg-slate-100 my-1" />
        <ActionButton onClick={handleRemoveCurrentPage} icon={Trash2} title="Delete Slide" danger size="sm" />
        <ActionButton onClick={handleClearAll} icon={Eraser} title="Reset Project" danger size="sm" />
      </div>
    </motion.div>
  );
};

export default VirtualPageList;
