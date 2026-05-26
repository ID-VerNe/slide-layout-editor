import React from 'react';
import { LUCIDE_ICON_MAP } from '../../../../constants/icons';
import { HelpCircle } from 'lucide-react';
import { Icon as IconAtom } from './Icon';
import { Image as ImageAtom } from './Image';
import { useModularStyle } from '../hooks/useModularStyle';
import { PageData } from '../../../../types';

interface ZineIconProps {
  name: string;
  page?: PageData;
  fieldKey?: string;
  size?: number;
  className?: string;
  color?: string;
  weight?: number | string;
  strokeWidth?: number;
  style?: React.CSSProperties;
  [key: string]: any;
}

/**
 * ZineIcon - 已重构：支持多种图标源并利用 Modular Hooks
 */
export const ZineIcon: React.FC<ZineIconProps> = ({ 
  name, 
  page,
  fieldKey,
  size = 24, 
  className = "", 
  color,
  weight,
  strokeWidth = 2.5,
  style: customStyle,
  ...otherProps
}) => {
  const { style, className: resolvedClassName } = useModularStyle({
    page,
    fieldKey,
    props: { color, weight, ...otherProps },
    customStyle,
    className: `zine-icon ${className}`
  });

  if (!name) return null;

  // 1. 处理图片/URL
  const isImage = name.startsWith('data:image') || name.includes('http') || name.includes('/') || name.includes('.');
  if (isImage) {
    return (
      <ImageAtom 
        url={name}
        className={`flex items-center justify-center overflow-hidden ${resolvedClassName}`}
        imgClassName="object-contain"
        style={{ width: size, height: size, ...style }}
      />
    );
  }

  // 2. 处理 Material Symbols
  const isMaterial = name.includes('_') || /^[a-z]/.test(name);
  if (isMaterial) {
    const resolvedWeight = style.fontWeight || weight || 400;
    return (
      <IconAtom
        name={name.toLowerCase()}
        size={`${size}px`}
        color={style.color as string || 'inherit'}
        className={resolvedClassName}
        style={{
          fontWeight: resolvedWeight,
          fontVariationSettings: `'FILL' 0, 'wght' ${resolvedWeight}, 'GRAD' 0, 'opsz' 24`,
          display: 'inline-block',
          lineHeight: 1,
          textTransform: 'none',
          ...style
        }}
      />
    );
  }

  // 3. 处理 Lucide 图标
  const PascalName = name.charAt(0).toUpperCase() + name.slice(1);
  const LucideIcon = LUCIDE_ICON_MAP[PascalName] || LUCIDE_ICON_MAP[name] || HelpCircle;

  return (
    <LucideIcon 
      size={size} 
      strokeWidth={strokeWidth} 
      className={resolvedClassName} 
      style={{ color: style.color as string || 'inherit', ...style }} 
    />
  );
};

export default ZineIcon;
