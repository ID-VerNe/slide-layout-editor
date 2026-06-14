# 专用与内部原子组件

## 5. 专用原子组件

### 5.1 `ZineResume`
简历专用原子组件，封装了简历区块的完整渲染逻辑。

- **文件**: `src/components/ui/slide/atoms/ZineResume.tsx`
- **数据来源**: `page.resumeSections: ResumeSection[]`
- **核心功能**:
  - 逐区块渲染：标题 + 条目列表（职位、时间、描述）
  - 支持 Markdown 格式描述文本（`description` 字段）
  - 自动排版间距与分割线
  - 多页简历的页码连续性支持（`resumePageIndex`）

---
## 6. 内部原子构建块

以下组件位于 `src/components/ui/slide/atoms/`，为原子组件内部使用的基础构建块：

- **`Text`** (`atoms/Text.tsx`): 最基础的文本渲染单元。支持 `content` (HTML/纯文本)、`sanitize` (DOMPurify 清理)、`as` (HTML 标签) 等属性。
- **`Icon`** (`atoms/Icon.tsx`): 原子化图标渲染器，基于 Material Symbols Outlined 字体图标。支持 `name`、`size`、`color`、`weight` 参数。
- **`Image`** (`atoms/Image.tsx`): 原子化图片渲染器基础级别。支持 `url`、`objectFit`、`className` 等属性，提供加载状态和错误处理。
