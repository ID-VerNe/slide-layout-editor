import React, { useMemo } from 'react';
import { useModularStyle } from '../hooks/useModularStyle';
import { PageData, DesignSystem, ProjectTheme } from '../../../../types';
import { measureArtFontDimensions } from '../utils/artFontMeasurer';

interface ZineArtFontProps {
  text: string;
  page?: PageData;
  fieldKey?: string;
  mode?: 'solid' | 'outline';
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number | string;
  className?: string;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacing?: string;
  opacity?: number;
  mixBlendMode?: React.CSSProperties['mixBlendMode'];
  style?: React.CSSProperties;
  designSystem?: DesignSystem;
  theme?: ProjectTheme;
  [key: string]: any;
}

/**
 * ZineArtFont - 高级艺术字组件
 * 支持实心/空心切换、SVG 响应式自适应贴合与 24 格物理隔离
 */
export const ZineArtFont: React.FC<ZineArtFontProps> = ({
  text,
  page,
  fieldKey,
  mode = 'outline',
  color = '#0F172A',
  strokeColor = '#0F172A',
  strokeWidth = 2,
  fontSize = 120,
  fontFamily = 'Inter, sans-serif',
  fontWeight = 900,
  className = '',
  textAlign = 'center',
  lineHeight = 1,
  letterSpacing = '-0.02em',
  opacity = 1,
  mixBlendMode = 'normal',
  style: customStyle,
  ...otherProps
}) => {
  const { style, className: resolvedClassName } = useModularStyle({
    page,
    fieldKey,
    props: { color, opacity, mixBlendMode, ...otherProps },
    customStyle,
    className: `zine-art-font ${className}`
  });

  const resolvedFontSize = style.fontSize || fontSize;
  const resolvedFontFamily = (style.fontFamily as string) || fontFamily;
  const resolvedFontWeight = style.fontWeight || fontWeight;

  // 使用独立的离屏测量模块
  const dimensions = useMemo(() => {
    return measureArtFontDimensions(
      text,
      resolvedFontSize,
      resolvedFontFamily,
      resolvedFontWeight,
      lineHeight,
      strokeWidth
    );
  }, [text, resolvedFontSize, resolvedFontFamily, resolvedFontWeight, lineHeight, strokeWidth]);

  if (!text) return null;

  const displayText = text.toUpperCase();

  const getTextAnchor = () => {
    const align = style.textAlign || textAlign;
    switch (align) {
      case 'left': return 'start';
      case 'center': return 'middle';
      case 'right': return 'end';
      default: return 'middle';
    }
  };

  const getX = () => {
    const align = style.textAlign || textAlign;
    switch (align) {
      case 'left': return strokeWidth;
      case 'center': return dimensions.width / 2;
      case 'right': return dimensions.width - strokeWidth;
      default: return dimensions.width / 2;
    }
  };

  const finalStyle: React.CSSProperties = {
    minWidth: 0,
    minHeight: 0,
    maxWidth: '100%',
    maxHeight: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style,
  };

  return (
    <div className={resolvedClassName} style={finalStyle}>
      <svg
        viewBox={`0 0 ${dimensions.width || 100} ${dimensions.height || fontSize}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full max-w-full max-h-full"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <text
          x={getX()}
          y={dimensions.height * 0.85}
          textAnchor={getTextAnchor()}
          fill={mode === 'solid' ? (style.color as string || color) : 'transparent'}
          stroke={style.color as string || strokeColor}
          strokeWidth={mode === 'outline' ? strokeWidth : 0}
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{
            fontFamily: resolvedFontFamily,
            fontSize: `${typeof resolvedFontSize === 'number' ? resolvedFontSize : parseFloat(resolvedFontSize as string) || 120}px`,
            fontWeight: resolvedFontWeight as any,
            letterSpacing: style.letterSpacing as string || letterSpacing,
            textTransform: 'uppercase',
          }}
        >
          {displayText}
        </text>
      </svg>
    </div>
  );
};

export default ZineArtFont;
