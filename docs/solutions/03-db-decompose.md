# 2.3 db.ts 模块拆解

## 事实核对

报告对 `src/utils/db.ts` 的总体定位(持久化、哈希、Canvas、DOM 下载、ZIP 归档堆砌)成立,但职责枚举里有三处与实际代码不符,需要更正后再设计迁移。

### 与源码一致的部分

- 文件规模: `src/utils/db.ts` 实测 319 行、11,141 字节,与报告 `#L1-L320` 的范围一致(wc 不计末行换行,差 1 行属正常)。
- IndexedDB 核心 CRUD: `initDB`、`saveProject`、`getProject`、`deleteProject` 确实存在,且 `initDB` 同时承担 `onupgradeneeded` 里 `projects` / `assets` 两个 object store 的建表。
- Web Crypto SHA-256: `saveAsset` 内部通过 `crypto.subtle.digest('SHA-256', ...)` 计算哈希指纹,带时间戳+随机数降级。
- DOM 下载器: `downloadBlob` 用 `<a>` + `URL.createObjectURL` 触发下载并回收。
- JSZip 打包与解压: `exportPagesToZip` 打包;`openProjectFromFilePicker` 内联 `.slgrid` 解压逻辑。

### 与源码不符的部分(报告夸大或误述)

| 报告描述 | 实际代码 | 结论 |
|---|---|---|
| "读取 ArrayBuffer 头部魔数判定 PNG/JPEG/WEBP" | `dataUrl.match(/^data:([^;,]+)/)` 从 data URL 的 MIME 前缀正则提取扩展名,全程未读 ArrayBuffer、未判定魔数 | 误述,需更正 |
| `canvas.toDataURL('image/jpeg', 0.8)` | `canvas.toDataURL('image/webp', quality)`,默认 `quality = 0.9` | 误述,需更正 |
| 解压 `.slgrid` 时"解析 `project.json` 及素材目录" | 只读取 `zipContent.file('project.json')` 并 `JSON.parse`,不遍历任何素材目录 | 不准确,需更正 |

### 报告方案遗漏的职责

报告列出的 5 个目标文件(`projectDb` / `assetHasher` / `canvasCompressor` / `zipArchive` / `fileDownload`)未明确 `saveAsset` / `getAsset` 这一组**资源存取**逻辑的归属。这两个函数同时承担:哈希计算、MIME 扩展名解析、Electron `nativeFs` 适配、IndexedDB 兜底读写,既不能塞进纯哈希模块,也不属于纯项目 CRUD。本方案新增 `src/utils/storage/assetStore.ts` 承接,见下文。

## 根因

`db.ts` 的膨胀不是偶然,而是把"Web 端持久化层"当成了一切 IO 基础设施的回收站。三个结构性的诱因:

1. **以"数据库"为名扩张边界**。模块命名为 `db`,但 IndexedDB 只是它众多职责之一。一旦遇到"和持久化沾边但不属于 IndexedDB"的需求(Web Crypto、Canvas、Blob 下载、ZIP 归档),默认归宿就是这个文件,边界从未被守住。
2. **资源存取耦合三层关注点**。`saveAsset` / `getAsset` 把哈希、MIME 解析、nativeFs 适配、IndexedDB 兜底写在同一函数体内,任何一层变动都要改这两个函数,也无法单独测试。
3. **文件选择器内联解压**。`openProjectFromFilePicker` 把"创建 `<input type=file>`"和"`.slgrid` 解压"写在同一个 Promise 里,DOM 关注点和归档解析关注点纠缠,后续若要支持其他归档格式无处落脚。

## 解决方案

按"职责单一、关注点分离"拆成 6 个文件。所有目标文件位于 `src/utils/` 下的子目录,目录名即职责域。不保留 `db.ts` 作为聚合入口——调用方按需 import 精确模块。

### 目录结构

```
src/utils/
├── storage/
│   ├── projectDb.ts        # IndexedDB 项目仓库
│   ├── assetHasher.ts      # Web Crypto 哈希与扩展名解析(纯函数)
│   └── assetStore.ts       # 资源存取(哈希 + nativeFs + IndexedDB 兜底)
├── media/
│   └── canvasCompressor.ts # Canvas 图像压缩
├── archive/
│   └── zipArchive.ts       # JSZip 打包与 .slgrid 解压
└── dom/
    └── fileDownload.ts     # Blob 下载与文件选择器
```

### 函数迁移映射

