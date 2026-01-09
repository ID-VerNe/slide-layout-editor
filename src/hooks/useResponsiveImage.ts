import { useState, useEffect } from 'react';
import { getAsset } from '../utils/db';
import { generateResponsiveImages, generateSrcSet, ImageVariant } from '../utils/imageUtils';

interface UseResponsiveImageOptions {
  priority?: boolean;
  sizes?: string;
}

interface ResponsiveImageResult {
  url: string | undefined;
  isLoading: boolean;
  srcSet: string;
  variants?: {
    webp?: { srcSet: string };
    avif?: { srcSet: string };
  };
}

export function useResponsiveImage(
  assetSource: string | undefined,
  options: UseResponsiveImageOptions = {}
): ResponsiveImageResult {
  const [url, setUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [variants, setVariants] = useState<{
    webp?: { srcSet: string };
    avif?: { srcSet: string };
  }>({});
  const [srcSet, setSrcSet] = useState('');

  useEffect(() => {
    if (!assetSource) {
      setUrl(undefined);
      setSrcSet('');
      setVariants({});
      return;
    }

    if (!assetSource.startsWith('asset://') && !assetSource.startsWith('data:')) {
      setUrl(assetSource);
      return;
    }

    let isMounted = true;

    async function load() {
      setIsLoading(true);
      try {
        const data = await getAsset(assetSource);
        if (data && isMounted) {
          setUrl(data);

          if (options.priority) {
            const imageVariants = await generateResponsiveImages(data);
            if (isMounted) {
              setSrcSet(generateSrcSet(imageVariants));
              setVariants({
                webp: { srcSet: generateSrcSet(imageVariants.filter(v => v.format === 'webp')) },
                avif: { srcSet: generateSrcSet(imageVariants.filter(v => v.format === 'avif')) }
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed to load asset for responsive image:", assetSource, err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [assetSource, options.priority]);

  return { url, isLoading, srcSet, variants };
}
