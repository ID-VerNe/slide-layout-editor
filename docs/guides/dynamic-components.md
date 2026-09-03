# 动态数组组件 (Information Matrix) 开发规范

本指南规定了在项目中添加具有“手工创建/编辑”与“自动排版”能力的动态数组组件的标准流程。以 `metrics`（信息矩阵）组件为例，这套流程确保了数据一致性、编辑器交互的一致性以及渲染器的自动布局能力。

## 核心设计思路

1.  **数据解耦**：所有动态项以数组形式存储在 `PageData` 中。
2.  **手动录入**：编辑器提供专用的列表编辑界面（Add/Delete/Edit）。
3.  **自动排版**：渲染引擎通过 `Repeater` 节点结合 `Grid/Flex/Modular` 布局，根据数组长度自动流转，无需手动指定每个项的坐标。

---

## 开发流程 (Step-by-Step)

### 第一步：定义数据结构 (Types)

在 `src/types.ts` 中定义该组件的数据接口，并确保它包含在 `PageData` 的扩展类型中。

```typescript
// 1. 定义单项数据结构
export interface MetricData {
  id: string;
  value: string;
  label: string;
  unit?: string;
}

// 2. 确保 PageData 具备承载该数组的能力（通常在 PageData 接口中作为可选属性）
export interface PageData {
  // ...
  metrics?: MetricData[];
  // ...
}
```

### 第二步：创建编辑器字段组件 (Editor Field)

在 `src/components/editor/fields/` 目录下创建对应的表单组件（如 `MetricsField.tsx`）。

*   **必须使用 `FieldWrapper`**：保持统一的标题和图标样式。
*   **支持增删改**：
    *   `addItem()`: 向数组 push 一个初始对象。
    *   `removeItem(index)`: 根据索引过滤数组。
    *   `updateItem(index, updates)`: 局部更新数组中的某个对象。
*   **UI 规范**：使用 `src/components/ui/Base.tsx` 中的原子组件，确保符合工业精密感审美。

```tsx
export const MetricsField: React.FC<FieldProps> = React.memo(({ page, onUpdate }) => {
  const metrics = page.metrics || [];
  // 实现 addItem, removeItem, updateItem 逻辑...
  return (
    <FieldWrapper page={page} onUpdate={onUpdate} fieldKey="metrics" label="Metrics Grid" icon={Activity}>
      {metrics.map((m, idx) => (
        <div className="group relative bg-slate-50 p-4 rounded-xl ...">
           {/* 输入框绑定 */}
        </div>
      ))}
      <button onClick={addItem}>Add Item</button>
    </FieldWrapper>
  );
});
```

### 第三步：注册字段映射 (Registry)

1.  **FieldType 注册**：在 `src/types.ts` 的 `FieldType` 联合类型中增加键名（如 `'metrics'`）。
2.  **组件映射**：在 `src/components/editor/FieldRenderer.tsx` 的 `componentMap` 中添加：
    ```typescript
    const componentMap: Record<string, React.FC<any>> = {
      // ...
      metrics: MetricsField,
    };
    ```
3.  **模板声明**：在 `src/templates/registry.ts` 中，为需要支持该功能的模板添加字段配置：
    ```typescript
    fields: withBaseFields([
      { key: 'metrics', label: 'Data Points' },
    ])
    ```

### 第四步：编写模板渲染 Schema (JSON Template)

在模板的 `root` 结构中，使用 `Repeater` 节点绑定数据，并由外层 `Container` 控制其排版。

*   **排版控制**：通过 `layout: 'grid'` (固定列数) 或 `layout: 'modular'` (24x24 模块化网格) 实现自动布局。
*   **变量绑定**：在 `template` 节点中使用 `{item.xxx}` 语法访问数据项属性。

```typescript
{
  type: 'Container',
  layout: 'modular',
  layoutProps: { columns: 3, rows: 1 }, // 定义为 3 列的矩阵
  children: [
    {
      type: 'Repeater',
      bind: 'page.metrics',
      itemVariable: 'item', // 默认为 item
      template: {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column' },
        children: [
          { 
            type: 'Component', 
            componentType: 'ZineCaption', 
            props: { text: '{item.label}' } 
          },
          { 
            type: 'Component', 
            componentType: 'ZineCaption', 
            props: { text: '{item.value}', className: '!text-lg !font-bold' } 
          }
        ]
      }
    }
  ]
}
```

---

## 最佳实践与注意事项

1.  **默认值处理**：在模板 Schema 的表达式中，建议使用 `{page.metrics || []}` 或在组件层处理空数组，防止渲染崩溃。
2.  **样式黑名单**：在 `LayoutRenderer.tsx` 中，`filterZineClassName` 会强制剔除 `shadow-*`、`blur-*`、`drop-shadow-*` 或 `animate-bounce/pulse/wiggle` 等不符合项目审美的 Tailwind 类名，即使在动态组件中也不应使用。
3.  **ID 管理**：虽然目前很多组件通过数组 `index` 操作，但为了更好的 React 渲染性能，建议在 `addItem` 时使用 `crypto.randomUUID()` 生成唯一 `id`。
4.  **模块化对齐**：当使用 `layout: 'modular'` 时，`Repeater` 内部的 `template` 节点无需指定 `modular` 坐标，它们会自动按网格流式填充。

---

## 典型实现案例：双语生词表 (`ZineVocabList` 与 `VocabItemsField`)

双语阅读套件（Bilingual Suite）是动态数组组件的最佳实践：

1. **数据模型 (`src/types.ts`)**:
   `VocabItem` 包含 `id`, `word`, `phonetic`, `pos`, `meaning`, `example`, `exampleZH`，挂载在 `PageData.vocabItems`。
2. **编辑器表单 (`src/components/editor/fields/VocabItemsField.tsx`)**:
   提供词汇列表的可视化抽屉编辑、音标快速输入与中英对照例句折叠卡片。
3. **原子组件 (`src/components/ui/slide/atoms/ZineVocabList.tsx`)**:
   内置多列自适应排版、8px 基线字阶解析 (`resolveModularFontSize`)，并硬编码了物理像素下限（词头 $\ge 16\text{px}$、释义 $\ge 14\text{px}$、音标 $\ge 12\text{px}$），彻底防止在极端视口缩放时文字坍塌。
