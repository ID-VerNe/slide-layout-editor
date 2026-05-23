import ModernFeature from '../components/templates/ModernFeature';
import PlatformHero from '../components/templates/PlatformHero';
import ComponentMosaic from '../components/templates/ComponentMosaic';
import TestimonialCard from '../components/templates/TestimonialCard';
import CommunityHub from '../components/templates/CommunityHub';
import TableOfContents from '../components/templates/TableOfContents';
import BigStatement from '../components/templates/BigStatement';
import StepTimeline from '../components/templates/StepTimeline';
import GalleryCapsule from '../components/templates/GalleryCapsule';
import EditorialSplit from '../components/templates/EditorialSplit';
import BackCoverMovie from '../components/templates/BackCoverMovie';
import FutureFocus from '../components/templates/FutureFocus';
import EditorialClassic from '../components/templates/EditorialClassic';
import CinematicFullBleed from '../components/templates/CinematicFullBleed';
import EditorialBackCover from '../components/templates/EditorialBackCover';
import KinfolkFeature from '../components/templates/KinfolkFeature';
import KinfolkEssay from '../components/templates/KinfolkEssay';
import KinfolkMontage from '../components/templates/KinfolkMontage';
import MicroAnchor from '../components/templates/MicroAnchor';
import TypographyHero from '../components/templates/TypographyHero';
import FilmDiptych from '../components/templates/FilmDiptych';
import AppleBentoGrid from '../components/templates/AppleBentoGrid';
import AcademicHybridResume from '../components/templates/AcademicHybridResume';
import GravityAnchorIntro from '../components/templates/GravityAnchorIntro';
import SincerityPortrait from '../components/templates/SincerityPortrait';
import ArtisticLSpace from '../components/templates/ArtisticLSpace';
import FloatingGallery from '../components/templates/FloatingGallery';
import CinematicLetterbox from '../components/templates/CinematicLetterbox';
import VerticalColumn from '../components/templates/VerticalColumn';
import HorizonSky from '../components/templates/HorizonSky';
import EpiloguePillar from '../components/templates/EpiloguePillar';

import { AspectRatioType } from '../constants/layout';
import { FieldSchema, FieldType } from '../types';

import { BigStatementSchema } from './schemas/big-statement';
import { MicroAnchorSchema } from './schemas/micro-anchor';
import { SincerityPortraitSchema } from './schemas/sincerity-portrait';
import { TemplateSchema } from './schemas/types';

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
}

const withBaseFields = (fields: (FieldType | FieldSchema)[]): FieldSchema[] => {
  const base: FieldSchema[] = [{ key: 'backgroundColor' }, { key: 'pageNumber' }];
  const custom = fields.map(f => typeof f === 'string' ? { key: f as FieldType } : f);
  return [...base, ...custom];
};

