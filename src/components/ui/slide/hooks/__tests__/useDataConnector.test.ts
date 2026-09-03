import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDataConnector } from '../useDataConnector';
import { PageData } from '../../../../../types';

const makePage = (overrides: Partial<PageData> = {}): PageData => ({
  id: 'test-page',
  type: 'slide',
  layoutId: 'test',
  aspectRatio: '16:9',
  title: 'Title',
  subtitle: 'Subtitle',
  backgroundColor: '#fff',
  visibility: {},
  ...overrides,
} as any);

describe('useDataConnector', () => {
  it('从 page 中提取指定字段内容', () => {
    const page = makePage({ title: 'My Title' });
    const { result } = renderHook(() => useDataConnector('title', page));
    expect(result.current.content).toBe('My Title');
  });

  it('字段不存在时 content 为 undefined', () => {
    const page = makePage();
    const { result } = renderHook(() => useDataConnector('nonexistent', page));
    expect(result.current.content).toBeUndefined();
  });

  it('提取 styleOverrides 中的覆盖样式', () => {
    const page = makePage({
      styleOverrides: { title: { fontSize: '24px', color: 'red' } },
    });
    const { result } = renderHook(() => useDataConnector('title', page));
    expect(result.current.overrides).toEqual({ fontSize: '24px', color: 'red' });
  });

  it('无 styleOverrides 时返回空对象', () => {
    const page = makePage();
    const { result } = renderHook(() => useDataConnector('title', page));
    expect(result.current.overrides).toEqual({});
  });

  it('visibility 为 true 时 isVisible 为 true', () => {
    const page = makePage({ visibility: { title: true } });
    const { result } = renderHook(() => useDataConnector('title', page));
    expect(result.current.isVisible).toBe(true);
  });

  it('visibility 为 false 时 isVisible 为 false', () => {
    const page = makePage({ visibility: { logo: false } });
    const { result } = renderHook(() => useDataConnector('logo', page));
    expect(result.current.isVisible).toBe(false);
  });

  it('visibility 未设置时默认 isVisible 为 true', () => {
    const page = makePage({ visibility: {} });
    const { result } = renderHook(() => useDataConnector('title', page));
    expect(result.current.isVisible).toBe(true);
  });
});
