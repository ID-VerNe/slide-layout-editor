# 24×24 网格与样式流水线

## 3. 24x24 模块化网格算法

项目弃用了传统的百分比布局，转而使用 **模块化坐标系**。

### 3.1 网格定义

```css
/* modular 布局容器的核心 CSS */
display: grid;
grid-template-columns: repeat(24, minmax(0, 1fr));
grid-template-rows: repeat(24, minmax(0, 1fr));
```

### 3.2 坐标映射

子节点的 `modular` 属性被映射为 CSS Grid 定位：

```typescript
// Schema 定义
modular: { colStart: 4, colSpan: 8, rowStart: 6, rowSpan: 12, align: 'center' }

// 渲染结果
style = {
  gridColumnStart: 4,
  gridColumnEnd: 'span 8',
  gridRowStart: 6,
  gridRowEnd: 'span 12',
  alignSelf: 'center'
}
```

**重要说明**：CSS Grid 的列线（grid lines）编号从 1 开始到 25 结束（共 25 条线形成 24 个格子）。因此：
- `colStart` 和 `rowStart` 的有效范围是 **1-24**（不是 0-23）
- 要使元素水平居中，使用公式：`colStart = (24 - colSpan) / 2 + 1`
- 例如：12 列宽的元素居中应设置 `colStart: 7`（即 (24-12)/2+1=7）

### 3.2.5 网格计算工具函数

项目提供了辅助函数简化网格计算：

```typescript
// 水平居中计算
function centerHorizontal(colSpan: number): number {
  return Math.floor((24 - colSpan) / 2) + 1;
}

// 垂直居中计算
function centerVertical(rowSpan: number): number {
  return Math.floor((24 - rowSpan) / 2) + 1;
}

// 示例：创建一个 8x6 的居中元素
const centered = {
  colStart: centerHorizontal(8),  // 9
  colSpan: 8,
  rowStart: centerVertical(6),    // 10
  rowSpan: 6
};
```

### 3.3 9 宫格对齐 (Self Alignment)

`modular.align` 和 `modular.justify` 允许子元素在网格单元内精确定位。目前所有 Zine 原子组件均已标准化支持此特性，允许它们在网格内“贴靠”：

- **组件感知**: `ZineMedia`, `ZineDisplay` 等内部会根据对齐属性自动调整宽高策略。如果没有对齐指令，则默认撑满；如果有，则收缩至内容大小并贴靠。
- `alignSelf`: 控制垂直方向 (`start` 置顶 / `center` 居中 / `end` 置底 / `stretch` 拉伸)
- `justifySelf`: 控制水平方向 (`start` 靠左 / `center` 居中 / `end` 靠右 / `stretch` 拉伸)


---

## 5. 样式流水线 (Style Pipeline)

渲染一个节点时，样式经过以下精密漏斗：

1. **令牌注入 (Tokens)**: 从 `DesignSystem` 注入基础字号、行高、字距等原子令牌。
2. **基线微调 (Baseline Adhesion)**: `useModularStyle` Hook 强制将行高对齐到 8px 网格。
3. **模板属性 (Props)**: 应用 Schema 中定义的固定样式，经 `evaluateObject()` 处理动态表达式。
4. **约束过滤 (Zine Filtering)**: **关键步骤**。通过 `ALLOWED_PROPS` 白名单 (41 个允许的 CSS 属性) 过滤内联样式，通过 `filterZineClassName()` 剔除 forbidden 类名前缀 (`rounded-`, `shadow-`, `blur-`, `animate-`)。

### 5.1 允许的属性白名单

```
gridColumnStart, gridColumnEnd, gridRowStart, gridRowEnd,
alignSelf, justifySelf,
display, flexDirection, alignItems, justifyContent, gap, flexWrap,
padding, paddingTop, paddingBottom, paddingLeft, paddingRight,
margin, marginTop, marginBottom, marginLeft, marginRight,
position, top, left, right, bottom, inset, zIndex,
opacity, mixBlendMode, transform, transition, transitionDuration,
width, height, maxWidth, maxHeight, minWidth, minHeight,
aspectRatio, overflow, backgroundColor, borderColor, borderWidth,
borderTopWidth, borderBottomWidth, borderLeftWidth, borderRightWidth,
borderStyle, borderRadius, textAlign, fontFamily, fontSize, fontWeight,
lineHeight, letterSpacing, textTransform, color, verticalAlign,
visibility, fontStyle
```

**注意**: `borderRadius` 已被允许，以便配合 `ZineMedia` 的圆角特性和 `ZineDivider` 的胶囊形状效果。

#### 智能样式合并 (Style Merging)
在 `renderComponent` 中，渲染引擎执行 **三级深度合并** 以保证定位优先级：
- **Level 1 (网格定位)**: 由 `modular` 属性计算出的 `gridColumnStart` 等。
- **Level 2 (默认层级)**: 组件默认 `zIndex: 1` 确保在容器背景之上。
- **Level 3 (自定义样式)**: 模板 Schema 中 `props.style` 定义的样式 (如 `opacity: 0.3`)。

引擎确保 Level 3 的自定义 `style` 对象**不会覆盖** Level 1 的定位属性，解决了样式冲突导致组件重置到左上角的 Bug。

### 5.2 禁止的类名前缀

```
shadow-, blur-, drop-shadow-,
animate-bounce, animate-pulse, animate-wiggle
```

> **注意**: `rounded-*` 类名现已允许，以便配合 `ZineMedia` 的新圆角特性和 `ZineDivider` 的胶囊形状效果。