export const TEMPLATES: TemplateConfig[] = [
  // --- 简历 (顶级工具) ---
  {
    id: 'academic-hybrid-resume',
    name: 'Dynamic Resume Pro',
    category: 'Resume',
    desc: 'Block-based technical resume with smart lists.',
    tags: ['Resume', 'A4'],
    component: AcademicHybridResume,
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
    component: GravityAnchorIntro,
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
    id: 'kinfolk-feature',
    name: 'Editorial Feature',
    category: 'Gallery',
    desc: 'Vertical typography with imagery.',
    tags: ['Kinfolk', 'Portrait'],
    component: KinfolkFeature,
    fields: withBaseFields(['variant', 'title', 'subtitle', 'image', 'imageLabel']),
    supportedRatios: ['2:3']
  },
  {
    id: 'kinfolk-montage',
    name: 'Art Montage',
    category: 'Gallery',
    desc: 'Staggered dual-image collage.',
    tags: ['Collage'],
    component: KinfolkMontage,
    fields: withBaseFields(['gallery', 'imageLabel']),
    supportedRatios: ['2:3']
  },
  {
    id: 'film-diptych',
    name: 'Film Diptych',
    category: 'Gallery',
    desc: 'Dual images side-by-side.',
    tags: ['Sequence'],
    component: FilmDiptych,
    fields: withBaseFields(['variant', 'gallery', 'imageLabel']),
    supportedRatios: ['2:3']
  },
  {
    id: 'micro-anchor',
    name: 'Micro Anchor',
    category: 'Gallery',
    desc: 'Extreme negative space.',
    tags: ['Minimalist'],
    component: MicroAnchor,
    schema: MicroAnchorSchema,
    fields: withBaseFields(['variant', 'image', 'title', 'subtitle']),
    supportedRatios: ['2:3']
  },
  {
    id: 'sincerity-portrait',
    name: 'Sincerity Portrait',
    category: 'Gallery',
    desc: 'Intimate portrait with asymmetrical balance.',
    tags: ['Sincerity', 'Portrait'],
    component: SincerityPortrait,
    schema: SincerityPortraitSchema,
    fields: withBaseFields([
      { key: 'title', label: 'Headline' },
      { key: 'subtitle', label: 'Sub-Headline' },
      { key: 'paragraph', label: 'Narrative Verse' },
      { key: 'image', label: 'Portrait' },
      { key: 'imageLabel', label: 'Image Meta' }
    ]),
    supportedRatios: ['2:3']
  },
  {
    id: 'artistic-l-space',
    name: 'Artistic L-Space',
    category: 'Gallery',
    desc: 'L-shaped negative space with bottom-right bleed imagery.',
    tags: ['Minimalist', 'L-Shape', 'Bleed'],
    component: ArtisticLSpace,
    fields: withBaseFields([
      { key: 'variant', label: 'Image Side', props: { options: [{ value: 'right', label: 'Image Right' }, { value: 'left', label: 'Image Left' }] } },
      { key: 'title', label: 'Vertical Headline' },
      { key: 'subtitle', label: 'Handwritten Notes (Top)' },
      { key: 'image', label: 'Main Image' },
      { key: 'imageLabel', label: 'Metadata' }
    ]),
    supportedRatios: ['2:3']
  },
  {
    id: 'floating-gallery',
    name: 'Floating Gallery',
    category: 'Gallery',
    desc: 'Centered floating imagery with wide passepartout margins.',
    tags: ['Gallery', 'Classic', 'Floating'],
    component: FloatingGallery,
    fields: withBaseFields([
      { key: 'title', label: 'Headline (Slanted)' },
      { key: 'subtitle', label: 'Poetic Verse (Under Line)' },
      { key: 'paragraph', label: 'Detailed Paragraph (Bottom)' },
      { key: 'image', label: 'Main Artwork' },
      { key: 'imageLabel', label: 'Catalog Info' }
    ]),
    supportedRatios: ['2:3']
  },
  {
    id: 'cinematic-letterbox',
    name: 'Cinematic Letterbox',
    category: 'Gallery',
    desc: 'Widescreen cinematic focus with extreme horizontal typography.',
    tags: ['Gallery', 'Cinematic', 'Wide'],
    component: CinematicLetterbox,
    fields: withBaseFields([
      { key: 'title', label: 'Scattered Headline (Bottom)' },
      { key: 'subtitle', label: 'Top Teaser (Above Title)' },
      { key: 'paragraph', label: 'Movie Subtitle (Below Image)' },
      { key: 'image', label: 'Widescreen Artwork' },
      { key: 'imageLabel', label: 'Catalog Info' }
    ]),
    supportedRatios: ['2:3']
  },
  {
    id: 'vertical-column',
    name: 'Vertical Column',
    category: 'Gallery',
    desc: 'Left-bleed image with a structured white sidebar on the right.',
    tags: ['Gallery', 'Minimalist', 'Sidebar'],
    component: VerticalColumn,
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
    component: HorizonSky,
    fields: withBaseFields([
      { key: 'title', label: 'Sky Headline' },
      { key: 'subtitle', label: 'Top Teaser (Above Title)' },
      { key: 'paragraph', label: 'Detailed Verse (Below Title)' },
      { key: 'image', label: 'Bottom Artwork (Earth)' },
      { key: 'imageLabel', label: 'Info Above Horizon' }
    ]),
    supportedRatios: ['2:3']
  },
  {
    id: 'epilogue-pillar',
    name: 'Epilogue Pillar',
    category: 'Gallery',
    desc: 'Right-aligned pillar image with a left-side colophon and signature.',
    tags: ['Gallery', 'Minimalist', 'Colophon'],
    component: EpiloguePillar,
    fields: withBaseFields([
      { key: 'title', label: 'End Title (e.g. EPILOGUE)' },
      { key: 'metrics', label: 'Colophon Details (Character, Gear...)' },
      { key: 'paragraph', label: 'Extra Copyright Notes' },
      { key: 'image', label: 'Right Pillar Image' },
      { key: 'signature', label: 'Handwritten Signature' },
      { key: 'imageLabel', label: 'Page Meta' }
    ]),
    supportedRatios: ['2:3']
  },
  {
    id: 'future-focus',
    name: 'Future Focus',
    category: 'Gallery',
    desc: 'Gold accents and background numbers.',
    tags: ['Impact'],
    component: FutureFocus,
    fields: withBaseFields(['title', 'subtitle', 'image', 'gallery', 'imageLabel']), 
    supportedRatios: ['16:9']
  },
  {
    id: 'back-cover-movie',
    name: 'Back Cover Movie',
    category: 'Gallery',
    desc: 'Movie credits style back cover.',
    tags: ['Cinematic'],
    component: BackCoverMovie,
    fields: withBaseFields(['image', 'logoSize', 'title', 'subtitle']),
    supportedRatios: ['16:9']
  },
  {
    id: 'gallery-capsule',
    name: 'Capsule Mosaic',
    category: 'Gallery',
    desc: 'Vertical capsule gallery.',
    tags: ['Modern'],
    component: GalleryCapsule,
    fields: withBaseFields(['variant', 'title', 'subtitle', 'gallery', 'imageLabel']),
    supportedRatios: ['16:9']
  },
  {
    id: 'editorial-split',
    name: 'Editorial Split',
    category: 'Gallery',
    desc: 'Minimalist split layout.',
    tags: ['Editorial'],
    component: EditorialSplit,
    fields: withBaseFields(['variant', 'title', 'subtitle', 'image', 'bullets', 'paragraph']), 
    supportedRatios: ['16:9']
  },

  // --- 封面系列 ---
  {
    id: 'cinematic-full-bleed',
    name: 'Cinematic Bleed',
    category: 'Cover',
    desc: 'Full-screen cinematic cover.',
    tags: ['Cinematic', 'Impact'],
    component: CinematicFullBleed,
    fields: withBaseFields([
      { key: 'variant', label: 'Layout Orientation', props: { options: [{ value: 'bottom', label: 'Bottom Stack' }, { value: 'top', label: 'Headline on Top' }] } },
      { key: 'titleY', label: 'Headline Position' },
      { key: 'title', label: 'Headline' },
      { key: 'subtitle', label: 'Subtitle' },
      { key: 'image', label: 'Background Image' },
      { key: 'imageLabel', label: 'Copyright Text' }
    ]), 
    supportedRatios: ['2:3']
  },
  {
    id: 'editorial-classic',
    name: 'Editorial Classic',
    category: 'Cover',
    desc: 'Kinfolk style magazine cover.',
    tags: ['Magazine', 'Minimalist'],
    component: EditorialClassic,
    fields: withBaseFields(['title', 'subtitle', 'image', 'imageLabel', 'imageSubLabel']),
    supportedRatios: ['2:3']
  },
  {
    id: 'editorial-back-cover',
    name: 'Editorial Back',
    category: 'Cover',
    desc: 'Magazine back cover.',
    tags: ['Back Cover'],
    component: EditorialBackCover,
    fields: withBaseFields(['title', 'subtitle']),
    supportedRatios: ['2:3']
  },

  // --- 其他通用模板 ---
  {
    id: 'apple-bento-grid',
    name: 'Bento Showcase',
    category: 'Product',
    desc: 'Apple-style modular grid.',
    tags: ['Bento', 'Grid'],
    component: AppleBentoGrid,
    fields: withBaseFields(['title', 'subtitle', 'logo', 'bentoItems']),
    supportedRatios: ['16:9']
  },
  {
    id: 'kinfolk-essay',
    name: 'Editorial Essay',
    category: 'General',
    desc: 'Text-heavy narrative layout.',
    tags: ['Narrative'],
    component: KinfolkEssay,
    fields: withBaseFields(['title', 'subtitle', 'paragraph', 'signature', 'metrics']),
    supportedRatios: ['2:3']
  },
  {
    id: 'typography-hero',
    name: 'Typography Hero',
    category: 'General',
    desc: 'Typography-focused divider.',
    tags: ['Typography'],
    component: TypographyHero,
    fields: withBaseFields(['title', 'subtitle', 'imageLabel']),
    supportedRatios: ['2:3']
  },
  {
    id: 'modern-feature',
    name: 'Modern Feature',
    category: 'Product',
    desc: 'Bold text with large visual.',
    tags: ['Bold'],
    component: ModernFeature,
    fields: withBaseFields(['logo', 'title', 'subtitle', 'actionText', 'image', 'imageLabel']),
    supportedRatios: ['16:9']
  },
  {
    id: 'component-mosaic',
    name: 'Component Mosaic',
    category: 'Product',
    desc: 'Icon grid showcase.',
    tags: ['Mosaic'],
    component: ComponentMosaic,
    fields: withBaseFields(['title', 'subtitle', 'mosaic']),
    supportedRatios: ['16:9']
  },
  {
    id: 'platform-hero',
    name: 'Platform Hero',
    category: 'Marketing',
    desc: 'Centered hero with feature grid.',
    tags: ['Branding'],
    component: PlatformHero,
    fields: withBaseFields(['logo', 'title', 'subtitle', 'features']),
    supportedRatios: ['16:9']
  },
  {
    id: 'testimonial-card',
    name: 'Testimonial Card',
    category: 'Marketing',
    desc: 'Profile with quote and data.',
    tags: ['Review'],
    component: TestimonialCard,
    fields: withBaseFields(['image', 'imageLabel', 'title', 'subtitle', 'metrics']),
    supportedRatios: ['16:9']
  },
  {
    id: 'community-hub',
    name: 'Community Hub',
    category: 'Marketing',
    desc: 'Call to action with testimonials.',
    tags: ['Social'],
    component: CommunityHub,
    fields: withBaseFields(['title', 'subtitle', 'partnersTitle', 'partners', 'testimonials']),
    supportedRatios: ['16:9']
  },
  {
    id: 'big-statement',
    name: 'Big Statement',
    category: 'General',
    desc: 'Centered minimalist slogan.',
    tags: ['Slogan'],
    component: BigStatement,
    schema: BigStatementSchema,
    fields: withBaseFields(['title', 'subtitle']),
    supportedRatios: ['16:9']
  },
  {
    id: 'step-timeline',
    name: 'Step Timeline',
    category: 'General',
    desc: 'Vertical process flow.',
    tags: ['Process'],
    component: StepTimeline,
    fields: withBaseFields(['title', 'subtitle', 'features']),
    supportedRatios: ['16:9']
  },
  {
    id: 'table-of-contents',
    name: 'Table of Contents',
    category: 'General',
    desc: 'Card-based overview.',
    tags: ['Agenda'],
    component: TableOfContents,
    fields: withBaseFields(['logo', 'title', 'subtitle', 'agenda']),
    supportedRatios: ['16:9']
  }
];

export type TemplateId = typeof TEMPLATES[number]['id'];

export const getTemplateById = (id: string) => {
  return TEMPLATES.find(t => t.id === id) || TEMPLATES[0];
};