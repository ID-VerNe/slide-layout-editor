# 5.6 dimensionCache LRU 化

## 事实核对

报告对问题点的描述属实，核对结论如下：

1. **类型确认**: `src/hooks/useAssetUrl.ts#L9` 的 `dimensionCache` 确为原生 `Map<string, ImageDimensions>`，无容量限制、无淘汰机制。旁边的 `assetCache`（`useAssetUrl.ts#L8`）确为 `new LRUCache<string, string>(100)`，使用 `src/utils/lruCache.ts` 中带 LRU 淘汰的实现。两者形成不对称的内存管理。

2. **写入守卫一致**: `dimensionCache` 的写入（`useAssetUrl.ts#L63`、`useAssetUrl.ts#L100`）与 `assetCache` 的写入（`useAssetUrl.ts#L91`）都被 `if (assetSource.startsWith('asset://'))` 守卫（L99-L101 与 L90-L92）。因此两者的 key 集合理论同源——只对 IndexedDB 资源（`asset://` ID）增长。报告所述"导入数百张图片"场景下持续累积的判断成立。

3. **淘汰不同步（报告未提及的衍生问题）**: 当 `assetCache` 因容量满 100 淘汰 key K 时，`dimensionCache` 中 K 的尺寸条目并不被清理。下次 `useAssetUrl(K)` 被调用时走 `else` 分支（`useAssetUrl.ts#L70-L87`）重新加载 base64 并 `assetCache.set(K, ...)`，但 `dimensionCache` 仍保留 K 的旧尺寸条目。这种"幽灵条目"在每次 `assetCache` 淘汰时都会留下，是 `dimensionCache` 增长快于 `assetCache` 的根因。

4. **严重级别核实**: 每条 `dimensionCache` 条目为 key 字符串 + `{width, height}` 两个 number，约几十字节。即便累积到数千条，内存占用也仅约百 KB 量级。报告标为 Minor 准确，非阻断性问题，但与相邻 `assetCache` 的设计不一致属于可低成本消除的代码异味。

5. **`LRUCache` 接口兼容性确认**: `src/utils/lruCache.ts` 提供的 `LRUCache` 在 `get`/`set`/`has` 三个方法上与原生 `Map` 语义一致（`get` 未命中返回 `undefined`，`has` 返回 `boolean`）。唯一差异是 `set` 返回 `void` 而非 `Map` 自身——但原代码 `dimensionCache.set(assetSource, dims)`（L63、L100）均未使用返回值，替换无破坏性。`LRUCache` 还提供 `clear()`/`delete()`/`size`/`keys`/`values`，满足未来可能的清理需求。

## 根因

直接根因是 **同源缓存却选择了不同实现**：`assetCache` 与 `dimensionCache` 在同一文件、为同一组 `asset://` 资源、由同一段 `useEffect` 写入，但前者用 `LRUCache(100)`、后者用原生 `Map`。这是实现期的一处遗漏，而非有意为之的设计选择——没有理由让 URL 数据受容量约束而尺寸数据不受约束。

深层根因是 **`dimensionCache` 的写入点分散且无统一回收策略**：
- L56 在 `assetCache` 命中分支中读 `dimensionCache`，若未命中则同步触发 `Image.onload` 写入（L60-L66）。
- L96-L103 在新加载分支中异步触发 `Image.onload` 写入。

两个写入点都没有配套的淘汰逻辑，且 `dimensionCache` 作为模块级全局变量，没有跨 `useAssetUrl` 调用回收条目的入口。一旦 `assetCache` 淘汰某 key，对应的 `dimensionCache` 条目立即成为无法被外部观测也无法回收的孤儿条目。

## 解决方案

将 `dimensionCache` 的实现从 `Map` 替换为 `LRUCache`，容量与 `assetCache` 对齐为 100。改动仅一行类型声明，其余读写代码不变。

### 设计原则（遵从 ~/.claude/CLAUDE.md）

