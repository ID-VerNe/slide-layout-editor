import React from 'react';
import { LUCIDE_ICON_MAP } from '../../../constants/icons';
import { HelpCircle } from 'lucide-react';

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
 * SlideIcon 原子组件
 * 统一处理 Lucide 图标、Material Symbols 和 Base64 图片/URL 资产
 */
export const SlideIcon: React.FC<SlideIconProps> = ({ 
  name, 
  size = 24, 
  className = "", 
  color,
  weight,
  strokeWidth = 2.5,
  style
}) => {
  if (!name) return null;

  // 1. 处理图片/URL
  const isImage = name.startsWith('data:image') || name.includes('http') || name.includes('/') || name.includes('.');
  if (isImage) {
    return (
      <div 
        className={`flex items-center justify-center overflow-hidden ${className}`}
        style={{ width: size, height: size, ...style }}
      >
        <img src={name} className="w-full h-full object-contain" alt="Icon" crossOrigin="anonymous" />
      </div>
    );
  }

  // 2. 处理 Material Symbols (通常包含下划线或小写开头)
  const isMaterial = name.includes('_') || /^[a-z]/.test(name);
  if (isMaterial) {
    return (
      <span 
        className={`material-symbols-outlined notranslate select-none ${className}`}
        style={{ 
          fontSize: `${size}px`, 
          color: color || 'inherit',
          fontWeight: weight || 'normal',
          fontVariationSettings: `'FILL' 0, 'wght' ${weight || 400}, 'GRAD' 0, 'opsz' 24`,
          display: 'inline-block',
          lineHeight: 1,
          textTransform: 'none',
          ...style
        }}
      >
        {name.toLowerCase()}
      </span>
    );
  }

  // 3. 处理 Lucide 图标
  const PascalName = name.charAt(0).toUpperCase() + name.slice(1);
  const Icon = LUCIDE_ICON_MAP[PascalName] || LUCIDE_ICON_MAP[name] || HelpCircle;

  return (
    <Icon 
      size={size} 
      strokeWidth={strokeWidth} 
      className={className} 
      style={{ color: color || 'inherit', ...style }} 
    />
  );
};
