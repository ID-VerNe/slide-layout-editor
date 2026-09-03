import { describe, it, expect } from 'vitest';
import { migrateToV3 } from '../v2-to-v3';

describe('v2-to-v3 Migration Edge Cases (Container Layout Preservation)', () => {
  it('preserves layout: "grid", layout: "modular", layout: "flex" on container nodes without renaming to layoutId', () => {
    const rawData = {
      pages: [
        {
          id: 'slide-1',
          type: 'slide',
          layout: 'TwoColumnLayout', // 顶层幻灯片布局应映射为 modern-feature
          title: 'Preserve Containers',
          schemaNode: {
            id: 'root-container',
            type: 'container',
            layout: 'grid',    // 容器布局必须保留为 layout: 'grid'
            columns: 2,
            children: [
              {
                id: 'child-modular',
                type: 'container',
                layout: 'modular', // 模块化容器必须保留为 layout: 'modular'
                children: []
              },
              {
                id: 'child-flex',
                type: 'container',
                layout: 'flex',    // Flex 容器必须保留为 layout: 'flex'
                children: []
              }
            ]
          }
        }
      ]
    };

    const migrated = migrateToV3(rawData);
    const page = migrated.pages[0];

    // 页面级布局成功重命名为 layoutId
    expect(page.layoutId).toBe('modern-feature');
    expect((page as any).layout).toBeUndefined();

    // 容器级布局未被误杀
    const schemaNode = (page as any).schemaNode;
    expect(schemaNode.layout).toBe('grid');
    expect(schemaNode.layoutId).toBeUndefined();

    expect(schemaNode.children[0].layout).toBe('modular');
    expect(schemaNode.children[0].layoutId).toBeUndefined();

    expect(schemaNode.children[1].layout).toBe('flex');
    expect(schemaNode.children[1].layoutId).toBeUndefined();
  });
});
