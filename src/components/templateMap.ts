import { lazy } from 'react';

const templateMap: Record<string, React.LazyExoticComponent<React.FC<any>>> = {
  'modern-feature': lazy(() => import('./templates/ModernFeature')),
  'platform-hero': lazy(() => import('./templates/PlatformHero')),
  'component-mosaic': lazy(() => import('./templates/ComponentMosaic')),
  'testimonial-card': lazy(() => import('./templates/TestimonialCard')),
  'community-hub': lazy(() => import('./templates/CommunityHub')),
  'table-of-contents': lazy(() => import('./templates/TableOfContents')),
  'big-statement': lazy(() => import('./templates/BigStatement')),
  'step-timeline': lazy(() => import('./templates/StepTimeline')),
  'gallery-capsule': lazy(() => import('./templates/GalleryCapsule')),
  'editorial-split': lazy(() => import('./templates/EditorialSplit')),
  'back-cover-movie': lazy(() => import('./templates/BackCoverMovie')),
  'future-focus': lazy(() => import('./templates/FutureFocus')),
  'editorial-classic': lazy(() => import('./templates/EditorialClassic')),
  'cinematic-full-bleed': lazy(() => import('./templates/CinematicFullBleed')),
  'editorial-back-cover': lazy(() => import('./templates/EditorialBackCover')),
  'kinfolk-feature': lazy(() => import('./templates/KinfolkFeature')),
  'kinfolk-essay': lazy(() => import('./templates/KinfolkEssay')),
  'kinfolk-montage': lazy(() => import('./templates/KinfolkMontage')),
  'micro-anchor': lazy(() => import('./templates/MicroAnchor')),
  'typography-hero': lazy(() => import('./templates/TypographyHero')),
  'film-diptych': lazy(() => import('./templates/FilmDiptych')),
  'apple-bento-grid': lazy(() => import('./templates/AppleBentoGrid')),
};

export default templateMap;
