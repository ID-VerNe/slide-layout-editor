import React from 'react';
import { PageData, CustomFont } from '../types';
import { Layout, ChevronRight } from 'lucide-react';
import { Section, Label } from './ui/Base';
import { getTemplateById } from '../templates/registry';
import { FieldRenderer } from './editor/FieldRenderer';

interface EditorProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  customFonts: CustomFont[];
}

/**
 * Editor 核心组件 (Schema 驱动版)
 * 核心升级：不再硬编码组件分发，而是遍历模板 Schema 进行动态渲染。
 */
const Editor: React.FC<EditorProps> = React.memo(({ page, onUpdate, customFonts }) => {
  if (!page || !page.layoutId) return null;

  const template = getTemplateById(page.layoutId);

  const handleOpenBrowser = () => {
    window.dispatchEvent(new CustomEvent('open-layout-browser', { 
      detail: { mode: 'change' } 
    }));
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500">
      {/* 顶部：布局与比例概览 */}
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

      {/* 
        核心逻辑：根据模板配置的 Schema 动态生成编辑器列表
        这消除了庞大的 switch-case，使架构具备极强的扩展性。
      */}
      <div className="space-y-8 px-1">
        {template.fields.map((schema) => (
          <FieldRenderer 
            key={`${page.id}-${schema.key}`}
            schema={schema}
            page={page}
            onUpdate={onUpdate}
            customFonts={customFonts}
          />
        ))}
      </div>
    </div>
  );
});

export default Editor;