# 模板注册表常量与示例

## 7. 模板注册表 (`registry.ts`)

- **文件**: `src/templates/registry.ts`

### 7.1 模板分类

模板按以下 7 个分类组织（定义在 `TemplateDefinition.category` 联合类型中）：

| 分类 | 值 | 说明 |
|:---|:---|:---|
| Cover | `'Cover'` | 封面类 (3 个模板) |
| Gallery | `'Gallery'` | 画册类 (17 个模板) |
| Product | `'Product'` | 产品展示 (3 个模板) |
| Marketing | `'Marketing'` | 营销宣传 (3 个模板) |
| General | `'General'` | 通用排版 (5 个模板) |
| Resume | `'Resume'` | 简历类 (1 个模板) |
| Bilingual | `'Bilingual'` | 双语阅读类 (4 个模板) |

### 7.2 模板配置与定义结构

```typescript
export interface TemplateDefinition {
  id: string;                      // 唯一标识
  name: string;                    // 显示名称
  category: 'Cover' | 'Product' | 'Marketing' | 'General' | 'Gallery' | 'Resume' | 'Bilingual';
  desc: string;                    // 描述
  tags: string[];                  // 搜索标签
  supportedRatios: AspectRatioType[]; // 支持的画幅 (含 '3:4')
  fields: (FieldType | FieldSchema)[]; // 编辑器字段
  defaultData?: Partial<PageData>; // 模板级默认数据
  root: TemplateNode;              // 渲染树根节点
}

export interface TemplateConfig extends Omit<TemplateDefinition, 'root'> {
  component: React.FC<{ page: any; typography?: any }>;
  schema?: TemplateSchema;
}
```

### 7.3 模板查询工具

```typescript
// 按 ID 查找模板
export function getTemplateById(id: string): TemplateConfig | undefined;
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

### 9.3 编写新模板 JSON 规范

在 `src/templates/definitions/Gallery/my-custom-template.json` 中直接写入声明式定义，无需手动编写 TypeScript 注册代码：

```json
{
  "id": "my-custom-template",
  "name": "My Custom Template",
  "category": "Gallery",
  "desc": "自定义画册模板",
  "tags": ["gallery", "photo", "portrait"],
  "supportedRatios": ["2:3", "3:4"],
  "fields": ["title", "image", "paragraph"],
  "defaultData": {
    "title": "画册标题",
    "paragraph": "描述文字"
  },
  "root": {
    "type": "Container",
    "layout": "modular",
    "children": []
  }
}
```
