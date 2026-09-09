import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useKnuthPlassLayout } from '../useKnuthPlassLayout';

// Mock Web Worker
class MockWorker {
  onmessage: (e: any) => void = () => {};
  postMessage(data: any) {
    // Simulate async worker response
    setTimeout(() => {
      this.onmessage({
        data: {
          id: data.id,
          fontSize: data.maxSize > 40 ? 40 : data.maxSize, // Mock resizing logic
          lines: [{ text: data.text, boxW: 100, ratio: 0, last: true }],
          success: true
        }
      });
    }, 10);
  }
  terminate() {}
}

describe('useKnuthPlassLayout', () => {
  beforeEach(() => {
    vi.stubGlobal('Worker', MockWorker);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('debounces input by 500ms before sending to worker', async () => {
    const { result, rerender } = renderHook((props) => useKnuthPlassLayout(props), {
      initialProps: {
        text: 'Initial Text',
        fontFamily: 'Inter',
        maxSize: 100,
        minSize: 10,
        lineHeight: 1.2,
        maxLines: 2,
        containerWidth: 500,
        align: 'justify' as const
      }
    });

    expect(result.current.isCalculating).toBe(true);
    expect(result.current.layout).toBeNull();

    // Rerender before 500ms to reset debounce
    setTimeout(() => {
      rerender({
        text: 'New Text',
        fontFamily: 'Inter',
        maxSize: 100,
        minSize: 10,
        lineHeight: 1.2,
        maxLines: 2,
        containerWidth: 500,
        align: 'justify' as const
      });
    }, 200);
    
    // Wait for the full flow to complete
    await waitFor(() => {
      expect(result.current.isCalculating).toBe(false);
      expect(result.current.layout).not.toBeNull();
      expect(result.current.layout?.fontSize).toBe(40);
      expect(result.current.layout?.lines[0].text).toBe('New Text');
    }, { timeout: 2000 });
  });
});
