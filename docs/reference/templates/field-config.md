# 模板字段配置

## 1. FieldSchema 类型定义

每个模板通过 `fields` 数组定义编辑器面板中可编辑的字段。字段的类型定义在 `src/types.ts`：

```typescript
export interface FieldSchema {
  key: FieldType;                      // 字段标识，唯一且与 PageData 对应
  label?: string;                      // 编辑器中显示的标签文案
  type?: string;                       // 字段渲染类型（如 'separator', 'footer', 'number'）
  icon?: string;                       // 字段图标标识
  props?: Record<string, unknown>;     // 字段专属属性（如 min/max/step/options）
  defaultValue?: unknown;              // 字段默认值
  placeholder?: string;                // 编辑器占位符提示
}
```

## 2. 支持的 FieldType 枚举

```typescript
export type FieldType =
  | 'logo' | 'title' | 'subtitle' | 'actionText' | 'paragraph'
  | 'signature' | 'image' | 'imageLabel' | 'imageSubLabel'
  | 'features' | 'bentoItems' | 'mosaic' | 'metrics'
  | 'partnersTitle' | 'partners' | 'testimonials' | 'agenda'
  | 'gallery' | 'variant' | 'footer' | 'bullets'
  | 'backgroundColor' | 'pageNumber' | 'logoSize' | 'titleY'
  | 'group' | 'separator' | 'resumeSections' | 'artFont'
  | 'bigDataMetrics';
```

## 3. withBaseFields 辅助函数

`withBaseFields()` 自动为每个模板添加 `backgroundColor` 和 `pageNumber` 两个基础字段（总是排在前面），然后追加自定义字段：

```typescript
const withBaseFields = (fields: (FieldType | FieldSchema)[]): FieldSchema[] => {
  const base: FieldSchema[] = [{ key: 'backgroundColor' }, { key: 'pageNumber' }];
  const custom = fields.map(f => typeof f === 'string' ? { key: f as FieldType } : f);
  return [...base, ...custom];
};
```

## 4. 字段配置示例

### 4.1 纯字符串字段（简写形式）

用字段名称字符串直接引用，自动转为 `{ key: fieldName }`：

```typescript
withBaseFields(['title', 'subtitle', 'image', 'imageLabel'])
```

### 4.2 带自定义标签

通过对象形式设置 `label`，覆盖编辑器中的默认标签名：

```typescript
withBaseFields([
  { key: 'title', label: 'Headline' },
  { key: 'paragraph', label: 'Body Copy' },
  { key: 'image', label: 'Main Media' },
  { key: 'imageLabel', label: 'Meta Info' }
])
```

### 4.3 带变体选项（variant）

使用 `variant` 字段 + `props.options` 定义布局变体选择器：

```typescript
withBaseFields([
  {
    key: 'variant',
    label: 'Image Side',
    props: {
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Right', value: 'right' }
      ]
    }
  },
  { key: 'title', label: 'Vertical Headline' },
  { key: 'image', label: 'Main Image' }
])
```

三选一变体示例（来自 `gallery-capsule`）：

```typescript
withBaseFields([
  {
    key: 'variant',
    label: 'Visual Scheme',
    props: {
      options: [
        { value: 'under', label: 'Under' },
        { value: 'over', label: 'Over' },
        { value: 'minimal', label: 'Minimal' }
      ]
    }
  },
  { key: 'title' },
  { key: 'subtitle' },
  { key: 'artFont', label: 'Art Typography (Year/ID)' },
  { key: 'gallery' },
  { key: 'imageLabel' }
])
```

### 4.4 数值字段

使用 `type: 'number'` 定义数值字段，支持 `min`/`max`/`step` 约束：

```typescript
withBaseFields([
  {
    key: 'imageHeight' as any,
    type: 'number',
    label: 'Image Proportion (%)',
    props: { min: 20, max: 80, step: 5 }
  }
])
```

### 4.5 分隔线字段

使用 `type: 'separator'` 在编辑器面板中插入视觉分隔线：

```typescript
withBaseFields([
  { key: 'topDivider' as any, label: 'Top Divider', type: 'separator' },
  { key: 'title', label: 'Headline' },
  { key: 'bottomDivider' as any, label: 'Bottom Divider', type: 'separator' },
])
```

### 4.6 Footer 字段

使用 `type: 'footer'` 表示底部元数据区域：

```typescript
withBaseFields([
  { key: 'footer', label: 'Catalog Info', type: 'footer' }
])
```

### 4.7 复合/集合字段

绑定到数据集合（数组/对象）的字段，通常对应 Repeater 或自定义渲染：

```typescript
withBaseFields([
  { key: 'gallery' },                // 多图集合
  { key: 'features' },               // 功能列表
  { key: 'bentoItems' },             // Bento 网格项
  { key: 'resumeSections' },         // 简历区块
  { key: 'partners' },               // 合作伙伴列表
  { key: 'testimonials' },           // 推荐语列表
  { key: 'agenda' },                 // 目录条目
  { key: 'bigDataMetrics' },         // 数据指标网格
])
```

### 4.8 带默认值和占位符

适用于引导内容的字段：

```typescript
withBaseFields([
  {
    key: 'partnersTitle',
    label: 'Partners Section Title',
    defaultValue: 'POWERED BY',
    placeholder: 'e.g., Trusted by, Used by'
  }
])
```

## 5. 模板级默认数据 (defaultData)

除了字段级别的 `defaultValue`，模板还可以在 `TemplateConfig.defaultData` 中设置整体默认值：

```typescript
{
  id: 'editorial-classic',
  fields: withBaseFields([...]),
  defaultData: {
    title: 'MAGAZINE TITLE',
    subtitle: 'Issue Theme',
    imageLabel: 'JANUARY',
    actionText: '2026'
  }
}
```

**优先级规则**（从高到低）：
1. 字段级 `defaultValue`
2. 模板级 `defaultData`
3. 系统默认值
