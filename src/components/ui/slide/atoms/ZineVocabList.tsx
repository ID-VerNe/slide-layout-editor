import React from 'react';
import { PageData, VocabItem } from '../../../../types';
import { useStore } from '../../../../store/useStore';

interface ZineVocabListProps {
  page: PageData;
  fieldKey?: string;
  items?: VocabItem[];
  columns?: number;
  showExample?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * ZineVocabList - 策展式双语生词原子组件
 * 采用艺术画廊作品标签（Gallery Caption）排版规范：
 * - 宽字距大写英文单词（All Caps Tracking）
 * - 斜体词性标注与音标
 * - 纤细宋体中文释义
 * - 语境双语例句（可选）
 */
export const ZineVocabList: React.FC<ZineVocabListProps> = ({
  page,
  fieldKey = 'vocabItems',
  items: directItems,
  columns = 2,
  showExample = false,
  className = '',
  style: customStyle,
}) => {
  const ds = useStore((s) => s.designSystem);
  const isVisible = fieldKey ? page.visibility?.[fieldKey] !== false : true;
  if (!isVisible) return null;

  const rawItems: VocabItem[] = directItems || (page as any)[fieldKey] || page.vocabItems || [];
  if (!rawItems || rawItems.length === 0) return null;

  const gridColsClass =
    columns === 1
      ? 'grid-cols-1'
      : columns === 3
      ? 'grid-cols-3'
      : 'grid-cols-2';

  return (
    <div
      className={`zine-vocab-list grid ${gridColsClass} gap-x-8 gap-y-6 w-full ${className}`}
      style={{
        ...customStyle,
      }}
    >
      {rawItems.map((item, idx) => (
        <div key={item.id || idx} className="flex flex-col space-y-1 text-left group">
          {/* 1. 词头区：大写宽字距单词 + 音标 + 斜体词性 */}
          <div className="flex items-baseline flex-wrap gap-x-2">
            <span
              className="font-serif font-bold text-sm tracking-[0.2em] uppercase"
              style={{
                color: ds.tokens.colors.primary,
                fontFamily: "'Playfair Display', 'Lora', serif",
              }}
            >
              {item.word}
            </span>
            {item.phonetic && (
              <span
                className="text-[10px] opacity-40 font-mono tracking-normal"
                style={{ color: ds.tokens.colors.secondary }}
              >
                /{item.phonetic}/
              </span>
            )}
            {item.pos && (
              <span
                className="text-[10px] italic font-serif opacity-60"
                style={{ color: ds.tokens.colors.accent }}
              >
                {item.pos}
              </span>
            )}
          </div>

          {/* 2. 释义区：微型思源宋体 */}
          <div
            className="text-[12px] leading-snug opacity-80"
            style={{
              color: ds.tokens.colors.secondary,
              fontFamily: "'Noto Serif SC', 'STFangsong', serif",
            }}
          >
            {item.meaning}
          </div>

          {/* 3. 例句区（可选） */}
          {showExample && item.example && (
            <div className="mt-1 pt-1 border-t border-slate-200/30 flex flex-col space-y-0.5">
              <p
                className="text-[10px] italic opacity-60 leading-tight"
                style={{ color: ds.tokens.colors.secondary }}
              >
                &ldquo;{item.example}&rdquo;
              </p>
              {item.exampleZH && (
                <p
                  className="text-[9px] opacity-50 leading-tight"
                  style={{
                    color: ds.tokens.colors.secondary,
                    fontFamily: "'Noto Serif SC', 'STFangsong', serif",
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
