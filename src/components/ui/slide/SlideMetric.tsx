import React from 'react';
import { MetricData, PageData, TypographySettings } from '../../../types';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface SlideMetricProps {
  data: MetricData;
  page?: PageData; // 传入 page 以获取 styleOverrides
  typography?: TypographySettings; // 传入全局配置
  className?: string;
  valueClassName?: string;
  labelClassName?: string;
  unitClassName?: string;
  subLabelClassName?: string;
  style?: React.CSSProperties;
}

/**
 * SlideMetric 原子组件
 * 增强版：支持 styleOverrides (全局字号调节) 和 全局字体感应。
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
  const overrides = page?.styleOverrides?.metrics || {};
  
  // 计算字体链
  const getFontFamily = () => {
    const fieldFont = typography?.fieldOverrides?.['metrics'];
    if (fieldFont) return fieldFont;
    const latin = typography?.defaultLatin || "'Inter', sans-serif";
    const cjk = typography?.defaultCJK || "'Noto Serif SC', serif";
    return `${latin}, ${cjk}`;
  };

  const finalValueSize = overrides.fontSize ? `${overrides.fontSize}px` : '4.5rem'; // 默认 72px

  return (
    <div className={`flex flex-col gap-2 ${className}`} style={{ ...style, fontFamily: getFontFamily() }}>
      <div className="flex items-baseline gap-1">
        <span 
          className={`font-[1000] text-slate-900 tracking-[-0.05em] leading-none ${valueClassName}`}
          style={{ fontSize: finalValueSize }}
        >
          {data.value}
        </span>
        {data.unit && (
          <span 
            className={`font-bold text-slate-400 ${unitClassName}`}
            style={{ fontSize: `calc(${finalValueSize} * 0.35)` }}
            dangerouslySetInnerHTML={{ 
              __html: katex.renderToString(data.unit, { throwOnError: false }) 
            }}
          />
        )}
      </div>
      <div className="space-y-0.5">
        <p className={`text-[10px] font-black text-slate-900 uppercase tracking-widest ${labelClassName}`}>
          {data.label}
        </p>
        {data.subLabel && (
          <p className={`text-[9px] font-medium text-slate-400 ${subLabelClassName}`}>
            {data.subLabel}
          </p>
        )}
      </div>
    </div>
  );
};