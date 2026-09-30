# 3.3 文本原子三合一

## 事实核对

报告（`docs/code-review-report.md#L518-L648`）结论「三组件 90% 同构、可收敛为基类」方向正确，但对差异点的列举不完整，且自带设计稿 `ZineTextAtom`（`#L538-L644`）存在多处会改变运行时行为或引入投机抽象的偏差。逐点核对如下。

### 重复度核对

`ZineDisplay.tsx`/`ZineBody.tsx`/`ZineCaption.tsx` 三者结构同构，6 个步骤完全一致：

1. `const storeDs = useStore(s => s.designSystem); const ds = propsDs || storeDs;`
2. `useDataConnector(fieldKey, page, defaultFallback)` 取 `content`/`overrides`/`isVisible`
3. `useModularStyle({ page, fieldKey, props: { color: ds.tokens.colors?.[color] || color, ...otherProps }, variant, ... })`
4. 守卫 `if (!isVisible || ...) return null`
5. `resolveDockingStyle(style, overrides)`
6. `<Text content={content} className="zine-xxx whitespace-pre-line ..." style={finalStyle} />`

「90% 重复」结论成立。

### 报告漏列的差异点

报告 `#L535` 称「三者唯一的差别仅在于 variant、语义标签（h1 vs div）、默认颜色 Token（primary | secondary）」。实际差异远不止此：

| 差异点 | ZineDisplay | ZineBody | ZineCaption |
|--------|-------------|----------|-------------|
| `variant` | `'display'` | `'body'` | `'caption'` |
| 默认 `color` | `'primary'` | `'primary'` | `'secondary'` |
| 默认回退字段 | `page.title` | `page.paragraph` | 无（`undefined`） |
| 语义标签 `as` | `h1` | `div` | `div` |
| className 前缀 | `zine-display tracking-tighter` | `zine-body` | `zine-caption` |
| `children` 支持 | 有（守卫放宽：`!content && !children`） | 无（守卫 `!content`） | 无（守卫 `!content`） |
| `dropCap` 支持 | 无 | 有（独立浮动首字母分支） | 无 |
| `orientation` 支持 | 有 | 无（不传，`useModularStyle` 默认 `'horizontal'`） | 有 |

报告漏掉了「默认回退字段」「tracking-tighter」「children」「dropCap」「orientation 覆盖范围」五个差异点。这意味着任何合并方案都必须参数化这些差异，而非简单合并。

### 报告设计稿（`#L538-L644`）的偏差

报告自带的 `ZineTextAtom` 设计稿未与现有代码逐一核对，存在 11 处偏差，不能直接照搬：

1. **`ds = propsDs || DEFAULT_DESIGN_SYSTEM`（`#L589`）** —— 原三组件均用 `propsDs || storeDs`（从 `useStore` 取）。`useModularStyle` 内部（`useModularStyle.ts#L36`）自己订阅 store 拿 `ds`，但 `ZineTextAtom` 仍需 `ds` 来做 color token 解析（传给 `useModularStyle.props.color`）与 dropCap `accentColor`。改用静态默认值会让用户自定义的 `designSystem.tokens.colors` 在这两处失效。**必须保留 `useStore` 订阅**。设计稿注释「彻底解除原子组件内部对全局 Store 的冗余直连」的意图在此无法实现——color token 解析在 hook 之外，仍需 `ds`。

2. **守卫 `if (!isVisible || (!content && !children))`（`#L608`）** —— 把 ZineDisplay 的 `children` 例外统一到三组件。ZineBody/Caption 接口本无 `children`，但 `[key: string]: any` 会捕获。原 ZineBody/Caption 即使收到 children 也不渲染（children 进 `otherProps` → `useModularStyle.props` → 被当 CSS 属性污染 `finalStyle`，是潜在 bug）。统一后 ZineTextAtom 显式解构 `children` 并正确渲染，是 bug 修复，但行为变化需在「风险与回滚」标注。

