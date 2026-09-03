import React from 'react';
import { LUCIDE_ICON_MAP } from '../../../../constants/icons';
import { HelpCircle } from 'lucide-react';
import { Icon as IconAtom } from './Icon';
import { Image as ImageAtom } from './Image';
import { useModularStyle } from '../hooks/useModularStyle';
import { resolveModularFontSize } from '../utils/typographyScale';
import { PageData, DesignSystem, ProjectTheme } from '../../../../types';

interface ZineIconProps {
  name: string;
  page?: PageData;
  fieldKey?: string;
  size?: number | string;
  className?: string;
  color?: string;
  weight?: number | string;
  strokeWidth?: number;
  style?: React.CSSProperties;
  designSystem?: DesignSystem;
  theme?: ProjectTheme;
  [key: string]: any;
}

/**
 * ZineIcon - 图标原子组件
 * 严格支持 24 格网格物理隔离与三源（Lucide, Material, URL）自适应规整
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
  designSystem: propsDs,
  theme: propsTheme,
  ...otherProps
}) => {
  const resolvedSize = typeof size === 'number'
    ? (size <= 10 ? Math.round(size * 8) : size)
    : (resolveModularFontSize(size) || 24);

  const { style, className: resolvedClassName } = useModularStyle({
    page,
    fieldKey,
    props: { color, weight, ...otherProps },
    customStyle,
    className: `zine-icon ${className}`
  });

  if (!name) return null;

  const containerStyle: React.CSSProperties = {
    minWidth: 0,
    minHeight: 0,
    maxWidth: '100%',
    maxHeight: '100%',
    boxSizing: 'border-box',
    ...style,
  };

  // 1. 处理图片/URL
  const isImage = name.startsWith('data:image') || name.includes('http') || name.includes('/') || name.includes('.');
  if (isImage) {
    return (
      <ImageAtom 
        url={name}
        className={`flex items-center justify-center overflow-hidden ${resolvedClassName}`}
        imgClassName="object-contain"
        style={{ width: resolvedSize, height: resolvedSize, ...containerStyle }}
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
        size={`${resolvedSize}px`}
        color={style.color as string || 'inherit'}
        className={resolvedClassName}
        style={{
          fontWeight: resolvedWeight,
          fontVariationSettings: `'FILL' 0, 'wght' ${resolvedWeight}, 'GRAD' 0, 'opsz' 24`,
          display: 'inline-block',
          lineHeight: 1,
          textTransform: 'none',
          ...containerStyle
        }}
      />
    );
  }

  // 3. 处理 Lucide 图标
  const PascalName = name.charAt(0).toUpperCase() + name.slice(1);
  const LucideIcon = LUCIDE_ICON_MAP[PascalName] || LUCIDE_ICON_MAP[name] || HelpCircle;

  return (
    <LucideIcon 
      size={resolvedSize} 
      strokeWidth={strokeWidth} 
      className={resolvedClassName} 
      style={{ color: style.color as string || 'inherit', ...containerStyle }} 
    />
  );
};

export default ZineIcon;
