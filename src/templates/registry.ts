import React from 'react';
import { AspectRatioType } from '../constants/layout';
import { FieldSchema, FieldType, PageData } from '../types';

import { 
  BigStatementSchema, 
  MicroAnchorSchema, 
  SincerityPortraitSchema,
  ZineClassicSchema,
  AcademicHybridResumeSchema,
  AppleBentoGridSchema,
  GravityAnchorIntroSchema,
  KinfolkFeatureSchema,
  KinfolkMontageSchema,
  FilmDiptychSchema,
  ArtisticLSpaceSchema,
  FloatingGallerySchema,
  CinematicLetterboxSchema,
  VerticalColumnSchema,
  HorizonSkySchema,
  EpiloguePillarSchema,
  FutureFocusSchema,
  BackCoverMovieSchema,
  GalleryCapsuleSchema,
  EditorialSplitSchema,
  CinematicFullBleedSchema,
  EditorialClassicSchema,
  EditorialBackCoverSchema,
  KinfolkEssaySchema,
  TypographyHeroSchema,
  ModernFeatureSchema,
  ComponentMosaicSchema,
  PlatformHeroSchema,
  TestimonialCardSchema,
  CommunityHubSchema,
  StepTimelineSchema,
  TableOfContentsSchema,
  TemplateSchema 
} from './schemas';

export interface TemplateConfig {
  id: string;
  name: string;
  category: 'Cover' | 'Product' | 'Marketing' | 'General' | 'Gallery' | 'Resume';
  desc: string;
  tags: string[];
  component: React.FC<{ page: any; typography?: any }>;
  schema?: TemplateSchema;
  fields: FieldSchema[];
  supportedRatios: AspectRatioType[];
  defaultData?: Partial<PageData>;  // 模板级默认数据
}

const withBaseFields = (fields: (FieldType | FieldSchema)[]): FieldSchema[] => {
  const base: FieldSchema[] = [{ key: 'backgroundColor' }, { key: 'pageNumber' }];
  const custom = fields.map(f => typeof f === 'string' ? { key: f as FieldType } : f);
  return [...base, ...custom];
};

