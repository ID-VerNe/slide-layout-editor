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

### 4.2 导出流程 (`handleExport`)

支持两种导出格式、两种范围，由统一的 `handleExport(format)` 函数处理：

```text
1. 保存当前缩放值 (previewZoom)
2. 锁定缩放到 1:1 (setPreviewZoom(1))
2.5 激活 isExporting 状态，通知 PreviewArea 开启 disableAnimation，旁路 Framer Motion 的 opacity: 0 入场动画，杜绝捕获半透明幽灵帧
3. 等待字体加载完成 (document.fonts.ready)
4. 确定导出索引数组 (当前页 或 全部页)
5. 逐页:
   a. 切换到目标页面索引
   b. 等待 600-800ms (确保高保真字体与图片渲染就绪)
   c. toPng() 捕获预览区 DOM 为 DataURL (pixelRatio: 2)
   d. PNG: 创建下载链接 (带延时节流，防浏览器弹窗拦截) / Electron 下先选择目录批量写入
   e. PDF: 基于 getExportDimensions(page, printSettings) 动态获取包含装订留白的物理宽高比，精准添加 jsPDF 页面，并注入简历链接注解
6. 恢复缩放值、页面索引与动画状态
```

- **动画旁路保护**: 导出期间传入 `disableAnimation={true}`，跳过元素淡入动画，确保首帧即为 100% 完整绘制状态。
- **物理装订与比例自适应**: 通过 `getExportDimensions` 计算包含装订边（Gutter）的实际画幅，防止启用了物理留白时 PDF 画幅仍按原始 16:9 强行拉伸。
- **取消机制**: 通过 `exportCancelledRef` 可在导出过程中取消，组件卸载时自动触发。
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
