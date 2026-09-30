# 3.4 字段浅包装收敛

## 事实核对

针对 `docs/code-review-report.md` 第 650-670 行的描述逐条核对:

| 报告描述 | 实际核对 | 结论 |
|---|---|---|
| `src/components/editor/fields/*.tsx` 包含 37 个文件 | Glob 输出 38 个 `.tsx` 文件 | 数量略有出入(38 vs 37),量级一致 |
| `ImageLabelField.tsx` (31 行) | `wc -l` 输出 31 行 | 一致 |
| `ImageSubLabelField.tsx` (31 行) | 31 行 | 一致 |
| `ParagraphField.tsx` (28 行) | 31 行 | 差 3 行,量级一致 |
| `ParagraphZHField.tsx` (31 行) | 36 行 | 差 5 行,量级一致 |
| `QuoteZHField.tsx` (29 行) | 35 行 | 差 6 行,量级一致 |
| `SideHeaderField.tsx` (30 行) | 32 行 | 差 2 行,量级一致 |
| `ActionTextField.tsx` (31 行) | 31 行 | 一致 |
| 文件内容仅调用 `GenericTextField` 并硬编码 `fieldKey`/`label`/`placeholder` | 7 个文件均仅 `return <GenericTextField ... />`,无任何额外逻辑 | 属实 |
| `FieldRenderer.tsx` 维护一张超过 50 行的 `componentMap` 静态字典 | `componentMap` 定义于 L39-L74,共 36 行(含 35 个字段映射条目);整文件 122 行 | **不属实**:`componentMap` 字典本身 36 行,未超 50 行。报告"超过 50 行"应为整文件行数(122)与字典行数(36)的混淆 |

补充事实(报告未提及,但影响落地方案):

1. **浅包装文件总数 = 7,不是 10+**。`grep -l "GenericTextField" src/components/editor/fields/*.tsx` 命中 8 个文件,其中 `GenericTextField.tsx` 自身是基础组件,剩余 7 个才是纯浅包装:`ActionTextField` / `ImageLabelField` / `ImageSubLabelField` / `ParagraphField` / `ParagraphZHField` / `QuoteZHField` / `SideHeaderField`。报告"10+ 个"为高估。

2. **7 个浅包装的唯一外部引用方是 `FieldRenderer.tsx`**。`grep -rn "from.*fields/(ActionTextField|ImageLabelField|...)" src/ --exclude=__tests__` 仅命中 `FieldRenderer.tsx` 的 7 条 import 语句,无任何其他文件直接引用这些组件。删除它们只影响 `FieldRenderer`。

3. **`FieldSchema` 类型已具备元数据承载能力**。`src/types.ts#L163-L181` 定义 `FieldSchema` 已含 `label`、`icon`、`props`、`defaultValue`、`placeholder` 五个字段。模板 JSON(如 `bilingual-quote.json#L17-L46`)已在 schema 层写入 `label`。但 `placeholder` / `icon` / `props` 在现有 schema 中几乎未使用——元数据通道已存在,只是没被填充和消费。

4. **`FieldRenderer` 当前只消费 `schema.key` 与 `schema.label`**。L87 `const { key, label, type, props = {} } = schema;` 解构出 `props` 但只在兜底分支(L93-L103)透传,具名组件分支(L112-L122)虽 spread `{...props}` 却被各浅包装内部硬编码的 `placeholder`/`className` 等覆盖。schema 层元数据与组件层硬编码存在双轨。

5. **并非所有文本型字段都是浅包装**。`TitleField` / `SubtitleField` / `FooterField` 直接使用 `FieldWrapper` + `DebouncedInput`/`DebouncedTextArea` 自行渲染,且各自带差异化逻辑(`TitleField` 有 `presetKey` 角标显示;`FooterField` 在 `pageNumber === false` 时 `return null`;`SubtitleField` 有固定 `rows=2` 与特定 `className`)。`PartnersTitleField` / `ArtFontField` / `TitleYField` / `GenericNumberField` 带复杂控件。这 8 个组件不在收敛范围。

6. **`signature` 字段映射到 `ImageField`**(`FieldRenderer.tsx#L49`),非文本字段,不在收敛范围。

## 根因

