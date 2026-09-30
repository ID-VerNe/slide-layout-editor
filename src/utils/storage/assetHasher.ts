// Web Crypto 哈希与 Data URL 扩展名解析（纯函数，无 IO 副作用）

/**
 * 基于 base64 数据计算 SHA-256 摘要前 16 位作为资源 ID
 * Crypto API 不可用时降级为时间戳 + 随机数
 */
export async function hashDataUrl(dataUrl: string): Promise<string> {
  const base64Data = dataUrl.split(',')[1];
  if (!base64Data) return dataUrl;

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(base64Data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
  } catch {
    // 降级方案：使用时间戳 + 随机数
    console.warn('Crypto API not available, using fallback hash');
    return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

/**
 * 从 Data URL 的 MIME 前缀解析干净的文件扩展名
 * 兼容含参数的复杂 Data URL，未知类型回退 png
 */
export function extFromDataUrl(dataUrl: string): string {
  const mimeMatch = dataUrl.match(/^data:([^;,]+)/);
  const rawMime = mimeMatch ? mimeMatch[1].toLowerCase() : '';
  if (rawMime.includes('svg')) return 'svg';
  if (rawMime.includes('jpeg') || rawMime.includes('jpg')) return 'jpg';
  if (rawMime.includes('webp')) return 'webp';
  if (rawMime.includes('gif')) return 'gif';
  if (rawMime.includes('/')) return rawMime.split('/')[1] || 'png';
  return 'png';
}
