/**
 * Dark-mode audit: flags className tokens that have a light style but no
 * dark: counterpart in the same className string. Run: node scripts/audit-dark-mode.mjs
 *
 * Heuristic pairs — light utility -> expected dark: utility prefix.
 */
import fs from 'fs';
import path from 'path';

const ROOTS = ['src'];
const PAIRS = [
  { light: /(^|[\s'"])bg-white(?![\w-])/g, dark: 'dark:bg-' },
  { light: /(^|[\s'"])bg-gray-50(?![\w-])/g, dark: 'dark:bg-' },
  { light: /(^|[\s'"])bg-gray-100(?![\w-])/g, dark: 'dark:bg-' },
  { light: /(^|[\s'"])text-gray-900(?![\w-])/g, dark: 'dark:text-' },
  { light: /(^|[\s'"])text-gray-800(?![\w-])/g, dark: 'dark:text-' },
  { light: /(^|[\s'"])text-gray-700(?![\w-])/g, dark: 'dark:text-' },
  { light: /(^|[\s'"])border-gray-100(?![\w-])/g, dark: 'dark:border-' },
  { light: /(^|[\s'"])border-gray-200(?![\w-])/g, dark: 'dark:border-' },
];

const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (/\.tsx$/.test(entry.name)) files.push(p);
  }
}
for (const r of ROOTS) walk(r);

let total = 0;
const report = [];
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  // capture className="..." and className={`...`} strings
  const classStrings = [...src.matchAll(/className=\{?["'`]([^"'`]+)["'`]/g)].map((m) => m[1]);
  const hits = [];
  classStrings.forEach((cls, i) => {
    if (cls.includes('dark:')) return; // already has dark handling
    for (const pair of PAIRS) {
      const m = cls.match(pair.light);
      if (m) hits.push({ token: m[0].trim(), cls: cls.slice(0, 90) });
    }
  });
  if (hits.length) {
    total += hits.length;
    report.push({ file, hits });
  }
}

for (const { file, hits } of report) {
  console.log(`\n${file}`);
  const seen = new Set();
  for (const h of hits) {
    const key = h.token;
    if (seen.has(key)) continue;
    seen.add(key);
    console.log(`   - ${key}   (e.g. "${h.cls}")`);
  }
}
console.log(`\n${total} unguarded light tokens in ${report.length} files`);
