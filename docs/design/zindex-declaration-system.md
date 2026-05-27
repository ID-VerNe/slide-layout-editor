# Z-Index 声明系统 — 设计方案

## 一、设计目标

当前布局系统使用 `BaseNode.style` 中的 `zIndex` 硬编码为 `1`（见 `LayoutRenderer.tsx` line 300），缺乏灵活的分层能力。新方案需要支持：

| 声明方式 | 含义 | 效果 |
|---------|------|------|
| 不声明（默认） | `page.top` | 处于页面内容层的默认层级 |
| `bottom` | 最底层 | zIndex = 0，位于所有内容之下 |
| `page.top` | 显式声明页面内容层 | 与默认行为一致 |
| `MainPhoto.top` | 叠在 MainPhoto 之上 | 引用节点 zIndex + 1 |
| `MainPhoto.bottom` | 叠在 MainPhoto 之下 | 引用节点 zIndex - 1 |

同时将 `BaseNode.id` 提升为一等公民，作为 zIndex 引用和其他操作的锚点。

---

## 二、类型定义变更

**文件：`src/templates/schemas/types.ts`**

```typescript
// 新增：zIndex 声明类型
export type ZIndexKeyword = 'page.top' | 'bottom';
export type ZIndexReference = `${string}.top` | `${string}.bottom`;
export type ZIndexDeclaration = ZIndexKeyword | ZIndexReference;

// 修改：BaseNode 增加 zIndex 字段
export interface BaseNode {
  id?: string;       // 已有字段，现提升为：供 zIndex 引用时使用
  zIndex?: ZIndexDeclaration;  // 新增：层叠声明，默认 = 'page.top'
  // ... 其余不变（className, style, modular, presetKey, visibleWhen）
}
```

注：已有的 `AbsoluteLayoutProps.zIndex`（number 类型）保持不变，因为它只作用于 `layout: 'absolute'` 容器内部子元素的层级关系，属于局部 CSS 属性，与新系统的全局 zIndex 声明是两个独立的维度。新 `BaseNode.zIndex` 优先级更高，会覆盖前者。

---

## 三、ZIndex 解析器

**新文件：`src/templates/schemas/zIndexResolver.ts`**

### 职责

1. 接收模板树（`TemplateNode`）
2. 遍历收集所有带 `id` 的节点及其 `zIndex` 声明
3. 解析 zIndex 引用依赖，计算具体数值
4. 返回解析函数，供渲染时调用

### 核心算法

```
基础值:
  PAGE_TOP  = 10    （页面内容默认层级，留出 0-9 给底层元素）
  BOTTOM    = 0     （最底层）

解析规则:
  1. undefined / 'page.top' → PAGE_TOP (10)
  2. 'bottom'              → BOTTOM (0)
  3. '<id>.top'            → resolve(id) + 1
  4. '<id>.bottom'         → resolve(id) - 1

边界处理:
  - 循环引用检测：通过 resolving Set 检测，检测到循环时 warn + 回退到 PAGE_TOP
  - 引用不存在的 id：warn + 回退到 PAGE_TOP
  - 结果缓存：用 Map 缓存解析结果，避免重复计算
```

### 伪代码

