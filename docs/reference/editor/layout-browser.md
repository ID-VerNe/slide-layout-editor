# 布局浏览器

## 5. 布局浏览器 (Layout Browser)

布局浏览器是添加/更改页面模板的三步向导，使用 `Modal type="custom"` 实现。

### 5.1 触发方式

| 触发场景 | 模式 | 入口 |
| :--- | :--- | :--- |
| 新建项目 (PLACEHOLDER 页) | `create` | 自动弹出 |
| 侧边栏 "+" 按钮 | `create` | `onAddPage` 回调 |
| 页面右键 "Change Layout" | `change` | `open-layout-browser` 事件 |

### 5.2 三步向导

```
Step 1: 选择方向 (Orientation)
├── Landscape (横屏)  -> Slides
├── Portrait  (竖屏)  -> Magazine
├── Square    (方形)  -> Posts
└── Resume    (简历)  -> Career Docs (直接跳到 Step 3, ratio= A4)

Step 2: 选择比例 (Ratio)
├── 16:9  (Landscape)
├── 2:3 / 3:4 (Portrait)
└── 1:1   (Square)

Step 3: 选择模板 (Template)
├── 按 Category 分组显示
├── 按名称 A-Z 排序
├── 实时 TemplatePreview 蓝图渲染
└── 仅显示支持当前比例 (supportedRatios) 的模板
```

### 5.3 确认动作 (`handleFinalAction`)

当用户选定新版式确认时，系统会自动提取目标模板的 `defaultData` 与各个字段的 `defaultValue` 进行默认数据兜底补全，防止切换到含特定数组结构（如词汇表、Bento 栅格、简历卡片）的新版式时因缺少对应字段而呈现空态：

```typescript
const targetTemplate = getTemplateById(layoutId);
const mergedDefaultData = {
  ...(targetTemplate?.defaultData || {}),
};
if (targetTemplate?.fields) {
  for (const f of targetTemplate.fields) {
    if (f.defaultValue !== undefined && mergedDefaultData[f.name] === undefined) {
      mergedDefaultData[f.name] = f.defaultValue;
    }
  }
}

if (modalMode === 'create' && 是 PLACEHOLDER 页) {
  // 替换占位页并合并模板默认数据
  updatePage({
    ...pages[0],
    ...mergedDefaultData,
    layoutId,
    aspectRatio: selectedRatio,
    title: pages[0].title === 'New Slide' ? (targetTemplate?.name || 'New Slide') : pages[0].title,
  });
} else if (modalMode === 'create') {
  // 追加新页
  addPage(selectedRatio, layoutId);
} else {
  // 更改当前页布局（继承现有内容，补全缺失的专属字段）
  updatePage({
    ...mergedDefaultData,
    ...currentPage,
    layoutId,
    aspectRatio: selectedRatio,
  });
}
```
