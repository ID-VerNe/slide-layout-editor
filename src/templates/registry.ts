import { AspectRatioType } from '../constants/layout';
import { FieldSchema, FieldType } from '../types';

export interface TemplateConfig {
  id: string;
  name: string;
  category: 'Cover' | 'Product' | 'Marketing' | 'General' | 'Gallery';
  desc: string;
  tags: string[];
  fields: FieldSchema[];
  supportedRatios: AspectRatioType[];
}

/**
 * 辅助函数：快速生成基础字段配置
 */
const withBaseFields = (fields: FieldType[]): FieldSchema[] => {
  const base: FieldType[] = ['backgroundColor', 'pageNumber'];
  return [...base, ...fields].map(key => ({ key }));
};

export const TEMPLATES: TemplateConfig[] = [
  {
    id: 'freeform',
    name: 'Freeform Canvas',
    category: 'General',
    desc: 'Fully customizable canvas with free positioning',
    tags: ['Freeform', 'Canvas', 'Custom', 'Flexible'],
    fields: withBaseFields(['backgroundColor']),
    supportedRatios: ['16:9', '2:3', 'A4', '1:1']
  },
  {
    id: 'apple-bento-grid',
    name: 'Bento Showcase',
    category: 'Product',
    desc: 'Apple-style high-density modular grid for features and metrics',
    tags: ['Bento', 'Grid', 'Apple', 'Showcase'],
    fields: withBaseFields(['title', 'subtitle', 'logo', 'bentoItems']),
    supportedRatios: ['16:9']
  },
  {
    id: 'editorial-classic',
    name: 'Editorial Classic',
    category: 'Cover',
    desc: 'Kinfolk style classic magazine cover with hard-edge image',
    tags: ['Magazine', 'Minimalist', 'Kinfolk'],
    fields: withBaseFields(['title', 'subtitle', 'image', 'imageLabel', 'imageSubLabel', 'actionText']),
    supportedRatios: ['2:3']
  },
  {
    id: 'cinematic-full-bleed',
    name: 'Cinematic Bleed',
    category: 'Cover',
    desc: 'Full-screen cinematic cover with floating serif typography',
    tags: ['Full Screen', 'Cinematic', 'Impact'],
    fields: withBaseFields(['title', 'subtitle', 'image', 'imageLabel']), 
    supportedRatios: ['2:3']
  },
  {
    id: 'editorial-back-cover',
    name: 'Editorial Back',
    category: 'Cover',
    desc: 'Minimalist magazine back cover with centered title',
    tags: ['Magazine', 'Minimalist', 'Back Cover'],
    fields: withBaseFields(['title', 'subtitle']),
    supportedRatios: ['2:3']
  },
  {
    id: 'kinfolk-feature',
    name: 'Editorial Feature',
    category: 'Gallery',
    desc: 'Impactful vertical typography with hard-edge imagery',
    tags: ['Kinfolk', 'Portrait', 'Minimalist'],
    fields: withBaseFields(['variant', 'title', 'subtitle', 'image', 'imageLabel']),
    supportedRatios: ['2:3']
  },
  {
    id: 'kinfolk-montage',
    name: 'Art Montage',
    category: 'Gallery',
    desc: 'Staggered dual-image collage with vertical metadata',
    tags: ['Montage', 'Collage', 'Details'],
    fields: withBaseFields(['gallery', 'imageLabel']),
    supportedRatios: ['2:3']
  },
  {
    id: 'film-diptych',
    name: 'Film Diptych',
    category: 'Gallery',
    desc: 'Dual images side-by-side or stacked with zero distractions',
    tags: ['Diptych', 'Sequence', 'Comparison', 'Pure'],
    fields: withBaseFields(['variant', 'gallery', 'imageLabel']),
    supportedRatios: ['2:3']
  },
  {
    id: 'micro-anchor',
    name: 'Micro Anchor',
    category: 'Gallery',
    desc: 'Extreme negative space with a tiny atmospheric anchor image',
    tags: ['Atmospheric', 'Whitespace', 'Minimalist'],
    fields: withBaseFields(['variant', 'image', 'title', 'subtitle']),
    supportedRatios: ['2:3']
  },
  {
    id: 'kinfolk-essay',
    name: 'Editorial Essay',
    category: 'General',
    desc: 'Text-heavy narrative layout with drop cap and technical grid',
    tags: ['Narrative', 'Text', 'Specs'],
    fields: withBaseFields(['title', 'subtitle', 'paragraph', 'signature', 'metrics']),
    supportedRatios: ['2:3']
  },
  {
    id: 'typography-hero',
    name: 'Typography Hero',
    category: 'General',
    desc: 'Typography-focused section divider with horizontal lines',
    tags: ['Typography', 'Divider', 'Slogan'],
    fields: withBaseFields(['title', 'subtitle', 'imageLabel']),
    supportedRatios: ['2:3']
  },
  {
    id: 'future-focus',
    name: 'Future Focus',
    category: 'Gallery',
    desc: 'Cinematic layout with gold accents and background numbers',
    tags: ['Gallery', 'Impact', 'Dynamic'],
    fields: withBaseFields(['title', 'subtitle', 'image', 'gallery', 'imageLabel', 'imageSubLabel', 'actionText']), 
    supportedRatios: ['16:9']
  },
  {
    id: 'back-cover-movie',
    name: 'Back Cover Movie',
    category: 'Gallery',
    desc: 'Cinematic movie credits style back cover',
    tags: ['Gallery', 'Back Cover', 'Cinematic'],
    fields: withBaseFields(['image', 'logoSize', 'title', 'subtitle']),
    supportedRatios: ['16:9']
  },
  {
    id: 'gallery-capsule',
    name: 'Capsule Mosaic',
    category: 'Gallery',
    desc: 'Stylish vertical capsule gallery with staggered layout',
    tags: ['Gallery', 'Portrait', 'Modern'],
    fields: withBaseFields(['variant', 'title', 'subtitle', 'gallery', 'imageLabel', 'imageSubLabel']),
    supportedRatios: ['16:9']
  },
  {
    id: 'editorial-split',
    name: 'Editorial Split',
    category: 'Gallery',
    desc: 'Japanese style minimalist split layout',
    tags: ['Gallery', 'Minimalist', 'Editorial'],
    fields: withBaseFields(['variant', 'title', 'subtitle', 'image', 'imageLabel', 'imageSubLabel', 'actionText', 'bullets', 'paragraph']), 
    supportedRatios: ['16:9']
  },
  {
    id: 'modern-feature',
    name: 'Modern Feature',
    category: 'Product',
    desc: 'Bold text with large visual placeholder',
    tags: ['Bold', 'Minimalist'],
    fields: withBaseFields(['logo', 'title', 'subtitle', 'actionText', 'image', 'imageLabel']),
    supportedRatios: ['16:9']
  },
  {
    id: 'component-mosaic',
    name: 'Component Mosaic',
    category: 'Product',
    desc: 'Text with scattered icon grid',
    tags: ['Showcase', 'Mosaic'],
    fields: withBaseFields(['title', 'subtitle', 'actionText', 'mosaic']),
    supportedRatios: ['16:9']
  },
  {
    id: 'platform-hero',
    name: 'Platform Hero',
    category: 'Marketing',
    desc: 'Centered hero with feature grid',
    tags: ['Branding', 'Grid'],
    fields: withBaseFields(['logo', 'title', 'subtitle', 'actionText', 'features']),
    supportedRatios: ['16:9']
  },
  {
    id: 'testimonial-card',
    name: 'Testimonial Card',
    category: 'Marketing',
    desc: 'Profile with quote and data points',
    tags: ['Review', 'Card', 'Data'],
    fields: withBaseFields(['image', 'imageLabel', 'title', 'subtitle', 'metrics']),
    supportedRatios: ['16:9']
  },
  {
    id: 'community-hub',
    name: 'Community Hub',
    category: 'Marketing',
    desc: 'Call to action with testimonials and partners',
    tags: ['Community', 'Feedback', 'Social'],
    fields: withBaseFields(['title', 'subtitle', 'actionText', 'partnersTitle', 'partners', 'testimonials']),
    supportedRatios: ['16:9']
  },
  {
    id: 'big-statement',
    name: 'Big Statement',
    category: 'General',
    desc: 'Pure centered minimalist slogan',
    tags: ['Impact', 'Slogan', 'Clean'],
    fields: withBaseFields(['title', 'subtitle']),
    supportedRatios: ['16:9']
  },
  {
    id: 'step-timeline',
    name: 'Step Timeline',
    category: 'General',
    desc: 'Vertical process flow with timeline',
    tags: ['Process', 'Workflow', 'Steps'],
    fields: withBaseFields(['title', 'subtitle', 'features']),
    supportedRatios: ['16:9']
  },
  {
    id: 'table-of-contents',
    name: 'Table of Contents',
    category: 'General',
    desc: 'Professional agenda with card-based section overview',
    tags: ['Agenda', 'Navigation', 'Minimalist'],
    fields: withBaseFields(['logo', 'title', 'subtitle', 'agenda']),
    supportedRatios: ['16:9']
  }
];

export type TemplateId = typeof TEMPLATES[number]['id'];

export const getTemplateById = (id: string) => {
  return TEMPLATES.find(t => t.id === id) || TEMPLATES[0];
};