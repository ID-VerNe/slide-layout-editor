import { describe, it, expect } from 'vitest';
import { createModularFlexContainer } from '../modularFlex';

describe('modularFlex', () => {
  it('createModularFlexContainer 创建带有 24 格外框占位与完整 Flex 属性的容器', () => {
    const container = createModularFlexContainer({
      modular: { colStart: 3, colSpan: 18, rowStart: 4, rowSpan: 2 },
      flex: { direction: 'row', align: 'center', justify: 'between', gap: 'spacing.md' },
      className: 'border-b pb-2',
      children: [
        {
          type: 'Component',
          componentType: 'ZineCaption',
          bind: 'page.subtitle',
        } as any,
      ],
    });

    expect(container.type).toBe('Container');
    expect(container.layout).toBe('flex');
    expect(container.modular).toEqual({ colStart: 3, colSpan: 18, rowStart: 4, rowSpan: 2 });
    expect(container.layoutProps).toEqual({
      direction: 'row',
      align: 'center',
      justify: 'between',
      gap: 'spacing.md',
      wrap: false,
    });
    expect(container.className).toContain('w-full h-full overflow-hidden');
    expect(container.className).toContain('border-b pb-2');
    expect(container.children).toHaveLength(1);
  });
});
