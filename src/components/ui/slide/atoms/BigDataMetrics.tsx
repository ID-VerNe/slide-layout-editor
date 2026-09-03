import React from 'react';
import { MetricData, PageData, DesignSystem, ProjectTheme } from '../../../../types';

interface BigDataMetricsProps {
  metrics?: MetricData[];
  text?: MetricData[];
  page?: PageData;
  rows?: number;
  cols?: number;
  fillOrder?: 'bottom-right-to-top-left' | 'top-left-to-bottom-right';
  className?: string;
  gap?: string;
  style?: React.CSSProperties;
  designSystem?: DesignSystem;
  theme?: ProjectTheme;
}

/**
 * BigDataMetrics - 自定义网格布局的 Metrics 组件
 * 严格限制在分配的外框容器中排布，绝不外溢
 */
export const BigDataMetrics: React.FC<BigDataMetricsProps> = ({
  metrics: metricsProp,
  text: textProp,
  page,
  rows: rowsProp,
  cols: colsProp,
  fillOrder = 'bottom-right-to-top-left',
  className = '',
  gap = '1.5rem',
  style: customStyle,
  designSystem: propsDs,
  theme: propsTheme,
}) => {
  const metrics = metricsProp || textProp || page?.metrics || [];
  
  const config: any = page?.bigDataMetricsConfig || {};
  const rows = rowsProp ?? config.rows ?? 3;
  const cols = colsProp ?? config.cols ?? 2;
  
  const styles: any = page?.styleOverrides?.bigDataMetrics || {};
  const valueStyle = styles.value || {};
  const labelStyle = styles.label || {};
  const unitStyle = styles.unit || {};
  
  const valueFontSize = (valueStyle.size || 3.5) * 8;
  const labelFontSize = (labelStyle.size || 2.25) * 8;
  const unitFontSize = (unitStyle.size || 1.5) * 8;

  if (!Array.isArray(metrics) || metrics.length === 0) {
    return null;
  }

  const columnWidthPercent = 100 / cols;

  const containerStyle: React.CSSProperties = {
    minWidth: 0,
    minHeight: 0,
    maxWidth: '100%',
    maxHeight: '100%',
    boxSizing: 'border-box',
    gap,
    ...customStyle
  };

  return (
    <div
      className={`flex flex-col w-full h-full overflow-hidden ${className}`}
      style={containerStyle}
    >
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex}
          className="flex flex-1"
          style={{ gap }}
        >
          {Array.from({ length: cols }).map((_, colIndex) => {
            const reverseColIndex = cols - 1 - colIndex;
            const metricIndex = reverseColIndex * rows + (rows - 1 - rowIndex);
            const metric = metrics[metricIndex];
            
            return (
              <div
                key={colIndex}
                style={{
                  width: `${columnWidthPercent}%`,
                  flex: `0 0 ${columnWidthPercent}%`
                }}
              >
                {metric && (
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span 
                        className="font-black tracking-tight leading-none"
                        style={{
                          fontSize: `${valueFontSize}px`,
                          color: valueStyle.color || 'var(--zine-primary, #0F172A)'
                        }}
                      >
                        {metric.value}
                      </span>
                      {metric.unit && (
                        <span 
                          className="font-bold opacity-60"
                          style={{
                            fontSize: `${unitFontSize}px`,
                            color: unitStyle.color || 'var(--zine-secondary, #64748B)'
                          }}
                        >
                          {metric.unit}
                        </span>
                      )}
                    </div>
                    <p 
                      className="font-black uppercase tracking-widest leading-tight"
                      style={{
                        fontSize: `${labelFontSize}px`,
                        color: labelStyle.color || 'var(--zine-secondary, #64748B)'
                      }}
                    >
                      {metric.label}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default BigDataMetrics;
