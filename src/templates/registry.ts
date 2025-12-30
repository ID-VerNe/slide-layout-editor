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

export type EditorFieldType = 
  | 'logo' | 'title' | 'subtitle' | 'actionText' | 'image' | 'imageLabel' 
  | 'features' | 'mosaic' | 'metrics' | 'partnersTitle' | 'partners' 
  | 'testimonials' | 'agenda' | 'gallery' | 'variant';

export interface TemplateConfig {
  id: string;
  name: string;
  category: 'Cover' | 'Product' | 'Marketing' | 'General' | 'Gallery';
  desc: string;
  tags: string[];
  component: React.FC<{ page: any }>;
  fields: EditorFieldType[];
}

export const TEMPLATES: TemplateConfig[] = [
  // Gallery Category
  {
    id: 'editorial-split',
    name: 'Editorial Split',
    category: 'Gallery',
    desc: 'Japanese style minimalist split layout with vertical typography',
    tags: ['Gallery', 'Minimalist', 'Editorial', 'Typography', 'Japan', 'Swap'],
    component: EditorialSplit,
    fields: ['variant', 'title', 'subtitle', 'image', 'imageLabel', 'imageSubLabel', 'actionText', 'bullets']
  },
  {
    id: 'gallery-capsule',
    name: 'Capsule Mosaic',
    category: 'Gallery',
    desc: 'Stylish vertical capsule gallery with staggered layout and overlapping text',
    tags: ['Gallery', 'Creative', 'Portrait', 'Modern', 'Layering'],
    component: GalleryCapsule,
    fields: ['variant', 'title', 'subtitle', 'gallery', 'imageLabel', 'imageSubLabel', 'footer']
  },
  // Product Category
  {
    id: 'modern-feature',
    name: 'Modern Feature',
    category: 'Product',
    desc: 'Bold text with large visual placeholder',
    tags: ['Bold', 'Minimalist'],
    component: ModernFeature,
    fields: ['logo', 'title', 'subtitle', 'actionText', 'image', 'imageLabel']
  },
  {
    id: 'component-mosaic',
    name: 'Component Mosaic',
    category: 'Product',
    desc: 'Text with scattered icon grid',
    tags: ['Showcase', 'Mosaic'],
    component: ComponentMosaic,
    fields: ['title', 'subtitle', 'actionText', 'mosaic']
  },
  // Marketing Category
  {
    id: 'platform-hero',
    name: 'Platform Hero',
    category: 'Marketing',
    desc: 'Centered hero with feature grid',
    tags: ['Branding', 'Grid'],
    component: PlatformHero,
    fields: ['logo', 'title', 'subtitle', 'actionText', 'features']
  },
  {
    id: 'testimonial-card',
    name: 'Testimonial Card',
    category: 'Marketing',
    desc: 'Profile with quote and data points',
    tags: ['Review', 'Card', 'Data'],
    component: TestimonialCard,
    fields: ['image', 'imageLabel', 'title', 'subtitle', 'metrics']
  },
  {
    id: 'community-hub',
    name: 'Community Hub',
    category: 'Marketing',
    desc: 'Call to action with testimonials and partners',
    tags: ['Community', 'Feedback', 'Social'],
    component: CommunityHub,
    fields: ['title', 'subtitle', 'actionText', 'partnersTitle', 'partners', 'testimonials']
  },
  // General Category
  {
    id: 'big-statement',
    name: 'Big Statement',
    category: 'General',
    desc: 'Pure centered minimalist slogan',
    tags: ['Impact', 'Slogan', 'Clean'],
    component: BigStatement,
    fields: ['title', 'subtitle']
  },
  {
    id: 'step-timeline',
    name: 'Step Timeline',
    category: 'General',
    desc: 'Vertical process flow with timeline and feature cards',
    tags: ['Process', 'Workflow', 'Steps'],
    component: StepTimeline,
    fields: ['title', 'subtitle', 'features']
  },
  {
    id: 'table-of-contents',
    name: 'Table of Contents',
    category: 'General',
    desc: 'Professional agenda with card-based section overview',
    tags: ['Agenda', 'Navigation', 'Minimalist'],
    component: TableOfContents,
    fields: ['logo', 'title', 'subtitle', 'agenda']
  }
];

export const getTemplateById = (id: string) => {
  return TEMPLATES.find(t => t.id === id) || TEMPLATES[0];
};