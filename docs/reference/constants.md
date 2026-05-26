# 全局常量与配置参考 (Constants & Config)

本章记录了 SlideGrid Studio 中的全局设计参数、布局配置与静态资源映射。

---

## 1. 布局与画布配置 (`layout.ts`)

- **文件**: `src/constants/layout.ts`

### 1.1 比例与尺寸 (`LAYOUT_CONFIG`)
定义了编辑器画布在不同比例下的原始像素尺寸：

| 比例 | 宽度 (px) | 高度 (px) | 描述 |
| :--- | :--- | :--- | :--- |
| `16:9` | 1920 | 1080 | 标准宽屏 |
| `2:3` | 1080 | 1620 | 海报排版 |
| `A4` | 1240 | 1754 | 专业简历 (Resume 专用) |
| `1:1` | 1080 | 1080 | 正方形 |

### 1.2 编辑器 UI 常量
- `SIDEBAR_WIDTH`: 96px (左侧导航栏)
- `EDITOR_PANEL_WIDTH`: 400px (右侧编辑面板)

---

## 2. 图标系统 (`icons.ts`)

- **文件**: `src/constants/icons.ts`
- **图标库**: 基于 `lucide-react`。

### 2.1 `LUCIDE_ICON_MAP`
将字符串 ID 映射到具体的 Lucide 组件，用于模板 Schema 动态渲染图标。

### 2.2 `CATEGORIZED_ICONS`
用于图标选择器中的分组展示，包含：
- Technology & Infrastructure
- Science & Health
- Business & Finance
- Communication & Social
- Security & Interface

---

## 3. 设计系统令牌 (`theme.ts`)

- **文件**: `src/constants/theme.ts`
- **内容**: 预设的主题调色板、圆角等级（尽管 Zine 模式限制了圆角的使用）以及阴影定义。
