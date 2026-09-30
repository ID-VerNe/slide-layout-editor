# 7.2 AGENTS.md 注释合规治理

## 事实核对

### 规范原文

`AGENTS.md` 「Comment Style Guide / 注释规范」明确两条硬性约束:

- 禁止同一行中英混合,反面示例 `// 1. 顶部大图 (Main Feature)`。
- 统一方向:中文写"为什么"(意图),英文写"是什么"(技术事实)。

### 报告点名文件复核

逐行核对报告 7.2 节列出的 5 处典型违规,行号与内容全部精准命中,无虚构:

| 文件 | 行号 | 实际内容 | 是否违规 |
|------|------|----------|----------|
| `src/templates/schemas/169-Product/bento-showcase.ts` | 18 | `// 1. 左侧大卡片 (Main Feature)` | 是,与 AGENTS.md 反面示例 100% 重合 |
| `src/templates/schemas/23-Cover/editorial-classic.ts` | 18 | `// 1. 顶部大图 (Rows 1-15) - 遵循天头原则` | 是,中文意图 + 英文网格坐标 + 中文原则混于一条 |
| `src/templates/schemas/Bilingual-Editorial/bilingual-reader.ts` | 59 | `// 2. 侧边 90° 旋转刊头印章 (Side Header Stamp)` | 是 |
| `src/templates/schemas/renderer/basePropsResolver.ts` | 41 | `// 9宫格对齐逻辑 (Self Alignment)` | 是 |
| `src/constants/theme.ts` | 63 | `// 主标题：Playfair Display, 32pt-48pt, Tracking +150 to +250 (AllCaps)` | 是,中文标签 + 英文技术规格混排 |

### 规模复核

报告称"超过 120 处违规"。实测以更窄的精确模式(注释中出现中文字符且其后出现半角括号包裹的英文片段)在 `src/` 下统计,命中 **154 处,覆盖 52 个文件**;若把判定收紧到"序号 + 中文 + (英文)"的模板结构注释,命中 **113 处,覆盖 34 个文件**。

放宽到"注释行内同时出现中文与拉丁字母"做上限估算,全仓 `.ts/.tsx` 命中 366 处/147 文件;但这个上限包含大量合规行(如 `// pixelRatio 0.1` 旁的中文解释跨行、JSDoc 多行结构),不能作为违规数。

结论:报告"120+ 处"的量级判断成立。违规密集区是模板 schema 目录(`src/templates/schemas/**`),单文件最高 7 处(`bilingual-reader.ts`、`bilingual-cover.ts`),根因是同一份"序号 + 中文标题 + (英文译名)"的注释模板被复制粘贴到 34 个 schema 文件。

### 与报告描述的差异与补充

1. **报告未给出精确计数口径**。"120+ 处"是审查者的人工估算,未定义匹配规则。本文给出可复现的两档统计(113/154),作为后续 CI 守护的 baseline。
2. **违规不止"中文 + (英文)"一种形态**。`editorial-classic.ts#L18` 的 `(Rows 1-15)` 是英文技术坐标,`theme.ts#L63` 的 `Playfair Display, 32pt-48pt` 是英文技术规格,`bilingual-reader.ts#L59` 的 `(Side Header Stamp)` 是英文译名。三者都是"同一行中英混合",但英部分的语义不同,治理时需分别给改写策略,不能一刀切删英文。
3. **`AGENTS.md` 自身的"原则"表述含中英混排行**。`AGENTS.md` L1 标题 `# Comment Style Guide / 注释规范`、L17 `同一行中英混合 ❌ → ...` 均属规范文档自身的双语并列,不属于代码注释,应保留;但需在规范中明确"本文件的双语标题是文档可读性例外,代码注释不适用"。

## 根因

违规的系统性源于三件事:

1. **缺失可执行的规则**。`AGENTS.md` 是纯文档约束,`eslint.config.js`(ESLint 9 flat config)未引入任何自定义规则检测中英混写。`pnpm lint` 只跑 `js.configs.recommended` + `tseslint.configs.recommended`,对注释内容零检查,违规可以无阻力地进入仓库。

