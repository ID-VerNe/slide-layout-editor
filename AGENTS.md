# Comment Style Guide / 注释规范

## 原则

| 用途 | 语言 | 示例 |
|------|------|------|
| 函数/模块的目的、业务逻辑说明 | 中文 | `/** 将正整数转为罗马数字（支持 1~3999）*/` |
| 布局/模板的结构划分 | 中文 | `// 1. 顶部大图 — 遵循天头原则` |
| 内联逻辑解释（为什么这样写） | 中文 | `// 降级方案：使用时间戳 + 随机数` |
| 类型注解、技术引用、URL | 英文 | `// pixelRatio 0.1` |
| Fix / TODO / HACK / XXX 备注 | 英文 | `// TODO: handle edge case` |
| 编译器指令 | 英文 | `// @ts-expect-error` |
| 对外开放 API 的 JSDoc | 英文 | `/** Returns the aspect ratio for a given template ID */` |

## 禁止

- **同一行中英混合** ❌ → `// 1. 顶部大图 (Main Feature)`
- **无意义注释** ❌ → `// 循环遍历`

### 判定边界

- 英文译名不是技术事实。` (Side Header Stamp)`、` (Main Feature)` 这类中文标题的英文翻译,
  与中文写在同一行即属违规。译名要么删掉,要么拆到独立英文行。
- 英文技术坐标、参数值、字体名、URL 属于技术事实,可以与中文同处一个注释块,
  但应分两行:中文一行写意图,英文一行写事实。
- 文件头双语标题(如本文档 `# Comment Style Guide / 注释规范`)是文档可读性例外,代码注释不适用。

## 统一方向

> **中文写"为什么"，英文写"是什么"。**

- 中文注释解释**意图**：这段代码在解决什么问题、为什么选择这个方案
- 英文注释记录**事实**：参数含义、数据结构、来源链接、已知限制

## 文件头注释

不建议在文件头放置大段的版权或修改记录。文件名自身即是标识，需要说明时用一行中文简述该文件的职责。

## 示例

```typescript
// A 类: 删除英文译名,只保留中文
// Before: // 1. 左侧大卡片 (Main Feature)
// After:  // 1. 左侧大卡片

// B 类: 英文技术坐标拆到独立行
// Before: // 1. 顶部大图 (Rows 1-15) - 遵循天头原则
// After:
// 1. 顶部大图 - 遵循天头原则
// Rows 1-15

// C 类: 中文意图 + 英文技术规格分两行
// Before: // 主标题：Playfair Display, 32pt-48pt, Tracking +150 to +250 (AllCaps)
// After:
// 主标题样式
// Playfair Display, 32pt-48pt, Tracking +150 to +250, AllCaps

// 正确 — 中文说明业务意图
/** 根据模板 ID 从注册表获取正确的宽高比，回退到 16:9 */
function getAspectRatio(templateId: string): number { ... }

// 正确 — 英文说明技术引用
// @ts-expect-error — this lib has no types
import foo from 'bar';

// 正确 — 对外 API 用英文
/** Returns the aspect ratio for a given template ID, or the default fallback */
```