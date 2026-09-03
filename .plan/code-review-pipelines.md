# 全项目深度代码审查报告：六大核心链路逻辑漏洞与改进方案

> **审查范围**: 
> 1. 渲染 Pipeline (Rendering Pipeline)
> 2. 布局控制 Pipeline (Layout Control Pipeline)
> 3. 字体组件 Pipeline (Font Component Pipeline)
> 4. 输出 Pipeline (Export & Output Pipeline)
> 5. Editor 组件输入 Pipeline (Editor Component Input Pipeline)
> 6. Template 相关 Pipeline (Template Pipeline)

---

## 目录
- [一、渲染 Pipeline](#一渲染-pipeline)
  - [1.1 AnimatePresence 导致导出半透明与幽灵空白帧](#11-animatepresence-导致导出半透明与幽灵空白帧)
  - [1.2 Text 组件强制 DOMPurify 解析导致数学符号被吞噬](#12-text-组件强制-dompurify-解析导致数学符号被吞噬)
  - [1.3 useAssetUrl MIME 类型硬编码与尺寸缓存未命中](#13-useasseturl-mime-类型硬编码与尺寸缓存未命中)
  - [1.4 简历与卡片组件 overflow-y-auto 导致打印/导出被物理截断](#14-简历与卡片组件-overflow-y-auto-导致打印导出被物理截断)
- [二、布局控制 Pipeline](#二布局控制-pipeline)
  - [2.1 basePropsResolver 中 presetStyle 倒挂覆盖自定义样式](#21-basepropsresolver-中-presetstyle-倒挂覆盖自定义样式)
  - [2.2 styleWhitelist 审美白名单过度剪裁导致渐变与排版样式丢失](#22-stylewhitelist-审美白名单过度剪裁导致渐变与排版样式丢失)
  - [2.3 PreviewArea 画布拖拽事件丢失 mouseup 造成粘滞拖拽](#23-previewarea-画布拖拽事件丢失-mouseup-造成粘滞拖拽)
  - [2.4 calculateFitZoom 与机械打印模式的 PPI 及切边计算失准](#24-calculatefitzoom-与机械打印模式的-ppi-及切边计算失准)
- [三、字体组件 Pipeline](#三字体组件-pipeline)
  - [3.1 AutoFitHeadline 模块级缓存缺少容器物理宽度维度](#31-autofitheadline-模块级缓存缺少容器物理宽度维度)
  - [3.2 字体加载校验遗漏 Electron asset:// 协议](#32-字体加载校验遗漏-electron-asset-协议)
  - [3.3 FontManager 批量上传并发竞争导致状态丢失](#33-fontmanager-批量上传并发竞争导致状态丢失)
  - [3.4 AutoFit 计算期间 0.01 不透明度引发导出空白](#34-autofit-计算期间-001-不透明度引发导出空白)
- [四、输出 Pipeline](#四输出-pipeline)
  - [4.1 导出过程强耦合前台 UI 并依赖脆弱的 800ms 盲等](#41-导出过程强耦合前台-ui-并依赖脆弱的-800ms-盲等)
  - [4.2 印刷切边模式下 PDF 导出尺寸固定导致画面拉伸失真](#42-印刷切边模式下-pdf-导出尺寸固定导致画面拉伸失真)
  - [4.3 画布平移时 Electron 缩略图截取负坐标崩溃](#43-画布平移时-electron-缩略图截取负坐标崩溃)
  - [4.4 浏览器端多页 PNG 导出触发浏览器弹窗拦截](#44-浏览器端多页-png-导出触发浏览器弹窗拦截)
  - [4.5 OffscreenExportRenderer 处于未引用死代码状态](#45-offscreenexportrenderer-处于未引用死代码状态)
- [五、Editor 组件输入 Pipeline](#五editor-组件输入-pipeline)
  - [5.1 虚拟化滚动导致未提交防抖输入被静默丢弃 (缺少 Flush)](#51-虚拟化滚动导致未提交防抖输入被静默丢弃-缺少-flush)
  - [5.2 Editor.tsx 顶层 React.memo 遗漏 pages 导致跨页资产联动失效](#52-editortsx-顶层-reactmemo-遗漏-pages-导致跨页资产联动失效)
  - [5.3 滑动条微调高频触发 updatePage 撑爆撤销历史栈](#53-滑动条微调高频触发-updatepage-撑爆撤销历史栈)
  - [5.4 简历 Markdown 链接解析使用贪婪正则吞噬前序所有文本](#54-简历-markdown-链接解析使用贪婪正则吞噬前序所有文本)
  - [5.5 超过 5MB 状态快照静默跳过历史记录引发撤销断层](#55-超过-5mb-状态快照静默跳过历史记录引发撤销断层)
- [六、Template 相关 Pipeline](#六template-相关-pipeline)
  - [6.1 getTemplateById 返回 undefined 触发 Editor 顶层白屏崩溃](#61-gettemplatebyid-返回-undefined-触发-editor-顶层白屏崩溃)
  - [6.2 切换模板时新模板专属复杂结构未初始化与旧脏数据堆积](#62-切换模板时新模板专属复杂结构未初始化与旧脏数据堆积)
  - [6.3 数据迁移脚本误杀模板容器节点的 layout 属性](#63-数据迁移脚本误杀模板容器节点的-layout-属性)
  - [6.4 表达式引擎自动求值将以关键字开头的普通文本识别为代码](#64-表达式引擎自动求值将以关键字开头的普通文本识别为代码)
- [七、整改优先级与路线图](#七整改优先级与路线图)

---

## 一、渲染 Pipeline

### 1.1 AnimatePresence 导致导出半透明与幽灵空白帧
- **文件定位**: [`src/components/Preview.tsx:L79-L86`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/components/Preview.tsx#L79-L86), [`src/pages/EditorPage.tsx:L248-L251`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/pages/EditorPage.tsx#L248-L251)
- **漏洞机理**:
  ```tsx
  <AnimatePresence mode="wait">
    <motion.div key={page.id + page.layoutId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
  ```
  在 `EditorPage.tsx` 中批量导出时，调用 `setCurrentPageIndex(idx)` 触发翻页动画。`AnimatePresence mode="wait"` 必须先完整执行上一页的退出动画（约 300ms），随后才挂载并执行下一页的进入动画（从 `opacity: 0` 渐变至 `1`，约 300ms）。由于导出流程仅使用了 `setTimeout(r, 800)` 盲等，在机器卡顿、图片加载中或字体未就绪时，800ms 到期时页面很可能正处于淡入中间态（`opacity: 0.2 ~ 0.7`）或上一页退出的残影状态。
- **危害**: 导出的 PDF/PNG 偶尔出现整页空白、半透明或双重重影。
- **修复方案**:
  向 `Preview` 传入 `disableAnimation?: boolean` 标志位。在导出渲染、离屏截图以及无须动效的静态捕获时，直接渲染原生 `div`，跳过 `motion.div` 的透明度补间。

### 1.2 Text 组件强制 DOMPurify 解析导致数学符号被吞噬
- **文件定位**: [`src/components/ui/slide/atoms/Text.tsx:L39-L45`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/components/ui/slide/atoms/Text.tsx#L39-L45), [`L83-L90`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/components/ui/slide/atoms/Text.tsx#L83-L90)
- **漏洞机理**:
  `Text.tsx` 中默认开启 `sanitize = true`，并将文本经由 `DOMPurify.sanitize(textContent)` 之后通过 `dangerouslySetInnerHTML={{ __html: sanitizedContent }}` 挂载到 DOM。
  如果用户在标题或正文中输入包含数学小于号的常规文本，例如 `"Revenue < $10M"`、`"Phase A < Phase B"` 或 `"Count < 5"`，HTML 解析器会将 `<` 后续字符作为未知 HTML 标签，因其不在白名单 `['b', 'i', 'em', 'strong', 'u', 'br', 'span']` 内而将其连同标签名直接丢弃，导致 `<` 以及其后的字符被凭空吞掉。
- **危害**: 常规文本比较符号被静默剔除，破坏展示内容的准确性。
- **修复方案**:
  区分纯文本与富文本。默认使用 React 原生子节点 `{children || textContent}` 进行文本转义展示；仅当明确指定 `isRichText={true}` 或包含受信任的 Markdown 转换时才启用 `dangerouslySetInnerHTML`。

### 1.3 useAssetUrl MIME 类型硬编码与尺寸缓存未命中
- **文件定位**: [`src/hooks/useAssetUrl.ts:L38-L56`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/hooks/useAssetUrl.ts#L38-L56)
- **漏洞机理**:
  1. `useAssetUrl.ts` 在 Electron 直读模式下：
     ```ts
     const mime = filename.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
     finalUrl = `data:${mime};base64,${base64Data}`;
     ```
     在 `archive-manager.ts` 中，所有位图资产都会被 Sharp 自动压缩转为 WebP（`.webp`）或保持为 JPEG（`.jpg`）。将其强制标记为 `image/png` 会导致部分 Chromium 底层绘图上下文在 `toPng` 捕获时出现色彩失真或解码失败。
  2. 当 `assetCache.has(assetSource)` 命中缓存时直接 `return`，若先前的图片尚在异步加载（尚未触发 `img.onload`），`dimensionCache` 仍为空。后挂载的组件取到 `{ width: 0, height: 0 }` 后便永远不会重新计算图片几何尺寸。
- **修复方案**:
  建立完整的文件扩展名到 MIME 映射表；将缓存从静态尺寸对象升级为记录尺寸加载状态的 Promise 锁。

### 1.4 简历与卡片组件 overflow-y-auto 导致打印/导出被物理截断
- **文件定位**: [`src/components/ui/slide/atoms/ZineResume.tsx:L70`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/components/ui/slide/atoms/ZineResume.tsx#L70)
- **漏洞机理**:
  `ZineResume.tsx` 在根容器上使用了 `overflow-y-auto`。当用户填写的项目经历、工作经历较多时，在编辑器中可以通过鼠标滚轮查看完整内容。但在导出 A4 PDF 或进行高精度位图截取时，`html-to-image` 和 `jsPDF` 只截取视口可见的像素区域，超出容器高度的部分直接被物理隐藏并截断丢弃，不会自动分页，也不会在导出产物中体现。
- **修复方案**:
  在简历等内容密度敏感的排版模板中引入页内内容溢出检测（[`pagesOverflow`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/hooks/usePreview.ts#L97)），超出单页时在编辑器内给出明确的“内容超出一页”告警，或提供自动拆分跨页（Multi-page Split）能力。

---

## 二、布局控制 Pipeline

### 2.1 basePropsResolver 中 presetStyle 倒挂覆盖自定义样式
- **文件定位**: [`src/templates/schemas/renderer/basePropsResolver.ts:L70-L76`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/templates/schemas/renderer/basePropsResolver.ts#L70-L76)
- **漏洞机理**:
  ```ts
  const filteredStyle: any = {};
  ALLOWED_CSS_PROPERTIES.forEach(p => {
    if ((finalStyle as any)[p] !== undefined) filteredStyle[p] = (finalStyle as any)[p];
    if ((presetStyle as any)[p] !== undefined) filteredStyle[p] = (presetStyle as any)[p];
  });
  finalStyle = filteredStyle;
  ```
  在白名单过滤循环中，若节点既绑定了 `presetKey`，又在 `style` 里声明了个性化覆盖（如自定义 `padding` 或 `color`），第 73 行的 `presetStyle` 会无条件覆盖已经计算好的 `finalStyle`。
- **危害**: 模板设计者在节点级声明的局部微调样式完全被全局预设绑死，无法生效。
- **修复方案**:
  颠倒覆盖次序：先取 `presetStyle[p]`，再以 `finalStyle[p]` 覆盖。

### 2.2 styleWhitelist 审美白名单过度剪裁导致渐变与排版样式丢失
- **文件定位**: [`src/templates/schemas/renderer/styleWhitelist.ts:L5-L20`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/templates/schemas/renderer/styleWhitelist.ts#L5-L20)
- **漏洞机理**:
  白名单中仅声明了 `backgroundColor`，排除了 `background` 和 `backgroundImage`；排除了 `textDecoration`；排除了 `clipPath`。导致在 Schema 声明渐变色填充（如 `linear-gradient`）、网格装饰背景、文字删除线或异形裁切时，所有样式在渲染前均被安全过滤器静默剔除。
- **修复方案**:
  将视觉表达常用的安全属性（`background`, `backgroundImage`, `textDecoration`, `textDecorationLine`, `clipPath` 等）补充进白名单。

### 2.3 PreviewArea 画布拖拽事件丢失 mouseup 造成粘滞拖拽
- **文件定位**: [`src/components/editor/PreviewArea.tsx:L97-L100`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/components/editor/PreviewArea.tsx#L97-L100)
- **漏洞机理**:
  `onMouseMove` 与 `onMouseUp` 直接绑定在容器 `div` 上。当用户按住鼠标拖动画布并迅速滑出浏览器视口、侧边栏或松开鼠标时，容器 `div` 无法触发 `onMouseUp` 事件，内部状态 `isDragging` 始终为 `true`。当光标重新移入时，画布会进入失控的“粘滞拖拽”状态。
- **修复方案**:
  在 `handleMouseDown` 中使用 `setPointerCapture` 或在 `window` 对象上注册全局一次性 `pointerup` / `mouseup` 监听。

### 2.4 calculateFitZoom 与机械打印模式的 PPI 及切边计算失准
- **文件定位**: [`src/hooks/usePreview.ts:L38-L45`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/hooks/usePreview.ts#L38-L45)
- **漏洞机理**:
  ```ts
  if (printSettings?.enabled) {
    const ppi = designDims.width / (printSettings.widthMm - (designDims.orientation === 'portrait' ? printSettings.gutterMm : 0));
    targetWidth = printSettings.widthMm * ppi;
    targetHeight = printSettings.heightMm * ppi;
  }
  ```
  该计算假定只有 `portrait` 会扣减装订留白（`gutterMm`），但如果用户的横版画册将装订边设在左侧（`bindingSide === 'left'`），或将立式画册装订在顶部（`bindingSide === 'top'`），该公式未考虑实际选定的装订边方向，导致 PPI 计算偏差，进而使自适应缩放比例（Fit Zoom）偏大或偏小。
- **修复方案**:
  根据 `printSettings.configs[orientation].bindingSide` 的实际轴向（水平轴还是垂直轴）动态扣除装订线留白。

---

## 三、字体组件 Pipeline

### 3.1 AutoFitHeadline 模块级缓存缺少容器物理宽度维度
- **文件定位**: [`src/components/AutoFitHeadline.tsx:L16-L22`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/components/AutoFitHeadline.tsx#L16-L22)
- **漏洞机理**:
  ```ts
  const fontCache = new Map<string, number>();
  const getCacheKey = (text: string, maxSize: number, fontFamily: string, maxLines: number, minSize: number) => {
    return `${text}-${maxSize}-${fontFamily}-${maxLines}-${minSize}`;
  };
  ```
  `AutoFitHeadline` 的缓存 Key **完全未包含容器宽度**。
  - 同一个大标题如果在 16:9 横屏（宽度 1920px）先计算并得出了 72px 字号；
  - 随后在 2:3 竖屏（宽度 1080px）或左侧栏微缩列表中渲染同一文本时，直接命中缓存返回 72px；
  - 导致竖屏排版严重溢出破框，而在横屏排版又可能因先渲染了缩略图而缩得极小；
  - 且全局 Map 无上限，用户长时间编辑会造成持续内存泄漏。
- **修复方案**:
  将容器宽度离散分桶后计入 Cache Key（如 `Math.round(containerWidth / 10) * 10`），并将 `fontCache` 替换为带有最大容量的 LRU 缓存。

### 3.2 字体加载校验遗漏 Electron asset:// 协议
- **文件定位**: [`src/utils/fontLoader.ts:L14-L21`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/utils/fontLoader.ts#L14-L21)
- **漏洞机理**:
  ```ts
  const isDataUrlValid =
    font.dataUrl.startsWith('data:font/') ||
    font.dataUrl.startsWith('data:application/x-font-') ||
    font.dataUrl.startsWith('data:application/font-') ||
    font.dataUrl.startsWith('http://') ||
    font.dataUrl.startsWith('https://') ||
    font.dataUrl.startsWith('blob:');
  ```
  在 Electron 桌面环境下，工程本地资源归档后使用的是自定义协议 `asset://font-hash.woff2`。此处校验白名单遗漏了 `asset://`，导致从已保存的本地工程读取自定义字体时，全部被控制台输出警告并跳过载入，文档字体强制退化为浏览器默认字体。
- **修复方案**:
  在 `isDataUrlValid` 白名单前缀中加入 `font.dataUrl.startsWith('asset://')`。

### 3.3 FontManager 批量上传并发竞争导致状态丢失
- **文件定位**: [`src/components/FontManager.tsx:L56-L63`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/components/FontManager.tsx#L56-L63)
- **漏洞机理**:
  用户多选字体文件后，`Array.from(files).forEach` 分别启动异步 `FileReader`。每个文件在读取完成后各自调用 `onFontsChange(prev => [...prev, newFont])`。由于父级 `GlobalSettings` 传下来的 `setCustomFonts` 缺少函数式更新保证，并发的异步回调会形成竞态覆盖，导致批量上传时经常只有 1~2 个字体真正保存进项目。
- **修复方案**:
  使用 `Promise.all` 聚合所有选中的文件，一次性将批量读取好的字体数组合并提交。

### 3.4 AutoFit 计算期间 0.01 不透明度引发导出空白
- **文件定位**: [`src/components/AutoFitHeadline.tsx:L197-L198`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/components/AutoFitHeadline.tsx#L197-L198)
- **漏洞机理**:
  为了避免二分查找字号时的文本跳动，组件在 `isCalculating = true` 时设置了样式 `opacity: 0.01`。
  当导出程序触发或切换页面时，若字体计算尚未收敛完成，`toPng` 会直接将 `0.01` 透明度的标题捕捉下来，导致导出的标题文字肉眼完全不可见。
- **修复方案**:
  计算期间使用不可见的离屏隐藏探测节点（Offscreen Probe Node）测算大小，可视节点始终保持稳定的真实透明度。

---

## 四、输出 Pipeline

### 4.1 导出过程强耦合前台 UI 并依赖脆弱的 800ms 盲等
- **文件定位**: [`src/pages/EditorPage.tsx:L246-L256`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/pages/EditorPage.tsx#L246-L256), [`L259-L272`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/pages/EditorPage.tsx#L259-L272)
- **漏洞机理**:
  多页导出逻辑直接劫持用户界面的 `setCurrentPageIndex(idx)`，并通过固定等待 `await new Promise(r => setTimeout(r, 800))`。
  - 在遇到多图、大图或慢速设备时，800ms 经常无法保证图片与字体加载完毕；
  - 导出过程中若用户误触键盘或鼠标切换了页面，会彻底打乱导出页面的顺序；
  - 代码库中专门编写了具备完整字体及图片监听的 [`OffscreenExportRenderer.tsx`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/components/editor/OffscreenExportRenderer.tsx)，但在业务页面中却完全未被调用。
- **修复方案**:
  启用离屏渲染队列，在隐藏容器中逐页构建并监听 `img.complete` 与 `document.fonts.ready`，渲染完毕后再执行截图，不再劫持前台界面。

### 4.2 印刷切边模式下 PDF 导出尺寸固定导致画面拉伸失真
- **文件定位**: [`src/pages/EditorPage.tsx:L258-L267`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/pages/EditorPage.tsx#L258-L267)
- **漏洞机理**:
  当开启机械印刷排版（`printSettings.enabled = true`）时，Preview 渲染的画布物理高为 `designDims.width * (heightMm / widthMm)`。
  但 PDF 生成逻辑写死：
  ```ts
  const doc = new jsPDF({
    unit: 'px',
    format: [LAYOUT_CONFIG[pages[0].aspectRatio].width, LAYOUT_CONFIG[pages[0].aspectRatio].height]
  });
  ```
  后续 `doc.addImage` 也强制指定该静态宽高。这导致带出血切边的画册在导出为 PDF 时被强制压缩为无出血的标准比例，画面发生肉眼可见的纵向拉伸与几何失真。
- **修复方案**:
  根据页面当前实际的 Canvas 宽高（考虑 `printSettings`）动态传入 `jsPDF` 页面尺寸与图片绘制范围。

### 4.3 画布平移时 Electron 缩略图截取负坐标崩溃
- **文件定位**: [`electron/main.ts:L134-L143`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/electron/main.ts#L134-L143), [`src/pages/EditorPage.tsx:L158-L160`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/pages/EditorPage.tsx#L158-L160)
- **漏洞机理**:
  Electron 主进程的 `capture-page-to-thumbnail` 处理函数直接将前端传来的 `rect` 传入 `win.webContents.capturePage({ x, y, width, height })`。当用户在画布中进行过平移，使页面一部分超出视口左上边缘时，`rect.x` 或 `rect.y` 为负值，Electron 底层 Chromium 会抛出 Native 错误，导致自动保存缩略图失败。
- **修复方案**:
  在主进程对 `rect` 进行合法性夹紧裁剪（Clamp），确保 `x, y >= 0` 且不超出窗口物理尺寸。

### 4.4 浏览器端多页 PNG 导出触发浏览器弹窗拦截
- **文件定位**: [`src/pages/EditorPage.tsx:L274-L283`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/pages/EditorPage.tsx#L274-L283)
- **漏洞机理**:
  在非 Electron 的浏览器环境中执行“导出所有页面为 PNG”时，代码在循环中快速调用 `link.click()` 尝试连续下载几十个文件。主流现代浏览器（Chrome / Edge / Safari）具有防流氓下载弹窗机制，会在第 2~3 个文件触发拦截，提示用户“是否允许下载多个文件”，未被允许的后续图片全部丢失。
- **修复方案**:
  在 Web 环境下使用 `JSZip` 将所有页面的 PNG 打包为一个 `.zip` 压缩包，一次性触发单次下载。

### 4.5 OffscreenExportRenderer 处于未引用死代码状态
- **文件定位**: [`src/components/editor/OffscreenExportRenderer.tsx`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/components/editor/OffscreenExportRenderer.tsx)
- **漏洞机理**:
  该文件本应承担优雅的后台静默离屏导出任务，但项目中全局没有任何一个文件 import 它。它是未连接到流水线的孤岛组件。
- **修复方案**:
  将其纳入 `EditorPage` 或 `useProject`，彻底替换 `EditorPage` 中前台翻页 + `setTimeout(800)` 的高风险实现。

---

## 五、Editor 组件输入 Pipeline

### 5.1 虚拟化滚动导致未提交防抖输入被静默丢弃 (缺少 Flush)
- **文件定位**: [`src/components/Editor.tsx:L33-L38`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/components/Editor.tsx#L33-L38), [`src/hooks/useDebouncedValue.ts:L43-L50`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/hooks/useDebouncedValue.ts#L43-L50)
- **漏洞机理**:
  `Editor.tsx` 使用 `@tanstack/react-virtual` 实现了右侧字段列表的虚拟滚动。各个输入框基于 `useDebouncedValue` 实现 300ms 防抖更新。
  当用户在某输入框键入大段文本后，立刻向下滚动面板准备编辑下一个字段时，当前虚拟行滑出视口被虚拟化容器**强制卸载（Unmount）**。
  在组件卸载时，`useDebouncedValue` 的 cleanup 仅执行了 `clearTimeout(handler)`。由于缺乏 `flush` 机制，尚未到期的 300ms 计时器连同用户刚刚键入的内容被彻底销毁，输入内容被静默丢弃。
- **危害**: 严重的数据丢失隐患，用户滚动面板或快速按快捷键保存时内容经常丢失。
- **修复方案**:
  在 `useDebouncedValue` 中提供 `flush` 机制，在组件 unmount 或 input `onBlur` 时，若存在待提交的变更，强制立即调用 `onChange`。

### 5.2 Editor.tsx 顶层 React.memo 遗漏 pages 导致跨页资产联动失效
- **文件定位**: [`src/components/Editor.tsx:L95-L100`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/components/Editor.tsx#L95-L100)
- **漏洞机理**:
  `Editor.tsx` 接收了全量页面数组 `pages` 并透传给各字段（如 `ResumeContentHub`, `ImageField` 跨页素材调取），但在其自定义的 memo 比较函数中：
  ```ts
  const pageEqual = shallowEqual(prevProps.page, nextProps.page);
  const onUpdateEqual = prevProps.onUpdate === nextProps.onUpdate;
  const fontsEqual = shallowEqual(prevProps.customFonts, nextProps.customFonts);
  return pageEqual && onUpdateEqual && fontsEqual;
  ```
  完全未比较 `pages` 的变动。这导致当用户在其他页面新增图片或修改章节时，当前页面的素材与章节关联下拉菜单无法感知更新。
- **修复方案**:
  在对比函数中加入对 `prevProps.pages === nextProps.pages` 的校验。

### 5.3 滑动条微调高频触发 updatePage 撑爆撤销历史栈
- **文件定位**: [`src/components/editor/fields/ImageField.tsx:L66-L73`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/components/editor/fields/ImageField.tsx#L66-L73)
- **漏洞机理**:
  在图片缩放和平移滑动条中，滑动过程中持续高频触发 `handleConfigChange` 并调用 `onUpdate(..., false)`。每次调用都触发 Zustand 的 `pushHistory()`。用户单次拖动滑块就会在历史栈中产生几十个连续快照，瞬间耗尽历史记录的 50 个槽位，破坏撤销/重做功能的使用价值。
- **修复方案**:
  滑动过程中调用 `onUpdate(page, true)`（静默更新，不记入历史），仅在滑动结束（`onPointerUp` / `onChangeEnd`）时记录一次历史快照。

### 5.4 简历 Markdown 链接解析使用贪婪正则吞噬前序所有文本
- **文件定位**: [`src/components/ui/slide/utils/resumeParser.ts:L8`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/components/ui/slide/utils/resumeParser.ts#L8)
- **漏洞机理**:
  ```ts
  text.replace(/.*\[(.*?)\].*\((.*?)\)/g, `<a href="$2" ...>$1</a>`)
  ```
  首部的 `.*` 为贪婪匹配。如果文本为：
  `"Developed [Project A](https://a.com) and maintained [Project B](https://b.com) successfully."`
  贪婪的 `.*` 会直接匹配到第二个链接之前的全部内容，并把整行文本替换为仅剩第二个链接标签，前面的所有文字描述及前序链接全部被抹杀。
- **修复方案**:
  更换为标准非贪婪 Markdown 链接匹配正则：`/\[([^\]]+)\]\(([^)]+)\)/g`。

### 5.5 超过 5MB 状态快照静默跳过历史记录引发撤销断层
- **文件定位**: [`src/store/useStore.ts:L252-L265`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/store/useStore.ts#L252-L265)
- **漏洞机理**:
  在 `pushHistory` 中，当工程序列化大小超过 5MB 时，代码直接 `return` 跳过入栈。如果项目中包含几张较大的图片，用户后续进行的文字编辑将永远无法撤销，发生撤销断层。
- **修复方案**:
  历史快照中应对大型静态资源进行哈希脱敏或引用化存储，避免重复序列化大体积 Base64，保障历史栈链路不断裂。

---

## 六、Template 相关 Pipeline

### 6.1 getTemplateById 返回 undefined 触发 Editor 顶层白屏崩溃
- **文件定位**: [`src/components/Editor.tsx:L23-L36`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/components/Editor.tsx#L23-L36), [`src/templates/registry.ts:L760-L762`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/templates/registry.ts#L760-L762)
- **漏洞机理**:
  若工程中记录的 `page.layoutId` 在当前模板注册表中不存在（如已被删除的废弃模板或外部导入文件），`getTemplateById` 返回 `undefined`。
  随后在 `Editor.tsx` 中直接执行：
  ```ts
  count: template.fields.length + 1
  ```
  引发运行时 `TypeError: Cannot read properties of undefined (reading 'fields')`，导致整个 React 应用白屏崩溃。
- **修复方案**:
  使用 `template?.fields?.length || 0`，并在 `!template` 时渲染友好的降级占位组件。

### 6.2 切换模板时新模板专属复杂结构未初始化与旧脏数据堆积
- **文件定位**: [`src/pages/EditorPage.tsx:L227`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/pages/EditorPage.tsx#L227), [`src/store/useStore.ts:L19-L52`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/store/useStore.ts#L19-L52)
- **漏洞机理**:
  切换现有页面模板时，代码仅执行：
  `updatePage({ ...currentPage, layoutId: layoutId as any, aspectRatio: selectedRatio })`
  若切换至具有专属结构的模板（如 `bilingual-glossary` 必须有 `vocabItems`，`apple-bento-grid` 必须有 `bentoItems`），新模板无法获取必需的数据结构，渲染出空态或崩溃；且原模板独有的数十个私有字段依然残留在页面数据中。
- **修复方案**:
  切换模板时，调用类似于 `getDefaultPage` 的逻辑，合并新模板的 `defaultData` 与默认字段值，确保新模板结构完整。

### 6.3 数据迁移脚本误杀模板容器节点的 layout 属性
- **文件定位**: [`src/utils/migrations/v2-to-v3.ts:L48-L52`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/utils/migrations/v2-to-v3.ts#L48-L52)
- **漏洞机理**:
  数据迁移脚本中存在无差别递归转换：
  ```ts
  if (key === 'layout' && typeof value === 'string') {
    result.layoutId = LAYOUT_ID_MAP[value] || value;
    continue;
  }
  ```
  在包含 `ContainerNode` 的模板 Schema 中，容器节点的布局模式字段正是 `layout: 'grid'` 或 `layout: 'modular'`。该脚本在处理嵌套结构时，会将所有容器的 `layout` 属性错误重命名为 `layoutId` 并删除原 `layout` 字段。
  导致渲染器无法读取容器布局类型，所有 Grid 和 24 格模块化网格全部退化为默认的 Flex 布局，版面严重坍塌。
- **修复方案**:
  严格限制该字段重命名仅在具有 `pages` 属性的顶层页面对象上生效，严禁作用于模板子节点。

### 6.4 表达式引擎自动求值将以关键字开头的普通文本识别为代码
- **文件定位**: [`src/templates/schemas/expressionEvaluator.ts:L435-L444`](file:///c:/Users/VerNe/Downloads/Documents/slide-layout-editor/src/templates/schemas/expressionEvaluator.ts#L435-L444)
- **漏洞机理**:
  为了支持免花括号的简写绑定，引擎增加了自动嗅探求值：
  ```ts
  const firstIdentMatch = obj.trim().match(/^([A-Za-z_$][A-Za-z0-9_$]*)/);
  if (firstIdentMatch && Object.prototype.hasOwnProperty.call(context, firstIdentMatch[1])) {
    return this.evaluate(obj, context);
  }
  ```
  当用户在标题中输入正常的英文短语（如 `"page 1"`、`"theme of design"`、或 Repeater 循环内的 `"item details"`）时，首个单词恰好命中了 context 变量名（`page`, `theme`, `item`）。
  引擎将其当做表达式解析，输入 `"page 1"` 会被直接转换为 `[object Object]`；输入包含减号的短语（如 `"page-break"`）甚至会被计算为 `NaN`。
- **修复方案**:
  全面取消裸字符串隐式自动求值，强制要求所有动态表达式必须严格包裹在 `{...}` 中，杜绝歧义。

---

## 七、整改优先级与路线图

| 优先级 | 影响链路 | 核心漏洞及影响 | 涉及模块 |
| :--- | :--- | :--- | :--- |
| **P0 紧急** | Editor 输入 | 虚拟滚动快速划走时丢失刚刚输入的文字（缺少 Flush） | `useDebouncedValue.ts`, `Editor.tsx` |
| **P0 紧急** | 渲染/输出 | 动效延迟与静态 800ms 导致导出文件偶发半透明或空白 | `Preview.tsx`, `EditorPage.tsx` |
| **P0 紧急** | Template | 缺失或下线模板直接引发 Editor 顶层白屏崩溃 | `Editor.tsx`, `registry.ts` |
| **P1 严重** | 字体组件 | AutoFit 缓存未记录容器宽度导致不同屏幕宽高比字号溢出 | `AutoFitHeadline.tsx` |
| **P1 严重** | Template | 数据迁移脚本误将容器节点的 `layout` 属性抹杀为 `layoutId` | `v2-to-v3.ts` |
| **P1 严重** | 渲染/输出 | 印刷切边模式下导出的 PDF 宽高比失真拉伸 | `EditorPage.tsx` |
| **P2 重要** | Editor 输入 | 简历链接正则贪婪匹配吃掉整行前序正文 | `resumeParser.ts` |
| **P2 重要** | 布局控制 | 画布拖拽甩出视口时丢失 mouseup 导致粘滞拖拽 | `PreviewArea.tsx` |
| **P2 重要** | 渲染 | 文本原子组件强制 HTML 过滤吃掉包含 `<` 的正常字符 | `Text.tsx` |
| **P2 重要** | 字体组件 | 自定义字体协议校验遗漏 Electron `asset://` 导致本地字体失效 | `fontLoader.ts` |
| **P2 重要** | Template | 切换模板时新模板复杂数组字段未初始化与旧数据堆积 | `EditorPage.tsx` |
