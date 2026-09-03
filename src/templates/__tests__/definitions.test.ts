import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { validateTemplateSchema } from '../schemas/validator';
import { TEMPLATES } from '../registry';

describe('Template JSON Definitions', () => {
  const definitionsDir = path.resolve(__dirname, '../definitions');

  it('definitions 目录包含 36 个独立 JSON 文件', () => {
    let jsonCount = 0;
    const scanDir = (dir: string) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          scanDir(fullPath);
        } else if (file.endsWith('.json')) {
          jsonCount++;
        }
      }
    };
    scanDir(definitionsDir);
    expect(jsonCount).toBe(36);
  });

  it('所有模板均能成功被 Schema 校验器验证', () => {
    for (const tpl of TEMPLATES) {
      expect(tpl.schema).toBeDefined();
      const result = validateTemplateSchema(tpl.schema as any);
      expect(result.success, `Template ${tpl.id} validation failed`).toBe(true);
    }
  });

  it('所有具备 variant 的模板均配置了专属 switcher', () => {
    const variantTemplates = TEMPLATES.filter(t => t.fields.some(f => f.key === 'variant'));
    expect(variantTemplates.length).toBeGreaterThan(0);
    for (const tpl of variantTemplates) {
      const variantField = tpl.fields.find(f => f.key === 'variant');
      expect(variantField).toBeDefined();
      // 检查是否具备 switcher 类型或 mode 属性
      const props = (variantField?.props || {}) as any;
      expect(props.mode || props.options).toBeDefined();
    }
  });
});
