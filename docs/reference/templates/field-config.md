# 模板字段配置

每个模板通过 `fields` 数组定义编辑器面板中可编辑的字段。`withBaseFields()` 辅助函数会自动为每个模板添加 `backgroundColor` 和 `pageNumber` 两个基础字段。

### 3.1 字段类型
参见 [编辑器字段参考](editor/fields/index.md) 中的完整字段映射表。

### 3.2 常用字段配置示例

```typescript
// 纯字符串字段
withBaseFields(['title', 'subtitle', 'image', 'imageLabel'])

// 带自定义标签
withBaseFields([
  { key: 'title', label: 'Headline' },
  { key: 'paragraph', label: 'Body Copy' },
])

// 带变体选项
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
])

// 带分隔线
withBaseFields([
  { key: 'topDivider', label: 'Top Divider', type: 'separator' },
  { key: 'title', label: 'Headline' },
  { key: 'bottomDivider', label: 'Bottom Divider', type: 'separator' },
])
```
