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
3. 等待字体加载完成 (document.fonts.ready)
4. 确定导出索引数组 (当前页 或 全部页)
5. 逐页:
   a. 切换到目标页面索引
   b. 等待 600-800ms (确保渲染完成)
   c. toPng() 捕获预览区 DOM 为 DataURL (pixelRatio: 2)
   d. PNG: 创建下载链接 / Electron 下先选择目录，再批量写入
   e. PDF: jsPDF.addImage() + 简历链接注解 (hotfixes: ["px_scaling"])
6. 恢复缩放值与页面索引
```

- **取消机制**: 通过 `exportCancelledRef` 可在导出过程中取消，组件卸载时自动触发
- **PDF 简历链接**: 导出 PDF 时自动将 `data-url` 属性转换为可点击的 PDF 链接注解

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
