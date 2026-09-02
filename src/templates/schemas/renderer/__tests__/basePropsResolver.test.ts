import { describe, it, expect } from 'vitest';
import { resolveBaseProps } from '../basePropsResolver';
import { DEFAULT_DESIGN_SYSTEM } from '../../../../constants/theme';

describe('basePropsResolver', () => {
  const mockContext: any = {
    page: { title: 'Hello' },
    theme: {},
  };

  it('为 24 格网格节点强制注入物理隔离约束', () => {
    const node: any = {
      modular: {
        colStart: 1,
        colSpan: 5,
        rowStart: 1,
        rowSpan: 3,
        align: 'center',
        justify: 'start',
      },
    };

    const { style } = resolveBaseProps(node, mockContext, DEFAULT_DESIGN_SYSTEM);

    expect(style.gridColumnStart).toBe(1);
    expect(style.gridColumnEnd).toBe('span 5');
    expect(style.gridRowStart).toBe(1);
    expect(style.gridRowEnd).toBe('span 3');
    // 五重物理隔离约束
    expect(style.minWidth).toBe(0);
    expect(style.minHeight).toBe(0);
    expect(style.maxWidth).toBe('100%');
    expect(style.maxHeight).toBe('100%');
    expect(style.boxSizing).toBe('border-box');
    // 九点对齐
    expect(style.alignSelf).toBe('center');
    expect(style.justifySelf).toBe('start');
  });

  it('应用 layout preset', () => {
    const node: any = {
      presetKey: 'safe-area',
    };

    const { style } = resolveBaseProps(node, mockContext, DEFAULT_DESIGN_SYSTEM);
    expect(style.paddingLeft).toBe('24px');
    expect(style.paddingRight).toBe('24px');
  });

  it('注入 resolveZIndex', () => {
    const node: any = {
      zIndex: 'top',
    };
    const mockZIndexResolver = (val: string) => (val === 'top' ? 40 : 10);

    const { style } = resolveBaseProps(node, mockContext, DEFAULT_DESIGN_SYSTEM, mockZIndexResolver);
    expect(style.zIndex).toBe(40);
  });
});
