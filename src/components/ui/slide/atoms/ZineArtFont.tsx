import React, { useRef, useEffect, useState } from 'react';

interface ZineArtFontProps {
    text: string;
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
}

/**
 * ZineArtFont - 高级艺术字组件
 * 支持实心/空心切换、SVG 渲染、网格对齐
 */
export const ZineArtFont: React.FC<ZineArtFontProps> = ({
    text,
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
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // 计算文字尺寸
    useEffect(() => {
        if (!containerRef.current || !text) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        const metrics = ctx.measureText(text.toUpperCase());

        const height = fontSize * lineHeight;
        const width = metrics.width * 1.05 + strokeWidth * 2; 

        setDimensions({ width, height });
    }, [text, fontSize, fontFamily, fontWeight, lineHeight, strokeWidth]);

    if (!text) return null;

    const displayText = text.toUpperCase();

    const getTextAnchor = () => {
        switch (textAlign) {
            case 'left': return 'start';
            case 'center': return 'middle';
            case 'right': return 'end';
        }
    };

    const getX = () => {
        switch (textAlign) {
            case 'left': return strokeWidth;
            case 'center': return dimensions.width / 2;
            case 'right': return dimensions.width - strokeWidth;
        }
    };

    return (
        <div
            ref={containerRef}
            className={`zine-art-font inline-block ${className}`}
            style={{
                width: dimensions.width || 'auto',
                height: dimensions.height || 'auto',
                opacity,
                mixBlendMode,
            }}
        >
            <svg
                width={dimensions.width || 100}
                height={dimensions.height || fontSize}
                viewBox={`0 0 ${dimensions.width || 100} ${dimensions.height || fontSize}`}
                style={{ display: 'block', overflow: 'visible' }}
            >
                <text
                    x={getX()}
                    y={dimensions.height * 0.85}
                    textAnchor={getTextAnchor()}
                    fill={mode === 'solid' ? color : 'transparent'}
                    stroke={strokeColor}
                    strokeWidth={mode === 'outline' ? strokeWidth : 0}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    style={{
                        fontFamily,
                        fontSize: `${fontSize}px`,
                        fontWeight,
                        letterSpacing,
                        textTransform: 'uppercase',
                    }}
                >
                    {displayText}
                </text>
            </svg>
        </div>
    );
};
