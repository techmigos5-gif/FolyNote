/**
 * Dark-mode codemod: for every className string that has NO dark: handling,
 * insert a dark: counterpart after each light-only token. Idempotent.
 * Run: node scripts/codemod-dark-mode.mjs
 */
import fs from 'fs';
import path from 'path';

const ROOTS = ['src'];

// light token (regex, must not be a hover:/sm: variant) -> dark counterpart
const RULES = [
  { re: /(^|[\s'"`])bg-white(\/\d+)?(?![\w-])/g, dark: 'dark:bg-[#221a30]' },
  { re: /(^|[\s'"`])bg-gray-50(\/\d+)?(?![\w-])/g, dark: 'dark:bg-gray-900/40' },
  { re: /(^|[\s'"`])bg-gray-100(\/\d+)?(?![\w-])/g, dark: 'dark:bg-gray-800' },
  { re: /(^|[\s'"`])text-gray-900(?![\w-])/g, dark: 'dark:text-gray-100' },
  { re: /(^|[\s'"`])text-gray-800(?![\w-])/g, dark: 'dark:text-gray-200' },
  { re: /(^|[\s'"`])text-gray-700(?![\w-])/g, dark: 'dark:text-gray-300' },
  { re: /(^|[\s'"`])border-gray-100(?![\w-])/g, dark: 'dark:border-gray-800' },
  { re: /(^|[\s'"`])border-gray-200(?![\w-])/g, dark: 'dark:border-gray-700' },
];

function transformClassString(cls) {
  if (cls.includes('dark:')) return cls;
  let out = cls;
  for (const { re, dark } of RULES) {
    out = out.replace(re, (m, pre) => `${pre}${m.slice(pre.length)} ${dark}`);
  }
  return out;
}

const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (/\.tsx$/.test(entry.name)) files.push(p);
  }
}
for (const r of ROOTS) walk(r);

let changedFiles = 0, changedStrings = 0;
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  let next = src.replace(/className=\{?"([^"]*)"/g, (m, cls) => {
    const t = transformClassString(cls);
    if (t !== cls) changedStrings++;
    return `className="${t}"`;
  });
  next = next.replace(/className=\{`([^`]*)`\}/g, (m, cls) => {
    const t = transformClassString(cls);
    if (t !== cls) changedStrings++;
    return 'className={`' + t + '`}';
  });
  if (next !== src) {
    fs.writeFileSync(file, next);
    changedFiles++;
    console.log(`updated ${file}`);
  }
}
console.log(`\n${changedStrings} class strings updated across ${changedFiles} files`);
