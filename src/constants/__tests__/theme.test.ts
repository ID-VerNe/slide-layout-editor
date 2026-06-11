import { describe, it, expect } from 'vitest';
import { DEFAULT_DESIGN_SYSTEM } from '../theme';

describe('Design System', () => {
  describe('Tokens 结构', () => {
    it('应包含完整的 colors tokens', () => {
      const { colors } = DEFAULT_DESIGN_SYSTEM.tokens;

      expect(colors).toHaveProperty('primary');
      expect(colors).toHaveProperty('secondary');
      expect(colors).toHaveProperty('accent');
      expect(colors).toHaveProperty('background');
      expect(colors).toHaveProperty('surface');
    });

    it('colors tokens 应为有效的颜色值', () => {
      const { colors } = DEFAULT_DESIGN_SYSTEM.tokens;
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

      Object.values(colors).forEach((color) => {
        expect(hexColorRegex.test(color)).toBe(true);
      });
    });

    it('应包含完整的 spacing tokens', () => {
      const { spacing } = DEFAULT_DESIGN_SYSTEM.tokens;

      expect(spacing).toHaveProperty('none');
      expect(spacing).toHaveProperty('xs');
      expect(spacing).toHaveProperty('sm');
      expect(spacing).toHaveProperty('md');
      expect(spacing).toHaveProperty('lg');
      expect(spacing).toHaveProperty('xl');
      expect(spacing).toHaveProperty('gutter');
    });
  });

  describe('Presets 预设', () => {
    it('应包含 layout presets', () => {
      const { layout } = DEFAULT_DESIGN_SYSTEM.presets;

      expect(layout).toHaveProperty('safe-area');
      expect(layout).toHaveProperty('full-bleed');
    });

    it('应包含 effects presets', () => {
      const { effects } = DEFAULT_DESIGN_SYSTEM.presets;

      expect(effects).toHaveProperty('glass-card');
      expect(effects).toHaveProperty('hard-edge');
    });
  });
});
