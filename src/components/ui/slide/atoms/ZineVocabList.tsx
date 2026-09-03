import React from 'react';
import { PageData, VocabItem, DesignSystem, ProjectTheme, TypographySettings } from '../../../../types';
import { useStore } from '../../../../store/useStore';
import { useModularStyle } from '../hooks/useModularStyle';
import { resolveModularFontSize } from '../utils/typographyScale';
import { useDataConnector } from '../hooks/useDataConnector';

interface ZineVocabListProps {
  page: PageData;
  fieldKey?: string;
  items?: VocabItem[];
  columns?: number;
  showExample?: boolean;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
  designSystem?: DesignSystem;
  theme?: ProjectTheme;
  typography?: TypographySettings;
  [key: string]: any;
}

/**
 * ZineVocabList - 策展式双语生词原子组件
 * 严格遵从 24 格网格物理隔离与 Token 解析
 */
export const ZineVocabList: React.FC<ZineVocabListProps> = ({
  page,
  fieldKey = 'vocabItems',
  items: directItems,
  columns = 2,
  showExample = false,
  size = 2.25,
  className = '',
  style: customStyle,
  designSystem: propsDs,
  theme: propsTheme,
  typography: propsTypography,
  ...otherProps
}) => {
  const storeDs = useStore((s) => s.designSystem);
  const storeTheme = useStore((s) => s.theme);
  const ds = propsDs || storeDs;
  const theme = propsTheme || storeTheme;

  // 1. 统一提取数据连接与可见性状态
  const defaultFallback = directItems || (page as any)[fieldKey] || page.vocabItems || [];
  const { content: rawItems, isVisible } = useDataConnector<VocabItem[]>(fieldKey, page, defaultFallback);

  const { style: resolvedContainerStyle, className: resolvedClassName } = useModularStyle({
    page,
    fieldKey,
    props: otherProps,
    variant: 'body',
    customStyle,
    className: `zine-vocab-list ${className}`,
  });

  if (!isVisible || !rawItems || rawItems.length === 0) return null;

  // 2. 基于 8px 基线计算根基准字号并设置防溢出下限
  const basePx = resolveModularFontSize(size) || 18;
  const wordPx = Math.max(16, Math.round(basePx * 1.25));
  const meaningPx = Math.max(14, Math.round(basePx * 0.95));
  const phoneticPx = Math.max(12, Math.round(basePx * 0.78));
  const examplePx = Math.max(13, Math.round(basePx * 0.85));
  const exampleZHPx = Math.max(12, Math.round(basePx * 0.78));

  const gridColsClass =
    columns === 1
      ? 'grid-cols-1'
      : columns === 3
      ? 'grid-cols-3'
      : 'grid-cols-2';

  const finalContainerStyle: React.CSSProperties = {
    minWidth: 0,
    minHeight: 0,
    maxWidth: '100%',
    maxHeight: '100%',
    boxSizing: 'border-box',
    ...resolvedContainerStyle,
  };

  return (
    <div
      className={`grid ${gridColsClass} gap-x-12 gap-y-8 w-full ${resolvedClassName}`}
      style={finalContainerStyle}
    >
      {rawItems.map((item, idx) => (
        <div
          key={item.id || idx}
          className="flex flex-col space-y-2 text-left group min-w-0"
        >
          {/* 1. 词头区：大写宽字距单词 + 音标 + 斜体词性 */}
          <div className="flex items-baseline flex-wrap gap-x-2.5 gap-y-1">
            <span
              className="font-bold uppercase leading-tight tracking-[0.12em]"
              style={{
                fontSize: `${wordPx}px`,
                color: ds.tokens.colors.primary || theme.colors.primary,
                fontFamily: theme.typography.headingFont,
              }}
            >
              {item.word}
            </span>
            {item.phonetic && (
              <span
                className="font-mono opacity-60 tracking-normal"
                style={{
                  fontSize: `${phoneticPx}px`,
                  color: ds.tokens.colors.secondary || theme.colors.secondary,
                  fontFamily: theme.typography.captionFont,
                }}
              >
                /{item.phonetic.replace(/^\/+|\/+$/g, '')}/
              </span>
            )}
            {item.pos && (
              <span
                className="italic font-medium opacity-80"
                style={{
                  fontSize: `${phoneticPx}px`,
                  color: ds.tokens.colors.accent || theme.colors.accent,
                  fontFamily: theme.typography.headingFont,
                }}
              >
                {item.pos}
              </span>
            )}
          </div>

          {/* 2. 释义区 */}
          <div
            className="leading-relaxed font-normal break-words"
            style={{
              fontSize: `${meaningPx}px`,
              color: ds.tokens.colors.primary || theme.colors.primary,
              fontFamily: theme.typography.headingFontZH || theme.typography.bodyFontZH,
            }}
          >
            {item.meaning}
          </div>

          {/* 3. 例句区 */}
          {showExample && item.example && (
            <div
              className="border-l-2 pl-3 flex flex-col space-y-1 mt-1.5 pt-0.5"
              style={{
                borderColor: ds.tokens.colors.secondary ? `${ds.tokens.colors.secondary}40` : '#cbd5e1',
              }}
            >
              <p
                className="italic leading-relaxed opacity-85 break-words"
                style={{
                  fontSize: `${examplePx}px`,
                  color: ds.tokens.colors.secondary || theme.colors.secondary,
                  fontFamily: theme.typography.bodyFont,
                }}
              >
                &ldquo;{item.example}&rdquo;
              </p>
              {item.exampleZH && (
                <p
                  className="leading-relaxed opacity-75 break-words"
                  style={{
                    fontSize: `${exampleZHPx}px`,
                    color: ds.tokens.colors.secondary || theme.colors.secondary,
                    fontFamily: theme.typography.bodyFontZH,
                  }}
                >
                  {item.exampleZH}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ZineVocabList;
