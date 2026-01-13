import React from 'react';
import { FreeformItem } from '../../../types/freeform.types';

export const Shape: React.FC<{ item: FreeformItem }> = () => {
  // Shape 的视觉表现（背景、边框、圆角）现在由 FreeformItem 的包装容器统一处理。
  // 这样可以确保所有组件（包括图片）都能正确应用这些通用样式。
  return <div className="w-full h-full" />;
};