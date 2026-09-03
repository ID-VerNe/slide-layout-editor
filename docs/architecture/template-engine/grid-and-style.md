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

### 3.2.5 网格计算

要使元素在网格中居中，使用以下公式：
- 水平居中：`colStart = (24 - colSpan) / 2 + 1`
- 垂直居中：`rowStart = (24 - rowSpan) / 2 + 1`

示例：创建一个 8x6 的居中元素：
```typescript
const centered = {
  colStart: 9,   // (24 - 8) / 2 + 1 = 9
  colSpan: 8,
  rowStart: 10,  // (24 - 6) / 2 + 1 = 10
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

1. **Modular 网格映射**: `modular.colStart/colSpan/rowStart/rowSpan` → CSS Grid 属性。`align` → `alignSelf`，`justify` → `justifySelf`。
2. **Preset 注入**: `presetKey` 从 `ds.presets.layout` 获取 padding 令牌，从 `ds.presets.effects` 获取效果样式。
3. **模板属性 (Props)**: 应用 Schema 中定义的固定样式，经 `evaluateObject()` 处理动态表达式。
4. **约束过滤 (Zine Filtering)**: **关键步骤**。通过 `ALLOWED_PROPS` 白名单过滤内联样式，通过 `filterZineClassName()` 剔除 forbidden 类名前缀 (`shadow-`, `blur-`, `animate-bounce` 等)。

### 5.1 允许的属性白名单

LayoutRenderer.tsx 中的 `ALLOWED_PROPS` 白名单：

```
gridColumnStart, gridColumnEnd, gridRowStart, gridRowEnd,
alignSelf, justifySelf,
display, flexDirection, alignItems, justifyContent, gap, flexWrap,
padding, paddingTop, paddingBottom, paddingLeft, paddingRight,
margin, marginTop, marginBottom, marginLeft, marginRight,
position, top, left, right, bottom, inset, zIndex,
opacity, mixBlendMode, transform, transition, transitionDuration,
width, height, maxWidth, maxHeight, minWidth, minHeight,
aspectRatio, overflow, background, backgroundImage, backgroundSize, backgroundPosition, backgroundRepeat,
backgroundColor, borderColor, borderWidth,
borderTopWidth, borderBottomWidth, borderLeftWidth, borderRightWidth,
borderStyle, textAlign, fontFamily, fontSize, fontWeight, lineHeight,
letterSpacing, textTransform, textDecoration, textDecorationLine, color, verticalAlign, visibility,
fontStyle, borderRadius, clipPath, writingMode, textOrientation, whiteSpace, transformOrigin
```

**注意**: `background` / `backgroundImage`（渐变与背景纹理）、`clipPath`（蒙版裁切）与 `textDecoration` 现已进入白名单支持。`writingMode` 和 `textOrientation` 支持竖排文字。

#### 智能样式合并与覆盖优先级 (Style Merging & Precedence)
在 `basePropsResolver` 与渲染引擎中，样式的合并层级与覆盖顺序严格如下：
1. **Level 1 (网格物理约束)**: 由 `modular` 属性计算出的 `gridColumnStart` 等，拥有最高的版面结构保全性。
2. **Level 2 (预设底色/基准样式)**: 由 `presetKey` 从 `ds.presets.layout` / `ds.presets.effects` 注入的通用预设样式（例如 `safe-area` 注入的基准 padding）。
3. **Level 3 (用户/模板个性化覆盖)**: 模板 Schema 中 `node.style` 与 `props.style`。**当用户或模板指定具体样式属性时，明确覆盖 Level 2 的预设值**（如预设 padding 24px，但该卡片指定了 12px 时以 12px 为准）。

引擎确保所有层级经过 `ALLOWED_PROPS` 白名单过滤后安全产出。

### 5.2 禁止的类名前缀

```
shadow-, blur-, drop-shadow-,
animate-bounce, animate-pulse, animate-wiggle
```

> **注意**: `rounded-*` 类名现已允许，以便配合 `ZineMedia` 的新圆角特性和 `ZineDivider` 的胶囊形状效果。