1. **元数据下沉到组件层**:本应由 schema 声明、由 renderer 统一消费的字段元数据(`placeholder` / `icon` / `className` / `defaultFont` / `defaultColor` / `multiline` / `rows`),被硬编码进 7 个 `.tsx` 文件。每个文件 31 行代码只为传递 6-8 个常量 props。

2. **renderer 缺少默认规则**:`FieldRenderer` 采用"全量具名映射"策略——`componentMap` 必须为每个 key 显式登记组件,没有"未注册文本型 key 自动走 `GenericTextField`"的兜底。新增任意文本字段都要同时改 `componentMap` 与新建 `.tsx` 文件。

3. **schema 与组件元数据双轨**:模板 JSON 已声明 `label`,`FieldRenderer` 已透传 `{...props}`,但浅包装内部用硬编码覆盖,导致 schema 层的 `placeholder` / `props` 通道形同虚设。修改字段文案要改 `.tsx` 而非改 schema。

4. **`React.memo` + `displayName` 的形式化包装**:7 个文件都套了 `React.memo` 与 `displayName`,但内部只是转发 props,无任何 memoization 收益——`GenericTextField` 自身已 `React.memo`。形式化包装掩盖了"这只是一个数据字典条目"的本质。

## 解决方案

### 决策原则(遵从 `~/.claude/CLAUDE.md`)

- **不保留向后兼容**:直接删除 7 个浅包装文件,不保留 re-export 别名、不保留 `componentMap` 中的占位条目。
- **最简实现**:在 `FieldRenderer` 内新增一处文本字段预设表 + 一条默认渲染规则,不引入 `FieldRegistry` / `FieldDescriptor` 等抽象。
- **不投机抽象**:不为"未来可能出现的非文本字段"预留插件机制;`componentMap` 保留现状用于承载非文本型字段。
- **不破坏现有测试**:`__tests__/FieldRenderer.test.tsx` 未直接断言这 7 个 key 的渲染产物,仅断言 `title` / `separator` / `number` / `backgroundColor` / `unknown` 路径。本方案不动 `componentMap` 中这些条目。

### 范围界定

| 收敛(7 个) | 保留(8 个带自定义逻辑) | 保留(非文本型字段) |
|---|---|---|
| ActionTextField、ImageLabelField、ImageSubLabelField、ParagraphField、ParagraphZHField、QuoteZHField、SideHeaderField | TitleField、SubtitleField、FooterField、PartnersTitleField、ArtFontField、TitleYField、GenericNumberField、FieldWrapper | LogoField、ImageField、FeaturesField、MosaicField、MetricsField、BigDataMetricsField、PartnersField、TestimonialsField、AgendaField、GalleryField、VariantField、BulletsField、ColorField、BentoField、PageNumberField、ResumeSectionsField、VocabItemsField、SeparatorField |

保留组中的 `TitleField` / `SubtitleField` / `FooterField` 虽是文本型,但各有差异化逻辑(角标、固定 rows、pageNumber 短路),收敛它们需要把分支逻辑搬进 `GenericTextField`,超出"最简实现"边界,不在本次范围。

### 实施步骤

#### Step 1:在 `FieldRenderer.tsx` 新增文本字段预设表

在 `componentMap` 定义之后、`FieldRendererProps` 之前新增:

```typescript
import { Type, Bookmark, Quote, Languages } from 'lucide-react';

// 文本型字段的默认渲染预设:未在 componentMap 注册的文本 key 走 GenericTextField
const textFieldPresets: Record<string, Omit<GenericTextFieldProps, 'page' | 'onUpdate' | 'fieldKey' | 'label' | 'customFonts'>> = {
  actionText: {
    icon: Type,
    placeholder: 'e.g. SHOP NOW',
    className: 'text-xs font-black uppercase tracking-widest border-slate-100 hover:border-zine-accent focus:border-zine-accent transition-colors',
    defaultFont: "'Inter', sans-serif",
  },
  imageLabel: {
    icon: Type,
    placeholder: 'e.g. FIG. 01 — THE MOUNTAIN',
    className: 'text-xs font-bold border-slate-100 hover:border-zine-accent focus:border-zine-accent transition-colors',
    defaultFont: "'Inter', sans-serif",
  },
  imageSubLabel: {
    icon: Type,
    placeholder: 'e.g. VOL. 01',
    className: 'text-xs font-medium border-slate-100 hover:border-zine-accent focus:border-zine-accent transition-colors',
  },
  paragraph: {
    icon: Type,
    multiline: true,
    rows: 5,
    placeholder: 'Write something...',
  },
  paragraphZH: {
    icon: Languages,
    multiline: true,
    rows: 4,
    placeholder: '输入中文对照译文（思源宋体/弱对比灰）...',
    defaultFont: "'Noto Serif SC', 'STFangsong', serif",
    defaultColor: '#475569',
  },
  quoteZH: {
    icon: Quote,
    multiline: true,
    rows: 2,
    placeholder: '输入金句中文释义...',
    defaultFont: "'Noto Serif SC', 'STFangsong', serif",
    defaultColor: '#475569',
  },
  sideHeader: {
    icon: Bookmark,
    placeholder: 'e.g. VOL. 01 // THE ESSAY ARCHIVE',
    className: 'text-xs uppercase tracking-widest border-slate-100 hover:border-zine-accent focus:border-zine-accent transition-colors',
  },
};
```

