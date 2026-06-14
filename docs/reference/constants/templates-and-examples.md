# 模板注册表常量与示例

## 7. 模板注册表 (`registry.ts`)

- **文件**: `src/templates/registry.ts`

### 7.1 模板分类

模板按以下 6 个分类组织（定义在 `TemplateConfig.category` 联合类型中）：

| 分类 | 值 | 说明 |
|:---|:---|:---|
| Cover | `'Cover'` | 封面类 |
| Gallery | `'Gallery'` | 画册类 |
| Product | `'Product'` | 产品展示 |
| Marketing | `'Marketing'` | 营销宣传 |
| General | `'General'` | 通用排版 |
| Resume | `'Resume'` | 简历类 |

### 7.2 模板配置结构

```typescript
interface TemplateConfig {
  id: string;                      // 唯一标识
  name: string;                    // 显示名称
  category: 'Cover' | 'Product' | 'Marketing' | 'General' | 'Gallery' | 'Resume';
  desc: string;                    // 描述
  tags: string[];                  // 搜索标签
  component: React.FC;             // React 渲染组件 (Schema 驱动时可为 null)
  schema?: TemplateSchema;         // JSON Schema 定义
  fields: FieldSchema[];           // 编辑器字段
  supportedRatios: AspectRatioType[]; // 支持的画幅
  defaultData?: Partial<PageData>; // 默认数据
}
```

### 7.3 模板查询工具

```typescript
// 按 ID 查找模板
export function getTemplateById(id: string): TemplateConfig | undefined;

// 按分类过滤模板
export function getTemplatesByCategory(category: string): TemplateConfig[];

// 按画幅过滤模板
export function getTemplatesByRatio(ratio: AspectRatioType): TemplateConfig[];

// 搜索模板（名称、标签、描述）
export function searchTemplates(query: string): TemplateConfig[];
```

---

## 9. 使用示例

### 9.1 访问设计令牌

```typescript
import { DEFAULT_DESIGN_SYSTEM } from '../constants/theme';

// 读取颜色令牌
const primaryColor = DEFAULT_DESIGN_SYSTEM.tokens.colors.primary;

// 读取字体令牌
const displayFont = DEFAULT_DESIGN_SYSTEM.tokens.typography.display;

// 读取间距令牌
const spacing = DEFAULT_DESIGN_SYSTEM.tokens.spacing.md;
```

### 9.2 使用布局预设

```typescript
// 在模板 Schema 中引用预设
{
  type: 'Container',
  presetKey: 'safe-area',  // 引用预设
  children: [...]
}
```

### 9.3 注册新模板

```typescript
import { TEMPLATES } from '../templates/registry';

TEMPLATES.push({
  id: 'my-custom-template',
  name: 'My Custom Template',
  category: 'Gallery',
  desc: '自定义画册模板',
  tags: ['gallery', 'photo', 'portrait'],
  component: () => null,
  schema: MyTemplateSchema,
  fields: withBaseFields(['title', 'image', 'description']),
  supportedRatios: ['2:3'],
  defaultData: {
    title: '画册标题',
    description: '描述文字'
  }
});
```
