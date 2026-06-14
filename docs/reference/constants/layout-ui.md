# 布局与 UI 常量

## 1. 布局与画布配置 (`layout.ts`)

- **文件**: `src/constants/layout.ts`

### 1.1 比例与尺寸 (`LAYOUT_CONFIG`)
定义了编辑器画布在不同比例下的原始像素尺寸：

| 比例 | 宽度 (px) | 高度 (px) | 描述 |
| :--- | :--- | :--- | :--- |
| `16:9` | 1920 | 1080 | 标准宽屏 |
| `2:3` | 1080 | 1620 | 海报排版 |
| `A4` | 1240 | 1754 | 专业简历 (Resume 专用) |
| `1:1` | 1080 | 1080 | 正方形 |

### 1.2 编辑器 UI 常量
- `SIDEBAR_WIDTH`: 96px (左侧导航栏)
- `EDITOR_PANEL_WIDTH`: 400px (右侧编辑面板)

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