2. **模板复制粘贴**。34 个 schema 文件共用同一种"序号 + 中文标题 + (英文译名)"的注释结构,源自早期一个 schema 的写法被当作模板复制。单一模板的违规被批量放大,无人审查时就会产出 100+ 处同形违规。

3. **"英文译名"被误当成"技术事实"**。AGENTS.md 规定英文写"是什么"(技术事实),但 `(Side Header Stamp)`、`(Main Feature)` 这类是中文标题的英文翻译,属于"译名"而非"技术事实",本不该用英文。写注释者把译名当作技术规格写入英文括号,是规范理解偏差,不是疏忽。

## 解决方案

### 1. 规则再澄清

在 `AGENTS.md` 的「禁止」段下补充判定的可执行边界,消除"译名 vs 技术事实"的混淆:

```markdown
## 禁止

- **同一行中英混合** -> `// 1. 顶部大图 (Main Feature)`
- **无意义注释** -> `// 循环遍历`

### 判定边界

- 英文译名不是技术事实。` (Side Header Stamp)`、` (Main Feature)` 这类中文标题的英文翻译,
  与中文写在同一行即属违规。译名要么删掉,要么拆到独立英文行。
- 英文技术坐标、参数值、字体名、URL 属于技术事实,可以与中文同处一个注释块,
  但应分两行:中文一行写意图,英文一行写事实。
- 文件头双语标题(如本文档 `# Comment Style Guide / 注释规范`)是文档可读性例外,代码注释不适用。
```

### 2. 改写策略(三类违规各自的写法)

不要一刀切删英文。按英部分的语义分类处理:

**A. 英文译名(占多数,113/154)**

删除英文括号,只保留中文。如需对外暴露英文标识,放到对应标识符的 JSDoc 英文段。

- Before: `// 1. 左侧大卡片 (Main Feature)`
- After:  `// 1. 左侧大卡片`

**B. 英文技术坐标/参数(如 `Rows 1-15`、`32pt-48pt`)**

拆成两行:中文一行写意图,英文一行写事实。

- Before: `// 1. 顶部大图 (Rows 1-15) - 遵循天头原则`
- After:
  ```
  // 1. 顶部大图 - 遵循天头原则
  // Rows 1-15
  ```

**C. 英文技术规格(如 `Playfair Display, 32pt-48pt, Tracking +150 to +250 (AllCaps)`)**

整行是技术事实,应全英文;若需中文意图,中文单独一行。

- Before: `// 主标题：Playfair Display, 32pt-48pt, Tracking +150 to +250 (AllCaps)`
- After:
  ```
  // 主标题样式
  // Playfair Display, 32pt-48pt, Tracking +150 to +250, AllCaps
  ```

### 3. 批量改写脚本

违规集中在 `src/templates/schemas/**` 的 34 个文件,且形态高度同质(序号 + 中文 + (英文译名))。提供一个一次性脚本,自动处理 A 类(纯译名)的删除,B/C 类需人工判断英部分语义,脚本只标注不动手。

新增 `scripts/fix-comment-mixed.mjs`(项目已是 `"type": "module"`):

```javascript
// One-shot script: strip English translation in parentheses after Chinese,
// for comments matching the template-schema pattern.
// Only handles pattern: // N. 中文 (English)  ->  // N. 中文
// Leaves technical coordinates like (Rows 1-15) and technical specs for manual review.
// Run: node scripts/fix-comment-mixed.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../src/templates/schemas', import.meta.url).pathname;
const TRANSLATION_HINTS = [
  'Feature', 'Stamp', 'Header', 'Banner', 'Body', 'Separator', 'Gallery',
  'Masthead', 'Grid', 'Colophon', 'Media', 'Title', 'Caption', 'Mark',
  'Quote', 'Citation', 'Translation', 'Background',
];
const re = /^(\s*\/\/\s*\d+\.\s*[一-鿿][^\n]*?)\s*\(([A-Z][A-Za-z /'-]+)\)\s*$/;

function walk(dir) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name.endsWith('.ts')) {
      const src = readFileSync(p, 'utf8');
      const out = src.split('\n').map(line => {
        const m = line.match(re);
        if (!m) return line;
        const en = m[2];
        // Only strip when the English fragment looks like a translation, not a coordinate/spec.
        if (/\b(Rows|Cols|Row|Col)\b/.test(en)) return line;
        if (/\d/.test(en)) return line;
        if (!TRANSLATION_HINTS.some(h => en.includes(h))) return line;
        return m[1];
      }).join('\n');
      if (out !== src) writeFileSync(p, out, 'utf8');
    }
  }
}
walk(ROOT);
```