```typescript
export type ZIndexResolverFn = (declaration?: ZIndexDeclaration) => number;

export function createZIndexResolver(root: TemplateNode): ZIndexResolverFn {
  const PAGE_TOP = 10;
  const BOTTOM = 0;

  // 步骤 1：遍历树，收集所有带 id 的节点及其 zIndex 声明
  const idMap = new Map<string, ZIndexDeclaration | undefined>();
  walkTree(root, (node) => {
    if (node.id) {
      idMap.set(node.id, (node as any).zIndex);
    }
  });

  // 步骤 2：解析函数（带记忆化和循环检测）
  const cache = new Map<string, number>();
  const resolving = new Set<string>();

  function resolve(declaration?: ZIndexDeclaration): number {
    const key = declaration ?? '__default__';
    if (cache.has(key)) return cache.get(key)!;

    if (!declaration || declaration === 'page.top') {
      cache.set(key, PAGE_TOP);
      return PAGE_TOP;
    }
    if (declaration === 'bottom') {
      cache.set(key, BOTTOM);
      return BOTTOM;
    }

    // 解析引用: "SomeId.top" | "SomeId.bottom"
    const lastDot = declaration.lastIndexOf('.');
    const refId = declaration.slice(0, lastDot);
    const direction = declaration.slice(lastDot + 1);

    if (resolving.has(refId)) {
      console.warn(`[ZIndex] 循环引用: ${[...resolving].join(' → ')} → ${refId}`);
      cache.set(key, PAGE_TOP);
      return PAGE_TOP;
    }
    if (!idMap.has(refId)) {
      console.warn(`[ZIndex] 引用了不存在的 id: "${refId}"`);
      cache.set(key, PAGE_TOP);
      return PAGE_TOP;
    }

    resolving.add(refId);
    const refValue = resolve(idMap.get(refId));
    resolving.delete(refId);

    const value = direction === 'top' ? refValue + 1 : refValue - 1;
    cache.set(key, value);
    return value;
  }

  return resolve;
}
```

---

## 四、LayoutRenderer 修改

**文件：`src/templates/schemas/LayoutRenderer.tsx`**

### 4.1 Props 增加 zIndex 解析器

```typescript
import { ZIndexDeclaration, ZIndexResolverFn } from './zIndexResolver';

interface LayoutRendererProps {
  node: TemplateNode;
  page: PageData;
  theme: ProjectTheme;
  typography?: TypographySettings;
  context?: EvaluationContext;
  resolveZIndex?: ZIndexResolverFn;  // 新增
}
```

在组件内部递归调用 `<LayoutRenderer>` 时，透传 `resolveZIndex`。

### 4.2 `resolveBaseProps()` 应用 zIndex

在函数末尾（白名单过滤之后），增加 zIndex 处理：

```typescript
// 4. 处理 Z-Index 声明
if (resolveZIndex) {
  const declaredZIndex = (node as any).zIndex as ZIndexDeclaration | undefined;
  finalStyle.zIndex = resolveZIndex(declaredZIndex);
}
```

该函数签名需要增加 `resolveZIndex` 参数，所有调用方（`renderContainer`, `renderComponent`, `renderRepeater`, Text 渲染）都要传入。

### 4.3 `renderComponent()` 替换硬编码

当前的硬编码：

```typescript
const mergedStyle = { zIndex: 1, ...style, ...(dynamicProps.style || {}) };
```

改为：

```typescript
const resolvedZIndex = resolveZIndex
  ? resolveZIndex((node as any).zIndex as ZIndexDeclaration | undefined)
  : 1;

const mergedStyle = { zIndex: resolvedZIndex, ...style, ...(dynamicProps.style || {}) };
```

---

## 五、JsonTemplateRenderer 修改

**文件：`src/components/JsonTemplateRenderer.tsx`**

```typescript
import { createZIndexResolver } from '../templates/schemas/zIndexResolver';

export const JsonTemplateRenderer: React.FC<JsonTemplateRendererProps> = ({ 
  schema, page, typography 
}) => {
  const theme = useStore((state) => state.theme);

  // 创建 zIndex 解析器（schema 变化时重建）
  const resolveZIndex = useMemo(() => {
    return createZIndexResolver(schema.root);
  }, [schema.root]);

  return (
    <LayoutRenderer 
      node={schema.root} 
      page={page} 
      theme={theme} 
      typography={typography}
      resolveZIndex={resolveZIndex}   // 注入
    />
  );
};
```

---

## 六、Validator 修改

**文件：`src/templates/schemas/validator.ts`**

```typescript
const ZIndexDeclarationSchema = z.union([
  z.literal('page.top'),
  z.literal('bottom'),
  z.string().regex(/^.+\.(top|bottom)$/),  // 匹配 "任意id.top" 或 "任意id.bottom"
]);

const BaseNodeSchema = z.object({
  id: z.string().optional(),
  zIndex: ZIndexDeclarationSchema.optional(),  // 新增
  className: z.string().optional(),
  style: z.record(z.string(), z.any()).optional(),
  modular: /* ... */,
  presetKey: z.string().optional(),
  visibleWhen: z.string().optional(),
});
```

