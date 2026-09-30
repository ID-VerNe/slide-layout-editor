import type { PageData } from '../types';

/**
 * 动态字段读取：在 PageData 索引签名之上收敛 (page as any)[key] 逃逸。
 * 仅做 nullish 兜底，不做运行时类型守卫；T 由调用方保证与实际值类型一致。
 */
export function getPageField<T>(page: PageData, key: string, fallback: T): T {
  const v: unknown = page[key];
  return (v !== undefined && v !== null ? v : fallback) as T;
}
