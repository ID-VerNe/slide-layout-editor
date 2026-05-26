# 状态管理与数据流深度解析

SlideGrid Studio 的状态管理不仅负责数据存储，还集成了历史追踪、跨页面同步和复杂的数据迁移逻辑。

## 1. 响应式原子：Zustand Store (`useStore.ts`)

应用的状态被建模为一个单向数据流的 Store，位于 [src/store/useStore.ts](src/store/useStore.ts)。

### 1.1 核心状态树 (`ProjectState`)

| 状态字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `pages` | `PageData[]` | 核心页面数组，包含所有排版与内容数据 |
| `projectTitle` | `string` | 项目标题 |
| `theme` | `ProjectTheme` | 全局视觉主题 |
| `designSystem` | `DesignSystem` | 设计令牌系统 (V3+) |
| `currentPageIndex` | `number` | 当前编辑的页面索引 |
| `customFonts` | `CustomFont[]` | 自定义字体列表 |
| `imageQuality` | `number` | 图片压缩质量 (默认 0.95) |
| `minimalCounter` | `boolean` | 极简页码模式 |
| `counterStyle` | `CounterStyle` | 全局页码样式 |
| `printSettings` | `PrintSettings` | 打印/出版设置 |
| `isLoaded` | `boolean` | 异步加载完成标志 |
| `activeProjectId` | `string \| null` | 当前活跃项目 ID |
| `currentFilePath` | `string \| null` | .slgrid 物理文件路径 |
| `hasUnsavedChanges` | `boolean` | 脏检查标志，驱动自动保存 |
| `past` | `any[]` | 撤销历史栈 (最多 50 步) |
| `future` | `any[]` | 重做历史栈 |

### 1.2 Store Actions

| Action | 说明 |
| :--- | :--- |
| `createProject(title, templateId?)` | 创建新项目，返回项目 UUID |
| `loadProject(idOrData, templateId?, filePath?)` | 异步加载项目，执行 V3 迁移，同步 Electron 上下文 |
| `updatePage(updatedPage, silent?)` | 更新页面；`silent=true` 跳过历史记录写入 |
| `addPage(ratio, layoutId)` | 追加新页面，继承当前主题样式 |
| `removePage(id)` | 删除页面 (至少保留 1 页) |
| `reorderPages(newPages)` | 页面重排序 |
| `setTheme(update, applyToAll?)` | 更新主题；`applyToAll=true` 同步到所有页面 |
| `setDesignSystem(ds)` | 更新设计令牌系统 |
| `setCounterStyle(style)` | 设置页码样式并同步到所有页面 |
| `setPrintSettings(settings)` | 更新打印设置 |
| `pushHistory()` | 快照当前状态到撤销栈 |
| `undo()` / `redo()` | 撤销/重做 |
| `markAsSaved()` | 清除脏标记 (`hasUnsavedChanges = false`) |

---

## 2. 撤销/重做：深度快照机制

我们没有使用传统的命令模式 (Command Pattern)，而是使用了更简单的 **快照模式**。

### 2.1 历史栈管理

- **触发时机**: 只有当发生真正的用户交互（如 `onBlur` 或按钮点击）时调用 `pushHistory()`，而非键盘输入的每一个字符。这防止了历史记录被微小增量填满。
- **深度限制**: `past` 栈默认保留最近 **50 步**操作（`slice(-50)`）。
- **不可变性**: 利用 `structuredClone()` 进行**深拷贝**（针对 `pages`、`theme`、`designSystem`、`printSettings`、`customFonts`），确保 Undo 后的状态不会被后续操作污染。
- **页面索引追踪**: 每个快照包含 `currentPageIndex`，撤销时会恢复正确的编辑页面位置。

### 2.2 快照内容

每次 `pushHistory()` 存储以下完整状态：

```typescript
{
  pages: PageData[],          // 深拷贝
  projectTitle: string,
  theme: ProjectTheme,        // 深拷贝
  designSystem: DesignSystem,  // 深拷贝
  printSettings: PrintSettings, // 深拷贝
  minimalCounter: boolean,
  counterStyle: CounterStyle,
  imageQuality: number,
  customFonts: CustomFont[],  // 深拷贝
  currentPageIndex: number,
}
```

### 2.3 Undo/Redo 流程

