import React from 'react';
import { PageData, CustomFont, FieldSchema } from '../../types';

// 导入所有原子化字段组件
import { LogoField } from './fields/LogoField';
import { TitleField } from './fields/TitleField';
import { SubtitleField } from './fields/SubtitleField';
import { ActionTextField } from './fields/ActionTextField';
import { ParagraphField } from './fields/ParagraphField';
import { ImageField } from './fields/ImageField';
import { ImageLabelField } from './fields/ImageLabelField';
import { ImageSubLabelField } from './fields/ImageSubLabelField';
import { FeaturesField } from './fields/FeaturesField';
import { MosaicField } from './fields/MosaicField';
import { MetricsField } from './fields/MetricsField';
import { BigDataMetricsField } from './fields/BigDataMetricsField';
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
import { SeparatorField } from './fields/SeparatorField';
import { ArtFontField } from './fields/ArtFontField';

// 1. 定义具名组件映射 - 移到组件外部以保持引用稳定
const componentMap: Record<string, React.FC<any>> = {
  logo: LogoField,
  title: TitleField,
  subtitle: SubtitleField,
  actionText: ActionTextField,
  paragraph: ParagraphField,
  signature: ImageField,  // 签名现在使用 ImageField
  image: ImageField,
  imageLabel: ImageLabelField,
  imageSubLabel: ImageSubLabelField,
  features: FeaturesField,
  mosaic: MosaicField,
  mosaicItems: MosaicField,
  metrics: MetricsField,
  bigDataMetrics: BigDataMetricsField,
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
  separator: SeparatorField,
  artFont: ArtFontField,
};

interface FieldRendererProps {
  schema: FieldSchema;
  page: PageData;
  onUpdate: (page: PageData) => void;
  customFonts: CustomFont[];
  pages?: PageData[];
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  schema, page, onUpdate, customFonts, pages
}) => {
  const { key, label, type, props = {} } = schema;

  // 2. 匹配组件：优先找具名组件
  let Component = componentMap[key];

  // 3. Fallback 逻辑
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

  // 特殊处理 separator 类型，如果 key 没匹配到，看 type
  if (!Component && type === 'separator') {
    Component = SeparatorField;
  }

  if (!Component) return null;

  return (
    <Component
      page={page}
      onUpdate={onUpdate}
      customFonts={customFonts}
      label={label}
      fieldKey={key}
      pages={pages}
      {...props}
    />
  );
};