export const TEMPLATES: TemplateConfig[] = [
  // --- Zine Modular Series (Phase 4) ---
  {
    id: 'zine-classic',
    name: 'Zine Classic',
    category: 'Gallery',
    desc: 'The definitive 24x24 modular grid template. Industrial precision.',
    tags: ['Zine', 'Modular', 'Precision'],
    component: () => null, 
    schema: ZineClassicSchema,
    fields: withBaseFields([
      { key: 'title', label: 'Headline' },
      { key: 'subtitle', label: 'Sub-Headline' },
      { key: 'paragraph', label: 'Body Copy' },
      { key: 'image', label: 'Main Media' },
      { key: 'imageLabel', label: 'Meta Info' }
    ]),
    supportedRatios: ['16:9', '2:3', 'A4']
  },

  // --- 简历 (顶级工具) ---
  {
    id: 'academic-hybrid-resume',
    name: 'Dynamic Resume Pro',
    category: 'Resume',
    desc: 'Block-based technical resume with smart formatting and modular list.',
    tags: ['Resume', 'A4', 'Industrial'],
    component: () => null,
    schema: AcademicHybridResumeSchema,
    fields: withBaseFields([
      { key: 'title', label: 'Candidate Name' },
      { key: 'subtitle', label: 'Header Subtitle' },
      { key: 'resumeSections', label: 'Resume Content Hub' }
    ]),
    supportedRatios: ['A4']
  },

  // --- 核心内页模板 (Gallery 系列) ---
  {
    id: 'gravity-anchor-intro',
    name: 'Gravity Anchor',
    category: 'Gallery',
    desc: 'Professional intro page with heavy bottom imagery.',
    tags: ['Establishing', 'Intro'],
    component: () => null,
    schema: GravityAnchorIntroSchema,
    fields: withBaseFields([
      { key: 'title', label: 'Chapter Header' },
      { key: 'paragraph', label: 'Introductory Verse' },
      { key: 'image', label: 'Bottom Anchor Image' },
      { key: 'imageHeight' as any, type: 'number', label: 'Image Proportion (%)', props: { min: 20, max: 80, step: 5 } },
      { key: 'imageLabel', label: 'Camera / Metadata Text' }
    ]), 
    supportedRatios: ['2:3']
  },

  {
    id: 'sincerity-portrait',
    name: 'Sincerity Portrait',
    category: 'Gallery',
    desc: 'Large portrait imagery with overlapping typography.',
    tags: ['Portrait', 'Impact'],
    component: () => null,
    schema: SincerityPortraitSchema,
    fields: withBaseFields(['title', 'subtitle', 'image', 'imageLabel']),
    supportedRatios: ['2:3']
  },

  {
    id: 'kinfolk-feature',
    name: 'Editorial Feature',
    category: 'Gallery',
    desc: 'Vertical typography with imagery.',
    tags: ['Kinfolk', 'Portrait'],
    component: () => null,
    schema: KinfolkFeatureSchema,
    fields: withBaseFields(['variant', 'title', 'subtitle', 'image', 'imageLabel']),
    supportedRatios: ['2:3']
  },

  {
    id: 'kinfolk-montage',
    name: 'Art Montage',
    category: 'Gallery',
    desc: 'Staggered dual-image collage.',
    tags: ['Collage'],
    component: () => null,
    schema: KinfolkMontageSchema,
    fields: withBaseFields(['gallery', 'imageLabel']),
    supportedRatios: ['2:3']
  },

  {
    id: 'film-diptych',
    name: 'Film Diptych',
    category: 'Gallery',
    desc: 'Dual images side-by-side.',
    tags: ['Sequence'],
    component: () => null,
    schema: FilmDiptychSchema,
    fields: withBaseFields([
      { key: 'variant', label: 'Split Direction', props: { options: [{ value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' }] } },
      { key: 'gallery' },
      { key: 'imageLabel' }
    ]),
    supportedRatios: ['2:3']
  },

  {
    id: 'micro-anchor',
    name: 'Micro Anchor',
    category: 'Gallery',
    desc: 'Small centered imagery with metadata anchors.',
    tags: ['Minimalist'],
    component: () => null,
    schema: MicroAnchorSchema,
    fields: withBaseFields(['title', 'subtitle', 'image', 'imageLabel']),
    supportedRatios: ['2:3']
  },

  {
    id: 'artistic-l-space',
    name: 'Artistic L-Space',
    category: 'Gallery',
    desc: 'L-shaped negative space with bottom-right bleed imagery.',
    tags: ['Minimalist', 'L-Shape', 'Bleed'],
    component: () => null,
    schema: ArtisticLSpaceSchema,
    fields: withBaseFields([
      { key: 'variant', label: 'Image Side', props: { options: [{ value: 'right', label: 'Image Right' }, { value: 'left', label: 'Image Left' }] } },
      { key: 'title', label: 'Vertical Headline' },
      { key: 'subtitle', label: 'Handwritten Notes (Top)' },
      { key: 'topDivider' as any, label: 'Top Accent Line', type: 'separator' },
      { key: 'image', label: 'Main Image' },
      { key: 'footer', label: 'Metadata / Description', type: 'footer' }
    ]),
    supportedRatios: ['2:3']
  },

  {
    id: 'floating-gallery',
    name: 'Floating Gallery',
    category: 'Gallery',
    desc: 'Centered floating imagery with wide passepartout margins.',
    tags: ['Gallery', 'Classic', 'Floating'],
    component: () => null,
    schema: FloatingGallerySchema,
    fields: withBaseFields([
      { key: 'title', label: 'Headline (Slanted)' },
      { key: 'subtitle', label: 'Poetic Verse (Under Line)' },
      { key: 'paragraph', label: 'Detailed Paragraph (Bottom)' },
      { key: 'image', label: 'Main Artwork' },
      { key: 'footer', label: 'Catalog Info', type: 'footer' }
    ]),
    supportedRatios: ['2:3']
  },

  {
    id: 'cinematic-letterbox',
    name: 'Cinematic Letterbox',
    category: 'Gallery',
    desc: 'Widescreen cinematic focus with extreme horizontal typography.',
    tags: ['Gallery', 'Cinematic', 'Wide'],
    component: () => null,
    schema: CinematicLetterboxSchema,
    fields: withBaseFields([
      { key: 'title', label: 'Scattered Headline (Bottom)' },
      { key: 'subtitle', label: 'Top Teaser (Above Title)' },
      { key: 'paragraph', label: 'Movie Subtitle (Below Image)' },
      { key: 'image', label: 'Widescreen Artwork' },
      { key: 'footer', label: 'Catalog Info', type: 'footer' }
    ]),
    supportedRatios: ['2:3']
  },

  {
    id: 'vertical-column',
    name: 'Vertical Column',
    category: 'Gallery',
    desc: 'Left-bleed image with a structured white sidebar on the right.',
    tags: ['Gallery', 'Minimalist', 'Sidebar'],
    component: () => null,
    schema: VerticalColumnSchema,
    fields: withBaseFields([
      { 
        key: 'variant', 
        label: 'Image Side', 
        props: { 
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Right', value: 'right' }
          ] 
        } 
      },
      { key: 'title', label: 'Stacked Headline (Right)' },
      { key: 'subtitle', label: 'Sidebar Teaser (Top-Left of Title)' },
      { key: 'paragraph', label: 'Detailed Paragraph (Bottom)' },
      { key: 'image', label: 'Left Bleed Artwork' },
      { key: 'imageLabel', label: 'Catalog Info' }
    ]),
    supportedRatios: ['2:3']
  },

  {
    id: 'horizon-sky',
    name: 'Horizon Sky',
    category: 'Gallery',
    desc: 'Top negative space "sky" with a bottom-aligned image "earth".',
    tags: ['Gallery', 'Minimalist', 'Ethereal'],
    component: () => null,
    schema: HorizonSkySchema,
    fields: withBaseFields([
      { key: 'title', label: 'Sky Headline (Serif)' },
      { key: 'subtitle', label: 'Top Teaser (Above Title)' },
      { key: 'paragraph', label: 'Minimal Verse (Below Title)' },
      { key: 'image', label: 'Earthly Image' },
      { key: 'imageLabel', label: 'Horizon Metadata' }
    ]),
    supportedRatios: ['2:3']
  },
  {
    id: 'epilogue-pillar',
    name: 'Epilogue Pillar',
    category: 'Gallery',
    desc: 'Centered vertical "pillar" of text for conclusions.',
    tags: ['Gallery', 'Minimalist', 'Epilogue'],
    component: () => null,
    schema: EpiloguePillarSchema,
    fields: withBaseFields([
      { key: 'title', label: 'Top Small Headline' },
      { key: 'paragraph', label: 'Detailed Paragraph (Bottom)' },
      { key: 'bigDataMetrics', label: 'Colophon Info (Grid)' },
      { key: 'signature', label: 'Artist Signature' },
      { key: 'image', label: 'Right Pillar Image' },
      { key: 'footer', label: 'Metadata / Description', type: 'footer' }
    ]),
    defaultData: {
      metrics: [
        { value: 'CAMERA', label: 'CATEGORY', unit: '' },
        { value: 'LENS', label: 'CATEGORY', unit: '' },
        { value: 'LENS', label: 'CATEGORY', unit: '' },
        { value: 'LOCATION', label: 'CATEGORY', unit: '' },
        { value: 'LOCATION', label: 'CATEGORY', unit: '' },
        { value: 'LOCATION', label: 'CATEGORY', unit: '' }
      ],
      bigDataMetricsConfig: { rows: 3, cols: 2 }
    },
    supportedRatios: ['2:3']
  },
  {
    id: 'future-focus',
    name: 'Future Focus',
    category: 'Gallery',
    desc: 'Gold accents and background numbers.',
    tags: ['Impact'],
    component: () => null,
    schema: FutureFocusSchema,
    fields: withBaseFields(['title', 'subtitle', 'image', 'gallery', 'imageLabel']), 
    supportedRatios: ['16:9', '2:3']
  },
  {
    id: 'back-cover-movie',
    name: 'Back Cover Movie',
    category: 'Gallery',
    desc: 'Movie credits style back cover.',
    tags: ['Cinematic'],
    component: () => null,
    schema: BackCoverMovieSchema,
    fields: withBaseFields(['image', 'logoSize', 'title', 'subtitle']),
    supportedRatios: ['16:9', '2:3']
  },
  {
    id: 'gallery-capsule',
    name: 'Capsule Mosaic',
    category: 'Gallery',
    desc: 'Vertical capsule gallery.',
    tags: ['Modern'],
    component: () => null,
    schema: GalleryCapsuleSchema,
    fields: withBaseFields([
      { key: 'variant', label: 'Visual Scheme', props: { options: [{ value: 'under', label: 'Under' }, { value: 'over', label: 'Over' }, { value: 'minimal', label: 'Minimal' }] } },
      { key: 'title' },
      { key: 'subtitle' },
      { key: 'artFont', label: 'Art Typography (Year/ID)' },
      { key: 'gallery' },
      { key: 'imageLabel' }
    ]),
    supportedRatios: ['16:9', '2:3']
  },
  {
    id: 'editorial-split',
    name: 'Editorial Split',
    category: 'Gallery',
    desc: 'Balanced split between image and structured text.',
    tags: ['Gallery', 'Editorial', 'Split'],
    component: () => null,
    schema: EditorialSplitSchema,
    fields: withBaseFields(['variant', 'title', 'subtitle', 'paragraph', 'image', 'imageLabel', 'imageSubLabel', 'actionText', 'bullets' as any]),
    supportedRatios: ['16:9', '2:3']
  },

  // --- 封面系列 ---
  {
    id: 'cinematic-full-bleed',
    name: 'Cinematic Bleed',
    category: 'Cover',
    desc: 'Full-screen cinematic cover.',
    tags: ['Cinematic', 'Impact'],
    component: () => null,
    schema: CinematicFullBleedSchema,
    fields: withBaseFields([
      { key: 'variant', label: 'Layout Orientation', props: { options: [{ value: 'bottom', label: 'Bottom Stack' }, { value: 'top', label: 'Headline on Top' }] } },
      { key: 'titleY', label: 'Headline Position' },
      { key: 'title', label: 'Headline' },
      { key: 'subtitle', label: 'Subtitle' },
      { key: 'image', label: 'Background Image' },
      { key: 'imageLabel', label: 'Copyright Text' }
    ]), 
    supportedRatios: ['16:9', '2:3']
  },

  {
    id: 'editorial-classic',
    name: 'Editorial Classic',
    category: 'Cover',
    desc: 'Kinfolk style magazine cover with large central image.',
    tags: ['Cover', 'Editorial', 'Classic'],
    component: () => null,
    schema: EditorialClassicSchema,
    fields: withBaseFields([
      { key: 'title', label: 'Magazine Masthead' },
      { key: 'subtitle', label: 'Issue Theme/Tagline' },
      { key: 'image', label: 'Cover Image' },
      { key: 'imageLabel', label: 'Issue Month' },
      { key: 'imageSubLabel', label: 'Issue Volume' },
      { key: 'actionText', label: 'Year/Edition' }
    ]),
    defaultData: {
      title: 'MAGAZINE TITLE',
      subtitle: 'Issue Theme',
      imageLabel: 'JANUARY',
      actionText: '2026'
    },
    supportedRatios: ['2:3']
  },

  {
    id: 'editorial-back-cover',
    name: 'Editorial Back',
    category: 'Cover',
    desc: 'Minimalist magazine back cover.',
    tags: ['Cover', 'Editorial', 'Minimalist'],
    component: () => null,
    schema: EditorialBackCoverSchema,
    fields: withBaseFields([
      { key: 'title', label: 'Back Title (e.g. THANKS)' },
      { key: 'subtitle', label: 'Copyright / Publisher Line' }
    ]),
    supportedRatios: ['2:3']
  },


  // --- 其他通用模板 ---
  {
    id: 'apple-bento-grid',
    name: 'Bento Showcase',
    category: 'Product',
    desc: 'Apple-style modular grid.',
    tags: ['Bento', 'Grid'],
    component: () => null,
    schema: AppleBentoGridSchema,
    fields: withBaseFields(['title', 'subtitle', 'logo', 'bentoItems']),
    supportedRatios: ['16:9']
  },
  {
    id: 'kinfolk-essay',
    name: 'Editorial Essay',
    category: 'General',
    desc: 'Editorial narrative layout with drop cap and structured meta.',
    tags: ['General', 'Editorial', 'Narrative'],
    component: () => null,
    schema: KinfolkEssaySchema,
    fields: withBaseFields(['title', 'subtitle', 'paragraph', 'signature', 'metrics']),
    supportedRatios: ['2:3', 'A4']
  },
  {
    id: 'typography-hero',
    name: 'Typography Hero',
    category: 'General',
    desc: 'Oversized typography focused layout.',
    tags: ['Impact', 'Typography', 'Minimalist'],
    component: () => null,
    schema: TypographyHeroSchema,
    fields: withBaseFields([
      { key: 'topDivider' as any, label: 'Top Divider', type: 'separator' },
      { key: 'title', label: 'Headline' },
      { key: 'paragraph', label: 'Body Copy' },
      { key: 'bottomDivider' as any, label: 'Bottom Divider', type: 'separator' },
      { key: 'subtitle', label: 'Sub-Headline' }
    ]),
    supportedRatios: ['16:9', '2:3']
  },

  {
    id: 'modern-feature',
    name: 'Modern Feature',
    category: 'Product',
    desc: 'Bold text with large visual.',
    tags: ['Bold'],
    component: () => null,
    schema: ModernFeatureSchema,
    fields: withBaseFields(['logo', 'title', 'subtitle', 'actionText', 'image', 'imageLabel']),
    supportedRatios: ['16:9', '2:3']
  },
  {
    id: 'component-mosaic',
    name: 'Component Mosaic',
    category: 'Product',
    desc: 'Icon grid showcase with editorial sidebar.',
    tags: ['Mosaic', 'Product', 'Commercial'],
    component: () => null,
    schema: ComponentMosaicSchema,
    fields: withBaseFields(['title', 'subtitle', 'imageLabel', 'mosaicItems' as any]),
    supportedRatios: ['16:9', '2:3']
  },
  {
    id: 'platform-hero',
    name: 'Platform Hero',
    category: 'Marketing',
    desc: 'Centralized product announcement with feature grid.',
    tags: ['Branding', 'Platform', 'Hero'],
    component: () => null,
    schema: PlatformHeroSchema,
    fields: withBaseFields(['logo', 'title', 'subtitle', 'features']),
    supportedRatios: ['16:9', '2:3']
  },
  {
    id: 'testimonial-card',
    name: 'Testimonial Card',
    category: 'Marketing',
    desc: 'Professional profile with quote and verified metrics.',
    tags: ['Review', 'Testimonial', 'Marketing'],
    component: () => null,
    schema: TestimonialCardSchema,
    fields: withBaseFields(['image', 'imageLabel', 'title', 'subtitle', 'metrics']),
    supportedRatios: ['16:9', '2:3']
  },
  {
    id: 'community-hub',
    name: 'Community Hub',
    category: 'Marketing',
    desc: 'Call to action with testimonials and partner grid.',
    tags: ['Community', 'Social', 'Marketing'],
    component: () => null,
    schema: CommunityHubSchema,
    fields: withBaseFields([
      { key: 'title', label: 'Main Title' },
      { key: 'subtitle', label: 'Subtitle' },
      { key: 'imageLabel', label: 'Call-to-Action' },
      { key: 'partnersTitle', label: 'Partners Section Title', defaultValue: 'POWERED BY', placeholder: 'e.g., Trusted by, Used by' },
      { key: 'partners' as any },
      { key: 'testimonials' as any }
    ]),
    supportedRatios: ['16:9', '2:3']
  },

  {
    id: 'big-statement',
    name: 'Big Statement',
    category: 'General',
    desc: 'Centered minimalist slogan with high-impact typography.',
    tags: ['Slogan', 'Minimalist', 'Statement'],
    component: () => null,
    schema: BigStatementSchema,
    fields: withBaseFields(['title', 'subtitle', 'paragraph']),
    supportedRatios: ['16:9', '2:3']
  },
  {
    id: 'step-timeline',
    name: 'Step Timeline',
    category: 'General',
    desc: 'Sequential timeline process flow.',
    tags: ['Timeline', 'Process', 'Sequential'],
    component: () => null,
    schema: StepTimelineSchema,
    fields: withBaseFields(['title', 'subtitle', 'features' as any]),
    supportedRatios: ['16:9', '2:3']
  },

  {
    id: 'table-of-contents',
    name: 'Table of Contents',
    category: 'General',
    desc: 'Card-based navigational overview of the document.',
    tags: ['Agenda', 'Index'],
    component: () => null,
    schema: TableOfContentsSchema,
    fields: withBaseFields(['logo', 'title', 'subtitle', 'agenda']),
    supportedRatios: ['16:9', '2:3']
  }
];

export type TemplateId = typeof TEMPLATES[number]['id'];

export const getTemplateById = (id: string) => {
  return TEMPLATES.find(t => t.id === id);
};
