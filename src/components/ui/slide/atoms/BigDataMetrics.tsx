import React from 'react';
import { MetricData, PageData } from '../../../../types';
import { ZineMetric } from './ZineMetric';

interface BigDataMetricsProps {
  metrics?: MetricData[];
  text?: MetricData[]; // 渲染引擎会通过 bind 注入这个属性
  page?: PageData;
  rows?: number;
  cols?: number;
  fillOrder?: 'bottom-right-to-top-left' | 'top-left-to-bottom-right';
  className?: string;
  gap?: string;
  style?: React.CSSProperties;
}

/**
 * BigDataMetrics - 自定义网格布局的 Metrics 组件
 * 支持自定义行列数和填充顺序
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
  style: customStyle
}) => {
  // 优先使用 metrics prop，如果没有则使用 text prop（渲染引擎注入）
  // 最后回退到直接从 page.metrics 读取
  const metrics = metricsProp || textProp || page?.metrics || [];
  
  // 从 page.bigDataMetricsConfig 读取行列配置，如果没有则使用 props 或默认值
  const config = page?.bigDataMetricsConfig || {};
  const rows = rowsProp ?? config.rows ?? 3;
  const cols = colsProp ?? config.cols ?? 2;
  
  // 从 styleOverrides 读取三个部分的独立样式
  const styles = page?.styleOverrides?.bigDataMetrics || {};
  const valueStyle = styles.value || {};
  const labelStyle = styles.label || {};
  const unitStyle = styles.unit || {};
  
  // 将 size 倍数转换为实际 fontSize（size * 8px）
  const valueFontSize = (valueStyle.size || 3.5) * 8;
  const labelFontSize = (labelStyle.size || 2.25) * 8;
  const unitFontSize = (unitStyle.size || 1.5) * 8;

  // 计算每个 metric 的列位置（从右到左填充）
  const getColumnIndex = (index: number) => {
    // 按列优先，从右到左
    const colIndex = cols - 1 - Math.floor(index / rows);
    return colIndex;
  };

  if (!Array.isArray(metrics) || metrics.length === 0) {
    return null;
  }

  // 计算每列的宽度百分比
  const columnWidthPercent = 100 / cols;

  return (
    <div
      className={`flex flex-col ${className}`}
      style={{
        gap,
        ...customStyle
      }}
    >
      {/* 按行分组 */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex}
          className="flex"
          style={{ gap }}
        >
          {/* 每行显示 cols 列 */}
          {Array.from({ length: cols }).map((_, colIndex) => {
            // 从右到左填充：右列优先
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
                          fontFamily: valueStyle.fontFamily || page?.bodyFont || "'Inter', sans-serif",
                          fontWeight: valueStyle.bold ? 'bold' : 'normal',
                          fontStyle: valueStyle.italic ? 'italic' : 'normal',
                          color: valueStyle.color || '#000000'
                        }}
                      >
                        {metric.value}
                      </span>
                      {metric.unit && (
                        <span 
                          className="font-bold opacity-60"
                          style={{ 
                            fontSize: `${unitFontSize}px`,
                            fontFamily: unitStyle.fontFamily || page?.bodyFont || "'Inter', sans-serif",
                            fontWeight: unitStyle.bold ? 'bold' : 'normal',
                            fontStyle: unitStyle.italic ? 'italic' : 'normal',
                            color: unitStyle.color || '#000000'
                          }}
                        >
                          {metric.unit}
                        </span>
                      )}
                    </div>
                    <p 
                      className="uppercase font-black tracking-widest opacity-50"
                      style={{ 
                        fontSize: `${labelFontSize}px`,
                        fontFamily: labelStyle.fontFamily || page?.bodyFont || "'Inter', sans-serif",
                        fontWeight: labelStyle.bold ? 'bold' : 'normal',
                        fontStyle: labelStyle.italic ? 'italic' : 'normal',
                        color: labelStyle.color || '#000000'
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