| 原 `db.ts` 符号 | 目标文件 | 目标符号 |
|---|---|---|
| `DB_NAME` / `STORE_PROJECTS` / `STORE_ASSETS` / `DB_VERSION` | `storage/projectDb.ts` | 同名,内部常量,`STORE_ASSETS` 导出供 `assetStore` 复用 |
| `initDB` | `storage/projectDb.ts` | `initDB` |
| `saveProject` / `getProject` / `deleteProject` | `storage/projectDb.ts` | 同名 |
| `saveProjectThumbnail` / `getProjectThumbnail` | `storage/projectDb.ts` | 同名(语义属项目仓库,虽写入 `assets` store) |
| `__SLIDEGRID_DB__` 挂载块 | `storage/projectDb.ts` | 同名(E2E `e2e/08-project-persistence-and-storage.spec.ts` 依赖,保留) |
| `saveAsset` 内哈希逻辑(L36-L46) | `storage/assetHasher.ts` | `hashDataUrl(dataUrl): Promise<string>` |
| `saveAsset` 内 MIME 扩展名解析(L48-L62) | `storage/assetHasher.ts` | `extFromDataUrl(dataUrl): string` |
| `saveAsset` / `getAsset` | `storage/assetStore.ts` | 同名,内部调用 `hashDataUrl` / `extFromDataUrl` / `initDB` / `nativeFs` |
| `compressImage` | `media/canvasCompressor.ts` | `compressImage` |
| `exportPagesToZip` | `archive/zipArchive.ts` | `exportPagesToZip` |
| `openProjectFromFilePicker` 内 `.slgrid` 解压(L257-L266) | `archive/zipArchive.ts` | `parseProjectArchive(file): Promise<{ project: any; filename: string }>`(同时支持 `.json` 与 `.slgrid`,见下) |
| `downloadBlob` | `dom/fileDownload.ts` | `downloadBlob` |
| `exportProjectAsJson` | `dom/fileDownload.ts` | `exportProjectAsJson` |
| `openProjectFromFilePicker`(DOM 部分) | `dom/fileDownload.ts` | `openProjectFromFilePicker`,内部调用 `parseProjectArchive` |

### 关键设计决策

**为什么 `assetHasher` 与 `assetStore` 分开**。哈希与 MIME 解析是纯函数,无 IO、无副作用,可独立单测;`saveAsset` / `getAsset` 涉及 IndexedDB 与 nativeFs,依赖运行时环境。把它们合并会让纯逻辑测试被迫带上 IDB mock。拆开后 `assetHasher.test.ts` 只测哈希碰撞与扩展名边界,`assetStore.test.ts` 沿用现有 `db.test.ts` 的 IDB mock 即可。

**为什么 `saveProjectThumbnail` / `getProjectThumbnail` 留在 `projectDb.ts`**。它们写入 `STORE_ASSETS`,但语义是项目缩略图——key 形如 `thumb_${projectId}`,生命周期跟随项目,不参与 `asset://` 协议、不走 nativeFs。归入项目仓库比归入资源存取更贴近语义。

**为什么 `.slgrid` 解压从 `openProjectFromFilePicker` 提取为 `parseProjectArchive`**。原实现把 DOM 选择器和归档解析耦合,且 `.json` 与 `.slgrid` 两条分支散在 onchange 回调里。提取后 `parseProjectArchive` 同时承担 `.json`(直接 `JSON.parse`)与 `.slgrid`(JSZip 解压)两条路径,`openProjectFromFilePicker` 只负责创建 input、读取 File、转交解析。后续若新增 `.zip` 模板归档等格式,只改 `parseProjectArchive`。

**为什么不保留 `db.ts` 作为 re-export 聚合**。CLAUDE.md 明确"不保留向后兼容、移除过时路径而非添加兼容层"。聚合入口会鼓励调用方继续 `import { ... } from '../utils/db'`,违背拆解初衷。直接改全部调用方 import 路径。

### 调用方 import 迁移

以下调用方需更新 import 路径(共 7 个源文件 + 6 个测试文件):

| 文件 | 原 import | 新 import |
|---|---|---|
| `src/hooks/useProject.ts` | `saveProject` from `../utils/db` | `../utils/storage/projectDb` |
| `src/store/useStore.ts` | `getProject` from `../utils/db` | `../utils/storage/projectDb` |
| `src/hooks/useAssetUrl.ts` | `getAsset` from `../utils/db` | `../utils/storage/assetStore` |
| `src/hooks/useResponsiveImage.ts` | `getAsset` from `../utils/db` | `../utils/storage/assetStore` |
| `src/components/editor/fields/ImageField.tsx` | `saveAsset` from `../../../utils/db` | `../../../utils/storage/assetStore` |
| `src/components/ui/IconPicker.tsx` | `compressImage` from `../../utils/db` | `../../utils/media/canvasCompressor` |
| `src/pages/Dashboard.tsx` | `deleteProject, openProjectFromFilePicker` from `../utils/db` | 拆成两条:`deleteProject` from `../utils/storage/projectDb`;`openProjectFromFilePicker` from `../utils/dom/fileDownload` |
| `src/pages/EditorPage.tsx` | `exportProjectAsJson, exportPagesToZip, openProjectFromFilePicker` from `../utils/db` | 拆成三条:`exportProjectAsJson, openProjectFromFilePicker` from `../utils/dom/fileDownload`;`exportPagesToZip` from `../utils/archive/zipArchive` |

