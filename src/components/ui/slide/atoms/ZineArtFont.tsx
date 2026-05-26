import React, { useRef, useEffect, useState } from 'react';
import { useModularStyle } from '../hooks/useModularStyle';
import { PageData } from '../../../../types';

interface ZineArtFontProps {
    text: string;
    page?: PageData;
    fieldKey?: string;
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
    style?: React.CSSProperties;
    [key: string]: any;
}

/**
 * ZineArtFont - 高级艺术字组件
 * 支持实心/空心切换、SVG 渲染、网格对齐
 */
export const ZineArtFont: React.FC<ZineArtFontProps> = ({
    text,
    page,
    fieldKey,
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
    style: customStyle,
    ...otherProps
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const { style, className: resolvedClassName } = useModularStyle({
        page,
        fieldKey,
        props: { color, opacity, mixBlendMode, ...otherProps },
        customStyle,
        className: `zine-art-font ${className}`
    });

    // 计算文字尺寸
    useEffect(() => {
        if (!containerRef.current || !text) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resolvedFontSize = style.fontSize || `${fontSize}px`;
        const resolvedFontFamily = style.fontFamily || fontFamily;
        const resolvedFontWeight = style.fontWeight || fontWeight;

        ctx.font = `${resolvedFontWeight} ${resolvedFontSize} ${resolvedFontFamily}`;
        const metrics = ctx.measureText(text.toUpperCase());

        const height = parseFloat(resolvedFontSize as string) * (parseFloat(style.lineHeight as string) || lineHeight);
        const width = metrics.width * 1.05 + strokeWidth * 2;

        setDimensions({ width, height });
    }, [text, fontSize, fontFamily, fontWeight, lineHeight, strokeWidth, style]);

    if (!text) return null;

    const displayText = text.toUpperCase();

    const getTextAnchor = () => {
        const align = style.textAlign || textAlign;
        switch (align) {
            case 'left': return 'start';
            case 'center': return 'middle';
            case 'right': return 'end';
            default: return 'middle';
        }
    };

    const getX = () => {
        const align = style.textAlign || textAlign;
        switch (align) {
            case 'left': return strokeWidth;
            case 'center': return dimensions.width / 2;
            case 'right': return dimensions.width - strokeWidth;
            default: return dimensions.width / 2;
        }
    };

    const finalStyle: React.CSSProperties = {
        width: dimensions.width || 'auto',
        height: dimensions.height || 'auto',
        ...style,
    };

    return (
        <div
            ref={containerRef}
            className={resolvedClassName}
            style={finalStyle}
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
                    fill={mode === 'solid' ? (style.color as string || color) : 'transparent'}
                    stroke={style.color as string || strokeColor}
                    strokeWidth={mode === 'outline' ? strokeWidth : 0}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    style={{
                        fontFamily: style.fontFamily as string || fontFamily,
                        fontSize: style.fontSize || `${fontSize}px`,
                        fontWeight: style.fontWeight as any || fontWeight,
                        letterSpacing: style.letterSpacing as string || letterSpacing,
                        textTransform: 'uppercase',
                    }}
                >
                    {displayText}
                </text>
            </svg>
        </div>
    );
};

export default ZineArtFont;
