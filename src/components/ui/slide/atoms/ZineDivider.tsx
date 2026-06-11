import React from 'react';
import { DesignSystem, PageData } from '../../../../types';
import { useStore } from '../../../../store/useStore';
import { useModularStyle } from '../hooks/useModularStyle';

interface ZineDividerProps {
  page: PageData;
  fieldKey?: string;
  orientation?: 'horizontal' | 'vertical';
  thickness?: number | string;
  color?: keyof DesignSystem['tokens']['colors'] | string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * ZineDivider - 工业感分割线/精密刻度线
 * 遵循 Zine Mode 审美约束，支持 Modular Grid 定位与 9 点对齐
 */
export const ZineDivider: React.FC<ZineDividerProps> = ({
  page,
  fieldKey,
  orientation = 'horizontal',
  thickness = '1px',
  color = 'accent',
  className = '',
  style: customStyle = {}
}) => {
  const ds = useStore(s => s.designSystem);
  
  const isHorizontal = orientation === 'horizontal';
  
  const { style, className: resolvedClassName } = useModularStyle({
    page,
    fieldKey,
    props: { color: (ds.tokens.colors as any)[color] || color },
    customStyle,
    className
  });

  // 1. 可见性检查
  const isVisible = fieldKey ? page.visibility?.[fieldKey] !== false : true;
  if (!isVisible) return null;

  // 2. 智能厚度与长度逻辑
  // 我们支持通过 styleOverrides 直接控制 width 和 height
  // 修复：优先读取 styleOverrides.thickness，并自动添加 px 单位
  const overrideThickness = fieldKey && page.styleOverrides?.[fieldKey]?.thickness;
  const thicknessValue = overrideThickness || thickness;
  const resolvedThickness = typeof thicknessValue === 'number' ? `${thicknessValue}px` : thicknessValue;

  const finalStyle: React.CSSProperties = {
    ...style,
    backgroundColor: style.color || (ds.tokens.colors as any)[color] || color,
    
    // 长度逻辑：
    // 如果是水平线：width 默认为 100% (除非 style 中有显式 width)
    // 如果是垂直线：height 默认为 100% (除非 style 中有显式 height)
    width: isHorizontal 
      ? (style.width || '100%') 
      : resolvedThickness,
    height: isHorizontal 
      ? resolvedThickness 
      : (style.height || '100%'),
      
    opacity: style.opacity ?? 1,
    
    // 强制执行对齐方式 (由 LayoutRenderer 或 styleOverrides 传入)
    // 修复：Flexbox(column) 中需要交换 alignSelf 和 justifySelf
    alignSelf: style.alignSelf || (isHorizontal ? 'center' : 'stretch'),
    justifySelf: style.justifySelf || (isHorizontal ? 'stretch' : 'center'),
    
    // 确保 zIndex 至少为 1
    zIndex: style.zIndex || 1,
  };

  return <div className={`zine-divider ${resolvedClassName}`} style={finalStyle} />;
};

export default ZineDivider;
