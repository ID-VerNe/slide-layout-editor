# 术语表与规范定义 (Glossary)

本章定义了 SlideGrid Studio 开发中涉及的核心概念，确保团队沟通语境的一致性。

---

## 1. 排版与布局 (Layout)

### 24x24 模块化网格 (Modular Grid)
项目的基础坐标系。将页面横向和纵向各等分为 24 份。所有组件的位置和尺寸均基于此网格单元（Units）。

### 8px 基线网格 (Baseline Grid)
垂直方向的微观约束。所有的行高、间距、位移必须是 8px 的倍数，以确保印刷级的精密对齐。

### 响应式缩放 (Responsive Scale)
虽然网格是固定的（24x24），但其物理尺寸会根据容器的宽高比动态缩放。这保证了排版逻辑在 A4、16:9 或手机屏幕上保持绝对比例一致。

---

## 2. 设计系统 (Design System)

### 设计令牌 (Design Token)
UI 的原子化属性，如 `color.primary`, `typography.body.fontSize`。禁止在代码中硬编码 Hex 色值。

### 原子组件 (Zine Atom)
最小的可复用渲染单元。它们不具备复杂的业务逻辑，仅负责消费 Token 并将数据渲染为符合 SPEC 规范的视觉形式。

### 样式流水线 (Style Pipeline)
样式从 Schema 属性到最终 CSS 的转化过程，包含 Token 注入、基线微调和属性过滤。

---

## 3. 数据与工程 (Data & Project)

### `.slgrid` 工程文件
SlideGrid Studio 的专有归档格式。本质上是一个包含 `project.json` 和 `assets/` 文件夹的 ZIP 压缩包。

### `asset://` 协议
应用定义的虚拟协议。用于在渲染进程中安全地引用存放在磁盘上的、属于该工程的图像资产。

### 脏检查 (Dirty Check)
一种状态监控机制（`hasUnsavedChanges`）。当 Store 中的数据与上次保存的版本不一致时触发，驱动 UI 显示“未保存”状态并触发自动保存。

---

## 4. 角色与进程 (Roles)

### 主进程 (Main Process)
Electron 的后端环境。负责磁盘 IO、Sharp 图像处理、归档打包及窗口管理。

### 渲染进程 (Renderer Process)
Electron 的前端环境（React）。负责 UI 交互、模板计算及动画表演。

### 预加载脚本 (Preload Script)
双进程之间的“翻译官”。通过 ContextBridge 暴露安全的 API 供渲染进程调用。
