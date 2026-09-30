# 5.3 撤销栈字体剥离与保全

## 事实核对

报告对问题点的描述与代码核对一致，逐条验证如下：

1. **`buildSnapshot` 深拷贝字体二进制**：`src/store/useStore.ts#L71-L83` 中 `customFonts: deepClone(state.customFonts)` 确实把整个 `CustomFont` 对象（含 `dataUrl` Base64 负载）一起 `structuredClone`。`CustomFont` 接口（`src/types.ts#L7-L11`）定义 `dataUrl?: string`，该字段承载多兆字节的字体二进制。核对属实。

2. **5MB 门限逻辑**：`src/store/useStore.ts#L318-L328` 存在 `MAX_SNAPSHOT_SIZE = 5 * 1024 * 1024`，通过 `JSON.stringify(snapshot).length` 检测，超限即 `console.warn` 后 `return`，不压栈。核对属实。

3. **`undo`/`redo` 直接覆写 `state.customFonts`**：`src/store/useStore.ts#L551`、`#L575`、`#L600` 三处均为 `customFonts: deepClone(prev.customFonts || [])`，把快照内的字体对象原样克隆后写回 `state.customFonts`。报告所说的"快照剥离二进制后若直接覆写会洗掉持久化字体二进制"风险路径成立。

4. **自动保存链路确实会洗数据**：`src/pages/EditorPage.tsx#L110-L120` 的 3 秒防抖自动保存依赖 `hasUnsavedChanges` 触发 `saveToDB`；`saveToDB`（`src/hooks/useProject.ts#L117-L130`）把 `state.customFonts` 原样写入 `saveProject`。而 `undo()`/`redo()` 在 `set` 中都置 `hasUnsavedChanges: true`（`#L555`、`#L580`、`#L605`）。因此一旦把缺 `dataUrl` 的快照覆写回 `state.customFonts`，3 秒后自动保存即把"裸元数据"持久化进 IndexedDB，字体二进制被永久洗掉。报告该论断属实，并非夸大。

5. **测试现状**：`src/store/useStore.test.ts#L196-L233` 的 5MB / 50 条 / 序列化异常三个用例仍然有效（本方案不删除 5MB 门限，见下文"根因"说明）；`#L494-L501` 的 `setCustomFonts` 用例使用 `url` 字段（非 `CustomFont` 接口的 `dataUrl`），属测试桩数据偏差，不影响本方案；`#L566-L608` 的"缺失字段回退"用例推入的快照不含 `customFonts`，`prev.customFonts || []` 兜底为 `[]`，`rehydrate([])` 仍为 `[]`，断言 `toEqual([])` 通过。本方案不破坏这些测试。

## 根因

直接症结是 `buildSnapshot` 把字体二进制当作普通状态一起深拷贝进快照。中文字体 Base64 化后常达 3~5.5MB，单字体即可让 `JSON.stringify(snapshot).length` 持续 >5MB，命中 `pushHistory` 的硬门限，导致后续每次页面修改都跳过压栈，Undo/Redo 永久失效。

但 5MB 门限本身**不是本次要拆掉的对象**：它是对 `pages` 内嵌巨大数据（如内联 Base64 图像）的兜底防线，与字体问题是两条独立链路。按 CLAUDE.md "不保留向后兼容/移除废弃路径"原则，本次只拆字体的深拷贝路径，不动 5MB 门限——门限在此处并非"兼容层"，而是另一类数据的安全网。

真正的根因是**快照承担了它不该承担的职责**：字体二进制的真源（source of truth）已经在 IndexedDB 中持久化（`saveProject` 写入），也在 `document.fonts` 中注册可渲染。快照只需保留"用哪几个字体"的元信息引用，无需复制"字体的字节"。`deepClone(state.customFonts)` 是越界复制——既浪费内存，又撞上 5MB 门限。剥离即把快照还原为"元数据引用层"。

## 解决方案

核心三步：快照只存元数据 → 维护会话级字体二进制缓存 → 恢复时用缓存 rehydrate，绝不让裸元数据直接覆写 `state.customFonts`。

### 设计原则（遵从 ~/.claude/CLAUDE.md）

- **不保留向后兼容**：`buildSnapshot` 的 `customFonts` 字段直接改为元数据映射，不保留"有时带 dataUrl 有时不带"的双形快照。
- **最简实现**：会话级 `Map<string, string>` 作 binaryMap，不引入新模块、不抽象 selector。
- **不破坏现有测试**：见上文"事实核对"第 5 条，所有相关用例继续通过。
- **关键防御**：`rehydrateFonts` 对缺二进制的字体**直接丢弃**，绝不让 `state.customFonts` 出现"有 name 无 dataUrl"的条目——这是堵住自动保存洗库的最后一道闸。

### 实施步骤

**Step 1：建立会话级字体二进制缓存**

`src/store/useStore.ts` 模块顶层（紧邻 `uncommittedBaseline`）新增：

