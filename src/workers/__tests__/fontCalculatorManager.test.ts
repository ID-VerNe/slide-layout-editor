import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getFontCalculatorWorker,
  calculateFontSizeWithWorker,
  resetFontCalculatorWorker,
} from '../fontCalculatorManager';

class MockWorker {
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: ((e: Event) => void) | null = null;

  postMessage(data: { id?: number; maxSize: number }) {
    setTimeout(() => {
      if (this.onmessage) {
        // 回传带有对应 id 的计算结果
        this.onmessage({
          data: {
            id: data.id,
            fontSize: Math.min(data.maxSize, 24),
          },
        } as MessageEvent);
      }
    }, 10);
  }

  terminate() {
    this.onmessage = null;
    this.onerror = null;
  }
}

describe('fontCalculatorManager', () => {
  beforeEach(() => {
    resetFontCalculatorWorker();
    vi.stubGlobal('Worker', MockWorker);
  });

  afterEach(() => {
    resetFontCalculatorWorker();
    vi.unstubAllGlobals();
  });

  it('保证获取的是共享 Worker 单例', () => {
    const worker1 = getFontCalculatorWorker();
    const worker2 = getFontCalculatorWorker();
    expect(worker1).toBeDefined();
    expect(worker1).toBe(worker2);
  });

  it('支持多个组件并发请求并根据 id 正确匹配各自计算结果', async () => {
    const p1 = calculateFontSizeWithWorker({
      text: 'Title 1',
      maxSize: 48,
      lineHeight: 1.2,
      maxLines: 1,
      minSize: 12,
      containerWidth: 600,
    });

    const p2 = calculateFontSizeWithWorker({
      text: 'Title 2',
      maxSize: 32,
      lineHeight: 1.2,
      maxLines: 2,
      minSize: 10,
      containerWidth: 400,
    });

    const [res1, res2] = await Promise.all([p1, p2]);
    expect(res1).toBe(24);
    expect(res2).toBe(24);
  });

  it('在 Worker 不可用时回退返回 maxSize', async () => {
    vi.stubGlobal('Worker', undefined);
    resetFontCalculatorWorker();

    const size = await calculateFontSizeWithWorker({
      text: 'Fallback Text',
      maxSize: 50,
      lineHeight: 1.2,
      maxLines: 1,
      minSize: 10,
      containerWidth: 500,
    });

    expect(size).toBe(50);
  });
});
