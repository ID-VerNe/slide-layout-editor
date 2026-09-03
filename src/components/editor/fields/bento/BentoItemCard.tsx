import React from 'react';
import { BentoItem, PageData } from '../../../../types';
import { 
  Hash, 
  Image as ImageIcon, 
  Smile, 
  ListOrdered, 
  Crop, 
  RotateCcw, 
  X 
} from 'lucide-react';
import { Input, Slider } from '../../../ui/Base';
import { IconPicker } from '../../../ui/IconPicker';

interface BentoItemCardProps {
  item: BentoItem;
  idx: number;
  pages: PageData[];
  isAdjusting: boolean;
  onToggleAdjust: () => void;
  onUpdate: (updates: Partial<BentoItem>) => void;
  onRemove: () => void;
}

/**
 * BentoItemCard - 单个 Bento 单元格项编辑器卡片
 */
export const BentoItemCard: React.FC<BentoItemCardProps> = ({
  item,
  idx,
  pages,
  isAdjusting,
  onToggleAdjust,
  onUpdate,
  onRemove,
}) => {
  return (
    <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-3">
      {/* 头部类型与删除 */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black text-slate-400 font-mono">
          #{idx + 1}
        </span>
        <div className="flex bg-slate-100 p-0.5 rounded-lg gap-0.5">
          {[
            { id: 'metric', icon: Hash },
            { id: 'image', icon: ImageIcon },
            { id: 'icon-text', icon: Smile },
            { id: 'feature-list', icon: ListOrdered },
          ].map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => onUpdate({ type: type.id as any })}
                className={`p-1 rounded-md transition-all ${
                  item.type === type.id
                    ? 'bg-white text-[#264376] shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon size={12} />
              </button>
            );
          })}
        </div>
        {item.type === 'image' && (
          <button
            type="button"
            onClick={onToggleAdjust}
            className={`p-1 rounded-md transition-all ${
              isAdjusting ? 'bg-[#264376] text-white' : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Adjust Image Position"
          >
            <Crop size={12} />
          </button>
        )}
        <button
          type="button"
          onClick={onRemove}
          className="ml-auto p-1 text-slate-300 hover:text-red-500"
        >
          <X size={14} />
        </button>
      </div>

      {/* 内部字段配置 */}
      <div className="space-y-2">
        {item.type === 'metric' && (
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Value"
              value={item.value || ''}
              onChange={(e) => onUpdate({ value: e.target.value })}
              className="font-bold"
            />
            <Input
              placeholder="Label"
              value={item.title || ''}
              onChange={(e) => onUpdate({ title: e.target.value })}
            />
          </div>
        )}
        {item.type === 'image' && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <IconPicker
                value={item.image || ''}
                onChange={(v) => onUpdate({ image: v })}
                allowedTabs={['upload', 'map', 'history']}
                pages={pages}
              />
              <Input
                placeholder="Label"
                value={item.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                className="flex-1"
              />
            </div>
            {isAdjusting && (
              <div className="p-3 bg-slate-50 rounded-xl space-y-4 border border-slate-100 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    Image Focus
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdate({ imageConfig: { scale: 1, x: 0, y: 0 } })}
                    className="text-[8px] font-black text-slate-400 hover:text-[#264376] uppercase flex items-center gap-1"
                  >
                    <RotateCcw size={10} /> Reset
                  </button>
                </div>
                <Slider
                  label="Scale"
                  value={item.imageConfig?.scale || 1}
                  min={0.5}
                  max={3}
                  step={0.05}
                  onChange={(v) =>
                    onUpdate({ imageConfig: { ...(item.imageConfig || { x: 0, y: 0 }), scale: v } })
                  }
                />
                <Slider
                  label="X Pos"
                  value={item.imageConfig?.x || 0}
                  min={-100}
                  max={100}
                  step={1}
                  onChange={(v) =>
                    onUpdate({ imageConfig: { ...(item.imageConfig || { scale: 1, y: 0 }), x: v } })
                  }
                />
                <Slider
                  label="Y Pos"
                  value={item.imageConfig?.y || 0}
                  min={-100}
                  max={100}
                  step={1}
                  onChange={(v) =>
                    onUpdate({ imageConfig: { ...(item.imageConfig || { scale: 1, x: 0 }), y: v } })
                  }
                />
              </div>
            )}
          </div>
        )}
        {item.type === 'icon-text' && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <IconPicker value={item.icon || 'Box'} onChange={(v) => onUpdate({ icon: v })} />
              <Input
                placeholder="Title"
                value={item.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                className="flex-1 font-bold"
              />
            </div>
            <Input
              placeholder="Subtitle"
              value={item.subtitle || ''}
              onChange={(e) => onUpdate({ subtitle: e.target.value })}
            />
          </div>
        )}
        {item.type === 'feature-list' && (
          <div className="space-y-2">
            <Input
              placeholder="Title"
              value={item.title || ''}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="font-bold"
            />
            <Input
              placeholder="Subtitle"
              value={item.subtitle || ''}
              onChange={(e) => onUpdate({ subtitle: e.target.value })}
            />
          </div>
        )}
        <div className="flex gap-1.5 pt-1">
          {(['light', 'dark', 'accent', 'glass'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onUpdate({ theme: t })}
              className={`w-3.5 h-3.5 rounded-full border transition-all ${
                item.theme === t ? 'ring-2 ring-[#264376] scale-110' : ''
              } ${
                t === 'light'
                  ? 'bg-slate-100'
                  : t === 'dark'
                  ? 'bg-slate-900'
                  : t === 'accent'
                  ? 'bg-[#264376]'
                  : 'bg-slate-300/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
