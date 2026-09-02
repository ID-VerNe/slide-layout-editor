import React from 'react';
import { PageData, VocabItem } from '../../../../types';
import { useStore } from '../../../../store/useStore';
import { useModularStyle } from '../hooks/useModularStyle';

interface ZineVocabListProps {
  page: PageData;
  fieldKey?: string;
  items?: VocabItem[];
  columns?: number;
  showExample?: boolean;
  size?: number; // 遵循 8px 基线倍数语义 (如 2.25 -> 18px, 1.5 -> 12px)
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

/**
 * ZineVocabList - 策展式双语生词原子组件
 * 全面集成 Design System Tokens 与 8px 基线网格：
 * - 根容器使用 useModularStyle 解析统一属性与 styleOverrides
 * - 词头、释义、例句均严格绑定 theme.typography 与 ds.tokens.colors
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
  ...otherProps
}) => {
  const ds = useStore((s) => s.designSystem);
  const theme = useStore((s) => s.theme);

  const { style: resolvedContainerStyle, className: resolvedClassName } = useModularStyle({
    page,
    fieldKey,
    props: {
      ...otherProps,
    },
    variant: 'body',
    customStyle,
    className: `zine-vocab-list ${className}`,
  });

  const isVisible = fieldKey ? page.visibility?.[fieldKey] !== false : true;
  if (!isVisible) return null;

  const rawItems: VocabItem[] = directItems || (page as any)[fieldKey] || page.vocabItems || [];
  if (!rawItems || rawItems.length === 0) return null;

  // 基于 8px 基线计算根基准字号 (例如 size=2.25 -> 18px)
  const basePx = typeof size === 'number' ? size * 8 : parseFloat(String(size)) * 8;
  const wordPx = Math.round(basePx * 1.25); // ~22px
  const meaningPx = Math.round(basePx * 0.95); // ~17px
  const phoneticPx = Math.round(basePx * 0.78); // ~14px
  const examplePx = Math.round(basePx * 0.85); // ~15px
  const exampleZHPx = Math.round(basePx * 0.78); // ~14px

  const gridColsClass =
    columns === 1
      ? 'grid-cols-1'
      : columns === 3
      ? 'grid-cols-3'
      : 'grid-cols-2';

  return (
    <div
      className={`grid ${gridColsClass} gap-x-12 gap-y-8 w-full ${resolvedClassName}`}
      style={{
        ...resolvedContainerStyle,
      }}
    >
      {rawItems.map((item, idx) => (
        <div
          key={item.id || idx}
          className="flex flex-col space-y-2 text-left group"
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

          {/* 2. 释义区：思源宋体 */}
          <div
            className="leading-relaxed font-normal"
            style={{
              fontSize: `${meaningPx}px`,
              color: ds.tokens.colors.primary || theme.colors.primary,
              fontFamily: theme.typography.headingFontZH || theme.typography.bodyFontZH,
            }}
          >
            {item.meaning}
          </div>

          {/* 3. 例句区（语境沉浸双语） */}
          {showExample && item.example && (
            <div
              className="border-l-2 pl-3 flex flex-col space-y-1 mt-1.5 pt-0.5"
              style={{
                borderColor: ds.tokens.colors.secondary ? `${ds.tokens.colors.secondary}40` : '#cbd5e1',
              }}
            >
              <p
                className="italic leading-relaxed opacity-85"
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
                  className="leading-relaxed opacity-75"
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