`Omit<...>` 类型注解为英文技术标识;中文注释解释意图。预设内容逐字复制自原 7 个浅包装文件,不做值合并或重命名。

#### Step 2:在 `FieldRenderer` 渲染分支新增默认规则

修改 `FieldRenderer` 函数体,在 separator 兜底之后、`if (!Component) return null;` 之前插入:

```typescript
  // 未注册为具名组件的文本型字段,统一走 GenericTextField + 预设元数据
  if (!Component && textFieldPresets[key]) {
    const preset = textFieldPresets[key];
    return (
      <GenericTextField
        page={page}
        onUpdate={onUpdate}
        customFonts={customFonts}
        fieldKey={key as keyof PageData & string}
        label={label}
        {...preset}
        {...props}
      />
    );
  }
```

`{...props}` 排在 `{...preset}` 之后,允许 schema 层 `props` 覆盖预设(如模板 JSON 写 `{ key: 'paragraph', props: { rows: 3 } }` 可覆盖默认 `rows=5`)。这是本方案赋予 schema 层元数据通道真实效力的关键。

#### Step 3:从 `componentMap` 移除 7 个浅包装条目

删除 `componentMap` 中的以下行:

```typescript
  actionText: ActionTextField,        // 删除
  paragraph: ParagraphField,          // 删除
  paragraphZH: ParagraphZHField,      // 删除
  quoteZH: QuoteZHField,              // 删除
  sideHeader: SideHeaderField,        // 删除
  imageLabel: ImageLabelField,        // 删除
  imageSubLabel: ImageSubLabelField,  // 删除
```

#### Step 4:删除 7 个浅包装文件与对应 import

删除文件:

- `src/components/editor/fields/ActionTextField.tsx`
- `src/components/editor/fields/ImageLabelField.tsx`
- `src/components/editor/fields/ImageSubLabelField.tsx`
- `src/components/editor/fields/ParagraphField.tsx`
- `src/components/editor/fields/ParagraphZHField.tsx`
- `src/components/editor/fields/QuoteZHField.tsx`
- `src/components/editor/fields/SideHeaderField.tsx`

删除 `FieldRenderer.tsx` 顶部的 7 条对应 import 语句(L8、L9、L11、L12、L33、L34、L35)。

新增 `GenericTextField` 与 `GenericTextFieldProps` 的 import(原文件未直接 import `GenericTextField`,因为浅包装组件承担了引用职责):

```typescript
import { GenericTextField, GenericTextFieldProps } from './fields/GenericTextField';
```

### 关于 schema 层 `placeholder` 的处理

`FieldSchema.placeholder` 字段(`src/types.ts#L180`)当前在 `FieldRenderer` 中未被消费。本方案不主动启用它,避免扩散改动面;预设表中的 `placeholder` 已覆盖 7 个字段的占位符需求。若后续要让模板 JSON 可声明占位符,只需在 Step 2 的 `<GenericTextField>` 调用中加 `placeholder={placeholder || preset.placeholder}`。这是未来扩展点,不在本次实现内。

## Before / After

### Before

`src/components/editor/fields/ParagraphZHField.tsx`(36 行独立文件):

