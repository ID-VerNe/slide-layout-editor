import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AutoFitHeadline, { resetAutoFitCache } from '../AutoFitHeadline';
import React from 'react';

vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => setTimeout(() => cb(performance.now()), 0));
vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));

class MockWorker {
  onmessage: (e: any) => void = () => {};
  postMessage(data: any) {
    setTimeout(() => {
      this.onmessage({ data: { fontSize: 40 } });
    }, 0);
  }
  terminate() {}
}
vi.stubGlobal('Worker', MockWorker);

describe('AutoFitHeadline Edge Cases (Width Isolation & Opacity Safety)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetAutoFitCache();
  });

  it('does not render text at 0.01 opacity during calculation to prevent blank captures', () => {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 800 });
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, value: 50 });

    render(
      <AutoFitHeadline 
        text="Visibility Test" 
        maxSize={64} 
        lineHeight={1.2} 
        fontFamily="Inter" 
        maxLines={1} 
      />
    );

    const el = screen.getByText('Visibility Test');
    // 验证 opacity 不是 0.01 幽灵不可见状态
    expect(parseFloat(el.style.opacity)).toBeGreaterThanOrEqual(0.9);
  });

  it('isolates cache by container width so different viewports compute independent sizes', async () => {
    // 模拟宽视口 (1200px)
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 1200 });
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { 
      configurable: true, 
      get: function() {
        const fontSize = parseFloat(this.style.fontSize);
        return fontSize > 50 ? 200 : 30;
      }
    });

    const { unmount } = render(
      <AutoFitHeadline 
        text="Viewport Headline" 
        maxSize={80} 
        lineHeight={1.2} 
        fontFamily="Inter" 
        maxLines={1} 
      />
    );

    await waitFor(() => {
      const el = screen.getByText('Viewport Headline');
      expect(parseFloat(el.style.fontSize)).toBeLessThanOrEqual(50);
    });

    unmount();

    // 模拟窄视口 (300px)
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 300 });
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { 
      configurable: true, 
      get: function() {
        const fontSize = parseFloat(this.style.fontSize);
        // 窄视口需要更小字号才不溢出
        return fontSize > 24 ? 200 : 30;
      }
    });

    render(
      <AutoFitHeadline 
        text="Viewport Headline" 
        maxSize={80} 
        lineHeight={1.2} 
        fontFamily="Inter" 
        maxLines={1} 
      />
    );

    await waitFor(() => {
      const el = screen.getByText('Viewport Headline');
      // 窄视口不应该沿用宽视口的 50px 缓存，必须能进一步缩小到 24px 以下
      expect(parseFloat(el.style.fontSize)).toBeLessThanOrEqual(24);
    });
  });
});
