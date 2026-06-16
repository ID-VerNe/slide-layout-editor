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
├── 2:3   (Portrait)
└── 1:1   (Square)

Step 3: 选择模板 (Template)
├── 按 Category 分组显示
├── 按名称 A-Z 排序
├── 实时 TemplatePreview 蓝图渲染
└── 仅显示支持当前比例 (supportedRatios) 的模板
```

### 5.3 确认动作 (`handleFinalAction`)

```typescript
if (modalMode === 'create' && 是 PLACEHOLDER 页) {
  // 替换占位页
  updatePage({ ...pages[0], layoutId, aspectRatio: selectedRatio, title: 'New Slide' });
} else if (modalMode === 'create') {
  // 追加新页
  addPage(selectedRatio, layoutId);
} else {
  // 更改当前页布局
  updatePage({ ...currentPage, layoutId, aspectRatio: selectedRatio });
}
```
