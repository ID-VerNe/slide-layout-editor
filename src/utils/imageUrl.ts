/**
 * Deduplicated utilities for image URL detection and ID generation.
 */

/**
 * Check whether a string value represents an image URL.
 * Supports data URIs, http(s) URLs, common image file extensions, and asset:// protocol.
 */
export const isImageUrl = (value: string): boolean =>
  value.startsWith('data:image') ||
  value.includes('http') ||
  /\.(png|jpg|jpeg|webp|svg|gif|avif)(\?|$)/i.test(value) ||
  value.startsWith('asset://');

/**
 * Generate a unique ID string with a given prefix.
 * Format: `${prefix}-${timestamp}-${randomString}`
 */
export const generateId = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
