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
import { ResumeSectionsField } from './fields/ResumeSectionsField';
import { TitleYField } from './fields/TitleYField';
import { GenericNumberField } from './fields/GenericNumberField';

interface FieldRendererProps {
  schema: FieldSchema;
  page: PageData;
  onUpdate: (page: PageData) => void;
  customFonts: CustomFont[];
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({ 
  schema, page, onUpdate, customFonts 
}) => {
  const { key, label, type, props = {} } = schema;

  // 1. 定义具名组件映射
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
    mosaicItems: MosaicField,
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
    resumeSections: ResumeSectionsField,
    titleY: TitleYField,
    logoSize: GenericNumberField,
  };

  // 2. 匹配组件：优先找具名组件，如果是 number 类型则使用通用调节控件
  let Component = componentMap[key];
  
  if (!Component && type === 'number') {
    return (
      <GenericNumberField 
        page={page} 
        onUpdate={onUpdate} 
        label={label} 
        fieldKey={key} 
        {...props} 
      />
    );
  }

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