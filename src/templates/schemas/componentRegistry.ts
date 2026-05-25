import { SlideHeadline } from '../../components/ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../../components/ui/slide/SlideSubHeadline';
import { SlideParagraph } from '../../components/ui/slide/SlideParagraph';
import { SlideImage } from '../../components/ui/slide/SlideImage';
import { SlideLogo } from '../../components/ui/slide/SlideLogo';
import { SlideIcon } from '../../components/ui/slide/SlideIcon';
import { SlideMetric } from '../../components/ui/slide/SlideMetric';
import { SlideBlockLabel } from '../../components/ui/slide/SlideBlockLabel';
import { SlideImageLabel } from '../../components/ui/slide/SlideImageLabel';
import MetadataOverlay from '../../components/ui/slide/MetadataOverlay';
import { OutlineText } from '../../components/ui/slide/OutlineText';

// Zine 原子组件 (Phase 3)
import { ZineDisplay } from '../../components/ui/slide/atoms/ZineDisplay';
import { ZineBody } from '../../components/ui/slide/atoms/ZineBody';
import { ZineCaption } from '../../components/ui/slide/atoms/ZineCaption';
import { ZineMedia } from '../../components/ui/slide/atoms/ZineMedia';
import { ZineResume } from '../../components/ui/slide/atoms/ZineResume';

export const COMPONENT_REGISTRY: Record<string, React.FC<any>> = {
  SlideHeadline,
  SlideSubHeadline,
  SlideParagraph,
  SlideImage,
  SlideLogo,
  SlideIcon,
  SlideMetric,
  SlideBlockLabel,
  SlideImageLabel,
  MetadataOverlay,
  OutlineText,
  
  // Zine 新原子
  ZineDisplay,
  ZineBody,
  ZineCaption,
  ZineMedia,
  ZineResume,
};

export type RegisteredComponentType = keyof typeof COMPONENT_REGISTRY;

export function getComponent(type: string): React.FC<any> | null {
  return COMPONENT_REGISTRY[type] || null;
}