```typescript
// 字体二进制的会话级缓存：family -> dataUrl
// 快照只存元数据，恢复时用此映射 rehydrate，避免裸元数据覆写 state.customFonts
const fontBinaryMap = new Map<string, string>();

/** 将字体列表中的二进制登记进会话缓存 */
const cacheFontBinaries = (fonts: CustomFont[] = []) => {
  for (const f of fonts) {
    if (f.family && f.dataUrl) {
      fontBinaryMap.set(f.family, f.dataUrl);
    }
  }
};

/** 用会话缓存补全快照字体的二进制，缺二进制的条目直接丢弃 */
const rehydrateFonts = (metadata: CustomFont[] = []): CustomFont[] => {
  const result: CustomFont[] = [];
  for (const m of metadata) {
    if (!m.family) continue;
    const dataUrl = fontBinaryMap.get(m.family);
    if (!dataUrl) continue; // 防御：缺二进制不写入 state，避免自动保存洗库
    result.push({ name: m.name, family: m.family, dataUrl });
  }
  return result;
};
```

`fontBinaryMap` 不进入 store state——它是 side-channel，变化不应触发渲染。会话生命周期内累积，`loadProject` 切换工程时清空。

**Step 2：在两个字体入口点登记缓存**

字体二进制进入 `state.customFonts` 的合法入口只有两处：`loadProject` 与 `setCustomFonts`。两处都加 `cacheFontBinaries`。

`loadProject`（`src/store/useStore.ts#L245-L260`）改造：

```typescript
set((state) => ({
  pages: migratedData.pages || [],
  // ... 其余字段不变
  customFonts: migratedData.customFonts || [],
  // ...
}));
cacheFontBinaries(migratedData.customFonts || []); // 切工程前先清空，避免跨工程串味
```

切换工程必须先清缓存（字体按工程隔离）。在 `loadProject` 入口（`#L214` 附近、`uncommittedBaseline = null;` 之后）加：

```typescript
fontBinaryMap.clear();
```

注意：`loadProject` 的 try 块内 `migrateToV3` 之后再 `cacheFontBinaries`，保证只缓存成功加载的工程数据；失败兜底分支（`#L284-L304`）的 `customFonts: []` 不触发缓存写入。

`setCustomFonts`（`#L355-L358`）改造：

```typescript
setCustomFonts: (customFonts) => {
  cacheFontBinaries(customFonts);
  loadCustomFontsIntoDOM(customFonts);
  set({ customFonts, hasUnsavedChanges: true });
},
```

**Step 3：`buildSnapshot` 剥离字体二进制**

`src/store/useStore.ts#L80` 改为：

```typescript
customFonts: state.customFonts.map(f => ({ name: f.name, family: f.family })),
```

注意：只保留 `name`/`family`，**显式不拷贝 `dataUrl`**。`structuredClone` 也一并省略——元数据是原始值字符串，浅拷贝即可，`deepClone` 在此处多余。

**Step 4：`undo`/`redo` 改用 `rehydrateFonts`**

三处 `customFonts: deepClone(prev.customFonts || [])`（`#L551`、`#L575`、`#L600`）统一替换为：

```typescript
customFonts: rehydrateFonts(prev.customFonts || []),
```

恢复前不另做 `cacheFontBinaries(get().customFonts)`：当前态的字体必来自 `loadProject`/`setCustomFonts`，二进制已在缓存。`rehydrateFonts` 内部丢弃缺二进制的条目，是最后一道闸——即便上游入口点未来被遗漏，也不会让裸元数据落到 `state.customFonts`。

### 5MB 门限去留

保留 `MAX_SNAPSHOT_SIZE` 及 `pushHistory` 中的检测。剥离字体后，常规工程快照回落到 KB 级，门限不再被字体撞穿；但 `pages` 内嵌巨大 Base64 图像仍可能触发，门限继续充当兜底。这不是兼容层，是独立链路的防线，不删。

## Before / After

### Before

`src/store/useStore.ts#L80`：

```typescript
customFonts: deepClone(state.customFonts), // 含多兆字节 Base64 dataUrl
```

`src/store/useStore.ts#L551`、`#L575`、`#L600`：

```typescript
customFonts: deepClone(prev.customFonts || []),
```

效果：单字体 3~5.5MB → 快照 `JSON.stringify` 长度持续 >5MB → `pushHistory` 命中门限 `return` → Undo/Redo 永久失效。

### After

`src/store/useStore.ts#L80`：

```typescript
customFonts: state.customFonts.map(f => ({ name: f.name, family: f.family })),
```

`src/store/useStore.ts#L551`、`#L575`、`#L600`：

```typescript
customFonts: rehydrateFonts(prev.customFonts || []),
```

新增模块级 `fontBinaryMap` + `cacheFontBinaries` + `rehydrateFonts`（见 Step 1）。

效果：快照体积下降约 99.9%（字体从 MB 级降到几十字节）；`pushHistory` 不再被字体撞穿门限；undo/redo 恢复时由 `fontBinaryMap` 补二进制，`state.customFonts` 始终带 `dataUrl`，自动保存不会洗库。

## 风险与回滚

### 风险

