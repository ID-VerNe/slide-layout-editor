/**
 * styleWhitelist - Zine Mode 工业级审美样式白名单与类名安全过滤器
 */

export const ALLOWED_CSS_PROPERTIES = [
  'gridColumnStart', 'gridColumnEnd', 'gridRowStart', 'gridRowEnd',
  'alignSelf', 'justifySelf',
  'display', 'flexDirection', 'alignItems', 'justifyContent', 'gap', 'flexWrap',
  'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
  'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
  'position', 'top', 'left', 'right', 'bottom', 'inset', 'zIndex',
  'opacity', 'mixBlendMode', 'transform', 'transition', 'transitionDuration',
  'width', 'height', 'maxWidth', 'maxHeight', 'minWidth', 'minHeight',
  'aspectRatio', 'overflow', 'backgroundColor', 'background', 'backgroundImage',
  'backgroundSize', 'backgroundPosition', 'backgroundRepeat',
  'borderColor', 'borderWidth',
  'borderTopWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderRightWidth',
  'borderStyle', 'textAlign', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight',
  'letterSpacing', 'textTransform', 'textDecoration', 'textDecorationLine',
  'color', 'verticalAlign', 'visibility',
  'fontStyle', 'borderRadius', 'writingMode', 'textOrientation', 'whiteSpace', 'transformOrigin',
  'objectFit', 'objectPosition', 'wordBreak', 'overflowWrap', 'boxSizing', 'clipPath'
] as const;

/** Filters out soft aesthetic utility classes (blur, shadow, bounce) */
export function filterZineClassName(className: any): string {
  if (!className || typeof className !== 'string') return '';

  const forbiddenPrefixes = [
    'shadow', 'blur', 'drop-shadow',
    'animate-bounce', 'animate-pulse', 'animate-wiggle'
  ];

  return className
    .split(' ')
    .filter(c => {
      const baseClass = c.replace('!', '');
      return !forbiddenPrefixes.some(p => baseClass === p || baseClass.startsWith(`${p}-`));
    })
    .join(' ');
}
