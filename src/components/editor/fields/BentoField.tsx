import React, { useState } from 'react';
import { PageData, BentoItem } from '../../../types';
import { LayoutGrid, Grid3X3, Plus, MousePointer2 } from 'lucide-react';
import { Input } from '../../ui/Base';
import { FieldWrapper } from './FieldWrapper';
import Modal from '../../Modal';
import { BentoItemCard } from './bento/BentoItemCard';
import { BentoVisualDesigner } from './bento/BentoVisualDesigner';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  pages?: PageData[];
}

/**
 * BentoField - 便携网格与多功能卡片字段主入口
 * 职责：连接页面状态、网格行列管理、编排卡片列表与可视化网格设计器
 */
export const BentoField: React.FC<FieldProps> = ({ page, onUpdate, pages = [] }) => {
  const [isVisualEditorOpen, setIsVisualEditorOpen] = useState(false);
  const [adjustingIdx, setAdjustingIdx] = useState<number | null>(null);

  const items = page.bentoItems || [];
  const bentoConfig = page.bentoConfig || { rows: 3, cols: 3 };

  const updateItems = (newItems: BentoItem[]) => {
    onUpdate({ ...page, bentoItems: newItems });
  };

  const updateConfig = (updates: Partial<{ rows: number; cols: number }>) => {
    onUpdate({ ...page, bentoConfig: { ...bentoConfig, ...updates } });
  };

  const addItem = () => {
    const newItem: BentoItem = {
      id: `bento-${Date.now()}`,
      type: 'metric',
      x: 1,
      y: 1,
      colSpan: 1,
      rowSpan: 1,
      theme: 'light',
      title: 'New Card',
      fontSize: 1,
    };
    updateItems([...items, newItem]);
  };

  const updateItem = (idx: number, updates: Partial<BentoItem>) => {
    const next = [...items];
    next[idx] = { ...next[idx], ...updates };
    updateItems(next);
  };

  const removeItem = (idx: number) => {
    updateItems(items.filter((_, i) => i !== idx));
    if (adjustingIdx === idx) setAdjustingIdx(null);
  };

  return (
    <FieldWrapper page={page} onUpdate={onUpdate} fieldKey="bento" label="Bento Grid" icon={LayoutGrid}>
      <div className="space-y-4">
        {/* 顶部行列配置与快捷添加 */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-4">
          <Grid3X3 size={16} className="text-slate-400" />
          <div className="flex-1 flex gap-2">
            <div className="flex-1">
              <span className="text-[8px] font-black uppercase text-slate-400 ml-1">Cols</span>
              <Input
                type="number"
                min={1}
                max={6}
                value={bentoConfig.cols}
                onChange={(e) => updateConfig({ cols: Math.min(6, Math.max(1, parseInt(e.target.value) || 1)) })}
                className="font-mono text-xs font-bold py-1"
              />
            </div>
            <div className="flex-1">
              <span className="text-[8px] font-black uppercase text-slate-400 ml-1">Rows</span>
              <Input
                type="number"
                min={1}
                max={6}
                value={bentoConfig.rows}
                onChange={(e) => updateConfig({ rows: Math.min(6, Math.max(1, parseInt(e.target.value) || 1)) })}
                className="font-mono text-xs font-bold py-1"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={addItem}
            className="px-3 py-2 bg-white border border-slate-200 text-[#264376] rounded-lg font-black text-[9px] uppercase tracking-wider hover:bg-slate-50 shadow-xs flex items-center gap-1 mt-3"
          >
            <Plus size={12} /> Add
          </button>
        </div>

        {/* 可视化绘制入口 */}
        <button
          type="button"
          onClick={() => setIsVisualEditorOpen(true)}
          className="w-full py-4 bg-[#264376] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-[#264376]/20 hover:brightness-110 transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          <MousePointer2 size={16} /> Open Bento Layout Painter
        </button>

        {/* Bento 单卡列表 */}
        <div className="space-y-3 pt-2">
          {items.map((item, idx) => (
            <BentoItemCard
              key={item.id}
              item={item}
              idx={idx}
              pages={pages}
              isAdjusting={adjustingIdx === idx}
              onToggleAdjust={() => setAdjustingIdx(adjustingIdx === idx ? null : idx)}
              onUpdate={(updates) => updateItem(idx, updates)}
              onRemove={() => removeItem(idx)}
            />
          ))}
        </div>

        {/* 可视化编辑器弹窗 */}
        <Modal
          isOpen={isVisualEditorOpen}
          onClose={() => setIsVisualEditorOpen(false)}
          title="Bento Grid Designer"
          maxWidth="max-w-5xl"
          type="custom"
        >
          <BentoVisualDesigner
            rows={bentoConfig.rows}
            cols={bentoConfig.cols}
            currentItems={items}
            onSave={(newItems) => {
              updateItems(newItems);
              setIsVisualEditorOpen(false);
            }}
          />
        </Modal>
      </div>
    </FieldWrapper>
  );
};