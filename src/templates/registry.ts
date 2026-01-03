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

export type EditorFieldType = 
  | 'logo' | 'title' | 'subtitle' | 'actionText' | 'image' | 'imageLabel' 
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
}

// 辅助函数：为模板添加标准的基础控制字段（背景、页码）
const withBaseFields = (fields: EditorFieldType[]): EditorFieldType[] => {
  return ['backgroundColor', 'pageNumber', ...fields];
};

export const TEMPLATES: TemplateConfig[] = [
  // Gallery Category
  {
    id: 'future-focus',
    name: 'Future Focus',
    category: 'Gallery',
    desc: 'Cinematic three-image layout inspired by New Year posters',
    tags: ['Gallery', 'New Year', 'Cinematic', 'Impact'],
    component: FutureFocus,
    fields: withBaseFields(['title', 'subtitle', 'image', 'gallery', 'imageLabel'])
  },
  {
    id: 'back-cover-movie',
    name: 'Back Cover Movie',
    category: 'Gallery',
    desc: 'Cinematic movie credits style back cover',
    tags: ['Gallery', 'Back Cover', 'Cinematic', 'Minimalist'],
    component: BackCoverMovie,
    fields: withBaseFields(['image', 'logoSize', 'title', 'subtitle'])
  },
  {
    id: 'editorial-split',
    name: 'Editorial Split',
    category: 'Gallery',
    desc: 'Japanese style minimalist split layout with vertical typography',
    tags: ['Gallery', 'Minimalist', 'Editorial', 'Typography', 'Japan', 'Swap'],
    component: EditorialSplit,
    fields: withBaseFields(['variant', 'title', 'subtitle', 'image', 'imageLabel', 'imageSubLabel', 'actionText', 'bullets'])
  },
  {
    id: 'gallery-capsule',
    name: 'Capsule Mosaic',
    category: 'Gallery',
    desc: 'Stylish vertical capsule gallery with staggered layout and overlapping text',
    tags: ['Gallery', 'Creative', 'Portrait', 'Modern', 'Layering'],
    component: GalleryCapsule,
    fields: withBaseFields(['variant', 'title', 'subtitle', 'gallery', 'imageLabel', 'imageSubLabel'])
  },
  // Product Category
  {
    id: 'modern-feature',
    name: 'Modern Feature',
    category: 'Product',
    desc: 'Bold text with large visual placeholder',
    tags: ['Bold', 'Minimalist'],
    component: ModernFeature,
    fields: withBaseFields(['logo', 'title', 'subtitle', 'actionText', 'image', 'imageLabel'])
  },
  {
    id: 'component-mosaic',
    name: 'Component Mosaic',
    category: 'Product',
    desc: 'Text with scattered icon grid',
    tags: ['Showcase', 'Mosaic'],
    component: ComponentMosaic,
    fields: withBaseFields(['title', 'subtitle', 'actionText', 'mosaic'])
  },
  // Marketing Category
  {
    id: 'platform-hero',
    name: 'Platform Hero',
    category: 'Marketing',
    desc: 'Centered hero with feature grid',
    tags: ['Branding', 'Grid'],
    component: PlatformHero,
    fields: withBaseFields(['logo', 'title', 'subtitle', 'actionText', 'features'])
  },
  {
    id: 'testimonial-card',
    name: 'Testimonial Card',
    category: 'Marketing',
    desc: 'Profile with quote and data points',
    tags: ['Review', 'Card', 'Data'],
    component: TestimonialCard,
    fields: withBaseFields(['image', 'imageLabel', 'title', 'subtitle', 'metrics'])
  },
  {
    id: 'community-hub',
    name: 'Community Hub',
    category: 'Marketing',
    desc: 'Call to action with testimonials and partners',
    tags: ['Community', 'Feedback', 'Social'],
    component: CommunityHub,
    fields: withBaseFields(['title', 'subtitle', 'actionText', 'partnersTitle', 'partners', 'testimonials'])
  },
  // General Category
  {
    id: 'big-statement',
    name: 'Big Statement',
    category: 'General',
    desc: 'Pure centered minimalist slogan',
    tags: ['Impact', 'Slogan', 'Clean'],
    component: BigStatement,
    fields: withBaseFields(['title', 'subtitle'])
  },
  {
    id: 'step-timeline',
    name: 'Step Timeline',
    category: 'General',
    desc: 'Vertical process flow with timeline and feature cards',
    tags: ['Process', 'Workflow', 'Steps'],
    component: StepTimeline,
    fields: withBaseFields(['title', 'subtitle', 'features'])
  },
  {
    id: 'table-of-contents',
    name: 'Table of Contents',
    category: 'General',
    desc: 'Professional agenda with card-based section overview',
    tags: ['Agenda', 'Navigation', 'Minimalist'],
    component: TableOfContents,
    fields: withBaseFields(['logo', 'title', 'subtitle', 'agenda'])
  }
];

export const getTemplateById = (id: string) => {
  return TEMPLATES.find(t => t.id === id) || TEMPLATES[0];
};