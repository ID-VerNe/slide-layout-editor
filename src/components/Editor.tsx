import React from 'react';
import { PageData, CustomFont } from '../types';
import { Layout, ChevronRight, LayoutGrid } from 'lucide-react';
import { Section, Label } from './ui/Base';
import { getTemplateById, EditorFieldType } from '../templates/registry';

// 导入原子化字段组件
import { LogoField } from './editor/fields/LogoField';
import { TitleField } from './editor/fields/TitleField';
import { SubtitleField } from './editor/fields/SubtitleField';
import { ActionTextField } from './editor/fields/ActionTextField';
import { ParagraphField } from './editor/fields/ParagraphField';
import { SignatureField } from './editor/fields/SignatureField';
import { ImageField } from './editor/fields/ImageField';
import { ImageLabelField } from './editor/fields/ImageLabelField';
import { ImageSubLabelField } from './editor/fields/ImageSubLabelField';
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
import { FooterField } from './editor/fields/FooterField';
import { BentoField } from './editor/fields/BentoField';
import { PageNumberField } from './editor/fields/PageNumberField';

interface EditorProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  customFonts: CustomFont[];
}

/**
 * Editor 核心组件
 * 加固版：增加了对 page 对象的空值保护，防止由于异步加载导致的渲染崩溃。
 */
const Editor: React.FC<EditorProps> = React.memo(({ page, onUpdate, customFonts }) => {
  // 核心修复 1：增加空值保护卫导
  if (!page || !page.layoutId) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-4 opacity-40">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-300">
          <LayoutGrid size={32} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Initialing Editor...</p>
      </div>
    );
  }

  const template = getTemplateById(page.layoutId);

  const handleOpenBrowser = () => {
    window.dispatchEvent(new CustomEvent('open-layout-browser', { 
      detail: { mode: 'change' } 
    }));
  };

  const renderField = (type: EditorFieldType) => {
    switch (type) {
      case 'logo': return <LogoField key={type} page={page} onUpdate={onUpdate} />;
      case 'title': return <TitleField key={type} page={page} onUpdate={onUpdate} />;
      case 'subtitle': return <SubtitleField key={type} page={page} onUpdate={onUpdate} />;
      case 'actionText': return <ActionTextField key={type} page={page} onUpdate={onUpdate} />;
      case 'paragraph': return <ParagraphField key={type} page={page} onUpdate={onUpdate} />;
      case 'signature': return <SignatureField key={type} page={page} onUpdate={onUpdate} />;
      case 'image': return <ImageField key={type} page={page} onUpdate={onUpdate} />;
      case 'imageLabel': return <ImageLabelField key={type} page={page} onUpdate={onUpdate} />;
      case 'imageSubLabel': return <ImageSubLabelField key={type} page={page} onUpdate={onUpdate} />;
      case 'features': return <FeaturesField key={type} page={page} onUpdate={onUpdate} customFonts={customFonts} />;
      case 'mosaic': return <MosaicField key={type} page={page} onUpdate={onUpdate} />;
      case 'metrics': return <MetricsField key={type} page={page} onUpdate={onUpdate} />;
      case 'partnersTitle': return <PartnersTitleField key={type} page={page} onUpdate={onUpdate} />;
      case 'partners': return <PartnersField key={type} page={page} onUpdate={onUpdate} />;
      case 'testimonials': return <TestimonialsField key={type} page={page} onUpdate={onUpdate} customFonts={customFonts} />;
      case 'agenda': return <AgendaField key={type} page={page} onUpdate={onUpdate} />;
      case 'bentoItems': return <BentoField key={type} page={page} onUpdate={onUpdate} />;
      case 'gallery': return <GalleryField key={type} page={page} onUpdate={onUpdate} />;
      case 'variant': return <VariantField key={type} page={page} onUpdate={onUpdate} />;
      case 'bullets': return <BulletsField key={type} page={page} onUpdate={onUpdate} />;
      case 'backgroundColor': return <ColorField key={type} page={page} onUpdate={onUpdate} />;
      case 'footer': return <FooterField key={type} page={page} onUpdate={onUpdate} />;
      case 'pageNumber': return <PageNumberField key={type} page={page} onUpdate={onUpdate} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-10 pb-20">
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

      <div className="space-y-8">
        {template.fields.map(renderField)}
      </div>
    </div>
  );
});

export default Editor;
