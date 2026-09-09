import React from 'react';
import { KnuthPlassText } from './ui/KnuthPlassText';

interface AutoFitHeadlineProps {
  text: string;
  maxSize: number;
  lineHeight: number;
  fontFamily: string;
  className?: string;
  maxLines: number;
  minSize?: number;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'div';
  style?: React.CSSProperties; 
  children?: React.ReactNode; 
}

/**
 * 字体大小自适应标题组件
 * 已全面升级为 Knuth-Plass 引擎，在 Worker 内利用排版惩罚值得出最佳字号。
 */
const AutoFitHeadline: React.FC<AutoFitHeadlineProps> = ({ 
  text, 
  maxSize, 
  lineHeight, 
  fontFamily, 
  className, 
  maxLines, 
  minSize = 8,
  as: Tag = 'h1',
  style = {}
}) => {
  return (
    <Tag className={className} style={{ margin: 0, padding: 0 }}>
      <KnuthPlassText
        text={text}
        fontFamily={fontFamily}
        maxSize={maxSize}
        minSize={minSize}
        lineHeight={lineHeight}
        maxLines={maxLines}
        align="center" // AutoFitHeadline is mostly used for centered display texts
        style={style}
      />
    </Tag>
  );
};

export const resetAutoFitCache = () => {
  // 仅供测试兼容
};

export default AutoFitHeadline;