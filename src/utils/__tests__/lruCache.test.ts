import { describe, it, expect } from 'vitest';
import { LRUCache } from '../lruCache';

describe('LRUCache', () => {
  it('基本 get/set', () => {
    const cache = new LRUCache<string, number>(3);
    cache.set('a', 1);
    cache.set('b', 2);
    expect(cache.get('a')).toBe(1);
    expect(cache.get('b')).toBe(2);
    expect(cache.get('c')).toBeUndefined();
  });

  it('has 检查键存在', () => {
    const cache = new LRUCache<string, string>(2);
    cache.set('x', 'hello');
    expect(cache.has('x')).toBe(true);
    expect(cache.has('y')).toBe(false);
  });

  it('delete 删除键', () => {
    const cache = new LRUCache<string, number>(3);
    cache.set('a', 1);
    expect(cache.delete('a')).toBe(true);
    expect(cache.has('a')).toBe(false);
    expect(cache.delete('nonexistent')).toBe(false);
  });

  it('clear 清空缓存', () => {
    const cache = new LRUCache<string, number>(3);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.clear();
    expect(cache.size).toBe(0);
    expect(cache.get('a')).toBeUndefined();
  });

  it('size 返回当前条目数', () => {
    const cache = new LRUCache<string, number>(5);
    expect(cache.size).toBe(0);
    cache.set('a', 1);
    expect(cache.size).toBe(1);
    cache.set('b', 2);
    expect(cache.size).toBe(2);
  });

  it('keys 返回所有键', () => {
    const cache = new LRUCache<string, number>(3);
    cache.set('a', 1);
    cache.set('b', 2);
    expect(cache.keys).toEqual(['a', 'b']);
  });

  it('values 返回所有值', () => {
    const cache = new LRUCache<string, number>(3);
    cache.set('a', 10);
    cache.set('b', 20);
    expect(cache.values).toEqual([10, 20]);
  });

  it('超过 maxSize 时淘汰最久未使用项', () => {
    const cache = new LRUCache<string, number>(3);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    cache.set('d', 4); // 应淘汰 'a'
    expect(cache.has('a')).toBe(false);
    expect(cache.get('b')).toBe(2);
    expect(cache.get('c')).toBe(3);
    expect(cache.get('d')).toBe(4);
    expect(cache.size).toBe(3);
  });

  it('get 操作刷新访问顺序', () => {
    const cache = new LRUCache<string, number>(3);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    cache.get('a'); // 刷新 'a'，现在 'b' 是最久未用
    cache.set('d', 4); // 应淘汰 'b'
    expect(cache.has('a')).toBe(true);
    expect(cache.has('b')).toBe(false);
    expect(cache.has('c')).toBe(true);
    expect(cache.has('d')).toBe(true);
  });

  it('set 更新已有键不增加 size', () => {
    const cache = new LRUCache<string, number>(3);
    cache.set('a', 1);
    cache.set('a', 10);
    expect(cache.size).toBe(1);
    expect(cache.get('a')).toBe(10);
  });

  it('set 更新已有键刷新访问顺序', () => {
    const cache = new LRUCache<string, number>(3);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    cache.set('a', 10); // 刷新 'a'，'b' 变最久未用
    cache.set('d', 4); // 应淘汰 'b'
    expect(cache.has('b')).toBe(false);
    expect(cache.get('a')).toBe(10);
  });

  it('默认 maxSize 为 100', () => {
    const cache = new LRUCache<number, number>();
    for (let i = 0; i < 100; i++) cache.set(i, i);
    expect(cache.size).toBe(100);
    cache.set(100, 100); // 淘汰 key=0
    expect(cache.has(0)).toBe(false);
    expect(cache.size).toBe(100);
  });

  it('支持非字符串键', () => {
    const cache = new LRUCache<number, string>(5);
    cache.set(1, 'one');
    cache.set(2, 'two');
    expect(cache.get(1)).toBe('one');
    // get(1) 刷新了 key=1 的顺序，所以 1 移到末尾
    expect(cache.keys).toEqual([2, 1]);
  });
});
