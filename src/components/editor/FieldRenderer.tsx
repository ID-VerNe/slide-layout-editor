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

// 映射表 - 移出组件以避免重复创建
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
};

interface FieldRendererProps {
  schema: FieldSchema;
  page: PageData;
  onUpdate: (page: PageData, silent?: boolean) => void;
  customFonts: CustomFont[];
}

/**
 * FieldRenderer - Schema 驱动分发器
 * 根据配置对象自动匹配 UI 控件
 */
export const FieldRenderer: React.FC<FieldRendererProps> = ({ 
  schema, page, onUpdate, customFonts 
}) => {
  const { key, props = {} } = schema;

  const Component = componentMap[key];

  if (!Component) {
    console.warn(`Field type "${key}" is not registered in FieldRenderer.`);
    return null;
  }

  return (
    <Component 
      page={page} 
      onUpdate={onUpdate} 
      customFonts={customFonts} 
      {...props} // 支持将 Schema 中的 props 传递给 Field 组件
    />
  );
};
