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
import { AspectRatioType } from '../constants/layout';

export type EditorFieldType = 
  | 'logo' | 'title' | 'subtitle' | 'actionText' | 'paragraph' | 'signature' | 'image' | 'imageLabel' 
  | 'features' | 'mosaic' | 'metrics' | 'partnersTitle' | 'partners' 
  | 'testimonials' | 'agenda' | 'gallery' | 'variant' | 'footer' | 'bullets' | 'backgroundColor' | 'pageNumber';

export interface TemplateConfig {
  id: string;
  name: string;
  category: 'Cover' | 'Product' | 'Marketing' | 'General' | 'Gallery';
  desc: string;
  tags: string[];
  component: React.FC<{ page: any }>;
  fields: EditorFieldType[];
  supportedRatios: AspectRatioType[];
}

const withBaseFields = (fields: EditorFieldType[]): EditorFieldType[] => {
  return ['backgroundColor', 'pageNumber', ...fields];
};

export const TEMPLATES: TemplateConfig[] = [
  // --- Cover Category (2:3 Optimized) ---
  {
    id: 'editorial-classic',
    name: 'Editorial Classic',
    category: 'Cover',
    desc: 'Kinfolk style classic magazine cover with hard-edge image',
    tags: ['Magazine', 'Minimalist', 'Kinfolk'],
    component: EditorialClassic,
    fields: withBaseFields(['title', 'subtitle', 'image', 'imageLabel', 'imageSubLabel']),
    supportedRatios: ['2:3']
  },
  {
    id: 'cinematic-full-bleed',
    name: 'Cinematic Bleed',
    category: 'Cover',
    desc: 'Full-screen cinematic cover with floating serif typography',
    tags: ['Full Screen', 'Cinematic', 'Impact'],
    component: CinematicFullBleed,
    fields: withBaseFields(['title', 'subtitle', 'image']),
    supportedRatios: ['2:3']
  },
  {
    id: 'editorial-back-cover',
    name: 'Editorial Back',
    category: 'Cover',
    desc: 'Minimalist magazine back cover with centered title and bottom subtitle',
    tags: ['Magazine', 'Minimalist', 'Back Cover'],
    component: EditorialBackCover,
    fields: withBaseFields(['title', 'subtitle']),
    supportedRatios: ['2:3']
  },
  // --- Gallery Category (2:3 Optimized) ---
  {
    id: 'kinfolk-feature',
    name: 'Editorial Feature',
    category: 'Gallery',
    desc: 'Impactful vertical typography with hard-edge imagery',
    tags: ['Kinfolk', 'Portrait', 'Minimalist'],
    component: KinfolkFeature,
    fields: withBaseFields(['variant', 'title', 'subtitle', 'image', 'imageLabel']),
    supportedRatios: ['2:3']
  },
  {
    id: 'kinfolk-montage',
    name: 'Art Montage',
    category: 'Gallery',
    desc: 'Staggered dual-image collage with vertical metadata',
    tags: ['Montage', 'Collage', 'Details'],
    component: KinfolkMontage,
    fields: withBaseFields(['gallery', 'imageLabel']),
    supportedRatios: ['2:3']
  },

  // --- General Category (2:3 Optimized) ---
  {
    id: 'kinfolk-essay',
    name: 'Editorial Essay',
    category: 'General',
    desc: 'Text-heavy narrative layout with drop cap and technical grid',
    tags: ['Narrative', 'Text', 'Specs'],
    component: KinfolkEssay,
    fields: withBaseFields(['title', 'subtitle', 'paragraph', 'signature', 'metrics']),
    supportedRatios: ['2:3']
  },

  // --- Legacy / Landscape Templates (16:9 Only) ---
  {
    id: 'future-focus',
    name: 'Future Focus',
    category: 'Gallery',
    desc: 'Cinematic layout with gold accents and background numbers',
    tags: ['Gallery', 'Impact', 'Dynamic'],
    component: FutureFocus,
    fields: withBaseFields(['title', 'subtitle', 'image', 'gallery', 'imageLabel']),
    supportedRatios: ['16:9'] // 移除 2:3 支持
  },
  {
    id: 'back-cover-movie',
    name: 'Back Cover Movie',
    category: 'Gallery',
    desc: 'Cinematic movie credits style back cover',
    tags: ['Gallery', 'Back Cover', 'Cinematic'],
    component: BackCoverMovie,
    fields: withBaseFields(['image', 'logoSize', 'title', 'subtitle']),
    supportedRatios: ['16:9'] // 移除 2:3 支持
  },
  {
    id: 'gallery-capsule',
    name: 'Capsule Mosaic',
    category: 'Gallery',
    desc: 'Stylish vertical capsule gallery with staggered layout',
    tags: ['Gallery', 'Portrait', 'Modern'],
    component: GalleryCapsule,
    fields: withBaseFields(['variant', 'title', 'subtitle', 'gallery', 'imageLabel', 'imageSubLabel']),
    supportedRatios: ['16:9'] // 移除 2:3 支持
  },
  {
    id: 'editorial-split',
    name: 'Editorial Split',
    category: 'Gallery',
    desc: 'Japanese style minimalist split layout',
    tags: ['Gallery', 'Minimalist', 'Editorial'],
    component: EditorialSplit,
    fields: withBaseFields(['variant', 'title', 'subtitle', 'image', 'imageLabel', 'imageSubLabel', 'actionText', 'bullets']),
    supportedRatios: ['16:9']
  },
  {
    id: 'modern-feature',
    name: 'Modern Feature',
    category: 'Product',
    desc: 'Bold text with large visual placeholder',
    tags: ['Bold', 'Minimalist'],
    component: ModernFeature,
    fields: withBaseFields(['logo', 'title', 'subtitle', 'actionText', 'image', 'imageLabel']),
    supportedRatios: ['16:9']
  },
  {
    id: 'component-mosaic',
    name: 'Component Mosaic',
    category: 'Product',
    desc: 'Text with scattered icon grid',
    tags: ['Showcase', 'Mosaic'],
    component: ComponentMosaic,
    fields: withBaseFields(['title', 'subtitle', 'actionText', 'mosaic']),
    supportedRatios: ['16:9']
  },
  {
    id: 'platform-hero',
    name: 'Platform Hero',
    category: 'Marketing',
    desc: 'Centered hero with feature grid',
    tags: ['Branding', 'Grid'],
    component: PlatformHero,
    fields: withBaseFields(['logo', 'title', 'subtitle', 'actionText', 'features']),
    supportedRatios: ['16:9']
  },
  {
    id: 'testimonial-card',
    name: 'Testimonial Card',
    category: 'Marketing',
    desc: 'Profile with quote and data points',
    tags: ['Review', 'Card', 'Data'],
    component: TestimonialCard,
    fields: withBaseFields(['image', 'imageLabel', 'title', 'subtitle', 'metrics']),
    supportedRatios: ['16:9']
  },
  {
    id: 'community-hub',
    name: 'Community Hub',
    category: 'Marketing',
    desc: 'Call to action with testimonials and partners',
    tags: ['Community', 'Feedback', 'Social'],
    component: CommunityHub,
    fields: withBaseFields(['title', 'subtitle', 'actionText', 'partnersTitle', 'partners', 'testimonials']),
    supportedRatios: ['16:9']
  },
  {
    id: 'big-statement',
    name: 'Big Statement',
    category: 'General',
    desc: 'Pure centered minimalist slogan',
    tags: ['Impact', 'Slogan', 'Clean'],
    component: BigStatement,
    fields: withBaseFields(['title', 'subtitle']),
    supportedRatios: ['16:9'] // 移除 2:3 支持
  },
  {
    id: 'step-timeline',
    name: 'Step Timeline',
    category: 'General',
    desc: 'Vertical process flow with timeline',
    tags: ['Process', 'Workflow', 'Steps'],
    component: StepTimeline,
    fields: withBaseFields(['title', 'subtitle', 'features']),
    supportedRatios: ['16:9']
  },
  {
    id: 'table-of-contents',
    name: 'Table of Contents',
    category: 'General',
    desc: 'Professional agenda with card-based section overview',
    tags: ['Agenda', 'Navigation', 'Minimalist'],
    component: TableOfContents,
    fields: withBaseFields(['logo', 'title', 'subtitle', 'agenda']),
    supportedRatios: ['16:9']
  }
];

export const getTemplateById = (id: string) => {
  return TEMPLATES.find(t => t.id === id) || TEMPLATES[0];
};
