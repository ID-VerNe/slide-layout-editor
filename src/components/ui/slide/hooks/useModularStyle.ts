import { useMemo } from 'react';
import { DesignSystem, PageData, ProjectTheme } from '../../../../types';
import { TypographyToken } from '../../../../types/tokens';

interface UseModularStyleProps {
  // 由调用方从 props 透传,不再自行订阅 store;componentRenderer 始终注入
  designSystem: DesignSystem;
  theme: ProjectTheme;
  fieldKey?: string;
  overrides?: Record<string, unknown>;
  props?: Record<string, unknown>;
  variant?: 'display' | 'body' | 'caption' | 'h1' | 'h2';
  orientation?: 'horizontal' | 'vertical-stack' | 'vertical-rotate';
  customStyle?: React.CSSProperties;
  className?: string;
  page?: PageData;
}

import { resolveModularFontSize, resolveModularLineHeight } from '../utils/typographyScale';
import { resolveDockingStyle } from '../utils/dockingResolver';

export { resolveModularFontSize, resolveModularLineHeight, resolveDockingStyle };

const EMPTY_OBJECT = Object.freeze({});

/**
 * 统一处理样式优先级与排版规范约束
 */
export const useModularStyle = ({
  designSystem: ds,
  theme,
  fieldKey,
  overrides: directOverrides = EMPTY_OBJECT,
  props = EMPTY_OBJECT,
  variant,
  orientation = 'horizontal',
  customStyle = EMPTY_OBJECT,
  className = '',
  page
}: UseModularStyleProps) => {

  // 如果提供了 fieldKey 且有 page，自动提取 overrides
  // styleOverrides 条目是 CSS 键值容器,窄化为可索引的 record 后与 directOverrides 合并
  const overrides = useMemo(() => {
    if (fieldKey && page?.styleOverrides?.[fieldKey]) {
      const src = page.styleOverrides[fieldKey] as Record<string, unknown>;
      return { ...src, ...directOverrides };
    }
    return directOverrides;
  }, [fieldKey, page?.styleOverrides, directOverrides]);

  const resolvedStyle = useMemo(() => {
    let finalStyle: React.CSSProperties = { ...customStyle };

    // 1. 获取基础排版样式
    const variantKey = (variant === 'h1' || variant === 'h2') ? 'display' : variant;
    if (variantKey && ds?.tokens?.typography?.[variantKey as 'body' | 'caption' | 'display']) {
      const token: TypographyToken = ds.tokens.typography[variantKey as 'body' | 'caption' | 'display'];
      finalStyle.fontSize = token.fontSize;

      // 基线吸附逻辑
      if (token.lineHeight && !isNaN(Number(token.lineHeight))) {
        const fontSizeVal = parseFloat(token.fontSize);
        const unit = token.fontSize.includes('pt') ? 'pt' : 'px';
        const rawLineHeight = fontSizeVal * parseFloat(token.lineHeight);

        if (unit === 'px' && variant !== 'body') {
          finalStyle.lineHeight = `${Math.ceil(rawLineHeight / 8) * 8}px`;
        } else {
          finalStyle.lineHeight = `${rawLineHeight}${unit}`;
        }
      } else {
        finalStyle.lineHeight = token.lineHeight;
      }

      finalStyle.letterSpacing = token.letterSpacing;
      finalStyle.fontWeight = token.fontWeight as React.CSSProperties['fontWeight'];
      if (token.textTransform) finalStyle.textTransform = token.textTransform as React.CSSProperties['textTransform'];
      if (token.fontStyle) finalStyle.fontStyle = token.fontStyle as React.CSSProperties['fontStyle'];
    }

    // 2. 处理排版方向逻辑
    if (orientation === 'vertical-stack') {
      finalStyle.writingMode = 'vertical-rl';
      finalStyle.textOrientation = 'upright';
      finalStyle.textTransform = 'uppercase';
      
      const specTracking = variant === 'display' ? '0.2em' : '0.2em'; 
      finalStyle.letterSpacing = specTracking;
      finalStyle.lineHeight = '1';
    } else if (orientation === 'vertical-rotate') {
      finalStyle.transform = finalStyle.transform 
        ? `${finalStyle.transform} rotate(-90deg)` 
        : 'rotate(-90deg)';
      finalStyle.whiteSpace = 'nowrap';
      finalStyle.transformOrigin = 'center';
    }

    // 3. 处理语义化排版属性
    const finalProps = { ...props, ...overrides };
    const {
      size, serif, sans, caption, zh, align, textAlign, bold, italic, leading, tracking,
      color, weight, ...otherProps
    } = finalProps;

    // A. 字号与行高
    // size/leading 来自未知形状的 props 合并,统一经 Number 窄化后参与算术
    const fontSizePx = resolveModularFontSize(size as string | number | undefined);
    if (fontSizePx !== undefined) {
      finalStyle.fontSize = `${fontSizePx}px`;

      // 如果手动指定了 size，默认行高也按 8px 基线自动对齐
      const baseLeading = leading !== undefined ? Number(leading) : 1.2;
      finalStyle.lineHeight = `${Math.ceil((fontSizePx * baseLeading) / 8) * 8}px`;
    } else if (leading !== undefined) {
      // 仅指定了行高倍数
      const currentFontSize = parseFloat((finalStyle.fontSize as string) || '16');
      finalStyle.lineHeight = `${Math.ceil((currentFontSize * Number(leading)) / 8) * 8}px`;
    }

    // B. 字体族解析
    // 优先级：overrides.fontFamily > props.fontFamily > serif/sans/caption semantic props > variant / fieldKey Design Token
    const isZH = zh || props.lang === 'zh';
    
    if (overrides.fontFamily) {
      finalStyle.fontFamily = overrides.fontFamily as React.CSSProperties['fontFamily'];
    } else if (props.fontFamily) {
      finalStyle.fontFamily = props.fontFamily as React.CSSProperties['fontFamily'];
    } else if (serif) {
      finalStyle.fontFamily = isZH ? theme.typography.headingFontZH : theme.typography.headingFont;
    } else if (sans) {
      finalStyle.fontFamily = isZH ? theme.typography.bodyFontZH : theme.typography.bodyFont;
    } else if (caption) {
      finalStyle.fontFamily = theme.typography.captionFont;
    } else {
      // 自动吸附 Design Token 规范：意图与表现绑定
      const lk = fieldKey ? fieldKey.toLowerCase() : '';
      const isHeading = variant === 'display' || variant === 'h1' || variant === 'h2' || 
                        lk === 'title' || lk === 'heading';
      const isCaption = variant === 'caption' || lk.includes('caption') || lk.includes('meta') || 
                        lk.includes('badge') || lk === 'footer';
      const isChineseSpecial = lk.includes('zh') || isZH;

      if (isHeading) {
        finalStyle.fontFamily = page?.titleFont || (isZH ? theme.typography.headingFontZH : theme.typography.headingFont);
      } else if (isCaption) {
        finalStyle.fontFamily = theme.typography.captionFont || theme.typography.bodyFont;
      } else if (isChineseSpecial) {
        finalStyle.fontFamily = theme.typography.bodyFontZH || theme.typography.bodyFont;
      } else {
        finalStyle.fontFamily = page?.bodyFont || (isZH ? theme.typography.bodyFontZH : theme.typography.bodyFont);
      }
    }

    // C. 核心视觉属性
    // align/textAlign/tracking/color/weight 来自合并后的未知形状 props,按 CSS 属性类型窄化后赋值
    const resolvedAlign = (overrides.align || overrides.textAlign || align || textAlign) as React.CSSProperties['textAlign'] | undefined;
    if (resolvedAlign) finalStyle.textAlign = resolvedAlign;
    if (bold) finalStyle.fontWeight = 'bold';
    if (italic) finalStyle.fontStyle = 'italic';
    if (tracking !== undefined) finalStyle.letterSpacing = typeof tracking === 'number' ? `${tracking}em` : (tracking as string);
    if (color) finalStyle.color = color as React.CSSProperties['color'];
    if (weight) finalStyle.fontWeight = weight as React.CSSProperties['fontWeight'];

    // 4. 合并直接 CSS Overrides (从 overrides 或 otherProps.style)
    // 优先级：overrides (直传 CSS) > otherProps.style
    const directCssStyles = { ...((otherProps.style as Record<string, unknown>) || {}), ...overrides } as Record<string, unknown>;

    Object.keys(directCssStyles).forEach(key => {
      // 排除掉已经处理过的语义化属性和特殊属性
      // 同时排除对应的目标 CSS 属性，防止旧的 Overrides (如 fontSize) 覆盖新的语义化逻辑 (如 size)
      const semanticKeys = [
        'size', 'serif', 'sans', 'caption', 'zh', 'align', 'bold', 'italic', 'leading', 'tracking', 'color', 'weight', 'lang', 'translateY',
        'fontSize', 'fontFamily', 'fontWeight', 'fontStyle', 'letterSpacing', 'lineHeight', 'textAlign'
      ];
      if (semanticKeys.includes(key)) return;

      let val = directCssStyles[key];
      // 自动补齐像素单位
      if (['fontSize', 'width', 'height', 'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'top', 'left', 'right', 'bottom', 'borderRadius'].includes(key)) {
        if (typeof val === 'number') val = `${val}px`;
      }
      (finalStyle as Record<string, unknown>)[key] = val;
    });

    // 特殊处理 translateY -> transform
    if (overrides.translateY !== undefined) {
      const y = typeof overrides.translateY === 'number' ? `${overrides.translateY}px` : overrides.translateY;
      finalStyle.transform = finalStyle.transform 
        ? `${finalStyle.transform} translateY(${y})` 
        : `translateY(${y})`;
    }

    // 5. 修复 Letter Spacing 导致的视觉偏移 (在居中对齐时尤为明显)
    // CSS 的 letter-spacing 会在最后一个字符后也添加间距，导致整体向右偏移。
    // 我们通过负的 margin-right 来抵消这个偏移。
    if (finalStyle.letterSpacing) {
      finalStyle.marginRight = `-${finalStyle.letterSpacing}`;
    }

    // 6. Zine Mode 约束 (强制执行)
    const ALLOWED_PROPS = [
      'gridColumnStart', 'gridColumnEnd', 'gridRowStart', 'gridRowEnd',
      'alignSelf', 'justifySelf',
      'display', 'flexDirection', 'alignItems', 'justifyContent', 'gap', 'flexWrap',
      'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 
      'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
      'position', 'top', 'left', 'right', 'bottom', 'inset', 'zIndex', 
      'opacity', 'mixBlendMode', 'transform', 'transition', 'transitionDuration',
      'width', 'height', 'maxWidth', 'maxHeight', 'minWidth', 'minHeight',
      'aspectRatio', 'overflow', 'backgroundColor', 'borderColor', 'borderWidth',
      'borderTopWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderRightWidth',
      'borderStyle', 'textAlign', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight',
      'letterSpacing', 'textTransform', 'color', 'verticalAlign', 'visibility',
      'fontStyle', 'borderRadius', 'writingMode', 'textOrientation', 'whiteSpace', 'transformOrigin',
      'objectFit', 'objectPosition', 'wordBreak', 'overflowWrap'
    ];
    
    const filteredStyle: Record<string, unknown> = {};
    const finalRecord = finalStyle as Record<string, unknown>;
    ALLOWED_PROPS.forEach(p => {
      if (finalRecord[p] !== undefined) filteredStyle[p] = finalRecord[p];
    });
    finalStyle = filteredStyle as React.CSSProperties;

    return finalStyle;
  }, [ds, theme, variant, overrides, props, customStyle]);

  const resolvedClassName = useMemo(() => {
    // Zine 审美过滤：剔除阴影、模糊、动画以及冲突的样式类 (保留 rounded 以支持圆角)
    const forbiddenPrefixes = ['shadow', 'blur', 'drop-shadow', 'animate-'];
    
    // 颜色类关键字
    const colorKeywords = [
      'white', 'black', 'slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 
      'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 
      'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose', 'zine-accent'
    ];

    return className
      .split(' ')
      .filter(c => {
        const baseClass = c.replace('!', '');
        
        // 1. 基础 Zine 禁用类
        if (forbiddenPrefixes.some(p => baseClass === p || baseClass.startsWith(`${p}-`))) return false;

        // 2. 颜色冲突处理
        if (baseClass.startsWith('text-')) {
          const colorPart = baseClass.split('-')[1];
          if (colorKeywords.includes(colorPart)) return false;
        }

        // 3. 字体与排版冲突处理 (仅当有明确的 overrides 时才剔除，防止破坏模板的基础排版)
        if (overrides) {
          if (baseClass === 'italic' && overrides.fontStyle) return false;
          if (baseClass.startsWith('font-') && overrides.fontWeight) return false;
          if (baseClass.startsWith('tracking-') && overrides.letterSpacing) return false;
          if (baseClass.startsWith('leading-') && overrides.lineHeight) return false;
          if (baseClass.startsWith('text-[') && overrides.fontSize) return false;
          
          // 自动转换常用 Tailwind 缩写
          if ((baseClass === 'uppercase' || baseClass === 'lowercase' || baseClass === 'capitalize') && overrides.textTransform) return false;
        }

        return true;
      })
      .join(' ');
  }, [className, overrides]);

  return { style: resolvedStyle, className: resolvedClassName };
};
