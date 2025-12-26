# Slide Layout Editor (杂志排版编辑器) 🎨

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-1.0.0-blue)](https://github.com/ID-VerNe/magazine-layout-editor)

这是一个基于 **React 19** 和 **TypeScript** 开发的高级杂志排版编辑器。它旨在通过预设的专业级模板，帮助用户快速创作具有设计感的杂志封面和文章内页。支持中英双语对照排版，特别适合用于制作自媒体封面、电子杂志或视觉海报。

🔗 **项目仓库**: [https://github.com/ID-VerNe/magazine-layout-editor](https://github.com/ID-VerNe/magazine-layout-editor)

---

## ✨ 核心特性

- 🖼️ **多风格模板库**:
  - **Cover (封面)**: 经典编辑风、Impact 大排版、Cinematic 电影感、Blueprint 工程蓝图、Tabloid 报纸风、Typography 字体艺术。
  - **Article (内页)**: 现代分栏、工程蓝图。
- 📐 **A4 比例标准**: 支持固定 A4 比例显示，并具备内容**溢出自动检测**逻辑，确保打印与导出的视觉效果。
- 🔤 **高级字体管理**: 内置多种字体库，支持用户上传自定义字体并实时应用。
- 📸 **高质量导出**: 支持一键导出多页高分辨率 PNG 图片。
- 💾 **项目持久化**:
  - 自动保存至浏览器数据库，防止进度丢失。
  - 支持 `.wdzmaga` 专属项目文件导入与导出，方便跨设备编辑。
- 🛠️ **精细化调节**: 图片支持缩放、偏移（X/Y）调节；排版支持字号、行高、段间距的微调。

---

## 🚀 视觉展示

### 编辑器界面
![主页预览](public/previews/2025-12-26_160520.jpg)
![编辑器预览](public/previews/2025-12-26_155817.jpg)

### 内置模板风格
| 经典封面 (Classic) | 电影感 (Cinematic) | 蓝图封面 (Blueprint) | 冲击力 (Impact) |
| :--- | :--- | :--- | :--- |
| ![Classic](public/previews/classic.png) | ![Cinematic](public/previews/cinematic.png) | ![Blueprint](public/previews/blueprints.png) | ![Impact](public/previews/impact.png) |
| **报纸风 (Tabloid)** | **字体艺术 (Typography)** | **现代分栏 (Article)** | **蓝图文章 (Article)** |
| ![Tabloid](public/previews/tabloid.png) | ![Typography](public/previews/typography.png) | ![Modern Article](public/previews/modern.png) | ![Blueprint Article](public/previews/blueprints_article.png) |

---

## 🛠️ 技术栈

- **框架**: [React 19](https://react.dev/)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **构建工具**: [Vite](https://vitejs.dev/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **动画**: [Framer Motion](https://www.framer.com/motion/)
- **图标**: [Lucide React](https://lucide.dev/)
- **图片处理**: [html-to-image](https://github.com/tsayen/html-to-image)
- **路由**: [React Router 7](https://reactrouter.com/)

---

## 📦 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/ID-VerNe/magazine-layout-editor.git
cd magazine-layout-editor
```

### 2. 安装依赖
```bash
npm install
```

### 3. 启动开发服务器
```bash
npm run dev
```

---

## 🏗️ 项目结构说明

项目近期经过了深度重构，采用了高度模块化的架构：

- `src/hooks/`: 封装了 `useProject`（项目状态管理）和 `usePreview`（缩放与溢出检测）逻辑。
- `src/components/ui/`: 基础 UI 组件库（Input, Slider, FontSelect 等）。
- `src/components/editor/`: 编辑器拆分组件（Sidebar, TopNav, EditorPanel, PreviewArea）。
- `src/components/templates/`: 杂志模板核心逻辑。
- `src/utils/db.ts`: 基于本地存储的持久化方案。

---

## 📄 开源协议

本项目基于 **MIT License** 协议开源。详情请参阅 [LICENSE](LICENSE) 文件。

© 2025 **ID-VerNe**. 最后更新日期：2025年12月26日。

---

## 🤝 贡献与反馈

如果你有任何想法或建议，欢迎提交 Issue 或 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request
