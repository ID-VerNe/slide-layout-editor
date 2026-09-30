// Zine 原子组件 (V3 Modular)
import React from 'react';
import { ZineDisplay } from '../../components/ui/slide/atoms/ZineDisplay';
import { ZineBody } from '../../components/ui/slide/atoms/ZineBody';
import { ZineCaption } from '../../components/ui/slide/atoms/ZineCaption';
import { ZineMedia } from '../../components/ui/slide/atoms/ZineMedia';
import { ZineResume } from '../../components/ui/slide/atoms/ZineResume';
import { ZineDivider } from '../../components/ui/slide/atoms/ZineDivider';
import { ZineIcon } from '../../components/ui/slide/atoms/ZineIcon';
import { ZineMetric } from '../../components/ui/slide/atoms/ZineMetric';
import { ZineLogo } from '../../components/ui/slide/atoms/ZineLogo';
import { ZineArtFont } from '../../components/ui/slide/atoms/ZineArtFont';
import { BigDataMetrics } from '../../components/ui/slide/atoms/BigDataMetrics';
import { ZineVocabList } from '../../components/ui/slide/atoms/ZineVocabList';

/**
 * Zine V3 组件注册表
 * 仅保留全新的原子化组件，彻底移除旧版 Slide* 组件。
 * 各原子 props 形状各异,注册表统一承载异构组件类型,渲染时由 componentRenderer 拼装具体 props
 */
// @lat: [[templates-schemas#Component Registry]]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const COMPONENT_REGISTRY: Record<string, React.ComponentType<any>> = {
  ZineDisplay,
  ZineBody,
  ZineCaption,
  ZineMedia,
  ZineResume,
  ZineDivider,
  ZineIcon,
  ZineMetric,
  ZineLogo,
  ZineArtFont,
  BigDataMetrics,
  ZineVocabList,
  // 别名与向后兼容映射
  ZineFooter: ZineCaption,
  ZineTitle: ZineDisplay,
  ZineSubtitle: ZineCaption,
  ZineText: ZineBody,
  ZineImage: ZineMedia,
  SlideTitle: ZineDisplay,
  SlideSubtitle: ZineCaption,
  SlideBody: ZineBody,
  SlideImage: ZineMedia,
  SlideDivider: ZineDivider,
};

export type RegisteredComponentType = keyof typeof COMPONENT_REGISTRY;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getComponent(type: string): React.ComponentType<any> | null {
  return COMPONENT_REGISTRY[type] || null;
}