3. **dropCap 守卫 `content && typeof content === 'string'`（`#L612`）** —— 原 ZineBody 仅 `if (dropCap)`，若 `content` 是 number 会 `content.charAt is not a function` 抛错。设计稿加了类型守卫，是 bug 修复，保留。

4. **dropCap 分支用 `<Component>`（`#L615`）** —— 原 ZineBody 硬编码 `<div>`。ZineTextAtom 的 `as` 默认 `'div'`，ZineBody 不传 `as` 时行为一致。OK，但这是接口扩张。

5. **className 用 `zine-text-atom` 替代 `zine-display`/`zine-body`/`zine-caption`（`#L616`/`#L639`）** —— grep 全仓无 CSS 规则依赖这三个类名（`src/**/*.css` 无匹配），`useModularStyle` 的 className 过滤逻辑（`useModularStyle.ts#L221-L261`）也不依赖具体类名。但保留原类名作为语义标识便于调试，且 `tracking-tighter` 是 ZineDisplay 的 Tailwind 工具类，丢失会改变字距（虽然 `display` token 的 `letterSpacing: '0.2em'` 会以 inline style 覆盖它，但 token 缺失时 `tracking-tighter` 是 fallback）。**必须通过 `baseClassName` 承载原类名，不能用 `zine-text-atom` 替代**。

6. **丢失 `tracking-tighter`（`#L639`）** —— 设计稿正常分支 `zine-text-atom ${baseClassName} whitespace-pre-line` 没有把 `tracking-tighter` 放进 `baseClassName` 的示例。ZineDisplay 声明式导出必须传 `baseClassName="zine-display tracking-tighter"`。

7. **新增 `autoFit`/`maxSize`/`minSize`/`lineHeight`（`#L555-L558`/`#L633-L638`）** —— 原 `Text` 组件本身支持这些，但三组件从未暴露。grep `autoFit` 在 `src/templates` 无匹配，即无调用方需要。这是投机抽象，违反 `~/.claude/CLAUDE.md`「避免投机抽象」。**移除**。

8. **移除 `typography` prop（`#L583-L587`）** —— 原 `componentRenderer.tsx#L74` 统一传 `typography` 给所有注册组件。ZineTextAtom 若不接受，React 会把 `typography` 渲染到 DOM 触发 warning。**必须接受并忽略**（原三组件就是这样：解构 `typography: propsTypography` 后丢弃）。

9. **新增 `defaultFallbackKey`（`#L546`）** —— 合理抽象，承载 `page.title`/`page.paragraph`/`undefined` 三种回退。保留。

10. **新增 `as` prop（`#L550`）** —— 合理抽象，ZineDisplay 需 `h1`。保留。

11. **新增 `baseClassName`（`#L551`）** —— 合理抽象，承载类名差异。保留。

### 测试覆盖核对

- `src/components/__tests__/ZineDisplay.test.tsx`：4 个用例，断言 `getByText` 与 `container.innerHTML === ''`。`tracking-tighter`/`h1` 标签名未被断言。重构后通过条件：保留 `text`/`fieldKey`/`page.title` 回退链与 visibility 守卫。
- `src/components/__tests__/ZineBody.test.tsx`：5 个用例，含 `paragraph: ''` 返回 null。重构后通过条件：`defaultFallbackKey="paragraph"` + 守卫 `!content`。
- `src/components/__tests__/ZineCaption.test.tsx`：5 个用例，含 `fieldKey="nonexistent"` 返回 null（无回退）。重构后通过条件：不传 `defaultFallbackKey` + 守卫 `!content`。
- `src/templates/schemas/__tests__/componentRegistry.test.tsx#L5-L17`：断言 `COMPONENT_REGISTRY` 含 `ZineDisplay`/`ZineBody`/`ZineCaption`。**重构后必须保留这三个导出名**，否则测试失败。
- `src/templates/schemas/__tests__/LayoutRenderer.test.tsx#L22-L23`/`#L312-L313`：`getComponent` 被 mock 为返回 `MockComponent`，真实 Zine 组件不被调用，不受影响。
- `src/components/__tests__/JsonTemplateRenderer.integration.test.tsx`：schema 用 `componentType: 'ZineDisplay'`/`'ZineBody'`，依赖注册表名，不依赖组件实现。
- `src/templates/schemas/__tests__/validator.test.ts`、`modularFlex.test.ts`：仅校验 `componentType` 字符串，不依赖实现。

