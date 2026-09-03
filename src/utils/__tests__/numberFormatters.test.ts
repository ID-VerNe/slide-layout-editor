import { describe, it, expect } from 'vitest';
import { toRoman, toAlpha } from '../numberFormatters';

describe('numberFormatters', () => {
  describe('toRoman', () => {
    it('handles non-positive numbers safely', () => {
      expect(toRoman(0)).toBe('0');
      expect(toRoman(-5)).toBe('-5');
    });

    it('converts common numbers to Roman numerals', () => {
      expect(toRoman(1)).toBe('I');
      expect(toRoman(4)).toBe('IV');
      expect(toRoman(9)).toBe('IX');
      expect(toRoman(14)).toBe('XIV');
      expect(toRoman(40)).toBe('XL');
      expect(toRoman(99)).toBe('XCIX');
      expect(toRoman(2026)).toBe('MMXXVI');
    });
  });

  describe('toAlpha', () => {
    it('converts numbers to Alpha strings', () => {
      expect(toAlpha(1)).toBe('A');
      expect(toAlpha(26)).toBe('Z');
      expect(toAlpha(27)).toBe('AA');
      expect(toAlpha(28)).toBe('AB');
    });

    it('handles non-positive numbers safely', () => {
      expect(toAlpha(0)).toBe('');
      expect(toAlpha(-1)).toBe('');
    });
  });
});