脚本设计原则:窄匹配、只删 A 类、不动 B/C。运行后用 `git diff` 人工复核,再跑 `pnpm test` 与 `pnpm lint`。

### 4. ESLint 自定义规则(长期守护)

ESLint 原生不检测注释内容。用 `@eslint/plugin-utils` 写一个 `no-mixed-cn-en-comment` 规则,或更轻量地写一个 `scripts/check-comment-mixed.mjs` 跑在 CI 里。考虑到本仓库 `eslint.config.js` 已是 flat config,且自定义 ESLint 规则的维护成本高于独立脚本,推荐后者:

`scripts/check-comment-mixed.mjs`:

```javascript
// CI guard: fail if any comment line in src/** matches the mixed CN/EN pattern.
// Pattern: // ...<CJK>... (<ASCII letters>)  where the ASCII fragment is a translation, not a coordinate.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = new URL('../src', import.meta.url).pathname;
const re = /\/\/[^\n]*[一-鿿][^\n]*\([A-Za-z][A-Za-z /'-]*\)/;
const exclude = /\/__tests__\//;

function walk(dir, hits) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, f.name);
    if (f.isDirectory()) walk(p, hits);
    else if ((f.name.endsWith('.ts') || f.name.endsWith('.tsx')) && !exclude.test(p)) {
      const lines = readFileSync(p, 'utf8').split('\n');
      lines.forEach((line, i) => {
        if (re.test(line) && !/\b(Rows|Cols|Row|Col)\b/.test(line)) {
          hits.push(`${p}:${i + 1}: ${line.trim()}`);
        }
      });
    }
  }
}
const hits = [];
walk(SRC, hits);
if (hits.length) {
  console.error(`Found ${hits.length} mixed CN/EN comment lines:`);
  for (const h of hits.slice(0, 50)) console.error(h);
  process.exit(1);
}
```

在 `package.json` 加脚本:

```json
"lint:comments": "node scripts/check-comment-mixed.mjs"
```

### 5. CI 守护

在 `.github/workflows/ci.yml` 的 `test` job 里,于 `pnpm test:ci` 之前加一步:

```yaml
      - name: Comment style guard
        run: pnpm lint:comments
```

CI 失败即阻断合入。规则与本地脚本同源,避免"本地通过 CI 红"的漂移。

### 6. AGENTS.md 同步更新

将本治理方案的两类示例(A 删英文、B/C 拆两行)补入 `AGENTS.md` 的「示例」段,使规范本身展示正确写法,而不只是反面教材。

## Before / After

### A 类:删除英文译名

`src/templates/schemas/169-Product/bento-showcase.ts#L18`

Before:

```typescript
      // 1. 左侧大卡片 (Main Feature)
```

After:

```typescript
      // 1. 左侧大卡片
```

### A 类:`src/templates/schemas/Bilingual-Editorial/bilingual-reader.ts#L59`

Before:

```typescript
      // 2. 侧边 90° 旋转刊头印章 (Side Header Stamp)
```

After:

```typescript
      // 2. 侧边 90° 旋转刊头印章
```

### B 类:拆两行,英文坐标单独一行

`src/templates/schemas/23-Cover/editorial-classic.ts#L18`

Before:

```typescript
      // 1. 顶部大图 (Rows 1-15) - 遵循天头原则
```

After:

