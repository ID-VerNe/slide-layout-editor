# 导出与打印系统

## 4. 导出系统

### 4.1 导出模式

支持两种格式、两种范围的组合：

| 格式 | 范围 | 说明 |
| :--- | :--- | :--- |
| PNG | 当前页 | 直接下载单张 PNG |
| PNG | 全部页 | 逐页渲染，Electron 下先选择目录再批量写入 |
| PDF | 当前页 | 当前页面转为 PDF |
| PDF | 全部页 | 多页 PDF (jsPDF, hotfixes: ["px_scaling"]) |

### 4.2 离屏无感导出管线 (`OffscreenExportRenderer` 与 `handleExport`)

在最新版本中，系统全面淘汰了“主画布剧烈切页捕获”的旧模式，转为采用**独立的离屏无感导出管线 (`OffscreenExportRenderer`)**：

```text
1. 用户触发导出，初始化导出进度与取消状态 (exportCancelledRef)
2. 激活离屏导出渲染器 (OffscreenExportRenderer):
   - 在用户视口不可见区域 (position: fixed, left: -9999px) 挂载独立的 1:1 纯净渲染容器
   - 彻底隔离主编辑视口，用户编辑画布无需切页、无需强制缩放、毫无画面闪烁
3. 针对每个目标导出页面:
   a. 离屏容器挂载目标 PageData
   b. 传入 disableAnimation={true}，旁路 Framer Motion 入场淡入动画，避免截获半透明帧
   c. 等待字体加载就绪 (document.fonts.ready) 与图片高保真渲染 (延时 600-800ms)
   d. toPng() 直接截取离屏 DOM 节点 (pixelRatio: 2)
   e. PNG: 创建下载链接 (带延时节流，防浏览器弹窗拦截) / Electron 下先弹出保存路径选择目录批量写入
   f. PDF: 基于 getExportDimensions(page, printSettings) 动态获取包含装订留白的物理宽高比，精准添加 jsPDF 页面，并自动注入简历链接注解
4. 导出完成，销毁离屏 DOM 节点，重置进度条
```

- **画布零干扰**: 主视口完全保持用户当前浏览的页面与缩放级别，导出在后台静默完成。
- **动画旁路保护**: 导出期间传入 `disableAnimation={true}`，跳过元素淡入动画，确保首帧即为 100% 完整绘制状态。
- **物理装订与比例自适应**: 通过 `getExportDimensions` 计算包含装订边（Gutter）的实际画幅，防止启用了物理留白时 PDF 画幅仍按原始 16:9 强行拉伸。
- **取消机制**: 通过 `exportCancelledRef` 可在导出过程中随时点击取消，组件卸载时自动中止。
- **PDF 简历链接**: 导出 PDF 时自动将 `data-url` 属性转换为可点击的 PDF 链接注解。
- **Electron 缩略图坐标保护**: 主进程 `capture-page-to-thumbnail` 对裁剪矩形坐标（x, y, width, height）进行 `Math.max(0, ...)` 钳制，防止负坐标引起崩溃。

### 4.3 导出配置

- **pixelRatio**: 2 (2x 分辨率)
- **backgroundColor**: 白色
- **过滤规则**: 排除非本站 CSS 链接
- **进度条**: 全屏动画显示百分比 (Framer Motion)

## 8. 打印设置 (Print Settings)

打印设置用于导出时添加装订线、裁切线等出版辅助元素：

```typescript
interface PrintSettings {
  enabled: boolean;
  widthMm: number;     // 页面宽度 (mm)
  heightMm: number;    // 页面高度 (mm)
  gutterMm: number;     // 装订线宽度
  showGutterShadow: boolean;  // 装订线阴影
  showTrimShadow: boolean;   // 裁切线阴影
  showContentFrame: boolean; // 内容框
  configs: {
    landscape: { bindingSide, trimSide };
    portrait: { bindingSide, trimSide };
    square: { bindingSide, trimSide };
    resume: { bindingSide, trimSide };
  }
}
```
