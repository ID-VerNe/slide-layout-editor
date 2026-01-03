import { 
  PageData, 
  TableOfContentsData, 
  PlatformHeroData, 
  StepTimelineData, 
  TestimonialCardData, 
  CommunityHubData, 
  ComponentMosaicData, 
  GalleryCapsuleData,
  EditorialSplitData
} from '../types';

export function isAgendaPage(page: PageData): page is TableOfContentsData {
  return page.layoutId === 'table-of-contents';
}

export function isPlatformHeroPage(page: PageData): page is PlatformHeroData {
  return page.layoutId === 'platform-hero';
}

export function isStepTimelinePage(page: PageData): page is StepTimelineData {
  return page.layoutId === 'step-timeline';
}

export function isTestimonialCardPage(page: PageData): page is TestimonialCardData {
  return page.layoutId === 'testimonial-card';
}

export function isCommunityHubPage(page: PageData): page is CommunityHubData {
  return page.layoutId === 'community-hub';
}

export function isComponentMosaicPage(page: PageData): page is ComponentMosaicData {
  return page.layoutId === 'component-mosaic';
}

export function isGalleryCapsulePage(page: PageData): page is GalleryCapsuleData {
  return page.layoutId === 'gallery-capsule';
}

export function isEditorialSplitPage(page: PageData): page is EditorialSplitData {
  return page.layoutId === 'editorial-split';
}