```
pushHistory():
  past.push(currentSnapshot)  ->  past.slice(-50)   // 限制深度
  future = []                                        // 清空重做栈

undo():
  currentSnapshot = deepClone(state)  ->  future.unshift(currentSnapshot)
  prevSnapshot = past.pop()           ->  restore state from prevSnapshot

redo():
  currentSnapshot = deepClone(state)  ->  past.push(currentSnapshot)
  nextSnapshot = future.shift()       ->  restore state from nextSnapshot
```

---

## 3. 跨页面全局同步算法

幻灯片应用的一个常见痛点是修改一处样式需要手动同步到所有页面。

### 3.1 `updatePage` 同步逻辑

当某个页面更新时，Store 会执行以下检查：

1. **全局字段识别**: 检查修改的字段是否属于 `GLOBAL_FIELDS` 集合：
   ```typescript
   const GLOBAL_FIELDS = ['backgroundPattern', 'footer', 'titleFont',
                          'bodyFont', 'logo', 'logoSize', 'counterColor'];
   ```
2. **条件广播**: 如果检测到全局字段变更，循环遍历 `pages` 数组，将该字段的新值应用到**所有页面**。
3. **静默更新**: `silent=true` 参数确保全局同步不触发额外的 `pushHistory()`，保持撤销栈整洁。

### 3.2 `setCounterStyle` 特殊处理

页码样式 `counterStyle` 通过专用的 `setCounterStyle()` action 处理，会显式调用 `pushHistory()` 并同步所有页面。

### 3.3 `setTheme` 全局应用

`setTheme(update, applyToAll=true)` 时，不仅更新 `theme`，还会同步 `backgroundColor`、`accentColor`、`titleFont`、`bodyFont` 到所有页面的对应字段。

---

## 4. 持久化循环：从内存到 IndexedDB

应用采用了 **Hybrid Auto-save** 三级缓存策略 (详见 [架构总览](../architecture/overview.md) 第 3 节)：

### 4.1 自动保存触发器

- **实时输入**: 键盘/选区变更直接写入 Zustand (内存)。
- **定时保存**: [EditorPage.tsx](src/pages/EditorPage.tsx) 中每 **3000ms** 检查 `hasUnsavedChanges`。
- **保存动作**: 调用 `saveToDB()` 将完整的 `ProjectData`（包含 version, title, pages, theme, designSystem 等）序列化存入 IndexedDB。
- **崩溃恢复**: 重启时，[loadProject()](src/store/useStore.ts#L112) 优先从 IndexedDB 读取，确保未手动保存的内容不丢失。

### 4.2 手动保存 (Ctrl+S)

1. 生成当前页面缩略图
2. 构建完整项目内容对象
3. Electron 环境: 调用 `nativeFs.saveProject()` → IPC → 主进程打包 .slgrid ZIP
4. Web 环境: 仅写入 IndexedDB
5. 更新 localStorage 中最近项目索引 (`magazine_recent_projects`)

---

## 5. 数据版本演进 (Migrations)

随着 Zine Mode 的引入，数据结构发生了巨大变化。

### 5.1 迁移流水线 ([v2-to-v3.ts](src/utils/migrations/v2-to-v3.ts))

当数据从磁盘或 IndexedDB 加载时，它流经以下迁移函数：

1. **资产解耦**: 将旧版 Base64 数据抽取为文件引用（`asset://` 协议）
2. **令牌注入**: 将默认的 `DesignSystem` 注入旧项目
3. **架构重组**: 将旧的 `titleFont` 配置映射到新的 `ProjectTheme.typography` 系统
4. **数据结构校验**: 确保输出数据符合最新 `ProjectData` 接口规范

### 5.2 调用位置

迁移在 `useStore.loadProject()` 中自动触发：

```typescript
const migratedData = migrateToV3(projectData);
```

这意味着所有旧项目文件在打开时都会自动升级到 V3+ 格式，无需用户手动操作。

---

## 6. 交互上下文：UIContext (`UIContext.tsx`)

除了持久化的项目数据，应用还维护了一个处理瞬时交互状态的上下文。

### 6.1 职责范围

- **全局弹窗 (Modals)**: 统一管理 `alert` 和 `confirm` 逻辑，解耦业务组件与 UI 实现。
- **消息通知**: 处理成功、警告或错误的即时反馈。

### 6.2 核心 API

- `alert(title, message)`: 触发全局警告弹窗。
- `confirm(title, message, onConfirm, options?)`: 触发带回调的确认弹窗。

### 6.3 使用方式

通过 `useUI()` Hook 在任意组件中访问：

```typescript
const { alert, confirm } = useUI();
```