import React from 'react';

/** Resolves 9-point docking and self alignment across CSS Grid and Flexbox layouts */
export function resolveDockingStyle(
  style: React.CSSProperties,
  overrides?: Record<string, any>
): React.CSSProperties {
  const finalStyle: React.CSSProperties = { ...style };
  
  const hasManualAlignment = Boolean(
    overrides && 
    (overrides.alignSelf !== undefined || overrides.justifySelf !== undefined)
  );

  // 判断是否为 CSS Grid 直接子节点（具有网格行列声明）
  const isGridItem = Boolean(
    finalStyle.gridColumnStart !== undefined ||
    finalStyle.gridColumnEnd !== undefined ||
    finalStyle.gridRowStart !== undefined ||
    finalStyle.gridRowEnd !== undefined
  );

  if (hasManualAlignment && overrides) {
    if (isGridItem) {
      // CSS Grid 规范：alignSelf 为垂直轴，justifySelf 为水平轴
      if (overrides.alignSelf !== undefined) {
        finalStyle.alignSelf = overrides.alignSelf;
      }
      if (overrides.justifySelf !== undefined) {
        finalStyle.justifySelf = overrides.justifySelf;
      }
      if (overrides.justifySelf && overrides.justifySelf !== 'stretch') {
        finalStyle.width = style.width || undefined;
      } else {
        finalStyle.width = style.width || '100%';
      }
    } else {
      // Flexbox column 规范：交叉轴为水平方向，主轴通过外边距控制
      if (overrides.justifySelf !== undefined) {
        const hVal = overrides.justifySelf;
        finalStyle.alignSelf = hVal === 'start' ? 'flex-start' : hVal === 'end' ? 'flex-end' : hVal;
      }

      if (overrides.alignSelf === 'start') {
        finalStyle.marginTop = '0';
        finalStyle.marginBottom = 'auto';
      } else if (overrides.alignSelf === 'end') {
        finalStyle.marginTop = 'auto';
        finalStyle.marginBottom = '0';
      } else if (overrides.alignSelf === 'center') {
        finalStyle.marginTop = 'auto';
        finalStyle.marginBottom = 'auto';
      }

      delete finalStyle.justifySelf;

      if (overrides.justifySelf && overrides.justifySelf !== 'stretch') {
        finalStyle.width = style.width || undefined;
      } else {
        finalStyle.width = style.width || '100%';
      }
    }
  } else {
    // 未设置 9 点对齐时默认铺满宽度，保证文本对齐可以完整居中或贴边
    finalStyle.width = style.width || '100%';
  }

  return finalStyle;
}