```tsx
import React from 'react';
import { PageData, CustomFont } from '../../../types';
import { Languages } from 'lucide-react';
import { GenericTextField } from './GenericTextField';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData, silent?: boolean) => void;
  label?: string;
  customFonts: CustomFont[];
}

/** 中文译文段落编辑器 */
export const ParagraphZHField: React.FC<FieldProps> = React.memo(
  ({ page, onUpdate, label, customFonts }) => {
    return (
      <GenericTextField
        page={page}
        onUpdate={onUpdate}
        fieldKey="paragraphZH"
        label={label || 'Chinese Translation'}
        icon={Languages}
        multiline={true}
        rows={4}
        placeholder="输入中文对照译文（思源宋体/弱对比灰）..."
        defaultFont="'Noto Serif SC', 'STFangsong', serif"
        defaultColor="#475569"
        customFonts={customFonts}
      />
    );
  }
);

ParagraphZHField.displayName = 'ParagraphZHField';
export default ParagraphZHField;
```

`FieldRenderer.tsx` 的 `componentMap` 包含 7 个浅包装条目,顶部有 7 条 import。

### After

`ParagraphZHField.tsx` 文件被删除。`FieldRenderer.tsx` 的 `componentMap` 不再含 `paragraphZH` 等条目,新增 `textFieldPresets` 表与一条默认规则。

```tsx
import React from 'react';
import { PageData, CustomFont } from '../../types';
import { Type, Bookmark, Quote, Languages } from 'lucide-react';
import { GenericTextField, GenericTextFieldProps } from './fields/GenericTextField';
import { LogoField } from './fields/LogoField';
import { TitleField } from './fields/TitleField';
// ... 其余保留组件的 import,已移除 7 个浅包装的 import

// 保留:具名组件映射(非文本型与带自定义逻辑的文本型字段)
const componentMap: Record<string, React.FC<any>> = {
  logo: LogoField,
  title: TitleField,
  subtitle: SubtitleField,
  signature: ImageField,
  image: ImageField,
  features: FeaturesField,
  mosaic: MosaicField,
  mosaicItems: MosaicField,
  metrics: MetricsField,
  bigDataMetrics: BigDataMetricsField,
  partnersTitle: PartnersTitleField,
  partners: PartnersField,
  testimonials: TestimonialsField,
  agenda: AgendaField,
  bentoItems: BentoField,
  gallery: GalleryField,
  variant: VariantField,
  bullets: BulletsField,
  backgroundColor: ColorField,
  footer: FooterField,
  pageNumber: PageNumberField,
  resumeSections: ResumeSectionsField,
  titleY: TitleYField,
  logoSize: GenericNumberField,
  separator: SeparatorField,
  artFont: ArtFontField,
  vocabItems: VocabItemsField,
};

// 新增:文本型字段默认渲染预设
const textFieldPresets: Record<string, Omit<GenericTextFieldProps, 'page' | 'onUpdate' | 'fieldKey' | 'label' | 'customFonts'>> = {
  actionText: {
    icon: Type,
    placeholder: 'e.g. SHOP NOW',
    className: 'text-xs font-black uppercase tracking-widest border-slate-100 hover:border-zine-accent focus:border-zine-accent transition-colors',
    defaultFont: "'Inter', sans-serif",
  },
  imageLabel: {
    icon: Type,
    placeholder: 'e.g. FIG. 01 — THE MOUNTAIN',
    className: 'text-xs font-bold border-slate-100 hover:border-zine-accent focus:border-zine-accent transition-colors',
    defaultFont: "'Inter', sans-serif",
  },
  imageSubLabel: {
    icon: Type,
    placeholder: 'e.g. VOL. 01',
    className: 'text-xs font-medium border-slate-100 hover:border-zine-accent focus:border-zine-accent transition-colors',
  },
  paragraph: {
    icon: Type,
    multiline: true,
    rows: 5,
    placeholder: 'Write something...',
  },
  paragraphZH: {
    icon: Languages,
    multiline: true,
    rows: 4,
    placeholder: '输入中文对照译文（思源宋体/弱对比灰）...',
    defaultFont: "'Noto Serif SC', 'STFangsong', serif",
    defaultColor: '#475569',
  },
  quoteZH: {
    icon: Quote,
    multiline: true,
    rows: 2,
    placeholder: '输入金句中文释义...',
    defaultFont: "'Noto Serif SC', 'STFangsong', serif",
    defaultColor: '#475569',
  },
  sideHeader: {
    icon: Bookmark,
    placeholder: 'e.g. VOL. 01 // THE ESSAY ARCHIVE',
    className: 'text-xs uppercase tracking-widest border-slate-100 hover:border-zine-accent focus:border-zine-accent transition-colors',
  },
};

interface FieldRendererProps {
  schema: FieldSchema;
  page: PageData;
  onUpdate: (page: PageData, silent?: boolean) => void;
  customFonts: CustomFont[];
  pages?: PageData[];
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  schema, page, onUpdate, customFonts, pages
}) => {
  const { key, label, type, props = {} } = schema;

  let Component = componentMap[key];

  if (!Component && type === 'number') {
    return (
      <GenericNumberField
        page={page}
        onUpdate={onUpdate}
        label={label}
        fieldKey={key}
        {...props}
      />
    );
  }

  if (!Component && type === 'separator') {
    Component = SeparatorField;
  }

  // 未注册为具名组件的文本型字段,统一走 GenericTextField + 预设元数据
  if (!Component && textFieldPresets[key]) {
    const preset = textFieldPresets[key];
    return (
      <GenericTextField
        page={page}
        onUpdate={onUpdate}
        customFonts={customFonts}
        fieldKey={key as keyof PageData & string}
        label={label}
        {...preset}
        {...props}
      />
    );
  }

  if (!Component) return null;

  return (
    <Component
      page={page}
      onUpdate={onUpdate}
      customFonts={customFonts}
      label={label}
      fieldKey={key}
      pages={pages}
      {...props}
    />
  );
};
```

