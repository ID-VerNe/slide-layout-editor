# JSON 模板存储架构改造可行性分析

## 背景

用户希望将当前基于 React 组件的模板系统改造为 JSON 配置文件驱动，核心需求：
- 只存储模板用什么 Component
- Component 放在什么位置
- 特殊的 Component 设置

## 当前架构分析

### 1. 模板系统现状

| 文件 | 职责 |
|------|------|
| `src/templates/registry.ts` | 模板配置（id, name, category, fields, supportedRatios） |
| `src/components/templateMap.ts` | React 组件动态导入映射 |
| `src/components/templates/*.tsx` | 22 个独立模板组件 |
| `src/components/Preview.tsx` | 使用 switch 语句渲染模板 |
| `src/components/Editor.tsx` | Schema 驱动的字段编辑器 |

**关键发现**：当前 `registry.ts` 已有 `fields: FieldSchema[]` 驱动的编辑器基础设施，模板系统部分符合 Schema 驱动理念。

### 2. 页面数据结构

```typescript
interface PageData {
  id: string;
  type: 'slide';
  layoutId: TemplateId;      // 引用模板
  aspectRatio: AspectRatioType;
  layoutVariant?: string;    // 布局变体
  title: string;
  subtitle?: string;
  // ... 更多内容字段
  styleOverrides?: Record<string, any>;  // 已有的样式覆盖机制
}
```

### 3. 当前模板示例分析

**CinematicFullBleed 布局结构**：
```
┌─────────────────────────────┐
│                             │
│      [SlideImage 背景]       │
│                             │
│  ┌───────────────────────┐  │
│  │  SlideSubHeadline     │  │
│  │  SlideHeadline        │  │
│  │  SlideBlockLabel      │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

关键点：
- 布局有多个 Zone（背景、标题区、元数据区）
- 存在条件渲染（`isTopMode` 决定标题位置）
- 组件间有嵌套和顺序关系

### 4. 现有原子组件

| 组件 | 用途 |
|------|------|
| SlideHeadline | 主标题 |
| SlideSubHeadline | 副标题 |
| SlideParagraph | 段落 |
| SlideImage | 图片 |
| SlideBlockLabel | 元数据标签 |
| SlideLogo | Logo |
| SlideMetric | 指标 |
| SlideIcon | 图标 |

---

## JSON 模板 Schema 设计

### 核心概念

1. **Component（组件）**：可复用的 UI 单元
2. **Node（节点）**：模板中的布局节点（Container、Leaf）
3. **Expression（表达式）**：数据绑定语法 `{page.title}`, `{theme.colors.background}`
4. **Template（模板）**：完整页面配置

### 关键技术挑战（来自代码审计）

#### 挑战 1：内联 JS 逻辑的转换

当前模板中包含大量内联逻辑：

```tsx
// 当前代码
const patternClass = pattern === 'grid' ? 'bg-grid-subtle' : 'bg-none';
return <div className={patternClass}>...</div>

// 或者
{mode === 'top' && <Header />}
{mode === 'bottom' && <Footer />}
```

**解决方案**：在 Renderer 中内置标准行为处理，而非将逻辑放入 JSON。

#### 挑战 2：Tailwind 动态类名

```tsx
// 这种模式需要 Expression Evaluator 处理
className={`bg-pattern-${page.backgroundPattern}`}
```

**解决方案**：
1. 预定义模式类映射
2. 或在 Renderer 中实现简单的模板字符串插值

#### 挑战 3：条件渲染

```tsx
{page.visibility?.logo !== false && <SlideLogo />}
```

**解决方案**：
```json
{
  "type": "SlideLogo",
  "bind": "page.logo",
  "visibleWhen": "page.visibility.logo"
}
```

---

### Node 类型定义

```typescript
type NodeType = 'Container' | 'Text' | 'Image' | 'Slide' | 'Conditional';

