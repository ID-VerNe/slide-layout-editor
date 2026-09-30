import { describe, it, expect } from 'vitest';
import { validateTemplate } from '../validator';
import { getTemplateById } from '../../registry';

describe('Bilingual Editorial Suite (双语阅读模版体系)', () => {
  const bilingualIds = [
    { id: 'bilingual-cover', name: 'Bilingual Cover' },
    { id: 'bilingual-reader', name: 'Bilingual Reader' },
    { id: 'bilingual-quote', name: 'Bilingual Quote' },
    { id: 'bilingual-glossary', name: 'Bilingual Glossary' },
  ];

  it('所有双语模版 Schema 均通过 Zod 校验', () => {
    for (const { id } of bilingualIds) {
      const tpl = getTemplateById(id);
      expect(tpl).toBeDefined();
      const result = validateTemplate(tpl!.schema);
      expect(result.success).toBe(true);
    }
  });

  it('所有双语模版均支持 3:4 与 2:3', () => {
    for (const { id } of bilingualIds) {
      const tpl = getTemplateById(id);
      expect(tpl!.supportedRatios).toContain('3:4');
      expect(tpl!.supportedRatios).toContain('2:3');
    }
  });

  it('注册表成功注册所有双语模版并包含默认数据', () => {
    for (const { id } of bilingualIds) {
      const tpl = getTemplateById(id);
      expect(tpl).toBeDefined();
      expect(tpl?.category).toBe('Bilingual');
      expect(tpl?.defaultData).toBeDefined();
      expect(tpl?.fields.length).toBeGreaterThan(2);
    }
  });

  it('bilingual-reader 默认数据包含正文、中文译文与策展生词列表', () => {
    const readerTpl = getTemplateById('bilingual-reader');
    expect(readerTpl?.defaultData?.paragraph).toBeTruthy();
    expect(readerTpl?.defaultData?.paragraphZH).toBeTruthy();
    expect(readerTpl?.defaultData?.vocabItems?.length).toBeGreaterThan(0);
    expect(readerTpl?.defaultData?.vocabItems?.[0].word).toBeTruthy();
    expect(readerTpl?.defaultData?.vocabItems?.[0].meaning).toBeTruthy();
  });

  it('bilingual-quote 默认数据包含英文主句与中文释义', () => {
    const quoteTpl = getTemplateById('bilingual-quote');
    expect(quoteTpl?.defaultData?.paragraph).toBeTruthy();
    expect(quoteTpl?.defaultData?.quoteZH).toBeTruthy();
  });
});
