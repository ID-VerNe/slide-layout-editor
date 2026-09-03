import { toPng } from 'html-to-image';
import { nativeFs } from './native-fs';

export interface ThumbnailCaptureOptions {
  pixelRatio?: number;
  quality?: number;
  skipFonts?: boolean;
  cacheBust?: boolean;
}

/**
 * 统一缩略图截取服务：优先使用 Electron 原生截图，回退到 html-to-image
 */
export async function capturePageThumbnail(
  containerEl: HTMLElement | null,
  projectId: string,
  options: ThumbnailCaptureOptions = {}
): Promise<string | null> {
  if (!containerEl) return null;

  const targetEl = containerEl.classList.contains('magazine-page')
    ? containerEl
    : (containerEl.querySelector('.magazine-page') as HTMLElement | null);

  if (!targetEl) return null;

  try {
    if (nativeFs.isElectron()) {
      const rect = targetEl.getBoundingClientRect();
      return await nativeFs.captureThumbnail(projectId, {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      });
    }

    const {
      pixelRatio = 0.2,
      quality = 0.5,
      skipFonts = true,
      cacheBust = true,
    } = options;

    return await toPng(targetEl, {
      pixelRatio,
      quality,
      skipFonts,
      cacheBust,
    });
  } catch (error) {
    console.warn('[ThumbnailCapture] Failed to capture thumbnail:', error);
    return null;
  }
}
