// One-shot script: strip English translation in parentheses after Chinese,
// for comments matching the template-schema pattern.
// 仅处理 A 类: // N. 中文 (English)  ->  // N. 中文
// 例外: (Rows 1-15)/(Cols 8-12) 这类英文技术坐标、含数字的规格、不在白名单的片段,保留人工处理。
// Run: node scripts/fix-comment-mixed.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../src', import.meta.url));
// 仅当英文片段命中以下译名关键词时才删除,避免误伤技术规格
const TRANSLATION_HINTS = [
  'Feature', 'Stamp', 'Header', 'Banner', 'Body', 'Separator', 'Gallery',
  'Masthead', 'Grid', 'Colophon', 'Media', 'Title', 'Caption', 'Mark',
  'Quote', 'Citation', 'Translation', 'Background', 'Alignment', 'Fallback',
];
// 匹配: 行内 // 注释,中文片段后跟 (纯 ASCII 字母/空格/连字符) 括号片段
const MIXED_RE = /^(\s*\/\/\s*[^\n]*?[一-鿿][^\n]*?)\s*\(([A-Z][A-Za-z /'-]+)\)\s*$/;

function walk(dir) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, f.name);
    if (f.isDirectory()) {
      walk(p);
    } else if (f.name.endsWith('.ts') || f.name.endsWith('.tsx')) {
      const src = readFileSync(p, 'utf8');
      const out = src.split('\n').map(line => {
        const m = line.match(MIXED_RE);
        if (!m) return line;
        const en = m[2];
        // 技术坐标/含数字的规格不处理
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