---

## 七、模板使用示例

```typescript
{
  type: 'Container',
  layout: 'modular',
  layoutProps: { columns: 24, rows: 24 },
  children: [
    // 1. 背景大图 — 放在底层
    {
      id: 'MainPhoto',                    // ← 声明 id
      zIndex: 'bottom',                   // ← 处于最底层
      type: 'Container',
      layout: 'absolute',
      modular: { colStart: 1, colSpan: 24, rowStart: 1, rowSpan: 24 },
      children: [
        {
          type: 'Component',
          componentType: 'ZineMedia',
          props: { className: 'w-full h-full' }
        }
      ]
    },
    // 2. 标题文字 — 叠在 MainPhoto 之上
    {
      zIndex: 'MainPhoto.top',            // ← 引用 MainPhoto，叠在其上一层
      type: 'Component',
      componentType: 'ZineDisplay',
      bind: 'page.title',
      modular: { colStart: 2, colSpan: 10, rowStart: 3, rowSpan: 4 },
      props: { className: 'text-white' }
    },
    // 3. 装饰文字 — 也叠在 MainPhoto 之上
    {
      zIndex: 'MainPhoto.top',            // ← 同层级，按 DOM 顺序
      type: 'Component',
      componentType: 'ZineCaption',
      bind: 'page.subtitle',
      modular: { colStart: 2, colSpan: 10, rowStart: 8, rowSpan: 1 },
    },
    // 4. 透明遮罩 — MainPhoto 和下层之间
    {
      zIndex: 'MainPhoto.bottom',         // ← MainPhoto 下一层
      type: 'Container',
      modular: { colStart: 1, colSpan: 24, rowStart: 1, rowSpan: 24 },
      style: { backgroundColor: 'rgba(0,0,0,0.3)' }
    }
  ]
}
```

**解析结果**：

```
#4 透明遮罩:    zIndex = resolve(MainPhoto) - 1 = -1
#1 MainPhoto:   zIndex = 0 (bottom)
#2 ZineDisplay: zIndex = resolve(MainPhoto) + 1 = 1
#3 ZineCaption: zIndex = resolve(MainPhoto) + 1 = 1
```

---

## 八、涉及的文件清单

| 文件 | 操作 | 内容 |
|------|------|------|
| `src/templates/schemas/types.ts` | 修改 | 新增 `ZIndexDeclaration` 类型，`BaseNode` 增加 `zIndex` 字段 |
| `src/templates/schemas/zIndexResolver.ts` | **新建** | zIndex 解析器：树遍历 + ID 收集 + 依赖解析 + 循环检测 |
| `src/templates/schemas/LayoutRenderer.tsx` | 修改 | Props 增加 `resolveZIndex`，`resolveBaseProps` 和 `renderComponent` 中应用 |
| `src/components/JsonTemplateRenderer.tsx` | 修改 | 创建 zIndex 解析器并注入 LayoutRenderer |
| `src/templates/schemas/validator.ts` | 修改 | 增加 `zIndex` 字段的 Zod 校验 |
| `src/templates/schemas/index.ts` | 修改 | 导出新模块 `zIndexResolver` |

---

## 九、设计要点

1. **非侵入式**：现有的 `style.zIndex` 和 `AbsoluteLayoutProps.zIndex` 继续正常工作，新 `BaseNode.zIndex` 是补充层，不破坏已有模板
2. **循环检测**：通过 `resolving Set` 检测依赖环，发现后 warn 并安全回退到 `PAGE_TOP`
3. **缺失引用**：引用不存在的 id 时，warn + 回退到 `PAGE_TOP`，不会崩溃
4. **默认值安全**：未声明时行为与当前一致（zIndex = 10，即 `page.top`）
5. **id 复用**：`BaseNode.id` 本来就有，现将其正式提升为 zIndex 引用的锚点