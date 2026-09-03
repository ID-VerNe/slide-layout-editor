import { CustomFont } from '../types';

// 记录已成功载入 document.fonts 的字体族名，避免重复加载
const loadedFontFamilies = new Set<string>();

/** Registers a single custom font into document.fonts and falls back to a style tag */
export async function registerCustomFontInDOM(font: CustomFont): Promise<void> {
  if (!font.family || !font.dataUrl) return;
  if (typeof document === 'undefined' || !document.fonts) return;

  if (loadedFontFamilies.has(font.family)) return;

  // 校验 Data URL 前缀，防止非法内容（支持 asset:// 协议以配合 Electron 归档）
  const isDataUrlValid =
    font.dataUrl.startsWith('data:font/') ||
    font.dataUrl.startsWith('data:application/x-font-') ||
    font.dataUrl.startsWith('data:application/font-') ||
    font.dataUrl.startsWith('http://') ||
    font.dataUrl.startsWith('https://') ||
    font.dataUrl.startsWith('blob:') ||
    font.dataUrl.startsWith('asset://');

  if (!isDataUrlValid) {
    console.warn(`[fontLoader] Invalid font URL for "${font.name}" — skipping.`);
    return;
  }

  try {
    const fontFace = new FontFace(font.family, `url(${font.dataUrl})`);
    const loaded = await fontFace.load();
    document.fonts.add(loaded);
    loadedFontFamilies.add(font.family);
  } catch (e) {
    console.warn('[fontLoader] FontFace.load() failed, attempting style tag fallback', e);
    try {
      const styleId = `custom-font-${font.family.replace(/[^a-z0-9]/gi, '_')}`;
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          @font-face {
            font-family: ${JSON.stringify(font.family)};
            src: url(${JSON.stringify(font.dataUrl)});
            font-weight: normal;
            font-style: normal;
          }
        `;
        document.head.appendChild(style);
        loadedFontFamilies.add(font.family);
      }
    } catch (styleErr) {
      console.error('[fontLoader] Failed to inject font style fallback', styleErr);
    }
  }
}

/** Loads an array of custom fonts into document.fonts concurrently */
export async function loadCustomFontsIntoDOM(fonts: CustomFont[] = []): Promise<void> {
  if (!fonts || !Array.isArray(fonts) || fonts.length === 0) return;
  await Promise.allSettled(fonts.map(f => registerCustomFontInDOM(f)));
}

/** Removes a custom font from document.fonts and cleans up fallback style tags */
export function removeCustomFontFromDOM(family: string): void {
  if (!family || typeof document === 'undefined') return;

  loadedFontFamilies.delete(family);

  if (document.fonts) {
    try {
      const fonts = Array.from(document.fonts.values());
      const targets = fonts.filter(f => f.family === family);
      targets.forEach(target => {
        document.fonts.delete(target);
      });
    } catch (e) {
      console.warn('[fontLoader] Failed to delete font from document.fonts', e);
    }
  }

  const styleId = `custom-font-${family.replace(/[^a-z0-9]/gi, '_')}`;
  const el = document.getElementById(styleId);
  if (el) {
    el.remove();
  }
}
