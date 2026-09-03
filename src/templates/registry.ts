import React from 'react';
import { AspectRatioType } from '../constants/layout';
import { FieldSchema, FieldType, PageData } from '../types';
import { TemplateSchema, TemplateNode } from './schemas/types';

export interface TemplateDefinition {
  id: string;
  name: string;
  category: 'Cover' | 'Product' | 'Marketing' | 'General' | 'Gallery' | 'Resume' | 'Bilingual';
  desc: string;
  tags: string[];
  supportedRatios: AspectRatioType[];
  fields: (FieldType | FieldSchema)[];
  defaultData?: Partial<PageData>;
  root: TemplateNode;
}

export interface TemplateConfig {
  id: string;
  name: string;
  category: TemplateDefinition['category'];
  desc: string;
  tags: string[];
  component: React.FC<{ page: any; typography?: any }>;
  schema?: TemplateSchema;
  fields: FieldSchema[];
  supportedRatios: AspectRatioType[];
  defaultData?: Partial<PageData>;
}

const withBaseFields = (fields: (FieldType | FieldSchema)[]): FieldSchema[] => {
  const base: FieldSchema[] = [{ key: 'backgroundColor' }, { key: 'pageNumber' }];
  const custom = (fields || []).map(f => typeof f === 'string' ? { key: f as FieldType } : f);
  return [...base, ...custom];
};

// 使用 Vite 的 import.meta.glob 批量静态载入 definitions 目录下的所有独立模板 JSON 文件
const templateModules = import.meta.glob<{ default: TemplateDefinition }>(
  './definitions/**/*.json',
  { eager: true }
);

// @lat: [[templates-registry]]
export const TEMPLATES: TemplateConfig[] = Object.values(templateModules).map((mod) => {
  const def = (mod as any).default || mod;
  return {
    id: def.id,
    name: def.name,
    category: def.category,
    desc: def.desc,
    tags: def.tags || [],
    component: () => null,
    supportedRatios: def.supportedRatios,
    fields: withBaseFields(def.fields),
    defaultData: def.defaultData,
    schema: {
      id: def.id,
      name: def.name,
      category: def.category,
      supportedRatios: def.supportedRatios,
      root: def.root,
      defaults: def.defaultData,
    },
  };
});

export type TemplateId = string;

export const getTemplateById = (id: string) => {
  return TEMPLATES.find(t => t.id === id);
};