interface BaseNode {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

interface ContainerNode extends BaseNode {
  type: 'Container';
  layout: 'flex' | 'grid' | 'absolute';
  layoutProps?: FlexLayoutProps | GridLayoutProps | AbsoluteLayoutProps;
  children: TemplateNode[];
}

interface ComponentNode extends BaseNode {
  type: string;                          // e.g., "SlideHeadline", "SlideImage"
  bind?: string;                          // e.g., "page.title"
  props?: Record<string, any>;            // 组件特定 props
  visibleWhen?: string;                   // e.g., "page.visibility.title"
}

interface ConditionalNode extends BaseNode {
  type: 'Conditional';
  condition: string;                      // e.g., "page.layoutVariant === 'top'"
  then: TemplateNode;
  else?: TemplateNode;
}

type TemplateNode = ContainerNode | ComponentNode | ConditionalNode;
```

### Component 注册

```typescript
// 原子组件注册
const COMPONENT_REGISTRY: Record<string, React.FC<any>> = {
  'SlideHeadline': SlideHeadline,
  'SlideSubHeadline': SlideSubHeadline,
  'SlideImage': SlideImage,
  'SlideBlockLabel': SlideBlockLabel,
  'SlideLogo': SlideLogo,
  'SlideMetric': SlideMetric,
  'SlideParagraph': SlideParagraph,
  'SlideIcon': SlideIcon,
  // ... 其他
};
```

### Expression Evaluator 设计

用于处理数据绑定语法：

```typescript
// 绑定语法
"{page.title}"           // 简单字段绑定
"{theme.colors.primary}"  // 嵌套对象绑定
"{page.styleOverrides?.title?.fontSize}" // 可选链

// 模板字符串
"bg-pattern-{page.backgroundPattern}"

// Evaluator 实现
class ExpressionEvaluator {
  evaluate(expr: string, context: { page: PageData; theme: Theme }): any {
    // 解析 {xxx} 语法
    // 支持可选链 page.vis?.title
    // 支持嵌套 theme.xxx
  }

