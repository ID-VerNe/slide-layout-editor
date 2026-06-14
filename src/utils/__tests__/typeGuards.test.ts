import { describe, it, expect } from 'vitest';
import {
  isAgendaPage,
  isPlatformHeroPage,
  isStepTimelinePage,
  isTestimonialCardPage,
  isCommunityHubPage,
  isComponentMosaicPage,
  isGalleryCapsulePage,
  isEditorialSplitPage,
} from '../typeGuards';
import { PageData } from '../../types';

const makePage = (layoutId: string): PageData => ({
  id: 'test',
  type: 'slide',
  layoutId,
  aspectRatio: '16:9',
  title: 'Test',
});

describe('typeGuards', () => {
  it('isAgendaPage 匹配 table-of-contents', () => {
    expect(isAgendaPage(makePage('table-of-contents'))).toBe(true);
    expect(isAgendaPage(makePage('modern-feature'))).toBe(false);
  });

  it('isPlatformHeroPage 匹配 platform-hero', () => {
    expect(isPlatformHeroPage(makePage('platform-hero'))).toBe(true);
    expect(isPlatformHeroPage(makePage('zine-classic'))).toBe(false);
  });

  it('isStepTimelinePage 匹配 step-timeline', () => {
    expect(isStepTimelinePage(makePage('step-timeline'))).toBe(true);
    expect(isStepTimelinePage(makePage('big-statement'))).toBe(false);
  });

  it('isTestimonialCardPage 匹配 testimonial-card', () => {
    expect(isTestimonialCardPage(makePage('testimonial-card'))).toBe(true);
    expect(isTestimonialCardPage(makePage('community-hub'))).toBe(false);
  });

  it('isCommunityHubPage 匹配 community-hub', () => {
    expect(isCommunityHubPage(makePage('community-hub'))).toBe(true);
    expect(isCommunityHubPage(makePage('platform-hero'))).toBe(false);
  });

  it('isComponentMosaicPage 匹配 component-mosaic', () => {
    expect(isComponentMosaicPage(makePage('component-mosaic'))).toBe(true);
    expect(isComponentMosaicPage(makePage('editorial-split'))).toBe(false);
  });

  it('isGalleryCapsulePage 匹配 gallery-capsule', () => {
    expect(isGalleryCapsulePage(makePage('gallery-capsule'))).toBe(true);
    expect(isGalleryCapsulePage(makePage('film-diptych'))).toBe(false);
  });

  it('isEditorialSplitPage 匹配 editorial-split', () => {
    expect(isEditorialSplitPage(makePage('editorial-split'))).toBe(true);
    expect(isEditorialSplitPage(makePage('vertical-column'))).toBe(false);
  });

  it('不匹配的 layoutId 全部返回 false', () => {
    const page = makePage('unknown-layout');
    expect(isAgendaPage(page)).toBe(false);
    expect(isPlatformHeroPage(page)).toBe(false);
    expect(isStepTimelinePage(page)).toBe(false);
    expect(isTestimonialCardPage(page)).toBe(false);
    expect(isCommunityHubPage(page)).toBe(false);
    expect(isComponentMosaicPage(page)).toBe(false);
    expect(isGalleryCapsulePage(page)).toBe(false);
    expect(isEditorialSplitPage(page)).toBe(false);
  });
});