结论：只要保留 `ZineDisplay`/`ZineBody`/`ZineCaption` 三个导出名与其 props 接口，现有测试全部通过。

## 根因

三组件是同一渲染算法的三份参数化副本。算法本身（6 步骤）从未演化出不同语义，但差异点（variant、回退字段、语义标签、className、children、dropCap、orientation）被复制了三遍而非参数化。结果是：任何对 6 步骤的修改（如调整守卫顺序、改 `useModularStyle` 调用签名）都要在三处分别改对，且很容易漏改一处（例如 ZineCaption 没有回退字段、ZineBody 没有 orientation，都是因为复制时漏掉了而非设计选择）。

报告自带设计稿试图一次性收敛，但设计稿本身未与代码核对，引入了「改 store 订阅」「丢 tracking-tighter」「加投机抽象 autoFit」等新问题。根本治理是：把 6 步骤收敛到 `ZineTextAtom`，差异点全部参数化为 prop，三个导出退化为 10 行声明式薄包装——但参数化必须严格覆盖全部差异点，不引入新抽象。

## 解决方案

新增 `src/components/ui/slide/atoms/ZineTextAtom.tsx` 承载 6 步骤与全部差异参数；`ZineDisplay`/`ZineBody`/`ZineCaption` 三个文件改为各 10 行的声明式导出，接口与类名与原版完全一致；`componentRegistry.ts` 不动。

遵循 `~/.claude/CLAUDE.md`：不保留向后兼容（三个导出直接重写，不保留旧实现）、最简实现（移除投机抽象 `autoFit` 等、不引入 `zine-text-atom` 通用类名）、禁止 emoji。注释遵从 `AGENTS.md`：中文写意图，英文写技术标识，禁单行中英混写。

### ZineTextAtom 基类