### 测试迁移

| 测试文件 | 动作 |
|---|---|
| `src/utils/__tests__/db.test.ts` | 拆分为 `storage/projectDb.test.ts`(initDB/saveProject/getProject/deleteProject/saveProjectThumbnail/getProjectThumbnail)、`storage/assetHasher.test.ts`(哈希与扩展名)、`storage/assetStore.test.ts`(saveAsset/getAsset 含 nativeFs 兜底)、`media/canvasCompressor.test.ts`(compressImage)。原 mock IDB 工厂抽到 `storage/__tests__/idbMock.ts` 共享 |
| `src/hooks/__tests__/useProject.test.ts` | `vi.mock('../../utils/db', ...)` → `vi.mock('../../utils/storage/projectDb', ...)` |
| `src/hooks/__tests__/useAssetUrl.test.ts` | `vi.mock('../../utils/db', ...)` → `vi.mock('../../utils/storage/assetStore', ...)` |
| `src/hooks/__tests__/useResponsiveImage.test.ts` | 同上 |
| `src/components/ui/__tests__/IconPicker.test.tsx` | `vi.mock('../../../utils/db', ...)` → `vi.mock('../../../utils/media/canvasCompressor', ...)` |
| `src/pages/__tests__/Dashboard.test.tsx` | `vi.mock('../../utils/db', ...)` → 分别 mock `projectDb` 与 `fileDownload` |
| `src/store/useStore.test.ts` | `vi.mock('../utils/db', ...)` 与 `vi.importActual<typeof import('../utils/db')>` → 改为 `../utils/storage/projectDb` |
| `e2e/08-project-persistence-and-storage.spec.ts` | 不改。仍通过 `window.__SLIDEGRID_DB__` 访问,挂载点迁移到 `projectDb.ts` 内,对象 shape 不变 |

## Before / After

### Before

```
src/utils/
└── db.ts   (319 行, 11 个 export, 混合 6 类职责)
```

调用方统一从 `'../utils/db'` 拉取,无论用到的是项目 CRUD、资源存取、压缩、下载还是归档。测试通过 `vi.mock('../utils/db', ...)` 整体替换,任何符号的 mock 都会牵连整个模块。

### After

```
src/utils/
├── storage/
│   ├── projectDb.ts        # ~110 行: DB 常量 + initDB + 项目 CRUD + 缩略图 + __SLIDEGRID_DB__
│   ├── assetHasher.ts      # ~30 行: hashDataUrl + extFromDataUrl (纯函数)
│   └── assetStore.ts       # ~80 行: saveAsset + getAsset (调用 assetHasher / projectDb / nativeFs)
├── media/
│   └── canvasCompressor.ts # ~25 行: compressImage
├── archive/
│   └── zipArchive.ts       # ~45 行: exportPagesToZip + parseProjectArchive
└── dom/
    └── fileDownload.ts     # ~55 行: downloadBlob + exportProjectAsJson + openProjectFromFilePicker
```

每个文件单一职责,最大 ~110 行。调用方按需 import 精确模块,测试按模块独立 mock。

### 行数预算依据

- `projectDb.ts`: 现有 `initDB`(12 行)+ `saveProject`/`getProject`/`deleteProject`(各 ~10 行)+ `saveProjectThumbnail`/`getProjectThumbnail`(各 ~12 行)+ 常量与 `__SLIDEGRID_DB__` 挂载(~15 行),合计 ~110 行。
- `assetHasher.ts`: 哈希(11 行)+ 扩展名解析(15 行)+ 注释,~30 行。
- `assetStore.ts`: `saveAsset`(原 ~25 行,去掉内联哈希后更短)+ `getAsset`(原 ~37 行,不变),~80 行。
- `canvasCompressor.ts`: `compressImage` 原样 20 行 + 注释,~25 行。
- `zipArchive.ts`: `exportPagesToZip` 28 行 + `parseProjectArchive` ~17 行,~45 行。
- `fileDownload.ts`: `downloadBlob` 10 行 + `exportProjectAsJson` 8 行 + `openProjectFromFilePicker`(去掉内联解压后)~37 行,~55 行。

## 风险与回滚

### 主要风险

