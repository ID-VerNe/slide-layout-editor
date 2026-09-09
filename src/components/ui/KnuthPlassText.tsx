import React, { useLayoutEffect, useRef, useState } from 'react';
import { useKnuthPlassLayout } from '../../hooks/useKnuthPlassLayout';

interface KnuthPlassTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  
  // Font parameters
  fontFamily: string;
  maxSize: number;
  minSize?: number;
  lineHeight?: number;
  maxLines?: number;
  
  align?: 'left' | 'center' | 'right' | 'justify';
}

export const KnuthPlassText: React.FC<KnuthPlassTextProps> = ({
  text,
  className = '',
  style = {},
  fontFamily,
  maxSize,
  minSize = 8,
  lineHeight = 1.5,
  maxLines = 100,
  align = 'justify'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useLayoutEffect(() => {
    if (containerRef.current) {
      if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver((entries) => {
          for (let entry of entries) {
            if (entry.contentRect.width > 0) {
              setContainerWidth(entry.contentRect.width);
            }
          }
        });
        observer.observe(containerRef.current);
        setContainerWidth(containerRef.current.offsetWidth);
        return () => observer.disconnect();
      } else {
        // Fallback for JSDOM/SSR
        setContainerWidth(800);
      }
    }
  }, []);

  const { layout, isCalculating } = useKnuthPlassLayout({
    text,
    fontFamily,
    maxSize,
    minSize,
    lineHeight,
    maxLines,
    containerWidth,
    align
  });

  const finalSize = layout?.fontSize || maxSize;

  return (
    <div
      ref={containerRef}
      className={`zine-knuth-plass-text relative w-full ${className} ${isCalculating ? 'opacity-80 transition-opacity' : ''}`}
      style={{
        ...style,
        fontFamily,
        fontSize: `${finalSize}px`,
        lineHeight,
      }}
    >
      {layout && layout.lines.length > 0 ? (
        layout.lines.map((line, idx) => (
          <div
            key={idx}
            className="whitespace-pre flex"
            style={{
              justifyContent: 
                line.last && align === 'justify' ? 'flex-start' : 
                align === 'center' ? 'center' : 
                align === 'right' ? 'flex-end' : 
                align === 'justify' ? 'space-between' : 'flex-start',
              width: '100%'
            }}
          >
            {align === 'justify' && !line.last ? (
              // Justify mode uses word-spacing for standard glues, or flex space-between
              // Since tex-linebreak computed the exact ratio, we can inject exact word-spacing 
              // or just let flex space-between do the work if we split by space.
              <div 
                style={{ 
                  display: 'flex', 
                  width: '100%', 
                  justifyContent: 'space-between'
                }}
              >
                {line.text.split(' ').map((word, wIdx) => (
                  <span key={wIdx}>{word}</span>
                ))}
              </div>
            ) : (
              // Left/Right/Center or last line of Justify
              <span>{line.text}</span>
            )}
          </div>
        ))
      ) : (
        // Fallback or Initial state before calculation
        <div style={{ textAlign: align }}>{text}</div>
      )}
    </div>
  );
};
