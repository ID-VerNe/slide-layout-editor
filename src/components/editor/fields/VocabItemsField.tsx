import React from 'react';
import { PageData, VocabItem } from '../../../types';
import { BookOpen, Plus, X } from 'lucide-react';
import { Input } from '../../ui/Base';
import { FieldWrapper } from './FieldWrapper';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  label?: string;
}

/**
 * VocabItemsField - 策展生词列表编辑器
 */
export const VocabItemsField: React.FC<FieldProps> = React.memo(({ page, onUpdate, label }) => {
  const items: VocabItem[] = page.vocabItems || [];

  const updateItems = (newItems: VocabItem[]) => {
    onUpdate({ ...page, vocabItems: newItems });
  };

  const addItem = () => {
    const newItem: VocabItem = {
      id: `vocab-${crypto.randomUUID()}`,
      word: 'EPHEMERAL',
      pos: 'adj.',
      phonetic: 'ɪˈfem.ər.əl',
      meaning: '短暂的；瞬息万变的',
      example: 'The ephemeral nature of fashion trends.',
      exampleZH: '时尚潮流转瞬即逝的本质。'
    };
    updateItems([...items, newItem]);
  };

  const updateItem = (idx: number, updates: Partial<VocabItem>) => {
    const next = [...items];
    next[idx] = { ...next[idx], ...updates };
    updateItems(next);
  };

  const removeItem = (idx: number) => {
    updateItems(items.filter((_, i) => i !== idx));
  };

  return (
    <FieldWrapper
      page={page}
      onUpdate={onUpdate}
      fieldKey="vocabItems"
      label={label || 'Curated Vocabulary'}
      icon={BookOpen}
    >
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div
            key={item.id || idx}
            className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3 relative group"
          >
            <button
              onClick={() => removeItem(idx)}
              className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors"
              title="Remove word"
            >
              <X size={14} />
            </button>

            {/* 1. 单词与词性 */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">
                  Word (All-Caps)
                </label>
                <Input
                  placeholder="e.g. DESPERATE"
                  value={item.word}
                  onChange={(e) => updateItem(idx, { word: e.target.value })}
                  className="font-serif font-bold text-sm tracking-wider uppercase"
                />
              </div>
              <div>
                <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">
                  Part of Speech
                </label>
                <Input
                  placeholder="e.g. adj."
                  value={item.pos || ''}
                  onChange={(e) => updateItem(idx, { pos: e.target.value })}
                  className="text-xs italic"
                />
              </div>
            </div>

            {/* 2. 音标与释义 */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">
                  Phonetic
                </label>
                <Input
                  placeholder="e.g. ˈdes.pər.ət"
                  value={item.phonetic || ''}
                  onChange={(e) => updateItem(idx, { phonetic: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">
                  Meaning (ZH)
                </label>
                <Input
                  placeholder="e.g. 拼命的，绝望的"
                  value={item.meaning}
                  onChange={(e) => updateItem(idx, { meaning: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            {/* 3. 例句 (可选) */}
            <div className="space-y-1.5 pt-1 border-t border-slate-200/40">
              <Input
                placeholder="Example sentence (EN)..."
                value={item.example || ''}
                onChange={(e) => updateItem(idx, { example: e.target.value })}
                className="text-xs italic"
              />
              <Input
                placeholder="例句中文翻译 (ZH)..."
                value={item.exampleZH || ''}
                onChange={(e) => updateItem(idx, { exampleZH: e.target.value })}
                className="text-xs"
              />
            </div>
          </div>
        ))}

        <button
          onClick={addItem}
          className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold uppercase text-xs hover:border-[#264376] hover:text-[#264376] transition-all flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Add Vocabulary Item
        </button>
      </div>
    </FieldWrapper>
  );
});

VocabItemsField.displayName = 'VocabItemsField';
export default VocabItemsField;
