# 布局与 UI 常量

## 1. 布局与画布配置 (`layout.ts`)

- **文件**: `src/constants/layout.ts`

### 1.1 比例与尺寸 (`LAYOUT_CONFIG`)
定义了编辑器画布在不同比例下的原始像素尺寸：

每个画幅对应一个 `LayoutDimensions` 对象，包含 `width`、`height`、`label`、`orientation` 四个属性：

```typescript
export interface LayoutDimensions {
  width: number;
  height: number;
  label: string;
  orientation: OrientationType;
}
```

| 比例 | 宽度 (px) | 高度 (px) | 方向 (Orientation) | 标签 (Label) |
| :--- | :--- | :--- | :--- | :--- |
| `16:9` | 1920 | 1080 | `landscape` | Standard (16:9) |
| `2:3` | 1080 | 1620 | `portrait` | Poster (2:3) |
| `3:4` | 1080 | 1440 | `portrait` | Xiaohongshu (3:4) |
| `A4` | 1240 | 1754 | `resume` | Professional Resume |
| `1:1` | 1080 | 1080 | `square` | Square (1:1) |

### 1.2 类型定义

```typescript
export type OrientationType = 'landscape' | 'portrait' | 'square' | 'resume';
export type AspectRatioType = '16:9' | '2:3' | '3:4' | 'A4' | '1:1';
```

- **`AspectRatioType`**: 画布比例标识，用于模板注册和页面创建
- **`OrientationType`**: 方向类型，`resume` 是从 `portrait` 剥离的独立方向，专用于简历/文档类排版

### 1.3 编辑器 UI 常量
- `SIDEBAR_WIDTH`: 96px (左侧导航栏)
- `EDITOR_PANEL_WIDTH`: 400px (右侧编辑面板)
- `SIDEBAR_OFFSET`: -80px (侧边栏偏移量)

这些常量也通过 `LAYOUT` 对象导出 (`LAYOUT.EDITOR_PANEL_WIDTH`、`LAYOUT.SIDEBAR_WIDTH`、`LAYOUT.SIDEBAR_OFFSET`)。

---

## 8. 快捷键参考

应用支持以下全局快捷键（当焦点不在输入框内时生效）：

| 快捷键 | 功能 |
|:---|:---|
| `Ctrl+S` | 智能保存 (Smart Save) |
| `Ctrl+Shift+S` | 另存为 (Save As) |
| `Ctrl+Z` | 撤销 |
| `Ctrl+Y` / `Ctrl+Shift+Z` | 重做 |
| `Alt+;` | 切换 24x24 调试网格 |
| `ArrowLeft` / `ArrowRight` | 切换页面 |
| `Delete` | 删除当前页面 |
