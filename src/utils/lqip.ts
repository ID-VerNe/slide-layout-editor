export async function generateLQIP(
  imageUrl: string,
  width: number = 20,
  height: number = 20,
  quality: number = 0.1
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // 仅对外部 https/http 链接启用 crossOrigin，本地协议 (asset:, data:, blob:) 不需要且可能导致失败
    if (imageUrl.startsWith('http')) {
      img.crossOrigin = 'anonymous';
    }
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        const lqip = canvas.toDataURL('image/jpeg', quality);
        resolve(lqip);
      } catch (err) {
        reject(err);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for LQIP generation'));
    };
    
    img.src = imageUrl;
  });
}

export function blurDataURL(dataUrl: string, _blurAmount: number = 10): string {
  // 实际上在 CSS 中使用 filter: blur() 效果更好
  return dataUrl;
}
