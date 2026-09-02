import { DesignSystem } from '../../../types';

/** Resolves design token strings (e.g. "spacing.md" -> "16px") safely */
export function resolveTokenValue(val: any, ds: DesignSystem): string {
  if (typeof val === 'string' && val.startsWith('spacing.')) {
    const key = val.split('.')[1] as keyof typeof ds.tokens.spacing;
    return ds.tokens.spacing[key] || '0px';
  }
  return val;
}
