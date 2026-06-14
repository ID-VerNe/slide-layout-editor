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
- **`PresetSelect`**: 受控预设选择器，用于字号/行高/字距等设计属性。

#### PresetSelect 组件

**文件**: `src/components/ui/PresetSelect.tsx`  
**用途**: 提供下拉选择器以强制使用预设值，确保设计一致性

**Props 接口**:
```typescript
interface PresetSelectProps<T extends string | number> {
  value: T;                          // 当前值
  options: PresetOption<T>[];        // 预设选项列表
  onChange: (value: T) => void;      // 变更回调
  label?: string;                    // 可选标签
}
```

**特性**:
- ✅ **泛型类型安全**: 支持 `number` 和 `string` 类型
- ✅ **自动值映射**: 非预设值自动映射到最接近的档位
- ✅ **紧凑 UI**: 小尺寸下拉框，适合编辑器侧边栏
- ✅ **实时预览**: 选择即生效，无需额外确认

**使用示例**:
```tsx
import { PresetSelect } from '../ui/PresetSelect';
import { FONT_SIZE_PRESETS } from '../../constants/editorPresets';

<PresetSelect
  value={page.styleOverrides?.artFont?.fontSize || 120}
  options={FONT_SIZE_PRESETS}
  onChange={(val) => updateFontSize('artFont', val)}
  label="Size"
/>
```

**自动值映射逻辑**:
```typescript
// 如果当前值不在预设中，找到最接近的预设
const closestOption = options.reduce((prev, curr) => 
  Math.abs(curr.value - value) < Math.abs(prev.value - value) 
    ? curr 
    : prev
);
```

#### `IconPicker` 组件

**文件**: `src/components/ui/IconPicker.tsx`  
**用途**: 统一的资产选择器，支持 Lucide / Material Symbols 图标、本地上传图片，以及**项目级历史图片复用**。

**Props 接口**:
```typescript
export type AssetTab = 'icons' | 'upload' | 'map' | 'history';

interface IconPickerProps {
  value: string;                        // 当前选中的资产值
  onChange: (val: string) => void;      // 选择回调
  trigger?: React.ReactNode;            // 自定义触发按钮
  allowedTabs?: AssetTab[];             // 允许显示的 Tab，默认 ['icons', 'upload', 'map']
  className?: string;
  pages?: PageData[];                   // 可选：传入项目全部页面，解锁 History Tab
}
```

**四大资产 Tab**:

| Tab | 标识 | 内容 | 默认显示 |
| :--- | :--- | :--- | :--- |
| **Icons** | `icons` | 分类的 Lucide / Material Symbols 图标，支持搜索与最近使用 | ✅ |
| **Images** | `upload` | 本地上传图片，经 `compressImage()` 处理后写入数据 | ✅ |
| **Map** | `map` | 预留的地图/资产映射入口 | ✅ |
| **History** | `history` | 展示当前项目中已使用过的图片，按使用频次倒排 | 仅在 `allowedTabs` 中声明且传入 `pages` 时显示 |

**核心行为**:

- **最近使用**: 通过 `localStorage` 的 `magazine_editor_recent_assets` 保存最近 18 个选中的资产，便于跨会话快速复用。
- **项目历史**: 当传入 `pages` 且允许 `history` Tab 时，`collectProjectImages()` 会扫描所有页面的以下字段：
  - `page.image`、`page.signature`、`page.logo`
  - `page.gallery[].url`
  - `page.features[].icon` / `page.features[].image`
  - `page.bentoItems[].icon` / `page.bentoItems[].image`
  - `page.partners[].logo`
  - `page.testimonials[].avatar`
  - `page.mosaicConfig.icons`

  扫描结果按使用频次降序排列，最多展示 **50 张**项目内已使用图片。

**使用示例**:
```tsx
<IconPicker
  value={page.logo}
  onChange={(val) => onUpdate({ ...page, logo: val })}
  allowedTabs={['upload', 'icons', 'history']}
  pages={pages}
/>
```

> 💡 在媒体类字段（Image / Logo / Gallery / Features / Bento / Partners / Testimonials / Signature / Mosaic）中，`pages` 已从 `EditorPage` 一路透传至 `IconPicker`，因此用户可直接在历史面板中快速复用项目已有的图片。

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
