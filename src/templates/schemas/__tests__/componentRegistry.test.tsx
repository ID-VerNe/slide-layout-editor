import { describe, it, expect } from 'vitest';
import { COMPONENT_REGISTRY, getComponent } from '../componentRegistry';

describe('ComponentRegistry', () => {
  it('COMPONENT_REGISTRY 包含所有已注册原子组件', () => {
    const expected = [
      'ZineDisplay', 'ZineBody', 'ZineCaption', 'ZineMedia',
      'ZineResume', 'ZineDivider', 'ZineIcon', 'ZineMetric',
      'ZineLogo', 'ZineArtFont', 'BigDataMetrics', 'ZineVocabList',
    ];
    for (const name of expected) {
      const comp = COMPONENT_REGISTRY[name];
      expect(comp).toBeDefined();
      // 组件可能是函数 (FC) 也可能是 forwardRef / memo 的对象
      const t = typeof comp;
      expect(t === 'function' || t === 'object').toBe(true);
    }
  });

  it('getComponent 已知名称返回组件函数或对象', () => {
    const comp = getComponent('ZineDisplay');
    expect(comp).not.toBeNull();
    const t = typeof comp;
    expect(t === 'function' || t === 'object').toBe(true);
  });

  it('getComponent 未知名称返回 null', () => {
    expect(getComponent('UnknownComponent')).toBeNull();
    expect(getComponent('')).toBeNull();
  });

  it('getComponent 空字符串返回 null', () => {
    expect(getComponent('')).toBeNull();
  });
});
