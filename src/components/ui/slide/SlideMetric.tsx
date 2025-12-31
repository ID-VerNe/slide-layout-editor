import React from 'react';
import { MetricData } from '../../../types';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface SlideMetricProps {
  data: MetricData;
  className?: string;
  valueClassName?: string;
  labelClassName?: string;
  unitClassName?: string;
  subLabelClassName?: string;
  style?: React.CSSProperties;
}

/**
 * SlideMetric 原子组件
 * 统一处理指标数据的展示，支持 KaTeX 数学公式渲染单位
 */
export const SlideMetric: React.FC<SlideMetricProps> = ({ 
  data, 
  className = "",
  valueClassName = "",
  labelClassName = "",
  unitClassName = "",
  subLabelClassName = "",
  style
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`} style={style}>
      <div className="flex items-baseline gap-1">
        <span className={`text-7xl font-[1000] text-slate-900 tracking-[-0.05em] ${valueClassName}`}>
          {data.value}
        </span>
        {data.unit && (
          <span 
            className={`text-2xl font-bold text-slate-400 ${unitClassName}`}
            dangerouslySetInnerHTML={{ 
              __html: katex.renderToString(data.unit, { throwOnError: false }) 
            }}
          />
        )}
      </div>
      <div className="space-y-0.5">
        <p className={`text-sm font-black text-slate-900 uppercase tracking-tight ${labelClassName}`}>
          {data.label}
        </p>
        {data.subLabel && (
          <p className={`text-[13px] font-medium text-slate-400 ${subLabelClassName}`}>
            {data.subLabel}
          </p>
        )}
      </div>
    </div>
  );
};
