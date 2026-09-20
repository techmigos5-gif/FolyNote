/**
 * Copies the brand/hero artwork into public/ for web + Capacitor bundling.
 * Run: node scripts/copy-images.js
 *
 *  - BoyImage.png  → public/boy-hero.png    (login split-screen visual)
 *  - Nature1-3.png → public/nature-1..3.png (homepage gallery)
 */
import fs from 'fs';
import path from 'path';

const copies = [
  ['BoyImage.png', 'boy-hero.png'],
  ['Nature1.png', 'nature-1.png'],
  ['Nature2.png', 'nature-2.png'],
  ['Nature3.png', 'nature-3.png'],
];

for (const [srcName, outName] of copies) {
  const src = path.resolve(srcName);
  if (!fs.existsSync(src)) {
    console.warn(`skip ${outName}: ${srcName} not found`);
    continue;
  }
  fs.copyFileSync(src, path.join('public', outName));
  const kb = (fs.statSync(path.join('public', outName)).size / 1024).toFixed(0);
  console.log(`copied ${srcName} → public/${outName} (${kb} KB)`);
}
console.log('done');
