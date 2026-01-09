import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AutoFitHeadline from '../AutoFitHeadline';
import React from 'react';

// 模拟 requestAnimationFrame 立即执行以加快测试
vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => setTimeout(() => cb(performance.now()), 0));
vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));

// 模拟 Worker
class MockWorker {
  onmessage: (e: any) => void = () => {};
  postMessage(data: any) {
    // 模拟 Worker 快速返回一个初步值
    setTimeout(() => {
      this.onmessage({ data: { fontSize: 50 } });
    }, 0);
  }
  terminate() {}
}
vi.stubGlobal('Worker', MockWorker);

describe('AutoFitHeadline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // 模拟 DOM 属性
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { 
      configurable: true, 
      value: 500 
    });
    
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { 
      configurable: true, 
      get: function() {
        const fontSize = parseFloat(this.style.fontSize);
        // 模拟：字号大于 40px 就溢出（scrollHeight 100 > maxHeight）
        // 这里需要配合组件内的 maxHeight 计算逻辑：fontSize * lineHeight * maxLines
        return fontSize > 40 ? 100 : 20;
      }
    });
  });

  it('应该能根据容器高度调整字体大小并显示', async () => {
    render(
      <AutoFitHeadline 
        text="测试标题" 
        maxSize={100} 
        lineHeight={1.2} 
        fontFamily="Inter" 
        className="test" 
        maxLines={1} 
      />
    );

    // 等待直到字号稳定在 40px 以下，且透明度变为 1 (表示计算结束)
    await waitFor(() => {
      const el = screen.getByText('测试标题');
      const fontSize = parseFloat(el.style.fontSize);
      // 检查字号是否已经缩减到合理范围
      expect(fontSize).toBeLessThanOrEqual(40);
      expect(window.getComputedStyle(el).opacity).toBe('1');
    }, { timeout: 5000 });

    const el = screen.getByText('测试标题');
    expect(parseFloat(el.style.fontSize)).toBeLessThanOrEqual(40);
  });
});
