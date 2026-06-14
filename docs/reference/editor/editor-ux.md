# 编辑器交互体验

## 3. 键盘快捷键

编辑器支持以下全局快捷键 (当焦点不在输入框内时生效):

| 快捷键 | 功能 |
| :--- | :--- |
| `Ctrl+S` | 智能保存 (Smart Save) |
| `Ctrl+Shift+S` | 另存为 (Save As) |
| `Ctrl+Z` | 撤销 |
| `Ctrl+Shift+Z` | 重做 |
| `Ctrl+Y` | 重做 (备选) |
| `Alt+;` | 切换 24x24 调试网格 |

**智能保存 (Smart Save)** 的执行流程：
1. 生成当前页面缩略图
2. 构建完整项目内容对象 (包含 version, title, pages, theme, ...)
3. Electron 环境: 调用 `nativeFs.saveProject()` -> IPC -> 主进程打包 ZIP
4. Web 环境: 仅写入 IndexedDB
5. 更新 localStorage 中最近项目索引 (含缩略图、文件路径)
6. 更新窗口标题

---

## 6. 缩略图系统

### 6.1 缩略图生成策略

应用使用双重缩略图生成策略：

1. **保存时生成 (实时)**:
   - `Ctrl+S` 时调用 `generateThumb()`
   - Electron: `webContents.capturePage` — 极速原生截图
   - Web: `html-to-image` (`pixelRatio: 0.2, quality: 0.5`)

2. **后台定时生成 (静默)**:
   - 首次 30 秒后，然后每 5 分钟
   - 仅在页面可见 (`!document.hidden`) 且有预览元素时执行
   - Electron: 240px 宽截图
   - Web: 超低保真截图 (`pixelRatio: 0.1, quality: 0.1`)

### 6.2 缩略图存储

- **位置**: `localStorage` (`magazine_recent_projects` key)
- **数据**: Base64 DataURL
- **容量**: 最多 48 个项目

---

## 7. 最近项目索引

编辑器使用 `localStorage` 维护项目元数据索引 (`magazine_recent_projects`):

**索引条目结构**:

```typescript
interface RecentProjectEntry {
  id: string;          // 项目 UUID
  title: string;       // 项目标题
  date: string;        // 创建日期 (locale string)
  lastModified: number; // 最后修改时间戳
  type: string;        // 首页模板 ID
  aspectRatio: string; // 首页比例
  thumbnail: string | null; // 缩略图 Base64
  filePath: string | null;  // .slgrid 物理文件路径
}
```

**更新时机**:
- 手动保存 (`Ctrl+S`) 时更新 `updateIndex()`
- 后台自动保存 (`saveToDB`) 时静默更新元数据 (保留原缩略图)

---

## 9. 预览缩放系统 (Preview Zoom)

通过 `usePreview` Hook 管理：

| 功能 | 说明 |
| :--- | :--- |
| `previewZoom` | 当前缩放倍率 (0.25 ~ 3.0) |
| `isAutoFit` | 是否自适应容器 |
| `handleManualZoom(step)` | 手动缩放 (±0.1) |
| `toggleFit()` | 切换自适应模式 |
| `handleOverflowChange(isOverflowing)` | 溢出检测回调 |

自适应模式 (`isAutoFit`) 下，系统根据容器大小动态计算最佳缩放。

---

## 10. 脏检查与窗口标题

编辑器实时反映工程状态：

```typescript
const unsavedMark = hasUnsavedChanges ? '● ' : '';
document.title = `${unsavedMark}${fileName} | SlideGrid Studio`;
```

- 有未保存修改: `● My Project.slgrid | SlideGrid Studio`
- 已保存: `My Project.slgrid | SlideGrid Studio`

## 11. 样式实验室 (ZineStylePanel)

`ZineStylePanel` 是编辑器中的"样式实验室"浮层组件，为每个字段提供精细化的样式微调能力。

- **文件**: `src/components/editor/zine/ZineStylePanel.tsx`
- **触发方式**: 在 `FieldToolbar` 中点击调整图标 (Adjustments)

### 11.1 控制面板功能

| 分区 | 功能 | 适用范围 |
| :--- | :--- | :--- |
| **字体选择** (Typography Pair) | 切换当前字段的 `fontFamily` | 非分割线、非图片字段 |
| **核心数值** (Size/Thickness/Rounding) | 字号/线条粗细/圆角 ± 步进控制 | 所有字段 (自适应类型) |
| **分割线长度** (Length) | 控制分割线相对单元格长度的百分比 | 仅分割线字段 |
| **文本对齐** (Text Align) | 左对齐/居中/两端对齐 | 非图片、非分割线字段 |
| **9 点对齐** (9-Point Docking) | 垂直 (TOP/MID/BOT) + 水平 (LFT/CTR/RGT) | 所有字段 |
| **调色盘** (Color Palette) | 从 `ds.tokens.colors` 中选择颜色 Token | 所有字段 |
| **斜体模式** (Italic Mode) | 切换 `fontStyle: 'italic'` | 非分割线、非图片字段 |

### 11.2 状态管理

- 所有修改写入 `page.styleOverrides[fieldKey]`，以静默模式 (`silent=true`) 更新 Store，不触发历史记录
- 支持一键重置 (`RESET`) 恢复默认样式
- 字段类型智能识别：自动判断当前字段属于分割线、图片还是文本类型，展示对应控件

### 11.3 字段类型识别逻辑

```typescript
const isDivider = fieldKey.toLowerCase().includes('divider') 
  || fieldKey === 'separator' 
  || fieldKey.toLowerCase().includes('line');
const isImage = fieldKey.toLowerCase().includes('image') 
  || fieldKey.toLowerCase().includes('logo') 
  || fieldKey.toLowerCase().includes('media');
```
