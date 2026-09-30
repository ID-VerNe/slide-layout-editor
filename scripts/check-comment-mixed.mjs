// CI guard: fail if any comment line in src/** matches the mixed CN/EN pattern.
// 规则: 中文注释同一行出现半角括号包裹的英文片段(译名/技术规格),即判违规。
// 例外: (Rows 1-15)/(Cols 8-12) 这类英文技术坐标、以及不含中文的纯英文括号合规。
// Run: pnpm lint:comments
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = fileURLToPath(new URL('../src', import.meta.url));
// 匹配: // 注释行内含 CJK,其后又出现 (纯 ASCII 字母/空格/连字符) 的括号片段
const MIXED_RE = /\/\/[^\n]*[一-鿿][^\n]*\([A-Za-z][A-Za-z /'-]*\)/;
const TECH_COORD_RE = /\b(Rows|Cols|Row|Col)\b/;
const EXCLUDE = /[/\\]__tests__[/\\]/;

function walk(dir, hits) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, f.name);
    if (f.isDirectory()) {
      walk(p, hits);
    } else if ((f.name.endsWith('.ts') || f.name.endsWith('.tsx')) && !EXCLUDE.test(p)) {
      const lines = readFileSync(p, 'utf8').split('\n');
      lines.forEach((line, i) => {
        if (MIXED_RE.test(line) && !TECH_COORD_RE.test(line)) {
          hits.push(`${p}:${i + 1}: ${line.trim()}`);
        }
      });
    }
  }
}

const hits = [];
walk(SRC, hits);
if (hits.length) {
  console.error(`Found ${hits.length} mixed CN/EN comment line(s):`);
  for (const h of hits) console.error(h);
  process.exit(1);
}