```typescript
// src/components/ui/slide/atoms/ZineTextAtom.tsx
import React from 'react';
import { DesignSystem, PageData, ProjectTheme, TypographySettings } from '../../../../types';
import { useStore } from '../../../../store/useStore';
import { useModularStyle, resolveDockingStyle } from '../hooks/useModularStyle';
import { useDataConnector } from '../hooks/useDataConnector';
import { Text } from './Text';

interface ZineTextAtomProps {
  page: PageData;
  fieldKey?: string;
  text?: string;
  /** 未提供 text/fieldKey 时的回退字段名 */
  defaultFallbackKey?: keyof PageData;
  /** 文本族，决定排版 Token 解析分支 */
  variant: 'display' | 'body' | 'caption';
  /** 默认颜色 Token 名，解析失败时原样透传 */
  defaultColorToken?: keyof DesignSystem['tokens']['colors'] | string;
  orientation?: 'horizontal' | 'vertical-stack' | 'vertical-rotate';
  /** 语义标签，如 h1 / div */
  as?: React.ElementType;
  /** className 前缀，承载 zine-display / zine-body / zine-caption 等语义类 */
  baseClassName?: string;
  className?: string;
  style?: React.CSSProperties;
  /** 首字下沉，仅 ZineBody 启用 */
  dropCap?: boolean;
  /** 显式子节点，仅 ZineDisplay 启用，存在时放宽空内容守卫 */
  children?: React.ReactNode;
  /** 以下 prop 仅为契合 componentRenderer 统一传参约定，本组件不消费 */
  designSystem?: DesignSystem;
  theme?: ProjectTheme;
  typography?: TypographySettings;
  [key: string]: any;
}

/** 文本原子基类，统一数据连接、模块化样式与对齐解析 */
export const ZineTextAtom: React.FC<ZineTextAtomProps> = ({
  page,
  fieldKey,
  text,
  defaultFallbackKey,
  variant,
  defaultColorToken = 'primary',
  orientation = 'horizontal',
  as: Component = 'div',
  baseClassName = '',
  className = '',
  style: customStyle,
  dropCap = false,
  children,
  designSystem: propsDs,
  // theme / typography 仅为契合注册表统一传参约定，本组件不消费
  theme: _theme,
  typography: _typography,
  ...otherProps
}) => {
  const storeDs = useStore(s => s.designSystem);
  const ds = propsDs || storeDs;

  // 1. 统一提取数据连接与可见性状态
  const fallback = text
    || (fieldKey ? (page as any)[fieldKey] : undefined)
    || (defaultFallbackKey ? (page as any)[defaultFallbackKey] : undefined);
  const { content, overrides, isVisible } = useDataConnector(fieldKey, page, fallback);

  const { style, className: resolvedClassName } = useModularStyle({
    page,
    fieldKey,
    props: {
      color: (ds.tokens.colors as any)?.[defaultColorToken as string] || defaultColorToken,
      ...otherProps
    },
    variant,
    orientation: orientation as any,
    customStyle,
    className
  });

  // 2. 可见性与内容检查：有子节点时放宽空内容守卫
  if (!isVisible || (!content && !children)) return null;

  // 3. 统一解析 9 点对齐与布局适应
  const finalStyle = resolveDockingStyle(style, overrides);

  // 4. 首字下沉排版分支：独立浮动放大首字母，仅字符串内容生效
  if (dropCap && typeof content === 'string' && content.length > 0) {
    const accentColor = (ds.tokens.colors as any)?.accent || '#264376';
    return (
      <Component
        className={`${baseClassName} whitespace-pre-line relative overflow-hidden ${resolvedClassName}`}
        style={finalStyle}
      >
        <span
          className="float-left font-black select-none mr-4 leading-none"
          style={{ fontSize: '4rem', marginTop: '0.2rem', color: accentColor }}
        >
          {content.charAt(0)}
        </span>
        <Text content={content.slice(1)} sanitize={true} />
      </Component>
    );
  }

  return (
    <Text
      as={Component}
      content={content}
      className={`${baseClassName} whitespace-pre-line ${resolvedClassName}`}
      style={finalStyle}
    >
      {children}
    </Text>
  );
};
```

### 三个声明式导出

```typescript
// src/components/ui/slide/atoms/ZineDisplay.tsx
import React from 'react';
import { PageData, DesignSystem, ProjectTheme, TypographySettings } from '../../../../types';
import { ZineTextAtom } from './ZineTextAtom';

interface ZineDisplayProps {
  page: PageData;
  fieldKey?: string;
  text?: string;
  color?: keyof DesignSystem['tokens']['colors'] | string;
  orientation?: 'horizontal' | 'vertical-stack' | 'vertical-rotate';
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  designSystem?: DesignSystem;
  theme?: ProjectTheme;
  typography?: TypographySettings;
  [key: string]: any;
}

/** 标题族原子：语义 h1，默认回退 page.title */
export const ZineDisplay: React.FC<ZineDisplayProps> = ({ color = 'primary', ...props }) => (
  <ZineTextAtom
    {...props}
    variant="display"
    defaultColorToken={color}
    defaultFallbackKey="title"
    as="h1"
    baseClassName="zine-display tracking-tighter"
  />
);

export default ZineDisplay;
```

```typescript
// src/components/ui/slide/atoms/ZineBody.tsx
import React from 'react';
import { PageData, DesignSystem, ProjectTheme, TypographySettings } from '../../../../types';
import { ZineTextAtom } from './ZineTextAtom';

interface ZineBodyProps {
  page: PageData;
  fieldKey?: string;
  text?: string;
  color?: keyof DesignSystem['tokens']['colors'] | string;
  className?: string;
  style?: React.CSSProperties;
  dropCap?: boolean;
  designSystem?: DesignSystem;
  theme?: ProjectTheme;
  typography?: TypographySettings;
  [key: string]: any;
}

/** 正文族原子：默认回退 page.paragraph，支持首字下沉 */
export const ZineBody: React.FC<ZineBodyProps> = ({ color = 'primary', ...props }) => (
  <ZineTextAtom
    {...props}
    variant="body"
    defaultColorToken={color}
    defaultFallbackKey="paragraph"
    baseClassName="zine-body"
  />
);

export default ZineBody;
```

