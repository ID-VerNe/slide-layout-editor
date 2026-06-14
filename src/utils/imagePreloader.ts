interface QueueItem {
  url: string;
  resolve: () => void;
  reject: (reason?: any) => void;
}

class ImagePreloader {
  private queue: QueueItem[] = [];
  private loadingPromises = new Map<string, Promise<void>>();
  private activeLoads = new Map<string, HTMLImageElement>();
  private maxConcurrentLoads = 3;
  private runningLoads = 0;
  private drainTimer: ReturnType<typeof setTimeout> | null = null;

  preload(url: string | undefined, priority: 'high' | 'normal' | 'low' = 'normal'): Promise<void> {
    if (!url) return Promise.resolve();

    const cached = this.loadingPromises.get(url);
    if (cached) return cached;

    const promise = new Promise<void>((resolve, reject) => {
      const item: QueueItem = { url, resolve, reject };
      if (priority === 'high') {
        this.queue.unshift(item);
      } else {
        this.queue.push(item);
      }
      this.scheduleDrain();
    });

    this.loadingPromises.set(url, promise);
    return promise;
  }

  preloadMultiple(urls: string[], priority: 'high' | 'normal' | 'low' = 'normal'): Promise<void[]> {
    return Promise.all(
      urls
        .filter(Boolean)
        .map(url => this.preload(url, priority).catch(err => console.warn('[ImagePreloader]', err)))
    );
  }

  /** 取消所有进行中的加载并清空队列 */
  clear(): void {
    if (this.drainTimer) {
      clearTimeout(this.drainTimer);
      this.drainTimer = null;
    }
    this.queue = [];
    this.activeLoads.forEach((img, url) => {
      // 取消未完成的图片请求
      img.src = '';
      img.onload = null;
      img.onerror = null;
      this.loadingPromises.delete(url);
    });
    this.activeLoads.clear();
  }

  /** 仅取消指定 URL 的加载，保留其他预加载任务 */
  clearUrls(urls: string[]): void {
    const urlSet = new Set(urls);
    this.queue = this.queue.filter(item => !urlSet.has(item.url));
    urlSet.forEach(url => {
      const img = this.activeLoads.get(url);
      if (img) {
        img.src = '';
        img.onload = null;
        img.onerror = null;
        this.activeLoads.delete(url);
      }
      this.loadingPromises.delete(url);
    });
  }

  private scheduleDrain(): void {
    if (this.drainTimer) return;
    this.drainTimer = setTimeout(() => {
      this.drainTimer = null;
      this.drain();
    }, 50);
  }

  private drain(): void {
    while (this.runningLoads < this.maxConcurrentLoads && this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) continue;
      this.startLoad(item);
    }

    if (this.queue.length > 0) {
      this.scheduleDrain();
    }
  }

  private startLoad(item: QueueItem): void {
    this.runningLoads++;

    const img = new Image();
    this.activeLoads.set(item.url, img);

    if (item.url.startsWith('http')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      this.finishLoad(item.url);
      item.resolve();
    };

    img.onerror = () => {
      this.finishLoad(item.url);
      this.loadingPromises.delete(item.url);
      item.reject(new Error(`Failed to preload image: ${item.url}`));
    };

    img.src = item.url;
  }

  private finishLoad(url: string): void {
    this.runningLoads = Math.max(0, this.runningLoads - 1);
    this.activeLoads.delete(url);
    // 成功加载后保留 promise，避免重复请求；失败时由 onerror 删除
  }
}

export const imagePreloader = new ImagePreloader();
