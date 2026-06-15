import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, handleAsync, applyProdOverrides } from '../logger';

describe('Logger', () => {
  let debugSpy: ReturnType<typeof vi.spyOn>;
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('默认级别下 info 输出到 console.info', () => {
    logger.info('hello');
    expect(infoSpy).toHaveBeenCalled();
    expect(infoSpy.mock.calls[0][0]).toContain('hello');
  });

  it('默认级别下 warn 输出到 console.warn', () => {
    logger.warn('warning msg');
    expect(warnSpy).toHaveBeenCalled();
    expect(warnSpy.mock.calls[0][0]).toContain('warning msg');
  });

  it('默认级别下 error 输出到 console.error', () => {
    logger.error('err msg');
    expect(errorSpy).toHaveBeenCalled();
    expect(errorSpy.mock.calls[0][0]).toContain('err msg');
  });

  it('setLevel 后低于阈值的不输出', () => {
    // 设置为 WARN (2)，debug 和 info 不应输出
    logger.setLevel(2 as any);
    debugSpy.mockClear();
    infoSpy.mockClear();
    logger.debug('should not appear');
    logger.info('should not appear');
    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
    logger.warn('should appear');
    expect(warnSpy).toHaveBeenCalled();
  });

  it('ERROR 级别下 warn 不输出', () => {
    logger.setLevel(3 as any);
    warnSpy.mockClear();
    logger.warn('should not appear');
    expect(warnSpy).not.toHaveBeenCalled();
    logger.error('should appear');
    expect(errorSpy).toHaveBeenCalled();
  });

  it('DEBUG 级别下 debug 输出', () => {
    logger.setLevel(0 as any);
    debugSpy.mockClear();
    logger.debug('debug msg');
    expect(debugSpy).toHaveBeenCalled();
    expect(debugSpy.mock.calls[0][0]).toContain('debug msg');
  });

  it('额外参数传递到 console', () => {
    logger.info('msg', { detail: 42 });
    expect(infoSpy).toHaveBeenCalled();
    const args = infoSpy.mock.calls[0];
    expect(args[0]).toContain('msg');
    expect(args[1]).toEqual({ detail: 42 });
  });

  it('formatMessage 包含日志级别标记', () => {
    logger.warn('test-format');
    const formatStr = warnSpy.mock.calls[0][0] as string;
    expect(formatStr).toContain('[WARN]');
    expect(formatStr).toContain('test-format');
  });
});

describe('handleAsync', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('成功时返回 [data, null]', async () => {
    const [data, err] = await handleAsync(Promise.resolve(42), 'test');
    expect(data).toBe(42);
    expect(err).toBeNull();
  });

  it('失败时返回 [null, error]', async () => {
    const [data, err] = await handleAsync(Promise.reject(new Error('boom')), 'ctx');
    expect(data).toBeNull();
    expect(err).toBeInstanceOf(Error);
    expect(err!.message).toBe('boom');
  });

  it('非 Error 抛出值会被包装为 Error', async () => {
    const [data, err] = await handleAsync(Promise.reject('string error'), 'ctx');
    expect(data).toBeNull();
    expect(err).toBeInstanceOf(Error);
    expect(err!.message).toBe('string error');
  });
});

describe('applyProdOverrides', () => {
  let originalConsole: typeof console;

  beforeEach(() => {
    originalConsole = { ...console };
  });

  afterEach(() => {
    Object.assign(console, originalConsole);
  });

  it('console.log 被替换为无操作函数', () => {
    const logSpy = vi.fn();
    console.log = logSpy;

    applyProdOverrides();

    console.log('test message');
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('console.debug 被替换为无操作函数', () => {
    const debugSpy = vi.fn();
    console.debug = debugSpy;

    applyProdOverrides();

    console.debug('test message');
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it('console.info 被替换为无操作函数', () => {
    const infoSpy = vi.fn();
    console.info = infoSpy;

    applyProdOverrides();

    console.info('test message');
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it('console.warn 过滤 AutoSave 消息', () => {
    const warnSpy = vi.fn();
    console.warn = warnSpy;

    applyProdOverrides();

    console.warn('AutoSave: document saved');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('console.warn 过滤 Thumbnail 消息', () => {
    const warnSpy = vi.fn();
    console.warn = warnSpy;

    applyProdOverrides();

    console.warn('Thumbnail generated successfully');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('console.warn 放行非过滤消息', () => {
    const warnSpy = vi.fn();
    console.warn = warnSpy;

    applyProdOverrides();

    console.warn('Some other warning');
    expect(warnSpy).toHaveBeenCalledWith('Some other warning');
  });

  it('console.error 透传所有调用', () => {
    const errorSpy = vi.fn();
    console.error = errorSpy;

    applyProdOverrides();

    console.error('test error', { key: 42 });
    expect(errorSpy).toHaveBeenCalledWith('test error', { key: 42 });
  });
});
