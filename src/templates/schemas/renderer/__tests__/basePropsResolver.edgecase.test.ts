import { describe, it, expect } from 'vitest';
import { resolveBaseProps } from '../basePropsResolver';
import { DEFAULT_DESIGN_SYSTEM } from '../../../../constants/theme';

describe('basePropsResolver Edge Cases (Style Precedence & Whitelist)', () => {
  const mockContext: any = {
    page: { title: 'Test' },
    theme: {},
  };

  it('ensures node custom styles override presetStyle rather than being inverted', () => {
    const node: any = {
      presetKey: 'safe-area', // default safe-area sets paddingLeft: '24px'
      style: {
        paddingLeft: '10px',  // 自定义样式覆盖预设
        color: '#ff0000',
      },
    };

    const { style } = resolveBaseProps(node, mockContext, DEFAULT_DESIGN_SYSTEM);

    // 严防预设反向覆盖用户自定义样式
    expect(style.paddingLeft).toBe('10px');
    expect(style.paddingRight).toBe('24px'); // 未覆盖的预设属性仍然继承
    expect(style.color).toBe('#ff0000');
  });

  it('preserves expanded whitelisted properties like background gradient, textDecoration, and clipPath', () => {
    const node: any = {
      style: {
        background: 'linear-gradient(180deg, #000, #fff)',
        backgroundImage: 'url("https://test.com/bg.png")',
        textDecoration: 'underline',
        textDecorationLine: 'line-through',
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
    };

    const { style } = resolveBaseProps(node, mockContext, DEFAULT_DESIGN_SYSTEM);

    expect(style.background).toBe('linear-gradient(180deg, #000, #fff)');
    expect(style.backgroundImage).toBe('url("https://test.com/bg.png")');
    expect(style.textDecoration).toBe('underline');
    expect(style.textDecorationLine).toBe('line-through');
    expect(style.clipPath).toBe('polygon(0 0, 100% 0, 100% 100%, 0 100%)');
  });

  it('filters out non-whitelisted properties', () => {
    const node: any = {
      style: {
        cursor: 'not-allowed',
        filter: 'drop-shadow(0 0 10px red)',
      },
    };

    const { style } = resolveBaseProps(node, mockContext, DEFAULT_DESIGN_SYSTEM);

    expect(style.cursor).toBeUndefined();
    expect(style.filter).toBeUndefined();
  });
});
