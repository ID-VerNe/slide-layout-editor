import React from 'react';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Divider Atomic Component - 基础线条/分割线组件
 */
export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  thickness = 1,
  color = 'currentColor',
  className = '',
  style = {}
}) => {
  const isHorizontal = orientation === 'horizontal';
  
  const finalStyle: React.CSSProperties = {
    backgroundColor: color,
    width: isHorizontal ? '100%' : thickness,
    height: isHorizontal ? thickness : '100%',
    ...style
  };

  return <div className={className} style={finalStyle} />;
};
