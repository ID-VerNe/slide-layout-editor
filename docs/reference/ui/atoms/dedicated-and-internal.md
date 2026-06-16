# 专用与内部原子组件

## 5. 专用原子组件

### 5.1 `ZineResume`
简历专用原子组件，封装了简历区块的完整渲染逻辑。

- **文件**: `src/components/ui/slide/atoms/ZineResume.tsx`
- **数据来源**: `page.resumeSections: ResumeSection[]`
- **Props**: `page`, `className`, `style`（以及通过 `[key: string]: any` 透传的额外属性）
- **内部实现**:
  - 使用 `useModularStyle` 解析样式 Token，`fieldKey` 固定为 `'resume'`。
  - accent 颜色从 `theme.colors.accent` 或 `#264376` 读取。
  - 逐区块渲染：标题 + 分割线 + 条目列表（职位、时间、描述）。
  - 支持 Markdown 格式描述文本（`description` 字段）——通过 `parseContent()` 自定义解析器处理 `**bold**`、`*italic*`、`` `code` ``、`[text](url)` Markdown 语法，并用 DOMPurify 清理。
  - `renderDescription()` 将描述按换行符分段，支持 `-`/`*`/`•` 开头的项目符号列表。
  - 自动排版间距与分割线（accent 颜色的细水平线分隔区块标题）。
  - 不依赖外部 Resume 组件，完全自包含。

---
## 6. 内部原子构建块

以下组件位于 `src/components/ui/slide/atoms/`，为原子组件内部使用的基础构建块：

- **`Text`** (`atoms/Text.tsx`): 最基础的文本渲染单元。
  - Props: `content`, `variant` (`'display' | 'body' | 'caption'`), `autoFit`, `maxSize`, `minSize`, `maxLines`, `lineHeight`, `className`, `style`, `children`, `as` (渲染的 HTML 标签, 默认 `'div'`), `sanitize` (DOMPurify 清理, 默认 `true`)。
  - `autoFit` 模式：启用 `AutoFitHeadline` 组件进行自动字号适配。
  - `sanitize=true` 时通过 `dangerouslySetInnerHTML` 渲染清理后的 HTML；`sanitize=false` 时直接渲染文本子节点。

- **`Icon`** (`atoms/Icon.tsx`): 原子化图标渲染器，基于 Material Symbols Outlined 字体图标。
  - Props: `name`, `size` (number|string, 默认 `24`), `color` (默认 `'currentColor'`), `className`, `style`。
  - 渲染为 `<span className="material-symbols-outlined">`。

- **`Image`** (`atoms/Image.tsx`): 原子化图片渲染器。
  - Props: `url`, `srcSet`, `variants`, `lqip`, `config` (`{ scale, x, y }`, 默认 `{ scale: 1, x: 0, y: 0 }`), `isLoading`, `priority`, `sizes`, `className`, `imgClassName`, `style`, `aspectRatio`, `onLoad`。
  - 支持 `<picture>` 元素与 WebP/AVIF `<source>` 标签。
  - LQIP 占位图（模糊 + 渐隐过渡）。
  - 加载状态时显示旋转动画（在没有 LQIP 时）。
  - 通过 `config.scale` 控制缩放、`config.x/y` 控制 `objectPosition`（映射为百分比）。
