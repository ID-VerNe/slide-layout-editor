import React from 'react';
import { PageData, CustomFont, FieldSchema } from '../../types';
import { Type, Bookmark, Quote, Languages } from 'lucide-react';

// 导入保留的具名字段组件（非文本型字段与带差异化逻辑的文本型字段）
import { LogoField } from './fields/LogoField';
import { TitleField } from './fields/TitleField';
import { SubtitleField } from './fields/SubtitleField';
import { ImageField } from './fields/ImageField';
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
import { VocabItemsField } from './fields/VocabItemsField';
import { GenericTextField, GenericTextFieldProps } from './fields/GenericTextField';

// 具名组件映射：保留非文本型字段与带自定义逻辑的文本型字段
const componentMap: Record<string, React.FC<any>> = {
  logo: LogoField,
  title: TitleField,
  subtitle: SubtitleField,
  vocabItems: VocabItemsField,
  signature: ImageField,
  image: ImageField,
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

// 文本型字段预设：未在 componentMap 注册的文本 key 走 GenericTextField + 预设元数据
const textFieldPresets: Record<string, Omit<GenericTextFieldProps, 'page' | 'onUpdate' | 'fieldKey' | 'label' | 'customFonts'>> = {
  actionText: {
    icon: Type,
    placeholder: 'e.g. SHOP NOW',
    className: 'text-xs font-black uppercase tracking-widest border-slate-100 hover:border-zine-accent focus:border-zine-accent transition-colors',
    defaultFont: "'Inter', sans-serif",
  },
  imageLabel: {
    icon: Type,
    placeholder: 'e.g. FIG. 01 — THE MOUNTAIN',
    className: 'text-xs font-bold border-slate-100 hover:border-zine-accent focus:border-zine-accent transition-colors',
    defaultFont: "'Inter', sans-serif",
  },
  imageSubLabel: {
    icon: Type,
    placeholder: 'e.g. VOL. 01',
    className: 'text-xs font-medium border-slate-100 hover:border-zine-accent focus:border-zine-accent transition-colors',
  },
  paragraph: {
    icon: Type,
    multiline: true,
    rows: 5,
    placeholder: 'Write something...',
  },
  paragraphZH: {
    icon: Languages,
    multiline: true,
    rows: 4,
    placeholder: '输入中文对照译文（思源宋体/弱对比灰）...',
    defaultFont: "'Noto Serif SC', 'STFangsong', serif",
    defaultColor: '#475569',
  },
  quoteZH: {
    icon: Quote,
    multiline: true,
    rows: 2,
    placeholder: '输入金句中文释义...',
    defaultFont: "'Noto Serif SC', 'STFangsong', serif",
    defaultColor: '#475569',
  },
  sideHeader: {
    icon: Bookmark,
    placeholder: 'e.g. VOL. 01 // THE ESSAY ARCHIVE',
    className: 'text-xs uppercase tracking-widest border-slate-100 hover:border-zine-accent focus:border-zine-accent transition-colors',
  },
};

interface FieldRendererProps {
  schema: FieldSchema;
  page: PageData;
  onUpdate: (page: PageData, silent?: boolean) => void;
  customFonts: CustomFont[];
  pages?: PageData[];
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  schema, page, onUpdate, customFonts, pages
}) => {
  const { key, label, type, props = {} } = schema;

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

  // 分隔线类型的特殊处理
  if (!Component && type === 'separator') {
    Component = SeparatorField;
  }

  // 未注册为具名组件的文本型字段，统一走 GenericTextField + 预设元数据
  if (!Component && textFieldPresets[key]) {
    const preset = textFieldPresets[key];
    return (
      <GenericTextField
        page={page}
        onUpdate={onUpdate}
        customFonts={customFonts}
        fieldKey={key as keyof PageData & string}
        label={label}
        {...preset}
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
      fieldKey={key}
      pages={pages}
      {...props}
    />
  );
};