1. **会话缓存的跨工程串味**：若 `loadProject` 忘记 `fontBinaryMap.clear()`，工程 A 的字体二进制可能在工程 B 的 rehydrate 中错误补回。已在 Step 2 明确 `loadProject` 入口清空缓存，风险可控。**严重度：低。**

2. **`fontBinaryMap` 内存常驻**：会话内每新增一字体即缓存一份 Base64（多兆字节级）。若用户在一个会话内连续加载大量字体，缓存会累积。但字体本就在 `state.customFonts` 中持有，缓存只是多持一份引用——字符串在 JS 引擎中按值存，`Map.set` 同一 family 多次写入是覆盖而非追加，单字体最多多占一份副本。可接受。**严重度：低。**

3. **快照中字体缺二进制的丢弃语义**：若工程 A 的字体在 `loadProject` 后 `fontBinaryMap` 已清空切换到工程 B，又通过 undo 回到工程 A 的快照——但 `loadProject` 本身会 `past: []`、`future: []` 清空历史（`#L258-L259`），切换工程不存在跨工程 undo 路径。此风险不存在。**严重度：无。**

4. **测试桩数据偏差**：`useStore.test.ts#L496` 的 `setCustomFonts` 用例传入 `{ url }` 而非 `{ dataUrl }`，`cacheFontBinaries` 因 `f.dataUrl` 缺失跳过该字体（不写入缓存）。该用例只断言 `state.customFonts` 被原样设置，不涉及缓存/rehydrate，断言通过。**严重度：无。**

5. **未来新增字体入口点遗漏缓存**：若后续代码绕过 `setCustomFonts`/`loadProject` 直接 `set({ customFonts })` 写入带二进制的字体，`fontBinaryMap` 不会登记，undo/redo 时 `rehydrateFonts` 会丢弃该字体。`rehydrateFonts` 的"缺二进制即丢弃"是防御闸——不会洗库，但会让该字体在 undo 后消失。需在 code review 时把"写入 `state.customFonts` 必经 `cacheFontBinaries`"作为契约固化。**严重度：低，可观测。**

### 回滚

改造集中在单文件 `src/store/useStore.ts`：

- 新增模块级 `fontBinaryMap`、`cacheFontBinaries`、`rehydrateFonts`。
- `buildSnapshot` 的 `customFonts` 行改写。
- `loadProject` 入口加 `fontBinaryMap.clear()`、成功分支加 `cacheFontBinaries`。
- `setCustomFonts` 加 `cacheFontBinaries`。
- `undo`/`redo` 三处 `customFonts` 行改写。

无数据迁移、无 store schema 变更、无持久化格式变更。回滚即 `git revert` 对应提交，IndexedDB 中的字体数据未受任何格式改动，回滚无副作用。

## 验证方式

1. **类型与单测**：
   - `npx tsc --noEmit` 确认 `rehydrateFonts` 签名与 `CustomFont` 接口契合，无残留 `deepClone` 误用。
   - `npm test -- useStore` 跑通全部 store 用例，重点关注：
     - `快照超过 5MB 时不写入历史`（仍通过，5MB 门限保留）。
     - `undo 恢复缺少新字段的旧快照时使用默认值`（`rehydrate([])` = `[]`，断言 `toEqual([])` 通过）。
     - `连续调用 pushHistory 相同快照不会重复压栈`（`isEqualSnapshot` 比较元数据，去重正确）。

2. **行为人工验证**（遵从项目 verify skill 精神，驱动真实流程而非只看测试）：
   - 启动 dev server，打开任意工程，上传一个 3~5MB 的中文字体（.ttf/.woff2）。
   - 在控制台确认 `[fontLoader]` 无 `Snapshot too large` 警告——剥离后快照不再撞门限。
   - 编辑页面文本（每次击键触发 `updatePage` 防抖入栈），执行多次 Undo/Redo，确认文本与字体均正确恢复，字体在画布上始终可渲染（不出现方框 fallback）。
   - 关键回归：Undo 后等待 >3 秒触发自动保存，刷新页面重载工程，确认自定义字体二进制仍在（`getProject` 返回的 `customFonts[i].dataUrl` 非空）——验证未被自动保存洗掉。
   - 切换到另一个工程再切回，确认字体仍正常——验证 `fontBinaryMap.clear()` 不误清当前工程。

3. **快照体积观测**（可选）：
   - 在 `pushHistory` 内临时打印 `JSON.stringify(snapshot).length`，对比改造前后：改造前单字体工程快照 >3MB，改造后应回落到 KB 级。

## 涉及文件

- `src/store/useStore.ts` — 新增 `fontBinaryMap`/`cacheFontBinaries`/`rehydrateFonts`；改造 `buildSnapshot`、`loadProject`、`setCustomFonts`、`undo`、`redo`。
- `src/types.ts` — 不变（`CustomFont` 接口保持 `name`/`family`/`dataUrl?`）。
- `src/utils/fontLoader.ts` — 不变。
- `src/store/useStore.test.ts` — 不变（现有用例无需改动即通过）。
