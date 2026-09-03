import React, { useState, useMemo } from 'react';
import { BentoItem } from '../../../../types';
import { Check, X } from 'lucide-react';

interface BentoVisualDesignerProps {
  rows: number;
  cols: number;
  currentItems: BentoItem[];
  onSave: (items: BentoItem[]) => void;
}

/**
 * BentoVisualDesigner - Bento 便携网格可视化绘制与双击合并设计器
 */
export const BentoVisualDesigner: React.FC<BentoVisualDesignerProps> = ({
  rows,
  cols,
  currentItems,
  onSave,
}) => {
  const [items, setItems] = useState<BentoItem[]>(currentItems);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());

  const isOccupied = (x: number, y: number) => {
    return items.some(
      (item) => x >= item.x && x < item.x + item.colSpan && y >= item.y && y < item.y + item.rowSpan
    );
  };

  const toggleCell = (x: number, y: number) => {
    if (isOccupied(x, y)) return;
    const key = `${x}-${y}`;
    const newSelected = new Set(selectedCells);
    if (newSelected.has(key)) newSelected.delete(key);
    else newSelected.add(key);
    setSelectedCells(newSelected);
  };

  const selectionInfo = useMemo(() => {
    if (selectedCells.size === 0) return null;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    selectedCells.forEach((key) => {
      const [x, y] = key.split('-').map(Number);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    });
    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    const isValid = selectedCells.size === width * height;
    return { x: minX, y: minY, w: width, h: height, isValid };
  }, [selectedCells]);

  const createItem = (x: number, y: number, w: number, h: number) => {
    const newItem: BentoItem = {
      id: `bento-${Date.now()}`,
      type: 'metric',
      x,
      y,
      colSpan: w,
      rowSpan: h,
      theme: 'light',
      title: 'New Item',
      fontSize: 1,
    };
    setItems((prev) => [...prev, newItem]);
    setSelectedCells(new Set());
  };

  const handleDoubleClickOnCell = (x: number, y: number) => {
    // 1. 如果有合法选择，合并选择
    if (selectionInfo?.isValid) {
      createItem(selectionInfo.x, selectionInfo.y, selectionInfo.w, selectionInfo.h);
    } else {
      // 2. 如果没有选择，直接在此处创建 1x1
      createItem(x, y, 1, 1);
    }
  };

  return (
    <div
      className="space-y-8 p-6"
      onContextMenu={(e) => {
        e.preventDefault();
        setSelectedCells(new Set());
      }}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">Step 1: Paint your layout</h4>
          <p className="text-xs text-slate-400 font-medium">
            Click to select • <span className="text-blue-600 font-bold underline">Double-Click</span> to create
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={!selectionInfo?.isValid}
            onClick={() => selectionInfo && createItem(selectionInfo.x, selectionInfo.y, selectionInfo.w, selectionInfo.h)}
            className={`px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
              selectionInfo?.isValid
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
            }`}
          >
            Create Selection
          </button>
          <button
            type="button"
            onClick={() => onSave(items)}
            className="px-8 py-2.5 bg-[#264376] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-[#264376]/20 transition-all hover:brightness-110"
          >
            Save & Exit
          </button>
        </div>
      </div>

      <div
        className="grid gap-2.5 bg-slate-100 p-4 rounded-[2.5rem] aspect-[16/10] relative select-none cursor-crosshair overflow-hidden"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
      >
        {Array.from({ length: rows * cols }).map((_, i) => {
          const x = (i % cols) + 1;
          const y = Math.floor(i / cols) + 1;
          const isSelected = selectedCells.has(`${x}-${y}`);
          const occupied = isOccupied(x, y);
          return (
            <div
              key={`bg-${i}`}
              onClick={() => toggleCell(x, y)}
              onDoubleClick={() => handleDoubleClickOnCell(x, y)}
              style={{ gridColumn: x, gridRow: y }}
              className={`rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center
                ${
                  occupied
                    ? 'bg-slate-200/50 border-transparent opacity-0 pointer-events-none'
                    : isSelected
                    ? 'bg-blue-500 border-blue-600 shadow-inner'
                    : 'bg-white border-slate-200 hover:border-blue-300'
                }`}
            >
              {isSelected && <Check size={12} className="text-white" />}
            </div>
          );
        })}
        {items.map((item) => (
          <div
            key={item.id}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setItems(items.filter((i) => i.id !== item.id));
            }}
            className="rounded-xl bg-[#264376] text-white flex flex-col items-center justify-center border-2 border-white shadow-lg animate-in zoom-in-95 duration-200 cursor-help group transition-transform active:scale-95"
            style={{ gridColumn: `${item.x} / span ${item.colSpan}`, gridRow: `${item.y} / span ${item.rowSpan}`, zIndex: 10 }}
          >
            <span className="text-[10px] font-black uppercase opacity-60 leading-none">
              {item.colSpan}x{item.rowSpan}
            </span>
            <X size={12} className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </div>
  );
};
