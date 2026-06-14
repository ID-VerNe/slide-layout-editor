# 数据模型与类型系统参考

本文档完整记录了 SlideGrid Studio 中所有核心数据结构、类型定义及其关联关系。所有类型定义位于 `src/types.ts`。

---

## 1. 数据架构总览

```text
ProjectData (工程文件)
├── version: string          # 数据版本 "3.0.0"
├── title / projectTitle     # 工程标题
├── pages: PageData[]        # 核心页面数组 (见 §2)
├── theme: ProjectTheme      # 全局视觉主题 (见 §3)
├── designSystem: DesignSystem  # 设计令牌系统 (见 §4)
├── customFonts: CustomFont[]   # 自定义字体列表
├── imageQuality: number        # 图片压缩质量
├── counterStyle: CounterStyle  # 全局页码样式
├── printSettings: PrintSettings # 打印/出版设置
└── filePath?: string           # .slgrid 物理路径
```

---

## 目录

- [PageData 与嵌套集合类型](./page-data.md)
- [主题与布局系统](./theme-and-layout.md)
- [模板 Schema 类型](./template-schema.md)
- [辅助类型、预设与类型关系图](./presets-and-helpers.md)
