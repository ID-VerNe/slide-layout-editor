/**
 * Canvas 图像压缩
 * 读取 File 为 Data URL，绘制到 canvas 后输出 webp
 */
export async function compressImage(file: File, quality: number = 0.9): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Failed context');
        canvas.width = img.width; canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/webp', quality));
      };
      img.onerror = () => reject(new Error(`Failed to load image for compression: ${file.name}`));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(reader.error || new Error(`Failed to read file: ${file.name}`));
  });
}
