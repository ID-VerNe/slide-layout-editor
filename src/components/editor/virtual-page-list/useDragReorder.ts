import { useState, useRef } from 'react';
import { PageData } from '../../../types';

interface UseDragReorderProps {
  pages: PageData[];
  onReorderPages: (newPages: PageData[], isCommit?: boolean) => void;
}

/**
 * useDragReorder - 处理页面列表 HTML5 拖拽排序控制与节流
 */
export function useDragReorder({ pages, onReorderPages }: UseDragReorderProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const lastReorderRef = useRef(0);
  const lastDragOverIndexRef = useRef<number>(-1);
  const draggedPageIdRef = useRef<string | null>(null);
  // 记录最后一次视觉更新的顺序，落手提交时读取，避免闭包过期
  const lastNewPagesRef = useRef<PageData[] | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
    draggedPageIdRef.current = pages[index]?.id || null;
    lastDragOverIndexRef.current = index;
  };

  const commitReorder = (targetIndex: number) => {
    const currentDraggedIndex = pages.findIndex((p) => p.id === draggedPageIdRef.current);
    if (
      draggedPageIdRef.current == null ||
      currentDraggedIndex === -1 ||
      currentDraggedIndex === targetIndex ||
      targetIndex >= pages.length
    ) {
      return;
    }

    const newPages = [...pages];
    const [draggedPage] = newPages.splice(currentDraggedIndex, 1);
    newPages.splice(targetIndex, 0, draggedPage);

    lastNewPagesRef.current = newPages;
    // 拖拽中：仅视觉更新，不压栈
    onReorderPages(newPages, false);
    lastReorderRef.current = Date.now();
    lastDragOverIndexRef.current = targetIndex;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedPageIdRef.current == null) return;

    const currentDraggedIndex = pages.findIndex((p) => p.id === draggedPageIdRef.current);
    if (currentDraggedIndex === -1 || currentDraggedIndex === index) return;

    const now = Date.now();
    // 节流处理 (150ms)
    if (now - lastReorderRef.current < 150) return;
    if (lastDragOverIndexRef.current === index) return;

    commitReorder(index);
  };

  const handleDragEnd = () => {
    // 落手：以最后一次视觉更新的顺序提交一次历史
    const finalPages = lastNewPagesRef.current;
    if (finalPages) {
      onReorderPages(finalPages, true);
    }
    lastNewPagesRef.current = null;
    setDraggedIndex(null);
    draggedPageIdRef.current = null;
    lastDragOverIndexRef.current = -1;
  };

  return {
    draggedIndex,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
