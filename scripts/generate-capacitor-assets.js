/**
 * Capacitor app assets from the master artwork (run before `npm run cap:icons`):
 *   assets/icon.png         1024x1024, transparency preserved
 *   assets/splash.png       2732x2732, brand centered on a light gradient
 *   assets/splash-dark.png  2732x2732, brand centered on a dark gradient
 * Run: node scripts/generate-capacitor-assets.js
 */
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const decodePNG = (buf) => {
  let off = 8, w = 0, h = 0, ct = 0;
  const idat = [];
  while (off + 8 <= buf.length) {
    const len = buf.readUInt32BE(off), type = buf.toString('ascii', off + 4, off + 8);
    const d = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); ct = d[9]; }
    else if (type === 'IDAT') idat.push(Buffer.from(d));
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  const ch = { 2: 3, 6: 4 }[ct];
  if (!ch) throw new Error(`Unsupported color type ${ct}`);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * ch;
  const px = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)];
    const row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? row[x - ch] : 0, b = y > 0 ? raw[(y - 1) * (stride + 1) + 1 + x] : 0;
      const c = y > 0 && x >= ch ? raw[(y - 1) * (stride + 1) + 1 + x - ch] : 0;
      let v = row[x];
      if (f === 1) v = (v + a) & 255;
      else if (f === 2) v = (v + b) & 255;
      else if (f === 3) v = (v + ((a + b) >> 1)) & 255;
      else if (f === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v = (v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 255;
      }
      row[x] = v;
    }
    for (let x = 0; x < w; x++) {
      const s = x * ch, t = (y * w + x) * 4;
      if (ct === 6) { px[t] = row[s]; px[t + 1] = row[s + 1]; px[t + 2] = row[s + 2]; px[t + 3] = row[s + 3]; }
      else { px[t] = row[s]; px[t + 1] = row[s + 1]; px[t + 2] = row[s + 2]; px[t + 3] = 255; }
    }
  }
  return { w, h, px };
};

const crcT = [];
for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcT[n] = c >>> 0; }
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4); let crc = 0xffffffff;
  for (const b of Buffer.concat([Buffer.from(type, 'ascii'), data])) crc = crcT[(crc ^ b) & 255] ^ (crc >>> 8);
  crcBuf.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([len, Buffer.from(type, 'ascii'), data, crcBuf]);
};
const encodePNG = (w, h, rgba) => {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  const stride = w * 4, raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
};

/** Box-filter downscale with premultiplied alpha. */
const resize = ({ w: sw, h: sh, px }, tw, th) => {
  const out = Buffer.alloc(tw * th * 4), xr = sw / tw, yr = sh / th;
  for (let ty = 0; ty < th; ty++) {
    const sy0 = Math.floor(ty * yr), sy1 = Math.min(sh, Math.max(sy0 + 1, Math.floor((ty + 1) * yr)));
    for (let tx = 0; tx < tw; tx++) {
      const sx0 = Math.floor(tx * xr), sx1 = Math.min(sw, Math.max(sx0 + 1, Math.floor((tx + 1) * xr)));
      let r = 0, g = 0, b = 0, aS = 0, n = 0;
      for (let sy = sy0; sy < sy1; sy++) for (let sx = sx0; sx < sx1; sx++) {
        const i = (sy * sw + sx) * 4, a = px[i + 3] / 255;
        r += px[i] * a; g += px[i + 1] * a; b += px[i + 2] * a; aS += a; n++;
      }
      const d = (ty * tw + tx) * 4;
      if (aS > 0) { out[d] = Math.round(r / aS); out[d + 1] = Math.round(g / aS); out[d + 2] = Math.round(b / aS); }
      out[d + 3] = Math.round((aS / n) * 255);
    }
  }
  return { w: tw, h: th, px: out };
};

const hex = (s) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
/** Vertical two-stop gradient canvas with `img` composited centered at `size`. */
const splash = (img, size, top, bottom, artSize) => {
  const A = hex(top), B = hex(bottom);
  const canvas = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    const t = y / (size - 1);
    const r = Math.round(A[0] + (B[0] - A[0]) * t), g = Math.round(A[1] + (B[1] - A[1]) * t), b = Math.round(A[2] + (B[2] - A[2]) * t);
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      canvas[i] = r; canvas[i + 1] = g; canvas[i + 2] = b; canvas[i + 3] = 255;
    }
  }
  const art = resize(img, artSize, artSize);
  const off = Math.floor((size - artSize) / 2);
  for (let y = 0; y < artSize; y++) for (let x = 0; x < artSize; x++) {
    const s = (y * artSize + x) * 4, d = ((y + off) * size + (x + off)) * 4, a = art.px[s + 3] / 255;
    canvas[d] = Math.round(art.px[s] * a + canvas[d] * (1 - a));
    canvas[d + 1] = Math.round(art.px[s + 1] * a + canvas[d + 1] * (1 - a));
    canvas[d + 2] = Math.round(art.px[s + 2] * a + canvas[d + 2] * (1 - a));
    canvas[d + 3] = 255;
  }
  return { w: size, h: size, px: canvas };
};

if (!fs.existsSync('assets')) fs.mkdirSync('assets');
const src = decodePNG(fs.readFileSync('icon.png'));

fs.writeFileSync('assets/icon.png', encodePNG(1024, 1024, resize(src, 1024, 1024).px));
console.log('wrote assets/icon.png (1024x1024, transparent)');
fs.writeFileSync('assets/splash.png', encodePNG(2732, 2732, splash(src, 2732, '#FDFCFE', '#EDE9FE', 720).px));
console.log('wrote assets/splash.png (2732x2732, light)');
fs.writeFileSync('assets/splash-dark.png', encodePNG(2732, 2732, splash(src, 2732, '#241b31', '#4C2E67', 720).px));
console.log('wrote assets/splash-dark.png (2732x2732, dark)');
console.log('done — now run: npm run cap:icons');
