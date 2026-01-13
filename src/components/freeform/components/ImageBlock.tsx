import React from 'react';
import { FreeformItem } from '../../../types/freeform.types';
import { SlideImage } from '../../ui/slide/SlideImage';
import { PageData } from '../../../types';

/**
 * ImageBlock - 自由布局图片组件
 * 核心重构：直接复用系统顶级的 SlideImage 原子组件。
 * 这样做可以获得：
 * 1. 渐进式加载 (LQIP)
 * 2. 基于 object-position 的专业级图像微调 (Adjust)
 * 3. 与全系统一致的渲染质量
 */
export const ImageBlock: React.FC<{ item: FreeformItem, page: PageData }> = ({ item, page }) => {
  const { content } = item;
  
  // 适配自由布局的数据结构到 SlideImage 的 Props
  const config = content?.imageConfig || { scale: 1, x: 0, y: 0 };
  const src = content?.image || '';

  return (
    <SlideImage
      page={page}
      src={src}
      config={config}
      className="w-full h-full"
      rounded="0" // 自由布局的圆角由外层容器控制
      shadow="none" // 自由布局的阴影由外层容器控制
      priority // 自由布局优先渲染
    />
  );
};