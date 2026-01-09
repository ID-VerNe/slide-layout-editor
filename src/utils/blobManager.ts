class BlobManager {
  private blobUrls: Map<string, string> = new Map();
  private refCounts: Map<string, number> = new Map();

  create(blob: Blob, key: string): string {
    const existingUrl = this.blobUrls.get(key);
    if (existingUrl) {
      const count = this.refCounts.get(key) || 0;
      this.refCounts.set(key, count + 1);
      return existingUrl;
    }

    const url = URL.createObjectURL(blob);
    this.blobUrls.set(key, url);
    this.refCounts.set(key, 1);
    return url;
  }

  release(key: string): void {
    const count = this.refCounts.get(key) || 0;
    if (count <= 1) {
      const url = this.blobUrls.get(key);
      if (url) {
        URL.revokeObjectURL(url);
        this.blobUrls.delete(key);
        this.refCounts.delete(key);
      }
    } else {
      this.refCounts.set(key, count - 1);
    }
  }

  clear(): void {
    this.blobUrls.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    this.blobUrls.clear();
    this.refCounts.clear();
  }

  get size(): number {
    return this.blobUrls.size;
  }
}

export const blobManager = new BlobManager();
