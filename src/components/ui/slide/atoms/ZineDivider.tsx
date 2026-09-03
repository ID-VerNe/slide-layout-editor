import React from 'react';
import { DesignSystem, PageData, ProjectTheme, TypographySettings } from '../../../../types';
import { useStore } from '../../../../store/useStore';
import { useModularStyle } from '../hooks/useModularStyle';
import { useDataConnector } from '../hooks/useDataConnector';

interface ZineDividerProps {
  page: PageData;
  fieldKey?: string;
  orientation?: 'horizontal' | 'vertical';
  thickness?: number | string;
  color?: keyof DesignSystem['tokens']['colors'] | string;
  className?: string;
  style?: React.CSSProperties;
  designSystem?: DesignSystem;
  theme?: ProjectTheme;
  typography?: TypographySettings;
}

/**
 * ZineDivider - 工业感分割线/精密刻度线
 * 遵循 Zine Mode 审美约束，支持 24 格物理硬隔离与双轴几何尺寸模型
 */
export const ZineDivider: React.FC<ZineDividerProps> = ({
  page,
  fieldKey,
  orientation = 'horizontal',
  thickness = '1px',
  color = 'accent',
  className = '',
  style: customStyle = {},
  designSystem: propsDs,
  theme: propsTheme,
  typography: propsTypography,
}) => {
  const storeDs = useStore(s => s.designSystem);
  const ds = propsDs || storeDs;
  
  const isHorizontal = orientation === 'horizontal';

  // 1. 统一提取数据连接与可见性状态
  const { isVisible, overrides } = useDataConnector(fieldKey, page);
  if (!isVisible) return null;
  
  const { style, className: resolvedClassName } = useModularStyle({
    page,
    fieldKey,
    props: { color: (ds.tokens.colors as any)[color] || color },
    customStyle,
    className
  });

  // 2. 智能厚度计算：优先读取 styleOverrides.thickness
  const overrideThickness = overrides?.thickness;
  const thicknessValue = overrideThickness || thickness;
  const resolvedThickness = typeof thicknessValue === 'number' ? `${thicknessValue}px` : thicknessValue;

  const finalStyle: React.CSSProperties = {
    minWidth: 0,
    minHeight: 0,
    maxWidth: '100%',
    maxHeight: '100%',
    boxSizing: 'border-box',
    ...style,
    backgroundColor: style.color || (ds.tokens.colors as any)[color] || color,
    
    // 长度与厚度几何模型
    width: isHorizontal 
      ? (style.width || '100%') 
      : resolvedThickness,
    height: isHorizontal 
      ? resolvedThickness 
      : (style.height || '100%'),
      
    opacity: style.opacity ?? 1,
    
    // 对齐方式 (由 LayoutRenderer 或 styleOverrides 传入)
    alignSelf: style.alignSelf || (isHorizontal ? 'center' : 'stretch'),
    justifySelf: style.justifySelf || (isHorizontal ? 'stretch' : 'center'),
    
    zIndex: style.zIndex || 1,
  };

  return <div className={`zine-divider ${resolvedClassName}`} style={finalStyle} />;
};

export default ZineDivider;