```typescript
// src/components/ui/slide/atoms/ZineCaption.tsx
import React from 'react';
import { PageData, DesignSystem, ProjectTheme, TypographySettings } from '../../../../types';
import { ZineTextAtom } from './ZineTextAtom';

interface ZineCaptionProps {
  page: PageData;
  fieldKey?: string;
  text?: string;
  color?: keyof DesignSystem['tokens']['colors'] | string;
  orientation?: 'horizontal' | 'vertical-stack' | 'vertical-rotate';
  className?: string;
  style?: React.CSSProperties;
  designSystem?: DesignSystem;
  theme?: ProjectTheme;
  typography?: TypographySettings;
  [key: string]: any;
}

/** 说明/副标题族原子：默认 secondary 色，无回退字段 */
export const ZineCaption: React.FC<ZineCaptionProps> = ({ color = 'secondary', ...props }) => (
  <ZineTextAtom
    {...props}
    variant="caption"
    defaultColorToken={color}
    baseClassName="zine-caption"
  />
);

export default ZineCaption;
```

### 与设计稿的关键偏离

| 偏离点 | 设计稿 | 本方案 | 理由 |
|--------|--------|--------|------|
| `ds` 兜底 | `DEFAULT_DESIGN_SYSTEM` | `propsDs \|\| storeDs` | color token 解析与 dropCap accentColor 需用户自定义 ds |
| `autoFit` 等 | 暴露 4 个 prop | 移除 | 无调用方，投机抽象 |
| className | `zine-text-atom` 替代 | `baseClassName` 承载原类名 | 保留 `tracking-tighter` 与语义标识 |
| `typography` | 移除 | 接受并忽略 | `componentRenderer` 统一传参 |
| dropCap 守卫 | `content && typeof === 'string'` | 保留 | bug 修复 |
| `zine-text-atom` 通用类 | 加 | 不加 | 无 CSS 依赖，最简 |

## Before / After

### 代码量

| 文件 | Before | After |
|------|--------|-------|
| `ZineDisplay.tsx` | 80 行（含接口+实现） | ~33 行（接口+10 行声明式导出） |
| `ZineBody.tsx` | 93 行 | ~30 行 |
| `ZineCaption.tsx` | 75 行 | ~30 行 |
| `ZineTextAtom.tsx` | 不存在 | ~110 行（单一真源） |
| **合计** | 248 行 | ~203 行 |

代码量减少不显著，但**变更集中度**质变：6 步骤从 3 份副本收敛为 1 份真源，后续改守卫顺序或 `useModularStyle` 调用只需改 `ZineTextAtom` 一处。

### 接口

三个对外导出的 props 接口与原版逐字段一致，调用方（`componentRenderer`、模板 `props`）零改动。`componentRegistry.ts` 的 `COMPONENT_REGISTRY` 与别名映射（`ZineFooter: ZineCaption` 等）不动。

## 风险与回滚

### 行为变化

1. **ZineBody/Caption 收到 children 时改为正确渲染**（原行为：children 进 `useModularStyle.props` 污染 `finalStyle`，是 bug）。`componentRenderer` 不传 children，运行时无影响。若担心，可在 ZineBody/Caption 声明式导出里显式 `const { color = ..., children: _c, ...props } = props;` 丢弃 children，严格保持原行为。本方案选择不丢弃——bug 修复优于保留 bug。

2. **dropCap 在 content 非 string 时不再抛错**（原行为：`content.charAt is not a function`）。bug 修复，无测试覆盖此边缘。

3. **className 多出 `baseClassName` 的拼接顺序**：原 `zine-display tracking-tighter whitespace-pre-line ${resolvedClassName}`，新 `${baseClassName} whitespace-pre-line ${resolvedClassName}`——`baseClassName="zine-display tracking-tighter"` 展开后字符串完全一致。ZineBody/Caption 同理。零差异。

