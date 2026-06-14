# 结构化与辅助字段

## 4. 结构化字段

### 4.1 `ResumeSectionsField`
简历区块编辑。这是最复杂的字段组件之一，作为 `ResumeContentHub` 的入口。

- **文件**: `fields/ResumeSectionsField.tsx`
- **绑定字段**: `page.resumeSections: ResumeSection[]`

---

## 5. 辅助与通用字段

### 5.1 `ResumeContentHub` (核心/复杂)
简历模板的中心化内容管理器。

- **文件**: `src/components/editor/fields/ResumeContentHub.tsx`
- **功能**:
  - **区块管理**: 添加/删除/重命名简历大类 (Experience, Education 等)。
  - **条目编辑**: 每区块支持多条目输入（标题、时间、描述）。
  - **拖拽排序**: 基于 `framer-motion` 的区块与条目重排序。
  - **跨页迁移**: 支持将区块一键迁移至上一页或下一页的相同模板中。
- **数据结构**: `page.resumeSections: ResumeSection[]`

### 5.2 `GenericNumberField`
- **文件**: `fields/GenericNumberField.tsx`
- **用途**: 通用数值微调器，支持步长控制。

### 5.3 `SeparatorField`
- **文件**: `fields/SeparatorField.tsx`
- **用途**: 控制幻灯片中的分割线 (ZineDivider) 的视觉表现。
- **增强功能**:
  - **Thickness**: 精确控制线条粗细 (px)。
  - **Length**: 控制线条相对于单元格的长度 (%)。
  - **9 点对齐**: 支持在 Modular Grid 单元格内的 9 个方位贴靠（置顶、居中、置底、靠左、靠右等）。
- **图标**: `Minus`

---

## 7. 共享工具组件

### 7.1 `FieldWrapper`
所有字段控件的通用包装器。

- **文件**: `fields/FieldWrapper.tsx`

**渲染内容**:
1. 字段标签 (带图标)
2. 可见性开关 (Toggle Eye 图标)
3. 子内容 (children)

**Props**:

| 属性 | 类型 | 说明 |
| :--- | :--- | :--- |
| `icon` | `LucideIcon` | 字段图标 |
| `label` | `string` | 字段标签文本 |
| `isVisible` | `boolean` | 当前可见状态 |
| `onToggle` | `() => void` | 切换可见性 |
| `children` | `ReactNode` | 字段内容 |

### 7.2 `FieldToolbar`
字段级工具栏。操作按钮行。

- **文件**: `fields/FieldToolbar.tsx`

**可用操作** (受 `allowedActions` Props 控制):
- 重置默认值 (RotateCcw 图标)
- 细调样式 (Adjustments 图标)
- 可见性切换
- 自定义操作按钮