### 行为差异

| 维度 | Before | After |
|------|--------|-------|
| 文件数 | 38 个 `.tsx` | 31 个 `.tsx`(删除 7 个浅包装) |
| `FieldRenderer.tsx` 行数 | 122 行 | 约 175 行(新增预设表约 60 行 + 默认规则 10 行,删除 7 条 import 与 7 条 componentMap 条目约 14 行) |
| 新增文本字段流程 | 新建 `.tsx` 文件 + 在 `componentMap` 加条目 + 在 import 加一行 | 在 `textFieldPresets` 加一条预设(若元数据可复用现有默认值则零改动) |
| schema 层 `props` 透传 | 浅包装硬编码覆盖 `placeholder`/`className` 等 | 预设被 `{...props}` 覆盖,模板 JSON 可声明 `props.rows` 等覆盖预设 |
| `React.memo` 包裹层数 | `ParagraphZHField.memo` → `GenericTextField.memo`(双层) | `GenericTextField.memo`(单层) |
| 渲染产物 DOM | 不变 | 不变(预设值逐字复制自原文件) |
| 测试 `__tests__/FieldRenderer.test.tsx` | 7 用例全绿 | 7 用例全绿(无用例触及这 7 个 key) |

## 风险与回滚

### 风险

1. **`{...props}` 覆盖预设顺序错误(中风险)**:`<GenericTextField {...preset} {...props} />` 中 `props` 必须排在 `preset` 之后,否则 schema 层 `props` 无法覆盖预设。实施时需核对展开顺序。若顺序写反,模板 JSON 中声明的 `props.rows` 等会被预设覆盖,行为静默错误。

2. **`label` 回退逻辑差异(低风险)**:原浅包装使用 `label={label || 'Chinese Translation'}`(带默认文案兜底),新方案直接 `label={label}` 传入 schema 的 `label`。若某模板 JSON 对 `paragraphZH` 字段未声明 `label`,渲染时 `FieldWrapper` 会回退到 `label || fieldKey`(`GenericTextField.tsx#L57`),显示原始 key 而非友好文案。**核对结论**:36 个模板 JSON 中,凡引用这 7 个 key 的字段都显式声明了 `label`(如 `bilingual-quote.json#L17-L45` 逐字段标注),未声明 `label` 的字段不会出现在编辑器面板。风险实际为零,但实施时应 grep 校验。

3. **`React.memo` 单层化对重渲染的影响(无)**:原浅包装的 `React.memo` 在 props 引用稳定时直接跳过渲染,但内部仅转发 props 给同样 `React.memo` 的 `GenericTextField`,双层 memo 等价于单层 memo。删除外层不增加任何重渲染成本。

