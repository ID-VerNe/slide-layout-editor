import React, { useState, useEffect, useCallback } from 'react';
import Preview from '../Preview';
import { PageData } from '../../types';

interface PreviewAreaProps {
  pages: PageData[];
  currentPageIndex: number;
  previewZoom: number;
  previewRef: React.RefObject<HTMLDivElement | null>;
  previewContainerRef: React.RefObject<HTMLDivElement | null>;
  enforceA4: boolean;
  isAutoFit: boolean; 
  setIsAutoFit: (val: boolean) => void; // 新增：接收控制函数
  onOverflowChange: (pageId: string, isOverflowing: boolean) => void;
}

/**
 * PreviewArea - 画布预览容器
 * 智能联动版：手动拖拽或滚动时自动解除 FIT 状态。
 */
const PreviewArea: React.FC<PreviewAreaProps> = ({
  pages,
  currentPageIndex,
  previewZoom,
  previewRef,
  previewContainerRef,
  isAutoFit,
  setIsAutoFit
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  // 核心逻辑：当开启 AutoFit 或 切换页面时，强制重置位移回中心 (0, 0)
  useEffect(() => {
    if (isAutoFit) {
      setDragOffset({ x: 0, y: 0 });
    }
  }, [isAutoFit, currentPageIndex]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if ((e.target as HTMLElement).tagName === 'TEXTAREA' || (e.target as HTMLElement).tagName === 'INPUT') {
      return;
    }

    // 核心修复：滚轮操作解除 FIT
    if (isAutoFit) setIsAutoFit(false);

    setDragOffset(prev => ({
      x: prev.x - e.deltaX,
      y: prev.y - e.deltaY
    }));
  }, [isAutoFit, setIsAutoFit]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // 核心修复：拖拽操作解除 FIT
    if (isAutoFit) setIsAutoFit(false);

    setIsDragging(true);
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastPos.x;
    const deltaY = e.clientY - lastPos.y;

    setDragOffset(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));

    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    setDragOffset({ x: 0, y: 0 });
  };

  return (
    <div 
      className={`flex-1 overflow-hidden no-scrollbar bg-neutral-200/50 flex items-center justify-center select-none relative
        ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      ref={previewContainerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
    >
      <div 
        className="magazine-canvas-scaler relative"
        ref={previewRef}
        style={{ 
          transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(${previewZoom})`,
          transformOrigin: 'center center',
          willChange: 'transform',
          // 在 FIT 模式下开启过渡动画，增强归位的视觉反馈
          transition: isAutoFit && !isDragging ? 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none'
        }}
      >
        {pages[currentPageIndex] && (
          <div 
            key={pages[currentPageIndex].id} 
            className="magazine-page-container block shadow-[0_60px_120px_-20px_rgba(0,0,0,0.2)] pointer-events-auto"
            onMouseDown={(e) => e.stopPropagation()} 
          >
            <Preview 
              page={pages[currentPageIndex]} 
              pageIndex={currentPageIndex}
              totalPages={pages.length}
            />
          </div>
        )}
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white/60 px-4 py-2 rounded-full shadow-sm backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity">
          Drag to Pan • Wheel to Scroll • Double Click to Center
        </p>
      </div>
    </div>
  );
};

export default PreviewArea;
