import React from 'react';
import { MetricData, PageData, TypographySettings } from '../../../types';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useStore } from '../../../store/useStore';
import { useModularStyle } from './hooks/useModularStyle';
import { Text } from './atoms/Text';

interface SlideMetricProps {
  data: MetricData;
  page?: PageData; 
  typography?: TypographySettings; 
  className?: string;
  valueClassName?: string;
  labelClassName?: string;
  unitClassName?: string;
  subLabelClassName?: string;
  style?: React.CSSProperties;
}

/**
 * SlideMetric - 已重构：使用 Atomic Text 组件与 Modular Hooks
 */
export const SlideMetric: React.FC<SlideMetricProps> = ({ 
  data, 
  page,
  typography,
  className = "",
  valueClassName = "",
  labelClassName = "",
  unitClassName = "",
  subLabelClassName = "",
  style: customStyle
}) => {
  const theme = useStore((state) => state.theme);
  const overrides = page?.styleOverrides?.metrics || {};
  
  // 1. 样式解析
  const { style, className: resolvedClassName } = useModularStyle({
    fieldKey: 'metrics',
    overrides,
    customStyle,
    className
  });

  const getFontFamily = () => {
    if (style.fontFamily) return style.fontFamily;
    const fieldFont = typography?.fieldOverrides?.['metrics'];
    if (fieldFont) return fieldFont;
    return theme?.typography?.headingFont || "'Inter', sans-serif";
  };

  const finalValueSize = style.fontSize || '4.5rem';
  const valueColor = style.color || theme?.colors?.primary || '#0F172A';
  const labelColor = theme?.colors?.accent || '#264376';
  const subLabelColor = theme?.colors?.secondary || '#64748B';

  return (
    <div className={`flex flex-col gap-2 ${resolvedClassName}`} style={{ ...style, fontFamily: getFontFamily() }}>
      <div className="flex items-baseline gap-1">
        <Text
          as="span"
          content={data.value}
          className={`font-[1000] tracking-[-0.05em] leading-none ${valueClassName}`}
          style={{ fontSize: finalValueSize, color: valueColor }}
          sanitize={false}
        />
        {data.unit && (
          <span 
            className={`font-bold opacity-60 ${unitClassName}`}
            style={{ fontSize: `calc(${finalValueSize} * 0.35)`, color: valueColor }}
            dangerouslySetInnerHTML={{ 
              __html: katex.renderToString(data.unit, { throwOnError: false }) 
            }}
          />
        )}
      </div>
      <div className="space-y-0.5">
        <Text
          as="p"
          content={data.label}
          className={`text-[10px] font-black uppercase tracking-widest ${labelClassName}`}
          style={{ color: labelColor }}
        />
        {(data as any).subLabel && (
          <Text
            as="p"
            content={(data as any).subLabel}
            className={`text-[9px] font-medium ${subLabelClassName}`}
            style={{ color: subLabelColor }}
          />
        )}
      </div>
    </div>
  );
};
