import { describe, it, expect } from 'vitest';
import {
  BilingualCoverSchema,
  BilingualReaderSchema,
  BilingualQuoteSchema,
  BilingualGlossarySchema,
} from '../index';
import { validateTemplate } from '../validator';
import { getTemplateById } from '../../registry';

describe('Bilingual Editorial Suite (双语阅读模版体系)', () => {
  const bilingualSchemas = [
    { id: 'bilingual-cover', schema: BilingualCoverSchema, name: 'Bilingual Cover' },
    { id: 'bilingual-reader', schema: BilingualReaderSchema, name: 'Bilingual Reader' },
    { id: 'bilingual-quote', schema: BilingualQuoteSchema, name: 'Bilingual Quote' },
    { id: 'bilingual-glossary', schema: BilingualGlossarySchema, name: 'Bilingual Glossary' },
  ];

  it('所有双语模版 Schema 均通过 Zod 校验', () => {
    for (const { schema } of bilingualSchemas) {
      const result = validateTemplate(schema);
      expect(result.success).toBe(true);
    }
  });

  it('所有双语模版均支持 3:4 小红书黄金比例', () => {
    for (const { schema } of bilingualSchemas) {
      expect(schema.supportedRatios).toContain('3:4');
      expect(schema.supportedRatios).toContain('2:3');
    }
  });

  it('注册表成功注册所有双语模版并包含默认数据', () => {
    for (const { id } of bilingualSchemas) {
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
