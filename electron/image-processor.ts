import sharp from 'sharp';
import { ImageVariant } from '../src/utils/imageUtils';

export async function processResponsiveImages(
  buffer: Buffer,
  formats: ('webp' | 'avif' | 'jpg' | 'png')[] = ['webp', 'jpg']
): Promise<ImageVariant[]> {
  const variants: ImageVariant[] = [];
  const sizes = [320, 640, 1280, 1920];

  for (const format of formats) {
    for (const size of sizes) {
      try {
        const resized = sharp(buffer)
          .resize(size, null, {
            fit: 'inside',
            withoutEnlargement: true
          });

        let compressed: Buffer;
        if (format === 'webp') {
          compressed = await resized.webp({ quality: 80 }).toBuffer();
        } else if (format === 'avif') {
          compressed = await resized.avif({ quality: 65 }).toBuffer();
        } else if (format === 'jpg' || format === 'jpeg') {
          compressed = await resized.jpeg({ quality: 85 }).toBuffer();
        } else {
          compressed = await resized.png({ quality: 90 }).toBuffer();
        }

        const metadata = await sharp(compressed).metadata();
        variants.push({
          url: `data:image/${format === 'jpg' ? 'jpeg' : format};base64,${compressed.toString('base64')}`,
          width: metadata.width || size,
          height: metadata.height || 0,
          format: format === 'jpg' ? 'jpg' : format
        });
      } catch (err) {
        console.error(`Failed to process image variant: ${size}px ${format}`, err);
      }
    }
  }

  return variants;
}