### 潜在风险

- **`tracking-tighter` 被 inline style 覆盖**：`display` token 的 `letterSpacing: '0.2em'`（`constants/theme.ts`）会以 inline style 覆盖 `tracking-tighter` 的 `-0.05em`。这是原 ZineDisplay 既有行为，重构后保持一致。若 token 缺失 `letterSpacing`，`tracking-tighter` 作为 fallback 生效——保留它有防御价值。

- **`storeDs` 冗余订阅**：`ZineTextAtom` 与 `useModularStyle` 都订阅 `useStore(s => s.designSystem)`。这是原三组件的既有冗余，本方案保留以不改变 color token 解析行为。若未来要解除，需把 color token 解析下沉到 `useModularStyle` 内部，属于独立重构，不在本方案范围。

### 回滚

三个文件是纯重写，`ZineTextAtom.tsx` 是新增。回滚 = `git revert` 单次提交即可，无外部依赖、无注册表改动、无迁移。

## 验证方式

### 单元测试（既有，应全部通过）

```bash
npx vitest run src/components/__tests__/ZineDisplay.test.tsx
npx vitest run src/components/__tests__/ZineBody.test.tsx
npx vitest run src/components/__tests__/ZineCaption.test.tsx
npx vitest run src/templates/schemas/__tests__/componentRegistry.test.tsx
npx vitest run src/components/__tests__/JsonTemplateRenderer.integration.test.tsx
npx vitest run src/templates/schemas/__tests__/LayoutRenderer.test.tsx
```

断言点已在「事实核对」逐一映射，无需新增测试。

### 类型检查

```bash
npx tsc --noEmit
```

重点：`ZineTextAtom` 的 `defaultFallbackKey?: keyof PageData` 与 `page[defaultFallbackKey]` 的类型——用 `(page as any)` 规避 `PageData` 无 index signature 的问题（与原 ZineDisplay `#L45` 一致）。

### 手动验证（dropCap 与 orientation 是现有测试未覆盖的分支）

1. **dropCap**：加载 `Bilingual-Editorial/bilingual-reader` 或 `Universal-General/kinfolk-essay` 模板，确认首字下沉渲染（浮动放大首字母 + accentColor + 段体 `Text`）。
2. **orientation: 'vertical-rotate'**：加载 `bilingual-reader` 的 `sideHeader`（ZineCaption + vertical-rotate），确认 90° 旋转刊头。
3. **orientation: 'vertical-stack'**：加载 `Universal-Gallery/artistic-l-space` 的 `ZineDisplay`，确认竖排堆叠。
4. **children 透传**：`ZineDisplay` 有 children 的场景（如 `big-statement` 模板若用到），确认子节点渲染。

### 集成回归

```bash
npx vitest run
```

覆盖 `validator.test.ts`、`modularFlex.test.ts` 等所有用 `componentType` 字符串的测试，确认注册表名未变。

---

**相关文件**：
- 新增：`C:\Users\VerNe\Downloads\Documents\slide-layout-editor\src\components\ui\slide\atoms\ZineTextAtom.tsx`
- 重写：`C:\Users\VerNe\Downloads\Documents\slide-layout-editor\src\components\ui\slide\atoms\ZineDisplay.tsx`
- 重写：`C:\Users\VerNe\Downloads\Documents\slide-layout-editor\src\components\ui\slide\atoms\ZineBody.tsx`
- 重写：`C:\Users\VerNe\Downloads\Documents\slide-layout-editor\src\components\ui\slide\atoms\ZineCaption.tsx`
- 不动：`C:\Users\VerNe\Downloads\Documents\slide-layout-editor\src\templates\schemas\componentRegistry.ts`
- 依赖：`C:\Users\VerNe\Downloads\Documents\slide-layout-editor\src\components\ui\slide\hooks\useModularStyle.ts`、`useDataConnector.ts`、`atoms\Text.tsx`
