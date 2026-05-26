// Zine 原子组件 (V3 Modular)
import { ZineDisplay } from '../../components/ui/slide/atoms/ZineDisplay';
import { ZineBody } from '../../components/ui/slide/atoms/ZineBody';
import { ZineCaption } from '../../components/ui/slide/atoms/ZineCaption';
import { ZineMedia } from '../../components/ui/slide/atoms/ZineMedia';
import { ZineResume } from '../../components/ui/slide/atoms/ZineResume';
import { ZineDivider } from '../../components/ui/slide/atoms/ZineDivider';
import { ZineIcon } from '../../components/ui/slide/atoms/ZineIcon';
import { ZineMetric } from '../../components/ui/slide/atoms/ZineMetric';
import { ZineLogo } from '../../components/ui/slide/atoms/ZineLogo';
import { ZineOutlineText } from '../../components/ui/slide/atoms/ZineOutlineText';
import { ZineArtFont } from '../../components/ui/slide/atoms/ZineArtFont';

/**
 * Zine V3 组件注册表
 * 仅保留全新的原子化组件，彻底移除旧版 Slide* 组件。
 */
export const COMPONENT_REGISTRY: Record<string, React.FC<any>> = {
  ZineDisplay,
  ZineBody,
  ZineCaption,
  ZineMedia,
  ZineResume,
  ZineDivider,
  ZineIcon,
  ZineMetric,
  ZineLogo,
  ZineOutlineText,
  ZineArtFont,
};

export type RegisteredComponentType = keyof typeof COMPONENT_REGISTRY;

export function getComponent(type: string): React.FC<any> | null {
  return COMPONENT_REGISTRY[type] || null;
}
