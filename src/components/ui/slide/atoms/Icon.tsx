import React from 'react';

interface IconProps {
  name: string;
  size?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Icon Atomic Component - 统一图标展示组件
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = 'currentColor',
  className = '',
  style = {}
}) => {
  return (
    <span 
      className={`material-symbols-outlined select-none ${className}`}
      style={{ 
        fontSize: size,
        color,
        ...style
      }}
    >
      {name}
    </span>
  );
};
