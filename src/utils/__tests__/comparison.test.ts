import { describe, it, expect } from 'vitest';
import { shallowEqual } from '../comparison';

describe('shallowEqual', () => {
  it('应该能正确比较基本对象', () => {
    const objA = { a: 1, b: 'test' };
    const objB = { a: 1, b: 'test' };
    const objC = { a: 1, b: 'different' };

    expect(shallowEqual(objA, objB)).toBe(true);
    expect(shallowEqual(objA, objC)).toBe(false);
  });

  it('应该能处理 null 和 undefined', () => {
    expect(shallowEqual(null, null)).toBe(true);
    expect(shallowEqual(null, {})).toBe(false);
    expect(shallowEqual(undefined, undefined)).toBe(true);
  });

  it('应该只能进行一层比较 (浅比较)', () => {
    const objA = { a: { nested: 1 } };
    const objB = { a: { nested: 1 } };
    
    // 虽然内容相同，但引用不同，浅比较应返回 false
    expect(shallowEqual(objA, objB)).toBe(false);
  });

  it('相同引用的对象应该返回 true', () => {
    const obj = { a: 1 };
    expect(shallowEqual(obj, obj)).toBe(true);
  });

  it('键数量不同应该返回 false', () => {
    expect(shallowEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it('NaN 与 NaN 比较返回 true', () => {
    expect(shallowEqual(NaN, NaN)).toBe(true);
  });

  it('空对象比较返回 true', () => {
    expect(shallowEqual({}, {})).toBe(true);
  });

  it('null 与对象比较返回 false', () => {
    expect(shallowEqual(null, { a: 1 })).toBe(false);
    expect(shallowEqual({ a: 1 }, null)).toBe(false);
  });

  it('undefined 与对象比较返回 false', () => {
    expect(shallowEqual(undefined, { a: 1 })).toBe(false);
  });

  it('原始类型比较', () => {
    expect(shallowEqual(1, 1)).toBe(true);
    expect(shallowEqual(1, 2)).toBe(false);
    expect(shallowEqual('a', 'a')).toBe(true);
  });
});