- **不保留向后兼容**: 直接修改 `dimensionCache` 的声明，不保留 `Map` 版本的分支或中间层。
- **最简实现**: 复用仓库内已有的 `LRUCache`，不引入第三方 LRU 库、不新增 `clear` 调度器或观察者。改动面为一行声明。
- **不破坏现有测试**: `__tests__/useAssetUrl.test.ts` 只断言 `url`/`dimensions`/`isLoading` 的对外行为，不关心 `dimensionCache` 的内部数据结构；`__tests__/lruCache.test.ts` 已覆盖 `LRUCache` 的容量淘汰语义。替换后两套测试均无需改动。
- **不扩大改动面**: 不在 `loadProject` 等跨模块入口显式调用 `clear()`。理由：`asset://` 资源 ID 是工程内唯一，切换工程后旧条目作为冷数据会被新工程的访问自然挤出 LRU 底部；显式 `clear` 仅节省约百 KB 临时占用，却要打通 `useStore.ts → useAssetUrl.ts` 的跨模块依赖，违反"关注点分离"。

### 实施步骤

**Step 1：替换 `dimensionCache` 声明**

`src/hooks/useAssetUrl.ts#L9`：

```ts
// 之前
const dimensionCache = new Map<string, ImageDimensions>();

// 之后
const dimensionCache = new LRUCache<string, ImageDimensions>(100);
```

`LRUCache` 已在 `useAssetUrl.ts#L2` 导入（`import { LRUCache } from '../utils/lruCache';`），无需新增 import。

**Step 2：确认读写调用点无需修改**

`dimensionCache` 的三处使用点（`useAssetUrl.ts#L56` 的 `get`、`useAssetUrl.ts#L63` 与 `useAssetUrl.ts#L100` 的 `set`）调用签名与 `LRUCache` 完全一致，无需改动。

### 关于"清理入口"

报告要求"提供清理、淘汰或重置入口"。LRU 的淘汰机制本身就是"淘汰入口"：每次 `set` 超过 100 容量时（`lruCache.ts#L22-L24`）自动淘汰最久未使用的 key。`LRUCache.clear()`（`lruCache.ts#L37-L39`）作为类内方法已存在，未来若需在工程切换时显式清空，可在 `useAssetUrl.ts` 导出一个薄封装调用 `assetCache.clear(); dimensionCache.clear();` 并在 `loadProject` 中触发——但本方案不引入此封装，避免为可忽略的百 KB 收益增加耦合。

## Before / After

### Before

```ts
const assetCache = new LRUCache<string, string>(100);
const dimensionCache = new Map<string, ImageDimensions>();
```

- `assetCache` 容量 100，LRU 淘汰。
- `dimensionCache` 无上限，永不淘汰；`assetCache` 淘汰 key 后 `dimensionCache` 残留幽灵条目。

### After

```ts
const assetCache = new LRUCache<string, string>(100);
const dimensionCache = new LRUCache<string, ImageDimensions>(100);
```

- 两者均为容量 100 的 LRU，淘汰策略一致。
- `dimensionCache` 上限与 `assetCache` 对齐，幽灵条目最多累积到 100 条后自动淘汰。

### 行为差异

| 维度 | Before | After |
|------|--------|-------|
| `dimensionCache` 容量 | 无上限 | 100 |
| 淘汰机制 | 无 | LRU，与 `assetCache` 同款 |
| `get` 命中时是否刷新访问顺序 | 否（`Map` 语义） | 是（`LRUCache` 语义，`lruCache.ts#L13-L15`） |
| `set` 返回值 | `Map` 自身 | `void`（原代码未使用，无影响） |
| 与 `assetCache` 的淘汰同步性 | 不同步，幽灵条目累积 | 大致同步（两者访问模式相近，最旧条目都会被挤出） |
| 测试改动 | — | 无 |

### 关于"刷新访问顺序"的语义变化