```typescript
      // 1. 顶部大图 - 遵循天头原则
      // Rows 1-15
```

### C 类:中文意图 + 英文技术规格分两行

`src/constants/theme.ts#L63`

Before:

```typescript
      // 主标题：Playfair Display, 32pt-48pt, Tracking +150 to +250 (AllCaps)
```

After:

```typescript
      // 主标题样式
      // Playfair Display, 32pt-48pt, Tracking +150 to +250, AllCaps
```

### 技术引用类:`src/templates/schemas/renderer/basePropsResolver.ts#L41`

Before:

```typescript
    // 9宫格对齐逻辑 (Self Alignment)
```

After:

```typescript
    // 9宫格对齐逻辑
```

理由:`Self Alignment` 是 `alignSelf`/`justifySelf` 的英文译名,不是技术坐标或参数值,属 A 类删除。

## 风险与回滚

### 风险

1. **批量改写误伤**。`scripts/fix-comment-mixed.mjs` 的窄匹配可能漏掉非"序号 + 中文 + (英文)"形态的违规(如 `theme.ts#L63` 的 `主标题：Playfair Display...`),也不会处理 B/C 类。这是有意为之:脚本只做高确定性的 A 类,其余人工处理。漏处理不影响正确性,只影响完成度,CI 守护会兜住未处理的部分。

2. **CI 守护首次启用即红**。当前仓库已有 154 处违规,直接开启 `lint:comments` 会让 CI 在治理 PR 合入前一直红。需在治理 PR 中**同一次提交**完成"改写 + 启用 CI 守护",或先开治理 PR、合并后再开 CI 守护 PR。推荐前者,避免中间态。

3. **测试不受影响**。注释改写不改变运行时行为,729 项测试应全绿。但 schema 文件改注释时若误删非注释行,会触发 schema 解析失败。脚本只替换匹配行,不动其他行,风险可控;仍需 `git diff` 复核。

4. **CI 守护规则的误报**。`check-comment-mixed.mjs` 排除了 `(Rows|Cols)` 形态,但可能误报合规的"中文 + 英文括号"注释(如 `// 容器 100x100 (ratio 1)` 在 `imageGeometry.test.ts` 中,虽然不在 `src/` 下的排除范围,但若路径改了可能命中)。规则用 `exclude` 排除 `__tests__`,生产代码中此类写法应人工评估。

### 回滚

- 改写 PR 若出问题:`git revert` 治理 commit,注释恢复原状,无运行时影响。
- CI 守护若误报过多:删除 `.github/workflows/ci.yml` 中的 `Comment style guard` 步骤,或把 `pnpm lint:comments` 临时降级为 `|| true`,但不要删除脚本本身,保留可重新启用的入口。
- ESLint 集成路线未采用,无需回滚 eslint 配置。

## 验证方式

1. **改写正确性**。运行 `node scripts/fix-comment-mixed.mjs` 后:
   - `git diff --stat` 确认只动 `src/templates/schemas/**` 下 34 个文件的注释行。
   - `pnpm test` 全绿(729 项 + e2e)。
   - `pnpm lint` 不新增 error/warning(注释改写不影响 ESLint)。

2. **CI 守护有效性**。运行 `node scripts/check-comment-mixed.mjs`:
   - 治理前:输出 154 处违规,exit 1。
   - 治理后:输出 0 处,exit 0。
   - 人工注入一行 `// 测试违规 (Test Violation)` 到任意 `src/` 文件,脚本应捕获并 exit 1。

3. **B/C 类人工复核**。脚本未处理的 41 处(154 - 113)需在 PR review 中逐个确认已按 B/C 策略改写,或确认为合规的"中文 + 英文技术事实"双行结构。

4. **AGENTS.md 同步**。`AGENTS.md` 的「示例」段应包含 A/B/C 三类的正确写法,反面教材保留但标注"已治理"。

5. **CI 验收**。`.github/workflows/ci.yml` 的 `Comment style guard` 步骤在治理 PR 上跑通,后续 PR 触发即检查,违规无法合入。
