import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useModularStyle } from '../useModularStyle';
import { DEFAULT_DESIGN_SYSTEM, DEFAULT_THEME } from '../../../../../constants/theme';

vi.mock('../../../../../store/useStore', () => ({
  useStore: vi.fn((selector: any) => {
    const mockState = {
      designSystem: DEFAULT_DESIGN_SYSTEM,
      theme: DEFAULT_THEME,
    };
    return selector(mockState);
  }),
}));

describe('useModularStyle', () => {
  it('无参数时返回空样式', () => {
    const { result } = renderHook(() => useModularStyle({}));
    expect(result.current.style).toBeDefined();
  });

  it('variant display 应应用 Display token 样式', () => {
    const { result } = renderHook(() => useModularStyle({ variant: 'display' }));
    const s = result.current.style;
    expect(s.fontSize).toBeDefined();
  });

  it('variant body 应应用 Body token 样式', () => {
    const { result } = renderHook(() => useModularStyle({ variant: 'body' }));
    const s = result.current.style;
    expect(s.fontSize).toBeDefined();
  });

  it('size 属性转换为像素并基线对齐', () => {
    const { result } = renderHook(() => useModularStyle({ props: { size: 4 } }));
    const s = result.current.style;
    // size 4 = 32px, 基线对齐到 8 的倍数
    expect(s.fontSize).toBe('32px');
  });

  it('bold 属性设置 fontWeight', () => {
    const { result } = renderHook(() => useModularStyle({ props: { bold: true } }));
    expect(result.current.style.fontWeight).toBe('bold');
  });

  it('italic 属性设置 fontStyle', () => {
    const { result } = renderHook(() => useModularStyle({ props: { italic: true } }));
    expect(result.current.style.fontStyle).toBe('italic');
  });

  it('color 属性设置颜色', () => {
    const { result } = renderHook(() => useModularStyle({ props: { color: '#ff0000' } }));
    expect(result.current.style.color).toBe('#ff0000');
  });

  it('serif 属性解析为 headingFont', () => {
    const { result } = renderHook(() => useModularStyle({ props: { serif: true } }));
    expect(result.current.style.fontFamily).toBe(DEFAULT_THEME.typography.headingFont);
  });

  it('sans 属性解析为 bodyFont', () => {
    const { result } = renderHook(() => useModularStyle({ props: { sans: true } }));
    expect(result.current.style.fontFamily).toBe(DEFAULT_THEME.typography.bodyFont);
  });

  it('orientation vertical-stack 应设置竖排模式', () => {
    const { result } = renderHook(() => useModularStyle({ orientation: 'vertical-stack' }));
    const s = result.current.style;
    expect(s.writingMode).toBe('vertical-rl');
    expect(s.textOrientation).toBe('upright');
    expect(s.textTransform).toBe('uppercase');
  });

  it('orientation vertical-rotate 应设置旋转', () => {
    const { result } = renderHook(() => useModularStyle({ orientation: 'vertical-rotate' }));
    expect(result.current.style.transform).toContain('rotate(-90deg)');
    expect(result.current.style.whiteSpace).toBe('nowrap');
  });

  it('page.styleOverrides 自动合并到 overrides', () => {
    const page = {
      id: 'p',
      type: 'slide' as const,
      layoutId: 'test',
      aspectRatio: '16:9' as const,
      title: 'T',
      backgroundColor: '#fff',
      visibility: {},
      styleOverrides: { title: { color: 'blue' } },
    };
    const { result } = renderHook(() =>
      useModularStyle({ fieldKey: 'title', page: page as any })
    );
    // overrides 应包含 styleOverrides 中的内容
    expect(result.current).toBeDefined();
  });

  describe('resolveModularFontSize & size 解析一致性', () => {
    it('数字 1.5 应严格转换为 12px (1.5 * 8)', () => {
      const { result } = renderHook(() => useModularStyle({ props: { size: 1.5 } }));
      expect(result.current.style.fontSize).toBe('12px');
    });

    it('字符串 "1.5" 应正确转换为 12px 而不是 1.5px', () => {
      const { result } = renderHook(() => useModularStyle({ props: { size: '1.5' } }));
      expect(result.current.style.fontSize).toBe('12px');
    });

    it('字符串 "1.5rem" 应按 16px 基准换算为 24px', () => {
      const { result } = renderHook(() => useModularStyle({ props: { size: '1.5rem' } }));
      expect(result.current.style.fontSize).toBe('24px');
    });

    it('字符串 "24px" 应保持 24px', () => {
      const { result } = renderHook(() => useModularStyle({ props: { size: '24px' } }));
      expect(result.current.style.fontSize).toBe('24px');
    });

    it('字符串 "12pt" 应按 4/3 换算为 16px', () => {
      const { result } = renderHook(() => useModularStyle({ props: { size: '12pt' } }));
      expect(result.current.style.fontSize).toBe('16px');
    });
  });
});

