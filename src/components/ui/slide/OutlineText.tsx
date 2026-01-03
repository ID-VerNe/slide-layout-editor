import React, { useRef, useEffect, useState } from 'react';

interface OutlineTextProps {
    text: string;
    strokeColor?: string;
    strokeWidth?: number;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: number | string;
    className?: string;
    textAlign?: 'left' | 'center' | 'right';
    lineHeight?: number;
    letterSpacing?: string;
}

/**
 * OutlineText - 使用 SVG 实现的空心文字组件
 * 完美兼容所有浏览器和导出场景
 */
export const OutlineText: React.FC<OutlineTextProps> = ({
    text,
    strokeColor = '#0F172A',
    strokeWidth = 2.5,
    fontSize = 120,
    fontFamily = 'Inter, sans-serif',
    fontWeight = 900,
    className = '',
    textAlign = 'right',
    lineHeight = 0.9,
    letterSpacing = '-0.05em',
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // 计算文字尺寸
    useEffect(() => {
        if (!containerRef.current || !text) return;

        // 创建临时 canvas 测量文字
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        const metrics = ctx.measureText(text.toUpperCase());

        // 估算高度（考虑行高）
        const height = fontSize * lineHeight;
        const width = metrics.width * 1.05; // 留出一点余量

        setDimensions({ width, height });
    }, [text, fontSize, fontFamily, fontWeight, lineHeight]);

    if (!text) return null;

    const displayText = text.toUpperCase();

    // 计算 x 位置基于对齐方式
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
            className={`inline-block ${className}`}
            style={{
                width: dimensions.width || 'auto',
                height: dimensions.height || 'auto',
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
                    y={dimensions.height * 0.85} // 基线调整
                    textAnchor={getTextAnchor()}
                    fill="transparent"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
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