  interpolate(template: string, context: any): string {
    // 处理 "bg-pattern-{page.backgroundPattern}"
    return template.replace(/\{([^}]+)\}/g, (_, expr) => this.evaluate(expr, context));
  }
}
```

### Template Schema 结构

```typescript
interface TemplateSchema {
  id: string;
  name: string;
  category: string;
  supportedRatios: AspectRatioType[];
  root: TemplateNode;
  defaults?: Record<string, any>;
  meta?: {
    version: string;
    author?: string;
  };
}
```

### JSON 示例

**BigStatement JSON 化**：

```json
{
  "id": "big-statement",
  "name": "Big Statement",
  "category": "General",
  "supportedRatios": ["16:9"],
  "root": {
    "type": "Container",
    "layout": "flex",
    "layoutProps": { "align": "center", "justify": "center" },
    "className": "w-full h-full relative",
    "children": [
      {
        "type": "SlideHeadline",
        "bind": "page.title",
        "props": {
          "maxSize": 96,
          "minSize": 48,
          "className": "uppercase tracking-widest"
        },
        "className": "text-center"
      }
    ]
  }
}
```

**CinematicFullBleed JSON 化**：

```json
{
  "id": "cinematic-full-bleed",
  "name": "Cinematic Bleed",
  "category": "Cover",
  "supportedRatios": ["2:3"],
  "root": {
    "type": "Container",
    "layout": "relative",
    "className": "w-full h-full overflow-hidden",
    "children": [
      {
        "type": "Container",
        "layout": "absolute",
        "layoutProps": { "inset": 0 },
        "children": [
          { "type": "SlideImage" }
        ]
      },
      {
        "type": "Conditional",
        "condition": "page.layoutVariant === 'top'",
        "then": {
          "type": "Container",
          "layout": "absolute",
          "layoutProps": { "top": 128, "left": 0, "right": 0 },
          "layout": "flex",
          "layoutProps": { "direction": "column", "align": "center" },
          "children": [
            { "type": "SlideHeadline", "bind": "page.title", "props": { "italic": true } },
            { "type": "SlideSubHeadline", "bind": "page.subtitle" }
          ]
        },
        "else": {
          "type": "Container",
          "layout": "absolute",
          "layoutProps": { "bottom": 96, "left": 0, "right": 0 },
          "layout": "flex",
          "layoutProps": { "direction": "column", "align": "center" },
          "children": [
            { "type": "SlideSubHeadline", "bind": "page.subtitle" },
            { "type": "SlideHeadline", "bind": "page.title", "props": { "italic": true } }
          ]
        }
      }
    ]
  }
}
```

---

## 改造复杂度分析

### 低复杂度（可直接迁移）

| 部分 | 说明 |
|------|------|
| Component 注册表 | 只是把现有组件映射换个地方存 |
| 原子组件 | 已经存在，无需修改 |
| 字段绑定机制 | 已有 `fieldKey` 对应关系 |

### 中等复杂度（需要新增基础设施）

| 部分 | 说明 |
|------|------|
| Expression Evaluator | 处理 `{page.xxx}` 绑定语法 |
| Zod Validation | 运行时 Schema 校验 |
| Layout Renderer | 将 JSON 转为 React 组件树 |
| 条件渲染引擎 | 处理 ConditionalNode |

### 高复杂度（需要架构重构）

| 部分 | 说明 |
|------|------|
| 模板迁移 | 22 个模板逐个分析并 JSON 化 |
| Preview.tsx 重构 | switch → JSON 驱动的动态渲染 |
| 动态 Tailwind 类名 | `bg-pattern-{page.xxx}` 类模板字符串处理 |

---

## 改造方案对比

### 方案 A：完全 JSON 化（激进）

**优点**：
- 完全数据驱动，灵活度最高
- 可实现运行时模板切换
- 便于模板可视化编辑器

**缺点**：
- 工作量巨大（估计 3-6 个月）
- 复杂布局（条件渲染、嵌套）的 Schema 设计困难
- 失去 TypeScript 类型安全

**耗时**：⭐⭐⭐⭐⭐（极高）

### 方案 B：混合架构（推荐）

**思路**：
- 保持 React 组件作为"布局模板"
- JSON 只负责 Component 实例化和配置
- 逐步迁移简单模板，复杂模板保持 React

**优点**：
- 渐进式改造，风险可控
- 保留 React 的布局灵活性
- 关键数据可 JSON 化

**缺点**：
- 两套系统需要维护
- 边界不清晰

**耗时**：⭐⭐⭐（中等）

### 方案 C：增强现有系统（保守）

**思路**：
- 不改底层架构
- 增强 `styleOverrides` 和 `layoutVariant` 能力
- 添加更多模板配置选项

**优点**：
- 最小改动
- 风险最低
- 可快速见效

**缺点**：
- 无法实现真正的可视化编辑
- 模板扩展仍需代码修改

**耗时**：⭐（低）

---

## 推荐路径

### 阶段一：核心引擎开发（1-2 周）

1. 创建 `src/templates/schemas/` 目录
2. 定义 TypeScript 类型 (`TemplateNode`, `ComponentNode`, `ContainerNode`)
3. 创建 Component 注册表
4. **实现 Expression Evaluator**（关键）
5. **实现 Zod Validation Schema**
6. 实现基础的 Layout Renderer（支持 flex 和 absolute）

### 阶段二：试点模板（2-3 周）

1. 选择 2 个简单模板做试点（推荐：`BigStatement`, `MicroAnchor`）
2. 设计 Schema 并手动编写 JSON
3. 实现预览引擎的 Schema 渲染路径
4. 验证布局保真度（像素级对比）

### 阶段三：编辑器集成（1-2 周）

1. 修改 `Editor.tsx` 支持 Schema 驱动的字段渲染
2. 保持现有 `FieldRenderer` 机制
3. 模板切换时读取 Schema 而非 registry

### 阶段四：逐步扩展（持续）

1. 根据需求逐步迁移更多模板
2. 优化 Schema 语法和布局引擎
3. 如有需要，开发可视化 Schema 编辑器

---

## 影响评估

### 受影响的文件

| 文件 | 改动类型 |
|------|---------|
| `src/components/Preview.tsx` | 重构（switch → Schema 渲染） |
| `src/templates/registry.ts` | 新增 Schema 导出 |
| `src/types.ts` | 新增 Schema 类型 |
| `src/components/templates/*.tsx` | 迁移为 JSON Schema |
| `src/components/Editor.tsx` | Schema 驱动适配 |
| `src/components/editor/FieldRenderer.tsx` | 可能需要调整 |

### 不受影响的部分

- `src/store/useStore.ts`（状态管理不变）
- `src/utils/db.ts`（持久化逻辑不变）
- `src/hooks/*`（业务逻辑不变）
- 原子组件（SlideHeadline 等，保持不变）

---

## 风险与对策

| 风险 | 概率 | 影响 | 对策 |
|------|------|------|------|
| Schema 设计不合理 | 中 | 高 | 先做试点，迭代优化 |
| 布局保真度丢失 | 高 | 高 | 每个模板需要精确对比测试 |
| 性能下降 | 低 | 中 | 注意 memo 和虚拟化 |
| 迁移工作量大 | 高 | 低 | 分阶段，逐步迁移 |
| 内联逻辑难以 JSON 化 | 高 | 中 | Renderer 内置标准行为处理 |

---

## 关键决策点（需要用户确认）

1. **是否需要支持运行时模板创建？**
   - 影响 Schema 设计复杂度
   - 如果需要，需要更严格的 Validation

2. **优先迁移哪些模板？**
   - 建议从 `BigStatement`, `MicroAnchor` 开始
   - 复杂模板（如 `AppleBentoGrid`, `AcademicHybridResume`）保持 React

3. **是否需要保留 React 模板作为备选？**
   - 向后兼容考虑
   - Hybrid 模式支持

4. **动态 Tailwind 类名如何处理？**
   - 方案 1：预定义模式类映射表
   - 方案 2：Expression Evaluator 支持字符串插值

---

## 结论

**可行性**：✅ 技术上可行

**推荐方案**：方案 B（混合架构）

**预估工期**：
- 核心引擎：1-2 周
- 试点模板：2-3 周
- 编辑器集成：1-2 周
- 总计：约 4-7 周

**关键差异点**（相比初始方案）：
1. 增加了 **Expression Evaluator** 设计
2. 增加了 **Zod Validation**
3. 明确了 **Node 类型层次**（Container vs Component）
4. 识别了 **动态 Tailwind 类名** 这一特殊挑战
