# 布局与选择类字段

## 6. 布局/选择类字段

### 6.1 `VariantField`
动态布局切换器。通过按钮组切换 `page.layoutVariant` 的值。

- **文件**: `fields/VariantField.tsx`
- **绑定字段**: `page.layoutVariant`

**渲染规则**:
1. 优先从 Schema 的 `options` prop 获取选项，渲染为等宽按钮组
   - 按钮组列数根据 `options.length` 动态生成
   - 当前选中的选项高亮显示（白色背景 + 阴影）
   - 未选中时默认取 `options[0].value`
2. 若 Schema 未传入 `options`，则根据 `page.layoutId` 回退到硬编码布局：
   - `gallery-capsule` → 三选一：Under / Over / Minimal（标签 "Visual Scheme"，图标 `Layers`）
   - `film-diptych` → 二选一：Horizontal / Vertical（标签 "Split Direction"，图标 `Layout`）
   - 其他 → 二选一：Image Left / Image Right（标签取自 `label` prop 或 "Layout Orientation"，图标 `Layout`）
3. 选项标签直接使用传入的文本，不做自动转换
4. 未配置 options 且无匹配 layoutId 时，始终显示默认 left/right 切换，不会自动隐藏

**示例**: Schema 传入 `options: [{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }]` → 渲染两个按钮；或 `layoutId` 匹配 `gallery-capsule` → 渲染 Under / Over / Minimal 三个按钮

---

### 6.2 `ColorField`
颜色选择器。用 `Base.Input type="color"` 渲染。

- **文件**: `fields/ColorField.tsx`
- **绑定字段**: 取决于映射 (如 `backgroundColor` → `page.backgroundColor`)
- **图标**: `Palette`

### 6.3 `PageNumberField`
页码开关 (Toggle) + 样式选择。

- **文件**: `fields/PageNumberField.tsx`
- **绑定字段**: `page.pageNumber: boolean`
- **额外控件**: `counterStyle` (下拉选择 `number` / `alpha` / `roman` / `dots`)
- **图标**: `Hash`

### 6.4 `TitleYField`
标题 Y 轴偏移滑块。

- **文件**: `fields/TitleYField.tsx`
- **绑定字段**: `page.titleY`
- **控件**: `Slider`
- **图标**: `MoveVertical`

