import React from 'react';
import { motion } from 'framer-motion';
import { PageData } from '../../../types';
import { LAYOUT_CONFIG } from '../../../constants/layout';

interface VirtualPageListItemProps {
  page: PageData;
  index: number;
  isActive: boolean;
  isDragged: boolean;
  style: React.CSSProperties;
  onPageSelect: (index: number) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
}

/**
 * VirtualPageListItem - 单项页面缩略卡片与拖拽容器
 */
export const VirtualPageListItem: React.FC<VirtualPageListItemProps> = ({
  page,
  index,
  isActive,
  isDragged,
  style,
  onPageSelect,
  onDragStart,
  onDragOver,
  onDragEnd,
}) => {
  const dims = LAYOUT_CONFIG[page.aspectRatio || '16:9'];
  const isPortrait = dims.height > dims.width;

  return (
    <div
      style={style}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      className={`relative px-3 w-full group cursor-grab active:cursor-grabbing transition-all ${
        isDragged ? 'opacity-50' : 'opacity-100'
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="active-bar"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#264376] rounded-r-full z-10"
        />
      )}

      <button
        type="button"
        onClick={() => onPageSelect(index)}
        className={`w-full aspect-square transition-all flex flex-col items-center justify-center relative overflow-hidden border-2 rounded-2xl ${
          isActive
            ? 'border-[#264376] bg-white shadow-xl shadow-[#264376]/10'
            : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-300 hover:bg-slate-100'
        }`}
      >
        <div className="flex flex-col items-center gap-1 opacity-60 pointer-events-none scale-110">
          <div
            className={`border-[1.5px] rounded-sm transition-all duration-500 flex items-center justify-center ${
              isActive ? 'border-[#264376] bg-[#264376]/5' : 'border-slate-300 bg-white'
            } ${isPortrait ? 'w-6 h-9' : 'w-10 h-6'}`}
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
