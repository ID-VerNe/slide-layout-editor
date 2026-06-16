# 模板测试与验证

## 1. 测试文件概览

模板系统包含以下测试文件，覆盖注册表、Schema 验证、渲染器、表达式求值、Z-Index 解析、组件注册和集成测试：

| 测试文件 | 覆盖范围 | 工具 |
| :--- | :--- | :--- |
| `src/templates/__tests__/registry.test.ts` | 模板注册表验证：ID 唯一性、必需字段、分类枚举、基础字段包含 | Vitest |
| `src/templates/schemas/__tests__/validator.test.ts` | Schema 结构验证：节点类型检查、24x24 模块化坐标边界、嵌套节点、ZIndex 格式、版本元数据 | Vitest + Zod |
| `src/templates/schemas/__tests__/componentRegistry.test.tsx` | 组件注册表：11 个原子组件的注册状态、已知/未知名称查找 | Vitest |
| `src/templates/schemas/__tests__/LayoutRenderer.test.tsx` | 布局渲染器：Container 布局变体、Component/Text/Conditional/Repeater 节点、visibleWhen、presetKey、ErrorBoundary、Zine 样式约束、嵌套 Repeater 上下文 | Vitest + Testing Library |
| `src/templates/schemas/__tests__/expressionEvaluator.test.ts` | 表达式引擎：属性访问、算术/比较/逻辑/三元运算符、字符串插值、对象求值、可选链、nullish coalescing、边界情况 | Vitest |
| `src/templates/schemas/__tests__/zIndexResolver.test.ts` | Z-Index 解析器：关键字声明、相对引用、自引用/循环引用检测、Conditional/Repeater 节点遍历 | Vitest |
| `src/components/__tests__/JsonTemplateRenderer.integration.test.tsx` | 集成测试：完整 Schema 渲染、嵌套容器、条件渲染、24x24 模块化布局、样式预设、错误边界、大型模板性能 | Vitest + Testing Library |

## 2. 运行测试

### 运行所有模板测试

```bash
pnpm test
```

### 运行特定测试文件

```bash
# 注册表测试
pnpm test -- src/templates/__tests__/registry.test.ts

# Schema 验证测试
pnpm test -- src/templates/schemas/__tests__/validator.test.ts

# 布局渲染器测试
pnpm test -- src/templates/schemas/__tests__/LayoutRenderer.test.tsx

# 表达式引擎测试
pnpm test -- src/templates/schemas/__tests__/expressionEvaluator.test.ts

# Z-Index 解析器测试
pnpm test -- src/templates/schemas/__tests__/zIndexResolver.test.ts

# 组件注册表测试
pnpm test -- src/templates/schemas/__tests__/componentRegistry.test.tsx

# 集成测试
pnpm test -- src/components/__tests__/JsonTemplateRenderer.integration.test.tsx
```

### 运行测试并查看覆盖率

```bash
pnpm test -- --coverage
```

## 3. Schema 验证

每个模板 Schema 可通过 `src/templates/schemas/validator.ts` 进行结构验证。验证器使用 Zod 定义以下约束：

- **必需字段**: `id`, `name`, `category`, `supportedRatios` (不能为空), `root`
- **节点类型**: Container / Component / Conditional / Repeater / Text (使用 `discriminatedUnion`)
- **24x24 模块化坐标**: `colStart`/`colSpan`/`rowStart`/`rowSpan` 范围 1-24
- **布局枚举**: `layout` 只能是 `flex` / `grid` / `absolute` / `modular`
- **ZIndex 格式**: `page.top` / `bottom` / `<id>.top` / `<id>.bottom`
- **嵌套节点**: 递归验证 children
- **元数据**: `meta.version` 为字符串（必需），`meta.author` 可选

```typescript
import { validateTemplate } from 'src/templates/schemas/validator';

const result = validateTemplate(mySchema);
if (result.success) {
  // schema 有效
} else {
  console.error(result.error);
}
```

## 4. 实时调试

运行 `pnpm dev`，在编辑器中切换到目标模板。`TemplatePreview` 组件会以蓝图风格实时渲染模板的 24x24 网格布局，便于验证排版的正确性。

## 5. 写入新测试的要点

- 模板 Schema 测试使用 `TemplateSchema` 类型创建完整结构，通过 `validateTemplateSchema()` 验证
- 布局测试使用 `LayoutRenderer` 组件配合 `render()` 渲染，验证 DOM 结构和 CSS 样式
- 表达式测试直接实例化 `ExpressionEvaluator`，调用 `evaluate()` / `interpolate()` / `evaluateObject()`
- Z-Index 测试使用 `createZIndexResolver()` 或 `resolveZIndex()` 解析节点树
- 集成测试在 `JsonTemplateRenderer` 中运行完整模板 Schema 渲染流程
