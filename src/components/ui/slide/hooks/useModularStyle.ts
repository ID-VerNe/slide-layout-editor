import { useMemo } from 'react';
import { useStore } from '../../../../store/useStore';
import { DesignSystem, ProjectTheme, PageData } from '../../../../types';

interface UseModularStyleProps {
  fieldKey?: string;
  overrides?: Record<string, any>;
  props?: Record<string, any>;
  variant?: 'display' | 'body' | 'caption';
  customStyle?: React.CSSProperties;
  className?: string;
  page?: PageData; // 传入 page 以自动获取 styleOverrides
}

/**
 * useModularStyle - 统一处理样式优先级与 Zine Mode 约束
 * 优先级：Page Overrides > Template Props > Design System Tokens > Theme Defaults
 */
export const useModularStyle = ({
  fieldKey,
  overrides: directOverrides = {},
  props = {},
  variant,
  customStyle = {},
  className = '',
  page
}: UseModularStyleProps) => {
  const ds = useStore(s => s.designSystem);
  const theme = useStore(s => s.theme);

  // 如果提供了 fieldKey 且有 page，自动提取 overrides
  const overrides = useMemo(() => {
    if (fieldKey && page?.styleOverrides?.[fieldKey]) {
      return { ...page.styleOverrides[fieldKey], ...directOverrides };
    }
    return directOverrides;
  }, [fieldKey, page?.styleOverrides, directOverrides]);

  const resolvedStyle = useMemo(() => {
    let finalStyle: React.CSSProperties = { ...customStyle };

    // 1. 获取 Variant 基础样式 (Design System Tokens)
    if (variant && ds?.tokens?.typography?.[variant]) {
      const token = ds.tokens.typography[variant];
      finalStyle.fontSize = token.fontSize;
      
      // Zine Mode 基线吸附逻辑 (强制执行)
      const fontSizePx = parseInt(token.fontSize);
      const rawLineHeight = fontSizePx * parseFloat(token.lineHeight);
      finalStyle.lineHeight = `${Math.ceil(rawLineHeight / 8) * 8}px`;
      
      finalStyle.letterSpacing = token.letterSpacing;
      finalStyle.fontWeight = token.fontWeight;
      finalStyle.textTransform = token.textTransform as any;
    }

    // 2. 合并 Props 传入的样式 (来自模板定义)
    const { color, weight, italic, ...otherProps } = props;
    if (color) finalStyle.color = color;
    if (weight) finalStyle.fontWeight = weight;
    if (italic) finalStyle.fontStyle = 'italic';
    Object.assign(finalStyle, otherProps.style || {});

    // 3. 合并 Page Overrides (编辑器覆盖)
    if (overrides) {
      if (overrides.color) finalStyle.color = overrides.color;
      if (overrides.fontSize) finalStyle.fontSize = typeof overrides.fontSize === 'number' ? `${overrides.fontSize}px` : overrides.fontSize;
      if (overrides.fontFamily) finalStyle.fontFamily = overrides.fontFamily;
      if (overrides.fontWeight) finalStyle.fontWeight = overrides.fontWeight;
      if (overrides.lineHeight) finalStyle.lineHeight = overrides.lineHeight;
      if (overrides.textAlign) finalStyle.textAlign = overrides.textAlign;
      if (overrides.fontStyle) finalStyle.fontStyle = overrides.fontStyle;
      if (overrides.letterSpacing) finalStyle.letterSpacing = overrides.letterSpacing;

      // 特殊处理 translateY -> transform
      if (overrides.translateY !== undefined) {
        const y = typeof overrides.translateY === 'number' ? `${overrides.translateY}px` : overrides.translateY;
        finalStyle.transform = finalStyle.transform 
          ? `${finalStyle.transform} translateY(${y})` 
          : `translateY(${y})`;
      }
    }

    // 4. 修复 Letter Spacing 导致的视觉偏移 (在居中对齐时尤为明显)
    // CSS 的 letter-spacing 会在最后一个字符后也添加间距，导致整体向右偏移。
    // 我们通过负的 margin-right 来抵消这个偏移。
    if (finalStyle.letterSpacing) {
      finalStyle.marginRight = `-${finalStyle.letterSpacing}`;
    }

    // 5. Zine Mode 约束 (强制执行)
    const ALLOWED_PROPS = [
      'gridColumnStart', 'gridColumnEnd', 'gridRowStart', 'gridRowEnd',
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
      'fontStyle'
    ];
    
    const filteredStyle: any = {};
    ALLOWED_PROPS.forEach(p => { 
      if ((finalStyle as any)[p] !== undefined) filteredStyle[p] = (finalStyle as any)[p]; 
    });
    finalStyle = filteredStyle;

    return finalStyle;
  }, [ds, theme, variant, overrides, props, customStyle]);

  const resolvedClassName = useMemo(() => {
    // Zine 审美过滤：剔除圆角、阴影、模糊、动画以及冲突的样式类
    const forbiddenPrefixes = ['rounded', 'shadow', 'blur', 'drop-shadow', 'animate-'];
    
    // 颜色类关键字
    const colorKeywords = [
      'white', 'black', 'slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 
      'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 
      'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose', 'zine-accent'
    ];

    // 字体/排版类关键字 (用于从 className 中剔除，防止覆盖 inline style)
    const fontKeywords = [
      'font-', 'italic', 'tracking-', 'leading-', 'text-[', 'uppercase', 'lowercase', 'capitalize'
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