4. **`displayName` 丢失(无影响)**:`React.memo` 的 `displayName` 仅影响 DevTools 组件树展示名。删除后这些节点在 DevTools 中显示为 `GenericTextField`,反而更准确——它们本来就是 `GenericTextField`。

5. **`signature` 字段未被误收敛(已规避)**:`signature` 在 `componentMap` 映射到 `ImageField`(`FieldRenderer.tsx#L49`),不在 `textFieldPresets` 中,保持原行为。

### 回滚

改动集中在 3 处:
- 删除 7 个 `.tsx` 文件(git 可恢复)
- `FieldRenderer.tsx` 顶部 import(删 7 行加 1 行)
- `componentMap`(删 7 条)+ `textFieldPresets`(新增)+ 默认规则(新增 10 行)

回滚直接 `git revert` 提交即可,无数据迁移、无 schema 变更、无外部接口变更。预设表是纯常量数据,删除即回滚。

## 验证方式

1. **单元测试(已有)**:运行 `__tests__/FieldRenderer.test.tsx`,确认 7 个用例全绿:
   - `根据 schema key 渲染对应字段组件`(`title` 走 `TitleField`)
   - `separator 类型可通过 key 渲染`
   - `separator 类型可作为 fallback 渲染`
   - `number 类型且无 key 映射时渲染 GenericNumberField`
   - `未识别且没有 fallback 时返回 null`(`key: ' totallyUnknown'` 不在 `componentMap` 也不在 `textFieldPresets`,仍返回 null)
   - `将 pages 透传给字段组件`
   - `backgroundColor key 映射到 ColorField`

   本方案未动 `TitleField` / `SeparatorField` / `GenericNumberField` / `ColorField` 的映射,这些用例行为不变。

2. **新增用例建议(推荐)**:在 `FieldRenderer.test.tsx` 中补 2 条用例锁定默认规则:
   ```tsx
   it('未注册的文本型 key 走 GenericTextField 预设', () => {
     const { container } = render(
       <FieldRenderer
         schema={{ key: 'paragraphZH', label: '中文译文' } as FieldSchema}
         page={basePage}
         onUpdate={noop}
         customFonts={customFonts}
       />
     );
     expect(container.querySelector('textarea')).toBeInTheDocument();
   });

   it('schema 层 props 覆盖 textFieldPresets 的 rows', () => {
     const { container } = render(
       <FieldRenderer
         schema={{ key: 'paragraph', label: 'Body', props: { rows: 2 } } as FieldSchema}
         page={basePage}
         onUpdate={noop}
         customFonts={customFonts}
       />
     );
     expect(container.querySelector('textarea')?.getAttribute('rows')).toBe('2');
   });
   ```
   注意:`GenericTextField` 内部用 `DebouncedTextArea`(`src/components/ui/DebouncedBase`),`rows` 是否透传到 DOM 需实测;若 `DebouncedTextArea` 未透传 `rows` 到 `<textarea>`,改用 `onUpdate` 调用断言或 mock `GenericTextField`。

3. **手动验证**:在编辑器中打开 `bilingual-quote` 模板(同时用到 `paragraph` / `quoteZH` / `sideHeader` / `imageLabel` / `actionText` 5 个收敛字段),逐一编辑这 5 个字段,确认:
   - 输入框出现且 placeholder 与原行为一致
   - `paragraph` / `quoteZH` 为多行文本域,`sideHeader` / `imageLabel` / `actionText` 为单行输入
   - 字体回退生效(`paragraphZH` / `quoteZH` 编辑器内字体为思源宋体,颜色为 `#475569`)
   - 样式面板(`ZineStylePanel`)仍可正常打开与调整

4. **TypeScript 编译验证**:`npx tsc --noEmit`,确认删除 import 后无未使用变量告警、`textFieldPresets` 的类型注解通过类型检查。

5. **grep 残留验证**:实施后执行 `grep -rn "ActionTextField\|ImageLabelField\|ImageSubLabelField\|ParagraphField\|ParagraphZHField\|QuoteZHField\|SideHeaderField" src/`,确认除 `GenericTextField` 之外无任何残留引用(浅包装文件名不应再出现于 `src/` 任何位置)。
