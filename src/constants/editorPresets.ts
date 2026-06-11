/**
 * 编辑器约束预设
 * 提供字号、行高、字距的受控选项，确保设计一致性
 */

export const FONT_SIZE_PRESETS = [
  { value: 6, label: '6pt (Micro)' },
  { value: 7, label: '7pt (Caption)' },
  { value: 10, label: '10pt (Body)' },
  { value: 12, label: '12pt (Body+)' },
  { value: 14, label: '14pt (Lead)' },
  { value: 18, label: '18pt (Subhead)' },
  { value: 24, label: '24pt (H3)' },
  { value: 32, label: '32pt (H2)' },
  { value: 48, label: '48pt (H1)' },
  { value: 64, label: '64pt (Display)' },
  { value: 80, label: '80pt (Hero)' },
  { value: 120, label: '120pt (Art)' }
] as const;

export const LINE_HEIGHT_PRESETS = [
  { value: 1.0, label: '1.0 (Tight)' },
  { value: 1.1, label: '1.1 (Display)' },
  { value: 1.2, label: '1.2 (Compact)' },
  { value: 1.4, label: '1.4 (Normal)' },
  { value: 1.6, label: '1.6 (Relaxed)' },
  { value: 1.8, label: '1.8 (Loose)' },
  { value: 2.0, label: '2.0 (Double)' }
] as const;

export const LETTER_SPACING_PRESETS = [
  { value: -0.05, label: '-0.05em (Tight)' },
  { value: 0, label: '0 (Normal)' },
  { value: 0.05, label: '0.05em (Wide)' },
  { value: 0.1, label: '0.1em (Airy)' },
  { value: 0.15, label: '0.15em (Tracking)' },
  { value: 0.2, label: '0.2em (Caps)' },
  { value: 0.3, label: '0.3em (Display)' }
] as const;

// 类型推导
export type FontSizePreset = typeof FONT_SIZE_PRESETS[number]['value'];
export type LineHeightPreset = typeof LINE_HEIGHT_PRESETS[number]['value'];
export type LetterSpacingPreset = typeof LETTER_SPACING_PRESETS[number]['value'];
