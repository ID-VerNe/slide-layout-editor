# 设计规格全局重构审计与计划 (V3 - 24x24 模块化网格终极版)

## 审计结论（关键问题）
- **布局参考系缺失**：目前采用混合布局（Flex/Grid/Absolute），缺乏统一的物理参考系。12 栅格在处理 70%、55% 等比例时存在偏差，需升级为 **24x24 模块化网格（Modular Grid）**。
- **垂直锚定缺失**：目前高度控制零散，需通过 **24 模块化行（Rows）** 实现高度的坐标化锚定。
- **微观对齐偏差**：需引入 **8px 基线网格（Baseline Grid）**，强制垂直排版的一致性。
- **渲染体系处于混合态**：部分模板走 Schema，多数仍是 React 组件，无法形成单一渲染管线。
- **全局元信息零散**：`MetadataOverlay` 缺乏**“Folio 锚点锁定”**的统一模型。
- **排版系统无约束**：Display / Body / Metadata 层级字号、行高、字距缺少离散档位约束。
- **颜色/布局无 Token 化**：仍有大量直接 hex 写入，布局预设没有 preset 化。
- **编辑器自由度过高**：允许任意调节，破坏了设计规范的“受控性”。

## 差距矩阵
| 规格项 | 当前状态 | 差距 |
| --- | --- | --- |
| **24x24 模块化网格** | 无统一参考系 | **核心基座**；所有布局基于 24x24 坐标定义 |
| **8px 基线网格** | 仅背景纹理 | **微观基准**；强制文本基线对齐，支持快捷键开关 |
| **Folio 锚点锁定** | 零散实现 | 锁定在 `col-2, row-23` 等绝对模块坐标 |
| **类型体系 (Scale)** | 组件内各自处理 | 无统一 scale，需替换为 Zine* 原子组件 |
| **网格与容器预设** | LayoutRenderer 自由 grid | 无统一安全边距（Safe Padding）/ 出血（Bleed）约束 |
| **颜色 Token 化** | theme + hex 混用 | 无 token 层与全局映射；禁用直写十六进制颜色 |
| **编辑器约束** | 可随意调节 | 缺乏“受控选项”来保证风格一致 |

---

## 全局重构计划

1. **建立 24x24 模块化网格内核 (Infrastructure)**  
   - **PageFrame 坐标化**：`PageFrame` 提供 24x24 物理参考系。
   - **坐标原语**：Schema 支持 `colStart/colSpan` 和 `rowStart/rowSpan`。`LayoutRenderer` 将其转换为百分比或 Grid Area。
   - **基线系统**：集成 8px 基线网格，支持 `Alt+;` 召唤。所有原子组件支持 `baseline-snap`。

2. **建立唯一渲染管线（唯一事实来源）**  
   - **100% Schema 驱动**：彻底移除 React 模板直渲，统一入口。
   - **Schema 覆盖策略**：每个模板必须有 `TemplateSchema`；未迁移模板先用“兼容壳 schema”。
   - **运行时校验**：引入 `validateTemplate`，渲染前验证 schema 结构。

3. **设计系统内核化（强约束）**  
   - 建立排版 scale（Display / Body / Metadata）定义字号/行高/字距的**离散档位**。
   - 统一 spacing/grid/folio/bleed 规范为 **preset**，在 schema 层引用 `presetKey`。
   - 明确定义 `DesignSystem.tokens`（typography / grid / layout / color / effects）。

4. **颜色与字体 Token 化**  
   - 将所有颜色替换为 token（primary/muted/background/surface/outline/interactive）。
   - 通过 CSS 变量 + Tailwind theme 扩展映射 token -> 真实值。
   - 补齐中英文字体结构（headingFontZH/bodyFontZH），并给各层级默认字体。

5. **Schema 版本化与迁移机制**  
   - 为 `ProjectData / PageData / TemplateSchema` 增加 `version` 字段。
   - 建立 `migrations/` 目录：按版本顺序执行（数据结构、字段命名、preset/token 变更）。

6. **编辑器约束层重构**  
   - 字距 / 行高 / 字号采用**有限选项**，并与 DesignSystem 预设绑定。
   - 颜色字段改为 token 选择器，禁用直接输入 hex。
   - 对 `styleOverrides` 做白名单控制，仅允许 preset 覆盖项。

7. **统一页面框架 PageFrame**  
   - 在 `Preview` 层引入 `PageFrame`：Folio 锚点层 + 内容层 + 网格/导出辅助层。
   - `GlobalFolio` 从模板中剥离，统一在 `PageFrame` 内渲染，确保跨模板位置绝对静止。

8. **原子组件重构（语义化排版原语）**  
   - 替换 `SlideHeadline / SlideParagraph / SlideBlockLabel` 为：  
     - `ZineDisplay`（Display）  
     - `ZineBody`（Body）  
     - `ZineCaption`（Metadata/Caption）

9. **模板原型库 (Archetypes) 统一化**  
   - 构建 Gallery / Archive / Tension 等 archetype 骨架（24x24 模块化块）。
   - 所有模板基于 archetype 派生，保证一致的网格排版节奏。

---

## 落地顺序与文件清单

1. **DesignSystem 数据结构与 24x24 定义**  
   - `src/types.ts`：新增 `DesignSystem` 结构，定义 24x24 坐标布局字段，补齐 CJK 字体。
   - `src/store/useStore.ts`：注入默认 DesignSystem。
   - `tailwind.config.js` / `index.css`：CSS 变量与 token 映射。

2. **PageFrame 与 物理网格叠加层**  
   - `src/components/PageFrame.tsx`：实现 24x24 网格背景 + 8px 基线 + Folio 锁定层 + 内容 Slot。
   - `src/components/Preview.tsx`：切换到 PageFrame 包裹模式，移除模板自管理 meta。

3. **渲染器增强 (Modular LayoutRenderer)**  
   - `src/templates/schemas/types.ts`：增加 `colStart/Span`, `rowStart/Span`, `presetKey` 定义。
   - `src/templates/schemas/LayoutRenderer.tsx`：实现对 24 坐标的自动映射与 preset 解析。
   - `src/templates/schemas/validator.ts`：新增校验逻辑。

4. **语义化原子组件替换**  
   - `src/components/ui/slide/*`：实现 `ZineDisplay / ZineBody / ZineCaption`。
   - `src/templates/schemas/componentRegistry.ts`：更新注册表。

5. **编辑器约束层**  
   - `src/components/editor/fields/*`：字距/行高/字号改为受控选项。
   - `src/components/editor/GlobalSettings.tsx`：颜色/字体 token 选择器。

6. **模板库 24x24 适配与架构迁移**  
   - 逐个迁移 Gallery/Cover/Product/Resume 等 30+ 模板，应用 24x24 坐标映射。

7. **数据迁移与验证**  
   - `src/utils/migrations/`：建立项目数据结构升级脚本。

---

## 里程碑与验收标准
1. **M1: 24x24 模块化基座落地**：PageFrame 生效，网格调试层可见。验收：元素可精准对齐。
2. **M2: 原子组件与 Token 接管**：Zine* 组件接管。验收：排版符合 Scale。
3. **M3: 100% Schema 驱动**：移除所有 React 模板。验收：Preview 路径唯一。
4. **M4: 编辑器约束与迁移完成**：编辑器受控。验收：旧项目平滑升级。
