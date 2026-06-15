import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, handleAsync } from '../logger';

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