1. **`__SLIDEGRID_DB__` 挂载点迁移可能漏掉**。E2E `e2e/08` 通过 `window.__SLIDEGRID_DB__` 调用 `saveProject` 等函数。若挂载块迁移到 `projectDb.ts` 后未被 `app entry` 加载,或 shape 与原版不一致,E2E 会静默失败。**对策**: 挂载块整体搬运,导出对象键名与原版完全一致;迁移后在浏览器控制台手测 `window.__SLIDEGRID_DB__.saveProject` 存在。
2. **`vi.mock` 路径替换遗漏**。共有 6 个测试文件需要改 mock 路径,漏改会导致测试因找不到 mock 而落到真实实现,可能误绿或报错。**对策**: 全量 grep `utils/db` 替换为新路径后,跑 `npm test` 全量验证。
3. **`assetStore` 对 `projectDb` 的 `STORE_ASSETS` 常量依赖形成跨文件耦合**。两个文件共享 `STORE_ASSETS` 常量,若任一方误改,另一方编译通过但运行时 store 名错位。**对策**: `STORE_ASSETS` 只在 `projectDb.ts` 定义并 `export`, `assetStore.ts` 只 `import` 不重定义;IDB store 名测试覆盖 `saveAsset`/`getAsset` 往返即可捕获。
4. **`parseProjectArchive` 提取后异常处理边界变化**。原 `openProjectFromFilePicker` 用 try/catch 包裹解析,失败时 `reject(err)`。提取后若 `parseProjectArchive` 自身抛错与原行为不一致,文件选择器测试可能受影响。**对策**: `parseProjectArchive` 内部不吞异常,沿用原 throw 语义;`openProjectFromFilePicker` 保留 try/catch/finally(input.remove)结构。

### 回滚策略

拆解以纯文件移动 + import 路径替换为主,无逻辑改写。回滚即 `git revert` 单次提交。建议拆解与调用方迁移落在**同一个提交**,避免出现"db.ts 已删但调用方未改"的中间态导致构建断裂。

若需分阶段验证,可先落 `storage/projectDb.ts` 与 `storage/assetStore.ts`(承载全部 IndexedDB 与资源存取,占原文件 ~70% 体量),验证通过后再落 `canvasCompressor` / `zipArchive` / `fileDownload`。但分阶段期间 `db.ts` 与新模块并存会违反"不保留向后兼容",仅作为应急回滚的中间检查点,不应作为最终态。

## 验证方式

### 单元测试

```
npm test -- src/utils/storage src/utils/media src/utils/archive src/utils/dom
```

预期:
- `projectDb.test.ts`: `initDB` 成功/失败、`saveProject`/`getProject` 往返、`deleteProject` 删除、缩略图往返。
- `assetHasher.test.ts`: 相同 data URL 哈希稳定;不同 data URL 哈希不同;MIME 扩展名覆盖 `png`/`jpg`/`jpeg`/`webp`/`gif`/`svg`/未知回退 `png`。
- `assetStore.test.ts`: 非 data URL 直通;Web 路径 `saveAsset`/`getAsset` 往返;Electron 上传成功返回本地 URL;Electron 上传失败回退 IndexedDB;Electron 读取成功返回 base64 data URL(覆盖 png/svg mime);非 `asset://` ID 直通。
- `canvasCompressor.test.ts`: 成功返回 webp data URL;Image 加载失败拒绝;FileReader 失败拒绝。
- `zipArchive.test.ts`: `parseProjectArchive` 对 `.json` 与 `.slgrid` 分别返回正确 project;`exportPagesToZip` 调用 `downloadBlob`(mock)且 onProgress 单调递增。
- `fileDownload.test.ts`: `downloadBlob` 创建 `<a>` 并触发 click;`exportProjectAsJson` 文件名清洗非法字符;`openProjectFromFilePicker` 在无文件选择时 resolve null。

### 调用方测试

```
npm test -- src/hooks src/store src/components src/pages
```

确认 `useProject` / `useAssetUrl` / `useResponsiveImage` / `useStore` / `IconPicker` / `Dashboard` / `EditorPage` 的测试在新 import 路径下全绿。

### E2E

```
npx playwright test e2e/08-project-persistence-and-storage.spec.ts
```

确认 `window.__SLIDEGRID_DB__` 在迁移到 `projectDb.ts` 后仍可访问,`saveProject` 写入与跨页面恢复行为不变。

### 类型与构建

```
npm run typecheck
npm run build
```

确认无残留 `import ... from '../utils/db'` 的悬空引用,`db.ts` 已从仓库删除。

### 全量回归

```
npm test
npm run lint
```

任一模块测试失败或 lint 报错即视为迁移未完成,不合并。
