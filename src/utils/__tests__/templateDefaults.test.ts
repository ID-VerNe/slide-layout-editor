import { describe, it, expect } from 'vitest';
import { createDefaultPage, applyTemplateDefaults } from '../templateDefaults';
import { getTemplateById } from '../../templates/registry';
import type { PageData } from '../../types';

describe('templateDefaults', () => {
  describe('createDefaultPage', () => {
    it('无 defaultData 的模板走内容回退', () => {
      const page = createDefaultPage('16:9', 'modern-feature', getTemplateById('modern-feature'));
      expect(page.title).toBe('New Slide');
      expect(page.subtitle).toBe('Created with SlideGrid Studio');
      expect(page.paragraphZH).toBeUndefined();
    });

    it('带 defaultData 的模板覆盖回退层', () => {
      const tpl = getTemplateById('bilingual-cover');
      const page = createDefaultPage('3:4', 'bilingual-cover', tpl);
      expect(page.title).toBe(tpl?.defaultData?.title);
      expect(page.paragraphZH).toBe(tpl?.defaultData?.paragraphZH);
    });

    it('freeform 布局得到 freeform 骨架', () => {
      const page = createDefaultPage('16:9', 'freeform', undefined);
      expect(page.type).toBe('freeform');
      expect(page.freeformItems).toEqual([]);
      expect(page.freeformConfig?.gridSize).toBe(20);
    });
  });

  describe('applyTemplateDefaults', () => {
    it('保留用户已有编辑（only-fill）', () => {
      const tpl = getTemplateById('bilingual-cover');
      const result = applyTemplateDefaults({ title: 'My Title' } as Partial<PageData>, tpl);
      expect(result.title).toBe('My Title');
      // 缺失字段由模板填入
      expect(result.paragraphZH).toBe(tpl?.defaultData?.paragraphZH);
    });

    it('null 字段由模板填充', () => {
      const tpl = getTemplateById('bilingual-cover');
      const result = applyTemplateDefaults({ title: null } as unknown as Partial<PageData>, tpl);
      expect(result.title).toBe(tpl?.defaultData?.title);
    });

    it('无 templateConfig 时原样返回', () => {
      const target = { title: 'Keep' };
      const result = applyTemplateDefaults(target, undefined);
      expect(result).toEqual(target);
    });
  });
});
