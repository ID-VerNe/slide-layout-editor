import React, { useMemo, useCallback, useRef } from 'react';
import { PageData, CustomFont } from '../types';
import { Layout, ChevronRight } from 'lucide-react';
import { Section, Label } from './ui/Base';
import { getTemplateById } from '../templates/registry';
import { FieldRenderer } from './editor/FieldRenderer';
import { shallowEqual } from '../utils/comparison';
import { useVirtualizer } from '@tanstack/react-virtual';

interface EditorProps {
  page: PageData;
  onUpdate: (page: PageData, silent?: boolean) => void;
  customFonts: CustomFont[];
}

/**
 * Editor 核心组件 (Schema 驱动虚拟化版)
 */
const Editor: React.FC<EditorProps> = React.memo(({ page, onUpdate, customFonts }) => {
  if (!page || !page.layoutId) return null;

  const template = useMemo(() => getTemplateById(page.layoutId), [page.layoutId]);
  const parentRef = useRef<HTMLDivElement>(null);

  const handleOpenBrowser = useCallback(() => {
    window.dispatchEvent(new CustomEvent('open-layout-browser', { 
      detail: { mode: 'change' } 
    }));
  }, []);

  // 虚拟化列表项：0 是顶部设置，1+ 是各个字段
  const rowVirtualizer = useVirtualizer({
    count: template.fields.length + 1,
    getScrollElement: () => document.getElementById('editor-scroll-container'),
    estimateSize: (index) => index === 0 ? 100 : 120,
    overscan: 5,
  });

  return (
    <div 
      ref={parentRef}
      className="relative w-full pb-20 animate-in fade-in duration-500"
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
      }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const isHeader = virtualRow.index === 0;
        
        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={rowVirtualizer.measureElement}
            className="absolute top-0 left-0 w-full"
            style={{
              transform: `translateY(${virtualRow.start}px)`,
              paddingBottom: '2rem' // 模拟原来的 space-y-8
            }}
          >
            {isHeader ? (
              <Section>
                <Label icon={Layout}>Slide Layout & Ratio</Label>
                <button 
                  onClick={handleOpenBrowser} 
                  className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 hover:border-[#264376]/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#264376] group-hover:bg-[#264376] group-hover:text-white transition-all"><Layout size={20} /></div>
                     <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{page.aspectRatio} // {template.category}</p>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{template.name}</p>
                     </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-[#264376] transition-colors" />
                </button>
              </Section>
            ) : (
              <div className="px-1">
                <FieldRenderer 
                  schema={template.fields[virtualRow.index - 1]}
                  page={page}
                  onUpdate={onUpdate}
                  customFonts={customFonts}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.page === nextProps.page &&
    prevProps.onUpdate === nextProps.onUpdate &&
    shallowEqual(prevProps.customFonts, nextProps.customFonts)
  );
});

export default Editor;