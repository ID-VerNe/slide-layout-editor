import React, { useState, useRef, useEffect } from 'react';
import { FreeformItem, FreeformConfig } from '../../types/freeform.types';
import { PageData } from '../../types';
import { FreeformItem as FreeformItemComponent } from './FreeformItem';
import { AlignmentGuides } from './AlignmentGuides';
import { GridOverlay } from './GridOverlay';
import { useFreeformCanvas } from '../../hooks/useFreeformCanvas';
import { useFreeformStore } from '../../store/freeformStore';
import { calculateSnapping, AlignmentGuide } from '../../utils/alignmentUtils';

interface FreeformCanvasProps {
  items: FreeformItem[];
  page: PageData;
  config: FreeformConfig;
  onUpdate: (items: FreeformItem[]) => void;
  onConfigUpdate: (config: FreeformConfig) => void;
}

export const FreeformCanvas: React.FC<FreeformCanvasProps> = ({
  items,
  page,
  config,
  onUpdate,
  onConfigUpdate,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const selectedItemId = useFreeformStore((state) => state.selectedItemId);
  const selectItem = useFreeformStore((state) => state.selectItem);
  
  const [draggingItem, setDraggingItem] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [resizingItem, setResizingItem] = useState<{ id: string; handle: string; startX: number; startY: number; startWidth: number; startHeight: number; startLeft: number; startTop: number } | null>(null);
  const [activeGuides, setActiveGuides] = useState<AlignmentGuide[]>([]);

  const {
    snapToGrid,
    showAlignmentGuides,
    showGridOverlay,
    gridSize,
  } = useFreeformCanvas(config);

  // 键盘删除事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedItemId) return;
      // 避免在输入框中删除
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const newItems = items.filter(i => i.id !== selectedItemId);
        onUpdate(newItems);
        selectItem(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemId, items, onUpdate, selectItem]);

  const handleMouseDown = (e: React.MouseEvent, item: FreeformItem) => {
    if (e.button !== 0) return;
    e.stopPropagation(); 
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setDraggingItem({
      id: item.id,
      offsetX: mouseX - item.x,
      offsetY: mouseY - item.y,
    });
    
    selectItem(item.id);
  };

  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    const item = items.find(i => i.id === selectedItemId);
    if (!item) return;

    setResizingItem({
      id: item.id,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: item.width,
      startHeight: item.height,
      startLeft: item.x,
      startTop: item.y
    });
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
        selectItem(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (draggingItem) {
      const currentItem = items.find(i => i.id === draggingItem.id);
      if (!currentItem) return;

      let newX = mouseX - draggingItem.offsetX;
      let newY = mouseY - draggingItem.offsetY;

      // 1. Grid Snap
      if (snapToGrid) {
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }

      // 2. Smart Guides Snap (override grid if detected)
      // 只有开启且没有按住 Ctrl/Cmd (临时禁用) 时触发
      let guides: AlignmentGuide[] = [];
      if (showAlignmentGuides && !e.metaKey && !e.ctrlKey) {
        const otherItems = items.filter(i => i.id !== draggingItem.id);
        const snapResult = calculateSnapping(
          { ...currentItem, x: newX, y: newY },
          otherItems,
          10 // Threshold
        );
        newX = snapResult.x;
        newY = snapResult.y;
        guides = snapResult.guides;
      }
      setActiveGuides(guides);

      const updatedItems = items.map((item) => 
        item.id === draggingItem.id ? { ...item, x: newX, y: newY } : item
      );
      onUpdate(updatedItems);
    }

    if (resizingItem) {
      const deltaX = e.clientX - resizingItem.startX;
      const deltaY = e.clientY - resizingItem.startY;

      let newWidth = resizingItem.startWidth;
      let newHeight = resizingItem.startHeight;
      let newX = resizingItem.startLeft;
      let newY = resizingItem.startTop;

      if (resizingItem.handle === 'se') {
        newWidth += deltaX;
        newHeight += deltaY;
      } else if (resizingItem.handle === 'sw') {
        newWidth -= deltaX;
        newHeight += deltaY;
        newX += deltaX;
      } else if (resizingItem.handle === 'ne') {
        newWidth += deltaX;
        newHeight -= deltaY;
        newY += deltaY;
      } else if (resizingItem.handle === 'nw') {
        newWidth -= deltaX;
        newHeight -= deltaY;
        newX += deltaX;
        newY += deltaY;
      }

      if (snapToGrid) {
        newWidth = Math.round(newWidth / gridSize) * gridSize;
        newHeight = Math.round(newHeight / gridSize) * gridSize;
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }
      
      newWidth = Math.max(gridSize, newWidth);
      newHeight = Math.max(gridSize, newHeight);

      const updatedItems = items.map((item) => 
        item.id === resizingItem.id ? { ...item, width: newWidth, height: newHeight, x: newX, y: newY } : item
      );
      onUpdate(updatedItems);
      setActiveGuides([]); // Resize 时暂时禁用对齐线以保持流畅，或后续添加
    }
  };

  const handleMouseUp = () => {
    setDraggingItem(null);
    setResizingItem(null);
    setActiveGuides([]);
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full bg-white overflow-hidden select-none"
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {showGridOverlay && <GridOverlay size={gridSize} />}
      
      <AlignmentGuides guides={activeGuides} />

      {items.map((item) => (
        <FreeformItemComponent
          key={item.id}
          item={item}
          page={page}
          isSelected={selectedItemId === item.id}
          onMouseDown={(e) => handleMouseDown(e, item)}
          onResizeStart={handleResizeStart}
        />
      ))}
    </div>
  );
};
