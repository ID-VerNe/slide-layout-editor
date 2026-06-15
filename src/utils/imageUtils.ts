import { nativeFs } from './native-fs';

export interface ImageVariant {
  url: string;
  width: number;
  height: number;
  format: 'webp' | 'avif' | 'jpg' | 'png' | 'jpeg';
}

export interface ResponsiveImageConfig {
  variants: ImageVariant[];
  defaultVariant: ImageVariant;
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

/**
 * 渲染进程调用的生成响应式图片的方法
 * 通过 IPC 调用主进程的 sharp 处理
 */
export async function generateResponsiveImages(
  assetUrlOrData: string | Buffer,
  formats: ('webp' | 'avif' | 'jpg' | 'png')[] = ['webp', 'jpg']
): Promise<ImageVariant[]> {
  if (!nativeFs.isElectron()) {
    console.warn('Responsive image processing is only available in Electron environment');
    return [];
  }

  let base64Data = '';
  if (typeof assetUrlOrData === 'string') {
    if (assetUrlOrData.startsWith('data:')) {
      base64Data = assetUrlOrData.split(',')[1];
    } else if (assetUrlOrData.startsWith('asset://')) {
      // 如果是 asset://，主进程可以直接读取文件
      return nativeFs.processResponsiveImages(assetUrlOrData, formats);
    }
  }

  return nativeFs.processResponsiveImages(base64Data || assetUrlOrData, formats);
}

export function generateSrcSet(variants: ImageVariant[]): string {
  return variants
    .map(v => `${v.url} ${v.width}w`)
    .join(', ');
}

export function generateSizes(config: ResponsiveImageConfig): string {
  return `
    (max-width: ${config.breakpoints.mobile}px) 100vw,
    (max-width: ${config.breakpoints.tablet}px) 50vw,
    33vw
  `.trim();
}
