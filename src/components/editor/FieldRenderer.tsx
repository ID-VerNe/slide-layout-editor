import React from 'react';
import { PageData, CustomFont, FieldSchema } from '../../types';

// 导入所有原子化字段组件
import { LogoField } from './fields/LogoField';
import { TitleField } from './fields/TitleField';
import { SubtitleField } from './fields/SubtitleField';
import { ActionTextField } from './fields/ActionTextField';
import { ParagraphField } from './fields/ParagraphField';
import { SignatureField } from './fields/SignatureField';
import { ImageField } from './fields/ImageField';
import { ImageLabelField } from './fields/ImageLabelField';
import { ImageSubLabelField } from './fields/ImageSubLabelField';
import { FeaturesField } from './fields/FeaturesField';
import { MosaicField } from './fields/MosaicField';
import { MetricsField } from './fields/MetricsField';
import { PartnersField } from './fields/PartnersField';
import { PartnersTitleField } from './fields/PartnersTitleField';
import { TestimonialsField } from './fields/TestimonialsField';
import { AgendaField } from './fields/AgendaField';
import { GalleryField } from './fields/GalleryField';
import { VariantField } from './fields/VariantField';
import { BulletsField } from './fields/BulletsField';
import { ColorField } from './fields/ColorField';
import { FooterField } from './fields/FooterField';
import { BentoField } from './fields/BentoField';
import { PageNumberField } from './fields/PageNumberField';
import { ResumeSectionsField } from './fields/ResumeSectionsField'; // 新增

interface FieldRendererProps {
  schema: FieldSchema;
  page: PageData;
  onUpdate: (page: PageData) => void;
  customFonts: CustomFont[];
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({ 
  schema, page, onUpdate, customFonts 
}) => {
  const { key, label, props = {} } = schema;

  const componentMap: Record<string, React.FC<any>> = {
    logo: LogoField,
    title: TitleField,
    subtitle: SubtitleField,
    actionText: ActionTextField,
    paragraph: ParagraphField,
    signature: SignatureField,
    image: ImageField,
    imageLabel: ImageLabelField,
    imageSubLabel: ImageSubLabelField,
    features: FeaturesField,
    mosaic: MosaicField,
    metrics: MetricsField,
    partnersTitle: PartnersTitleField,
    partners: PartnersField,
    testimonials: TestimonialsField,
    agenda: AgendaField,
    bentoItems: BentoField,
    gallery: GalleryField,
    variant: VariantField,
    bullets: BulletsField,
    backgroundColor: ColorField,
    footer: FooterField,
    pageNumber: PageNumberField,
    resumeSections: ResumeSectionsField, // 核心：全能简历字段
  };

  const Component = componentMap[key];
  if (!Component) return null;

  return (
    <Component 
      page={page} 
      onUpdate={onUpdate} 
      customFonts={customFonts} 
      label={label}
      {...props} 
    />
  );
};
