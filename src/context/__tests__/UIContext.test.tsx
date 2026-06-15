import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { UIProvider, useUI } from '../UIContext';

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  motion: { div: 'div', span: 'span' },
  spring: () => ({}),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => <UIProvider>{children}</UIProvider>;

describe('UIContext', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('未在 Provider 内调用 useUI 抛出错误', () => {
    expect(() => renderHook(() => useUI())).toThrow('useUI must be used within a UIProvider');
  });

  it('alert 打开后可关闭', async () => {
    const { result } = renderHook(() => useUI(), { wrapper });

    render(
      <UIProvider>
        <button onClick={() => result.current.alert('Test', 'hello')}>Open</button>
      </UIProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /open/i }));
    expect(await screen.findByRole('heading', { name: /test/i })).toBeInTheDocument();
    expect(screen.getByText('hello')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /test/i })).not.toBeInTheDocument();
    });
  });

  it('confirm 可调用 onConfirm', async () => {
    const cb = vi.fn();
    const { result } = renderHook(() => useUI(), { wrapper });

    render(
      <UIProvider>
        <button onClick={() => result.current.confirm('Sure?', 'remove it', cb)}>Open</button>
      </UIProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /open/i }));
    expect(await screen.findByRole('heading', { name: /sure/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    expect(cb).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /sure/i })).not.toBeInTheDocument();
    });
  });

  it('confirm 可取消', async () => {
    const cb = vi.fn();
    const { result } = renderHook(() => useUI(), { wrapper });

    render(
      <UIProvider>
        <button onClick={() => result.current.confirm('Sure?', 'remove it', cb)}>Open</button>
      </UIProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /open/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(cb).not.toHaveBeenCalled();
  });

  it('confirm 自定义按钮文字', async () => {
    const cb = vi.fn();
    const { result } = renderHook(() => useUI(), { wrapper });

    render(
      <UIProvider>
        <button onClick={() => result.current.confirm('Sure?', 'remove it', cb, { confirmText: 'Yes', cancelText: 'No' })}>Open</button>
      </UIProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /open/i }));
    expect(screen.getByRole('button', { name: /yes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /no/i })).toBeInTheDocument();
  });
});