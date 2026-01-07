import React from 'react';
import { MetricData, PageData, TypographySettings } from '../../../types';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useStore } from '../../../store/useStore';

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
 * SlideMetric - 主题感应版
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
  style
}) => {
  const theme = useStore((state) => state.theme);
  const overrides = page?.styleOverrides?.metrics || {};
  
  const getFontFamily = () => {
    const fieldFont = typography?.fieldOverrides?.['metrics'];
    if (fieldFont) return fieldFont;
    const latin = typography?.defaultLatin || theme?.typography?.headingFont || "'Inter', sans-serif";
    const cjk = typography?.defaultCJK || "'Noto Serif SC', serif";
    return `${latin}, ${cjk}`;
  };

  const finalValueSize = overrides.fontSize ? `${overrides.fontSize}px` : '4.5rem';
  
  // 颜色 Token 映射
  const valueColor = overrides.color || theme?.colors?.primary || '#0F172A';
  const labelColor = theme?.colors?.accent || '#264376';
  const subLabelColor = theme?.colors?.secondary || '#64748B';

  return (
    <div className={`flex flex-col gap-2 ${className}`} style={{ ...style, fontFamily: getFontFamily() }}>
      <div className="flex items-baseline gap-1">
        <span 
          className={`font-[1000] tracking-[-0.05em] leading-none ${valueClassName}`}
          style={{ fontSize: finalValueSize, color: valueColor }}
        >
          {data.value}
        </span>
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
        <p 
          className={`text-[10px] font-black uppercase tracking-widest ${labelClassName}`}
          style={{ color: labelColor }}
        >
          {data.label}
        </p>
        {data.subLabel && (
          <p 
            className={`text-[9px] font-medium ${subLabelClassName}`}
            style={{ color: subLabelColor }}
          >
            {data.subLabel}
          </p>
        )}
      </div>
    </div>
  );
};
