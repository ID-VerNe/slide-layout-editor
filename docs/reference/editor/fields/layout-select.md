# 布局与选择类字段

## 6. 布局/选择类字段

### 6.1 `VariantField`
模板变体切换器。将 `layoutVariant` 渲染为单选按钮组。

- **文件**: `fields/VariantField.tsx`
- **绑定字段**: `page.layoutVariant`

**渲染规则**:
1. 从模板配置 (`TemplateConfig.variants`) 获取可用变体
2. 渲染为单选按钮组 (`RadioGroup`)
3. 自动标签: 将 `snake_case` 转为 `Title Case`
4. 如果模板只有一个变体，自动设置为空字符串
5. 未配置 variants 时自动隐藏

**示例**: `page.layoutVariant = 'top'` → 渲染 "Top"、"Left"、"Bottom"、"Right" 等选项

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

