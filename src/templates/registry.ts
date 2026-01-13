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
import Freeform from '../components/templates/Freeform';

import { AspectRatioType } from '../constants/layout';
import { FieldSchema, FieldType } from '../types';

export interface TemplateConfig {
  id: string;
  name: string;
  category: 'Cover' | 'Product' | 'Marketing' | 'General' | 'Gallery' | 'Resume' | 'Freeform';
  desc: string;
  tags: string[];
  component: React.FC<{ page: any; typography?: any }>;
  fields: FieldSchema[];
  supportedRatios: AspectRatioType[];
}

const withBaseFields = (fields: (FieldType | FieldSchema)[]): FieldSchema[] => {
  const base: FieldSchema[] = [{ key: 'backgroundColor' }, { key: 'pageNumber' }];
  const custom = fields.map(f => typeof f === 'string' ? { key: f as FieldType } : f);
  return [...base, ...custom];
};

export const TEMPLATES: TemplateConfig[] = [
  // --- 简历系列 ---
  {
    id: 'academic-hybrid-resume',
    name: 'Dynamic Resume Pro',
    category: 'Resume',
    desc: 'Block-based technical resume with smart lists and dynamic sections.',
    tags: ['Resume', 'A4', 'Professional', 'Block-based'],
    component: AcademicHybridResume,
    fields: withBaseFields([
      { key: 'title', label: 'Candidate Name' },
      { key: 'subtitle', label: 'Header Subtitle (Email | GitHub)' },
      { key: 'resumeSections', label: 'Resume Content Hub' }
    ]),
    supportedRatios: ['A4']
  },
  // --- 自由布局 (必须补回) ---
  {
    id: 'freeform',
    name: 'Freeform Canvas',
    category: 'Freeform',
    desc: 'Total creative freedom with drag-and-drop elements.',
    tags: ['Canvas', 'Creative', 'Custom'],
    component: Freeform,
    fields: withBaseFields([]), 
    supportedRatios: ['16:9', '2:3', 'A4', '1:1']
  },
  // --- 标准幻灯片系列 ---
  {
    id: 'apple-bento-grid',
    name: 'Bento Showcase',
    category: 'Product',
    desc: 'Apple-style high-density modular grid.',
    tags: ['Bento', 'Grid', 'Apple'],
    component: AppleBentoGrid,
    fields: withBaseFields(['title', 'subtitle', 'logo', 'bentoItems']),
    supportedRatios: ['16:9']
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
    id: 'cinematic-full-bleed',
    name: 'Cinematic Bleed',
    category: 'Cover',
    desc: 'Full-screen cinematic cover.',
    tags: ['Cinematic', 'Impact'],
    component: CinematicFullBleed,
    fields: withBaseFields(['title', 'subtitle', 'image', 'imageLabel']), 
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
    fields: withBaseFields(['variant', 'image', 'title', 'subtitle']),
    supportedRatios: ['2:3']
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