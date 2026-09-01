import { describe, it, expect } from 'vitest';
import { TEMPLATES, getTemplateById } from '../registry';

describe('Template Registry', () => {
  it('TEMPLATES 非空且每个模板有唯一 id', () => {
    expect(TEMPLATES.length).toBeGreaterThan(0);
    const ids = TEMPLATES.map(t => t.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('每个模板包含必需字段', () => {
    for (const t of TEMPLATES) {
      expect(t.id).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(t.category).toBeTruthy();
      expect(Array.isArray(t.fields)).toBe(true);
      expect(Array.isArray(t.supportedRatios)).toBe(true);
      expect(t.supportedRatios.length).toBeGreaterThan(0);
    }
  });

  it('每个模板有 schema', () => {
    for (const t of TEMPLATES) {
      expect(t.schema).toBeDefined();
      expect(t.schema).not.toBeNull();
    }
  });

  it('getTemplateById 返回匹配模板', () => {
    const tpl = getTemplateById('modern-feature');
    expect(tpl).toBeDefined();
    expect(tpl!.name).toBe('Modern Feature');
  });

  it('getTemplateById 未知 id 返回 undefined', () => {
    expect(getTemplateById('nonexistent-template')).toBeUndefined();
  });

  it('category 枚举合法', () => {
    const validCategories = ['Cover', 'Product', 'Marketing', 'General', 'Gallery', 'Resume', 'Bilingual'];
    for (const t of TEMPLATES) {
      expect(validCategories).toContain(t.category);
    }
  });

  it('所有模板的 fields 都包含 backgroundColor 和 pageNumber', () => {
    for (const t of TEMPLATES) {
      const keys = t.fields.map(f => f.key);
      expect(keys).toContain('backgroundColor');
      expect(keys).toContain('pageNumber');
    }
  });
});
