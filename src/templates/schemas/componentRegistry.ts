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
};

export type RegisteredComponentType = keyof typeof COMPONENT_REGISTRY;

export function getComponent(type: string): React.FC<any> | null {
  return COMPONENT_REGISTRY[type] || null;
}