`LRUCache.get` 命中时会执行 `delete` + `set` 刷新顺序（`lruCache.ts#L13-L15`），而 `Map.get` 不修改顺序。对 `dimensionCache` 而言，L56 的 `dimensionCache.get(assetSource)` 命中后会刷新该 key 在 LRU 中的位置——这与同处一个 `if (assetCache.has(assetSource))` 分支内的 `assetCache.get`（L53）刷新行为对称，是预期的 LRU 语义，不引入错误。

## 风险与回滚

### 风险

1. **LRU 与 `Map` 语义差异（低风险）**: `LRUCache.get` 命中时刷新访问顺序，`Map.get` 不刷新。原代码在 `assetCache.has` 命中分支内同时调用 `assetCache.get`（L53，已刷新）与 `dimensionCache.get`（L56，原不刷新）。改 LRU 后 L56 也刷新，使得两个缓存的访问顺序更趋一致，不会产生错误——只是 `dimensionCache` 的淘汰时机略有提前。无功能回归。

2. **`set` 返回值差异（无影响）**: `Map.set` 返回 `Map` 自身，`LRUCache.set` 返回 `void`。原代码 `dimensionCache.set(assetSource, dims)`（L63、L100）均未使用返回值，替换无破坏。

3. **容量阈值合理性（低风险）**: 100 条 `dimensionCache` 条目约占几 KB，即便用户在单次会话中访问超过 100 个 `asset://` 资源，旧条目会被 LRU 淘汰；下次访问旧资源时 `dimensionCache.has` 返回 false，触发 L60-L66 的 `Image.onload` 重新读取尺寸并回填。尺寸是图片固有属性，重读结果与原缓存一致，无正确性问题，仅有一次 `Image` 加载的微小开销。

4. **与 `assetCache` 容量对齐是否过小（无风险）**: `dimensionCache` 与 `assetCache` 容量同为 100，访问模式几乎同步，因此 `dimensionCache` 命中率与 `assetCache` 命中率接近。即便偶尔未命中导致重读尺寸，开销仅为一次 `Image.onload`，可忽略。

### 回滚

改动范围限于 `useAssetUrl.ts#L9` 一行类型声明。回滚直接还原为 `new Map<string, ImageDimensions>()` 即可，无数据迁移、无外部接口变更、无测试改动。

## 验证方式

1. **单元测试（已有，无需新增）**: 运行 `__tests__/useAssetUrl.test.ts`，确认 6 个用例全部通过：
   - `应该能正确加载普通 URL 并返回尺寸`
   - `应该能处理 asset:// 协议的资源`
   - `Electron 环境下优先读取本地文件并识别 SVG MIME`
   - `Electron 环境下正确识别 WebP 与 JPEG 扩展名的 MIME 类型`
   - `Electron 读取失败时回退到 IndexedDB`
   - `图片加载失败时尺寸回退到 0`

   这些用例覆盖 `dimensionCache.get`（命中分支）与 `dimensionCache.set`（新加载分支与失败回退分支）的全部路径，替换为 LRU 后行为应一致。

2. **LRUCache 单元测试（已有）**: 运行 `__tests__/lruCache.test.ts`，确认 12 个用例覆盖 `get`/`set`/`has`/`delete`/`clear`/`size`/`keys`/`values`/淘汰/刷新顺序/默认 maxSize/非字符串键。这是 `dimensionCache` 替换后所依赖的底层语义保证。

3. **手动验证**: 在编辑器中打开一个含多张图片的工程，切换若干次幻灯片触发 `asset://` 资源加载。然后在 DevTools 控制台执行（开发模式下可临时暴露 `dimensionCache` 或通过 `useAssetUrl` 模块观察）确认 `dimensionCache.size` 不超过 100。若需快速验证淘汰，可将容量临时改为 3 后重复加载 5 张不同图片，确认最早的条目被淘汰。

4. **回归验证**: 运行 `pnpm test` 全量套件，确认无其他测试因 `dimensionCache` 类型变更而失败。改动仅触及一行声明，预期无回归。
