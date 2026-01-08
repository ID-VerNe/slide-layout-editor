/**
 * SlideGrid Studio 全局日志系统
 */

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

class Logger {
  private level: LogLevel = LogLevel.INFO;

  constructor() {
    // 生产环境默认降低日志级别，开发环境显示所有
    if (import.meta.env.DEV) {
      this.level = LogLevel.DEBUG;
    }
  }

  setLevel(level: LogLevel) {
    this.level = level;
  }

  private formatMessage(level: string, message: string): string {
    return `[${new Date().toLocaleTimeString()}] [${level}] ${message}`;
  }

  debug(message: string, ...args: any[]) {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(this.formatMessage('DEBUG', message), ...args);
    }
  }

  info(message: string, ...args: any[]) {
    if (this.level <= LogLevel.INFO) {
      console.info(this.formatMessage('INFO', message), ...args);
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.level <= LogLevel.WARN) {
      console.warn(this.formatMessage('WARN', message), ...args);
    }
  }

  error(message: string, ...args: any[]) {
    if (this.level <= LogLevel.ERROR) {
      console.error(this.formatMessage('ERROR', message), ...args);
    }
  }
}

export const logger = new Logger();

/**
 * 统一异步错误处理工具
 */
export async function handleAsync<T>(
  promise: Promise<T>, 
  context: string
): Promise<[T | null, Error | null]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (err: any) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(`Error in ${context}:`, error);
    return [null, error];
  }
}
