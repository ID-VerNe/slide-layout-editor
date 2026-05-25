import React from 'react';
import { LUCIDE_ICON_MAP } from '../../../constants/icons';
import { HelpCircle } from 'lucide-react';
import { Icon as IconAtom } from './atoms/Icon';
import { Image as ImageAtom } from './atoms/Image';
import { useModularStyle } from './hooks/useModularStyle';

interface SlideIconProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
  weight?: number;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

/**
 * SlideIcon - 已重构：支持多种图标源并利用 Modular Hooks
 */
export const SlideIcon: React.FC<SlideIconProps> = ({ 
  name, 
  size = 24, 
  className = "", 
  color,
  weight,
  strokeWidth = 2.5,
  style: customStyle
}) => {
  const { style, className: resolvedClassName } = useModularStyle({
    props: { color },
    customStyle,
    className
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
    return (
      <IconAtom
        name={name.toLowerCase()}
        size={`${size}px`}
        color={style.color as string || 'inherit'}
        className={resolvedClassName}
        style={{
          fontWeight: weight || 'normal',
          fontVariationSettings: `'FILL' 0, 'wght' ${weight || 400}, 'GRAD' 0, 'opsz' 24`,
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
