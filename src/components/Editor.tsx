import React, { useState } from 'react';
import { PageData, CustomFont } from '../types';
import { Layout, ChevronRight, Tag as TagIcon } from 'lucide-react';
import { Section, Label } from './ui/Base';
import Modal from './Modal';
import { TEMPLATES, getTemplateById, EditorFieldType } from '../templates/registry';

// 导入原子化字段组件
import { LogoField } from './editor/fields/LogoField';
import { TitleField } from './editor/fields/TitleField';
import { SubtitleField } from './editor/fields/SubtitleField';
import { ActionTextField } from './editor/fields/ActionTextField';
import { ImageField } from './editor/fields/ImageField';
import { ImageLabelField } from './editor/fields/ImageLabelField';
import { FeaturesField } from './editor/fields/FeaturesField';
import { MosaicField } from './editor/fields/MosaicField';
import { MetricsField } from './editor/fields/MetricsField';
import { PartnersField } from './editor/fields/PartnersField';
import { PartnersTitleField } from './editor/fields/PartnersTitleField';
import { TestimonialsField } from './editor/fields/TestimonialsField';
import { AgendaField } from './editor/fields/AgendaField';
import { GalleryField } from './editor/fields/GalleryField';
import { VariantField } from './editor/fields/VariantField';
import { BulletsField } from './editor/fields/BulletsField';
import { ColorField } from './editor/fields/ColorField';
import { PageNumberField } from './editor/fields/PageNumberField';

interface EditorProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  customFonts: CustomFont[];
}

// 字段组件映射配置
const FIELD_COMPONENTS: Record<EditorFieldType, React.FC<any>> = {
  logo: LogoField,
  title: TitleField,
  subtitle: SubtitleField,
  actionText: ActionTextField,
  image: ImageField,
  imageLabel: ImageLabelField,
  features: FeaturesField,
  mosaic: MosaicField,
  metrics: MetricsField,
  partnersTitle: PartnersTitleField,
  partners: PartnersField,
  testimonials: TestimonialsField,
  agenda: AgendaField,
  gallery: GalleryField,
  variant: VariantField,
  bullets: BulletsField,
  backgroundColor: ColorField,
  pageNumber: PageNumberField,
};

const Editor: React.FC<EditorProps> = React.memo(({ page, onUpdate, customFonts }) => {
  const [showLayoutModal, setShowLayoutModal] = useState(false);

  const template = getTemplateById(page.layoutId);
  const categories = Array.from(new Set(TEMPLATES.map(t => t.category)));

  // 渲染字段逻辑
  const renderField = (type: EditorFieldType) => {
    const Component = FIELD_COMPONENTS[type];
    if (!Component) return null;
    return <Component key={type} page={page} onUpdate={onUpdate} customFonts={customFonts} />;
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Layout Selector Section (Always present) */}
      <Section>
        <Label icon={Layout}>Slide Layout</Label>
        <button onClick={() => setShowLayoutModal(true)} className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 hover:border-slate-200 transition-all group">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#264376]"><Layout size={20} /></div>
             <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{template.category}</p>
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{template.name}</p>
             </div>
          </div>
          <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
        </button>
        <Modal isOpen={showLayoutModal} onClose={() => setShowLayoutModal(false)} title="Template Browser" type="custom" maxWidth="max-w-[85vw]">
          <div className="space-y-12 max-h-[75vh] overflow-y-auto no-scrollbar py-4 px-2">
             {categories.map(cat => (
               <div key={cat} className="space-y-6">
                  <div className="flex items-center gap-3 px-1 border-b border-slate-100 pb-4">
                    <TagIcon size={16} className="text-[#264376]" />
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-900">{cat}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {TEMPLATES.filter(t => t.category === cat).map(t => (
                      <button 
                        key={t.id} 
                        onClick={() => { onUpdate({ ...page, layoutId: t.id as any }); setShowLayoutModal(false); }} 
                        className={`flex flex-col items-start p-6 rounded-[2rem] border-2 transition-all text-left group/card
                          ${page.layoutId === t.id 
                            ? 'border-[#264376] bg-[#264376]/5 shadow-xl' 
                            : 'border-slate-50 bg-slate-50/50 hover:border-[#264376]/30 hover:bg-white hover:shadow-2xl hover:-translate-y-1'}`}
                      >
                        <span className={`text-sm font-black uppercase tracking-tight mb-2 transition-colors ${page.layoutId === t.id ? 'text-[#264376]' : 'text-slate-900 group-hover/card:text-[#264376]'}`}>{t.name}</span>
                        <span className="text-[11px] text-slate-400 font-medium leading-relaxed">{t.desc}</span>
                      </button>
                    ))}
                  </div>
               </div>
             ))}
          </div>
        </Modal>
      </Section>

      {/* Dynamic Content Sections based on Template Config */}
      <div className="space-y-8">
        {template.fields.map(renderField)}
      </div>
    </div>
  );
});

export default Editor;