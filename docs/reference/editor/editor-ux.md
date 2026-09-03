# 编辑器交互体验

## 3. 键盘快捷键

编辑器支持以下全局快捷键 (当焦点不在输入框内时生效):

| 快捷键 | 功能 |
| :--- | :--- |
| `Ctrl+S` | 智能保存 (Smart Save) |
| `Ctrl+Shift+S` | 另存为 (Save As) |
| `Ctrl+Z` | 撤销 |
| `Ctrl+Y` | 重做 |

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

### 6.2 缩略图存储与持久化服务 (`recentProjects.ts`)

为彻底根治大型项目中频繁 base64 截图塞满 `localStorage` 导致的 `QuotaExceededError` 崩溃，系统引入了专用的 `src/services/recentProjects.ts` 服务并协同 IndexedDB：

- **双轨存储**: 缩略图高保真原图异步写入 IndexedDB 的 `projectThumbnails` 独立对象仓库，同时按配额受控同步至 `localStorage`。
- **三级配额防御机制 (3-Tier Quota Defense)**:
  1. **Tier 1 (全量模式)**: 正常保存最近所有项目的完整元数据与 Base64 缩略图。
  2. **Tier 2 (前 6 项保留)**: 发生存储配额溢出时，自动剔除第 7 项以后的缩略图，仅为最近活跃的前 6 个项目保留缩略图。
  3. **Tier 3 (纯元数据兜底)**: 若配额依然紧张，清空所有条目的缩略图，仅保留项目标题、路径、时间戳与模板元数据，确保工程历史索引绝不丢失。

---

## 7. 最近项目索引

编辑器由 `recentProjects.ts` 统一管理项目元数据索引 (`slidegrid_recent_projects`):

**索引条目结构**:

```typescript
interface RecentProjectEntry {
  id: string;          // 项目 UUID
  title: string;       // 项目标题
  date: string;        // 创建日期 (locale string)
  lastModified: number; // 最后修改时间戳
  type: string;        // 首页模板 ID
  aspectRatio: string; // 首页比例 (含 '3:4')
  thumbnail: string | null; // 缩略图 Base64 (遵循 3 级配额防御)
  filePath: string | null;  // .slgrid 物理文件路径
}
```

**更新时机**:
- 手动保存 (`Ctrl+S`) 时调用 `recentProjects.updateRecentProject()`
- 后台自动保存 (`saveToDB`) 时静默更新元数据 (保留原缩略图)

---

## 9. 预览缩放系统 (Preview Zoom)

通过 `usePreview` Hook 管理：

| 功能 | 说明 |
| :--- | :--- |
| `previewZoom` | 当前缩放倍率 (0.1 ~ 1.5) |
| `isAutoFit` | 是否自适应容器 |
| `handleManualZoom(value)` | 手动设置缩放值 |
| `toggleFit()` | 切换自适应模式 |
| `handleOverflowChange(pageId, isOverflowing)` | 溢出检测回调 (pageId + 布尔值) |

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
| **粗体与斜体** (Bold &amp; Italic) | 切换 `bold` 与 `italic` 覆盖 | 非分割线、非图片字段 |

### 11.2 状态管理

- 所有修改写入 `page.styleOverrides[fieldKey]`，以静默模式 (`silent=true`) 更新 Store，不触发历史记录
- 支持一键重置 (`RESET`) 恢复默认样式
- 字段类型智能识别：自动判断当前字段属于分割线、图片还是文本类型，展示对应控件

### 11.3 字段类型识别逻辑

```typescript
// mode 参数优先级最高，可通过 props 显式指定 'text'/'image'/'divider'
// 默认模式走启发式自动判断:
const isDivider = mode === 'divider' || (!mode && (
  fieldKey.toLowerCase().includes('divider') 
  || fieldKey === 'separator' 
  || fieldKey.toLowerCase().includes('line')
));
const isImage = mode === 'image' || (!mode && (
  (fieldKey.toLowerCase().includes('image') 
    || fieldKey.toLowerCase().includes('logo') 
    || fieldKey.toLowerCase().includes('media'))
  && !fieldKey.toLowerCase().includes('label')
  && !fieldKey.toLowerCase().includes('text')
));
const isText = mode === 'text' || (!isDivider && !isImage);
```
