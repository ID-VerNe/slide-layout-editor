# 编辑器页面架构与交互系统

本章深入解析编辑器主页面 (`EditorPage`) 的架构、数据流、导出系统与布局浏览器。

---

## 1. 页面总览

`EditorPage` 是整个应用的"主战场"，一个高度复杂的编辑器界面，包含以下核心区域：

```text
┌──────────────────────────────────────────────────────────┐
│  TopNav (顶部工具栏)                                      │
│  项目标题 | 页面切换 | 缩放 | 导出 | 保存 | 撤销/重做      │
├──────┬───────────────────────────────────────┬────────────┤
│      │                                       │            │
│ Side │  PreviewArea (中央预览)                │ EditorPanel│
│ bar  │  - 页面实时渲染                        │ (右侧编辑)  │
│ (左) │  - 缩略图预览                          │  400px     │
│      │  - 缩放/自适应                         │            │
│ 96px │                                       │            │
├──────┴───────────────────────────────────────┴────────────┤
│  Modal Layer (Portal)                                     │
│  - GlobalSettings | Layout Browser | Export Dialog         │
└──────────────────────────────────────────────────────────┘
```

- **文件**: `src/pages/EditorPage.tsx` (324 行)
- **路由**: `/editor/:projectId`
- **URL 参数**: `?new=true` (新项目标记), `?template=<id>` (模板预设)

---

## 2. 初始化流程

### 2.1 项目加载

`EditorPage` 通过 `useProject` Hook 驱动项目加载，这是一个复杂的异步流程：

```
1. URL 解析 projectId
2. useProject 获取 Store 中的 loadProject 方法
3. loadProject(projectId, templateId) 被调用:
   a. 检查 IndexedDB -> 获取 ProjectData
   b. 执行 migrateToV3() 数据迁移
   c. 同步 Electron 项目上下文 (setCurrentProject)
   d. 加载到 Zustand Store
   e. 设置 isLoaded = true
4. 如果是新项目 (PLACEHOLDER_FOR_NEW_PROJECT):
   a. 自动弹出布局浏览器 (三步向导)
   b. 方向 → 比例 → 模板
```

### 2.2 热启动与自动保存

编辑器实现了三级自动持久化策略：

1. **实时输入**: 修改直接写入 Zustand (内存)
2. **定时自动保存**: 每 3 秒将 `hasUnsavedChanges` 为真的数据写入 IndexedDB (`saveToDB`)
3. **手动保存 (Ctrl+S)**: 写入 IndexedDB + 打包 .slgrid + 更新最近项目索引

```typescript
// 自动保存定时器 (EditorPage)
useEffect(() => {
  if (projectId && isLoaded && pages.length > 0 && pages[0].title !== 'PLACEHOLDER_FOR_NEW_PROJECT') {
    timeout = setTimeout(() => saveToDB(previewRef, false), 3000);
  }
}, [pages, projectId, isLoaded, ...]);
```

---

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

## 4. 导出系统

### 4.1 导出模式

支持两种格式、两种范围的组合：

| 格式 | 范围 | 说明 |
| :--- | :--- | :--- |
| PNG | 当前页 | 直接下载单张 PNG |
| PNG | 全部页 | 逐页渲染，Electron 下可批量保存到文件夹 |
| PDF | 当前页 | 当前页面转为 PDF |
| PDF | 全部页 | 多页 PDF (jsPDF) |

### 4.2 导出流程 (`handleExport`)

```text
1. 保存当前缩放值 (previewZoom)
2. 锁定缩放到 1:1 (setPreviewZoom(1))
3. 等待字体加载完成 (document.fonts.ready)
4. 确定导出索引数组 (当前页 或 全部页)
5. 逐页:
   a. 切换到目标页面索引
   b. 等待 600-800ms (确保渲染完成)
   c. toPng() 捕获 DOM 为 DataURL (pixelRatio: 2)
   d. PNG: 创建下载链接 / Electron 批量写文件
   e. PDF: jsPDF.addImage() + 简历链接注解
6. 恢复缩放值与页面索引
```

### 4.3 导出配置

- **pixelRatio**: 2 (2x 分辨率)
- **backgroundColor**: 白色
- **过滤规则**: 排除非本站 CSS 链接
- **进度条**: 全屏动画显示百分比 (Framer Motion)

---

## 5. 布局浏览器 (Layout Browser)

布局浏览器是添加/更改页面模板的三步向导，使用 `Modal type="custom"` 实现。

### 5.1 触发方式

| 触发场景 | 模式 | 入口 |
| :--- | :--- | :--- |
| 新建项目 (PLACEHOLDER 页) | `create` | 自动弹出 |
| 侧边栏 "+" 按钮 | `create` | `open-layout-browser` 事件 |
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

## 8. 打印设置 (Print Settings)

打印设置用于导出时添加装订线、裁切线等出版辅助元素：

```typescript
interface PrintSettings {
  enabled: boolean;
  widthMm: number;     // 页面宽度 (mm)
  heightMm: number;    // 页面高度 (mm)
  gutterMm: number;     // 装订线宽度
  showGutterShadow: boolean;  // 装订线阴影
  showTrimShadow: boolean;   // 裁切线阴影
  showContentFrame: boolean; // 内容框
  configs: {
    landscape: { bindingSide, trimSide };
    portrait: { bindingSide, trimSide };
    square: { bindingSide, trimSide };
    resume: { bindingSide, trimSide };
  }
}
```

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

---
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