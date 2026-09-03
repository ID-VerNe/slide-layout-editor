import React from 'react';
import { PageData, DesignSystem } from '../../types';
import { getTemplateById } from '../../templates/registry';
import { toRoman, toAlpha } from '../../utils/numberFormatters';
import { DotsCounter } from './DotsCounter';

interface GlobalFolioProps {
  page: PageData;
  pageIndex: number;
  totalPages: number;
  ds: DesignSystem;
  counterStyle: string;
}

/**
 * GlobalFolio - 全局 Folio 锁定层与页码渲染器
 */
export const GlobalFolio: React.FC<GlobalFolioProps> = ({
  page,
  pageIndex,
  ds,
  counterStyle,
}) => {
  const customCounterColor = page.counterColor || ds.tokens.colors.secondary;

  const alignment = page.folioAlignment || 'auto';
  const isRight = alignment === 'auto' ? page.layoutVariant === 'right' : alignment === 'right';

  // 当模板未注册或注册字段中包含 footer 时，允许渲染页脚文字
  const templateConfig = getTemplateById(page.layoutId);
  const hasFooterField = !templateConfig || templateConfig.fields?.some((f: any) => f.key === 'footer');

  const renderCounter = () => {
    const style = counterStyle || page.counterStyle || 'number';
    const current = pageIndex + 1;

    switch (style) {
      case 'alpha':
        return toAlpha(current);
      case 'roman':
        return toRoman(current);
      case 'dots':
        return <DotsCounter num={current} color={customCounterColor} />;
      default:
        return current.toString().padStart(2, '0');
    }
  };

  if (page.pageNumber === false) return null;

  // 使用 24x24 网格进行数学对齐：离开边框一个格子即 row: 23, col: 2 (左) 或 23 (右)
  return (
    <div className="absolute inset-0 grid grid-cols-24 grid-rows-24 z-50 pointer-events-none p-0">
      {/* 档案号/页脚文字 (FIG. XX) - 默认放置在页码对面 */}
      {page.footer && hasFooterField && (
        <div
          className={`text-[9px] font-black uppercase tracking-[0.3em] opacity-40 whitespace-pre-line flex items-end ${
            isRight ? 'text-left' : 'text-right'
          }`}
          style={{
            color: customCounterColor,
            gridRow: '23 / 24',
            gridColumn: isRight ? '2 / 8' : '18 / 24',
            justifyContent: isRight ? 'flex-start' : 'flex-end',
          }}
        >
          {page.footer}
        </div>
      )}

      {/* 页码显示 (Roman/Dots/Number) */}
      <div
        className="flex items-end"
        style={{
          color: customCounterColor,
          gridRow: '23 / 24',
          gridColumn: isRight ? '23 / 24' : '2 / 3',
          justifyContent: isRight ? 'flex-end' : 'flex-start',
        }}
      >
        <span
          className="font-black tracking-[0.3em]"
          style={{
            fontSize: '12px',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {renderCounter()}
        </span>
      </div>
    </div>
  );
};
