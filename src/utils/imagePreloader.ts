class ImagePreloader {
  private preloadQueue: Set<string> = new Set();
  private loadingPromises: Map<string, Promise<void>> = new Map();
  private maxConcurrentLoads = 3;
  private currentLoads = 0;

  preload(url: string, priority: 'high' | 'normal' | 'low' = 'normal'): Promise<void> {
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const load = () => {
        if (this.currentLoads >= this.maxConcurrentLoads) {
          setTimeout(load, 100);
          return;
        }

        this.currentLoads++;
        const img = new Image();
        
        // 仅对外部 https/http 链接启用 crossOrigin
        if (url.startsWith('http')) {
          img.crossOrigin = 'anonymous';
        }
        
        img.onload = () => {
          this.currentLoads--;
          resolve();
        };
        
        img.onerror = () => {
          this.currentLoads--;
          reject(new Error(`Failed to preload image: ${url}`));
        };
        
        img.src = url;
      };

      if (priority === 'high') {
        load();
      } else {
        setTimeout(load, 100);
      }
    });

    this.loadingPromises.set(url, promise);
    return promise;
  }

  preloadMultiple(urls: string[], priority: 'high' | 'normal' | 'low' = 'normal'): Promise<void[]> {
    return Promise.all(urls.filter(Boolean).map(url => this.preload(url, priority).catch(err => console.warn(err))));
  }

  clear(): void {
    this.loadingPromises.clear();
  }
}

export const imagePreloader = new ImagePreloader();
