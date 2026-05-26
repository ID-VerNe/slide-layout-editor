# UI 复合与功能组件 (Molecules & Features)

这些组件位于 `src/components/ui/` 和 `src/components/editor/`，提供了通用的交互功能和编辑器支持。

---

## 1. 基础 UI 库 (Base UI)

### 1.1 `Base` 原子组件集
位于 `src/components/ui/Base.tsx`，遵循项目视觉规范的样式化表单组件：
- `Base.Input`: 文本输入。
- `Base.TextArea`: 多行输入。
- `Base.Label`: 带图标的标签。
- `Base.Slider`: 带数字输入的滑块。

### 1.2 通用交互
- **`Modal`**: 通用浮层容器，支持 alert/confirm/custom 模式。
- **`FontSelect`**: 支持本地自定义字体的预览下拉框。
- **`IconPicker`**: 样式化的图标选择器。

---

## 2. 模板辅助功能

- **`TemplatePreview`**: 自动化蓝图渲染引擎，用于预览卡片。
- **`TemplateErrorBoundary`**: 模板级错误隔离。
- **`TemplateLoader`**: 加载状态反馈。

---

## 3. 编辑器核心组件

- **`Editor` / `EditorPanel`**: 编辑器主容器。
- **`FieldRenderer`**: 基于 Schema 的动态字段分发。
- **`Sidebar` / `TopNav`**: 导航与工具栏。
- **`PreviewArea`**: 管理预览缩放与适配。
- **`OffscreenExportRenderer`**: 高质量离屏导出引擎。

---

## 4. 系统级功能组件

### 4.1 `FontManager`
- **文件**: `src/components/FontManager.tsx`
- **职责**: 负责自定义字体的上传、解析、存储（IndexedDB/FileSystem）以及在预览中的动态加载。

### 4.2 `GlobalSettings`
- **文件**: `src/components/editor/GlobalSettings.tsx`
- **涵盖内容**: 全局主题色调、字体配对、图片质量、页码样式及打印参数配置。

### 4.3 `Preview`
- **文件**: `src/components/Preview.tsx`
- **职责**: 编辑器中央视图的顶级入口，集成 `usePreview` 钩子，管理缩放、背景渲染与溢出警告。
