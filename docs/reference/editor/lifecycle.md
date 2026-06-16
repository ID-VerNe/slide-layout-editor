# 编辑器生命周期

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

- **文件**: `src/pages/EditorPage.tsx` (410 行)
- **路由**: `/editor/:projectId`
- **URL 参数**: `?new=true` (新项目标记), `?template=<id>` (模板预设)
- **数据注入**: `EditorPanel` 接收 `currentPage`, `onUpdatePage`, `onRemovePage`, `customFonts` 与完整的 `pages` 数组，使字段内的 `IconPicker` 能够展示项目级图片历史 (`History` Tab)

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
// 自动保存定时器 (EditorPage) — 仅在有未保存变更时启动 3s 防抖
useEffect(() => {
  if (!isLoaded || !projectId || !hasUnsavedChanges) return;
  const autoSaveTimer = setTimeout(() => {
    saveToDB(previewRef, false);
  }, 3000);
  return () => clearTimeout(autoSaveTimer);
}, [isLoaded, projectId, hasUnsavedChanges, pages, projectTitle, theme, saveToDB]);
```
