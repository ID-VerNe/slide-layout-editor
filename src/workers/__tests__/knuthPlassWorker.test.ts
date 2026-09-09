import { describe, it, expect, vi, beforeEach } from 'vitest';
// We need to test the worker logic, so we dynamically import it after mocking self
let postedMessages: any[] = [];

describe('knuthPlassWorker', () => {
  beforeEach(() => {
    postedMessages = [];
    
    // Mock Web Worker environment
    (global as any).self = {
      onmessage: null,
      postMessage: (msg: any) => postedMessages.push(msg)
    };
    
    // Mock OffscreenCanvas
    (global as any).OffscreenCanvas = class {
      constructor() {}
      getContext() {
        return {
          font: '',
          measureText: (txt: string) => ({ width: txt.length * 10 }) // Mock 10px per char
        };
      }
    };
  });

  it('calculates lines correctly and responds', async () => {
    // Import worker script (this assigns self.onmessage)
    await import('../knuthPlassWorker');

    // Trigger onmessage
    (global as any).self.onmessage({
      data: {
        id: 1,
        text: 'Hello World Knuth Plass',
        fontFamily: 'Inter',
        maxSize: 30,
        minSize: 10,
        lineHeight: 1.2,
        maxLines: 5,
        containerWidth: 200,
        align: 'justify'
      }
    });

    expect(postedMessages.length).toBe(1);
    const msg = postedMessages[0];
    
    expect(msg.id).toBe(1);
    expect(msg.success).toBe(true);
    expect(msg.lines.length).toBeGreaterThan(0);
    // Since we use 10px per char and width is 200, it should fit in a few lines
    expect(msg.lines[0].text).toBeDefined();
  });
});
