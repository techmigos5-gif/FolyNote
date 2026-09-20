/**
 * Generates the full FolyNote icon set from the master artwork `icon.png`
 * (project root). Run: node scripts/generate-icons.js
 *
 * The artwork is backgroundless, and every generated icon PRESERVES that
 * transparency (PWA "any" icons, favicon, in-app brand mark, and by default
 * even the maskable/apple tiles). Set OPAQUE_ICONS=1 to flatten the two
 * platform tiles onto the sampled artwork color instead.
 *
 * Outputs into public/:
 *  - pwa-192x192.png, pwa-512x512.png   (app icons, transparent)
 *  - pwa-maskable-512x512.png           (80% safe zone)
 *  - apple-touch-icon.png               (180x180)
 *  - favicon.ico                        (PNG-compressed 32x32 entry)
 *  - brand.png                          (512x512 rounded-corner mark)
 */
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const SRC = path.resolve('icon.png');
const OUT = 'public';

// ---------------------------------------------------------------- decode PNG
function decodePNG(buf) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (!buf.subarray(0, 8).equals(sig)) throw new Error('icon.png is not a PNG file');
  let off = 8;
  let width = 0, height = 0, bitDepth = 0, colorType = 0;
  const idat = [];
  let palette = null;
  while (off + 8 <= buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === 'IDAT') {
      idat.push(Buffer.from(data));
    } else if (type === 'PLTE') {
      palette = Buffer.from(data);
    } else if (type === 'IEND') {
      break;
    }
    off += 12 + len;
  }
  if (bitDepth !== 8) throw new Error(`Unsupported bit depth ${bitDepth} — re-export icon.png as 8-bit/channel`);
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  if (!channels) throw new Error(`Unsupported PNG color type ${colorType}`);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bpp = channels;
  const stride = width * bpp;
  const pixels = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1);
    const filter = raw[rowStart];
    const row = raw.subarray(rowStart + 1, rowStart + 1 + stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? row[x - bpp] : 0;
      const b = y > 0 ? raw[(y - 1) * (stride + 1) + 1 + x] : 0;
      const c = y > 0 && x >= bpp ? raw[(y - 1) * (stride + 1) + 1 + x - bpp] : 0;
      let v = row[x];
      switch (filter) {
        case 1: v = (v + a) & 0xff; break;
        case 2: v = (v + b) & 0xff; break;
        case 3: v = (v + ((a + b) >> 1)) & 0xff; break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          v = (v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 0xff;
          break;
        }
      }
      row[x] = v;
    }
    for (let x = 0; x < width; x++) {
      const si = x * bpp;
      const di = (y * width + x) * 4;
      if (colorType === 6) {
        pixels[di] = row[si]; pixels[di + 1] = row[si + 1]; pixels[di + 2] = row[si + 2]; pixels[di + 3] = row[si + 3];
      } else if (colorType === 2) {
        pixels[di] = row[si]; pixels[di + 1] = row[si + 1]; pixels[di + 2] = row[si + 2]; pixels[di + 3] = 255;
      } else if (colorType === 0) {
        const g = row[si]; pixels[di] = g; pixels[di + 1] = g; pixels[di + 2] = g; pixels[di + 3] = 255;
      } else if (colorType === 4) {
        const g = row[si]; pixels[di] = g; pixels[di + 1] = g; pixels[di + 2] = g; pixels[di + 3] = row[si + 1];
      } else if (colorType === 3) {
        const idx = row[si];
        pixels[di] = palette[idx * 3]; pixels[di + 1] = palette[idx * 3 + 1]; pixels[di + 2] = palette[idx * 3 + 2];
        pixels[di + 3] = 255;
      }
    }
  }
  return { width, height, pixels };
}

// ---------------------------------------------------------------- encode PNG
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  let crc = 0xffffffff;
  for (const byte of Buffer.concat([Buffer.from(type, 'ascii'), data])) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  crcBuf.writeUInt32BE((crc ^ 0xffffffff) >>> 0, 0);
  return Buffer.concat([len, Buffer.from(type, 'ascii'), data, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ------------------------------------------------------------------ resample
/** Box-filter (area-average) downscale with premultiplied alpha. */
function resize(src, tw, th) {
  const { width: sw, height: sh, pixels } = src;
  const out = Buffer.alloc(tw * th * 4);
  const xr = sw / tw, yr = sh / th;
  for (let ty = 0; ty < th; ty++) {
    const sy0 = Math.floor(ty * yr);
    const sy1 = Math.min(sh, Math.max(sy0 + 1, Math.floor((ty + 1) * yr)));
    for (let tx = 0; tx < tw; tx++) {
      const sx0 = Math.floor(tx * xr);
      const sx1 = Math.min(sw, Math.max(sx0 + 1, Math.floor((tx + 1) * xr)));
      let r = 0, g = 0, b = 0, aSum = 0, n = 0;
      for (let sy = sy0; sy < sy1; sy++) {
        for (let sx = sx0; sx < sx1; sx++) {
          const i = (sy * sw + sx) * 4;
          const alpha = pixels[i + 3] / 255;
          r += pixels[i] * alpha;
          g += pixels[i + 1] * alpha;
          b += pixels[i + 2] * alpha;
          aSum += alpha;
          n++;
        }
      }
      const di = (ty * tw + tx) * 4;
      if (aSum > 0) {
        out[di] = Math.round(r / aSum);
        out[di + 1] = Math.round(g / aSum);
        out[di + 2] = Math.round(b / aSum);
      }
      out[di + 3] = Math.round((aSum / n) * 255);
    }
  }
  return { width: tw, height: th, pixels: out };
}

/** Composite RGBA over an opaque background color. */
function flatten(img, bg) {
  const out = Buffer.from(img.pixels);
  for (let i = 0; i < out.length; i += 4) {
    const a = out[i + 3] / 255;
    out[i] = Math.round(out[i] * a + bg[0] * (1 - a));
    out[i + 1] = Math.round(out[i + 1] * a + bg[1] * (1 - a));
    out[i + 2] = Math.round(out[i + 2] * a + bg[2] * (1 - a));
    out[i + 3] = 255;
  }
  return { width: img.width, height: img.height, pixels: out };
}  /** Scale source content to `scale * size`, centered on a size×size canvas. */
  function fit(src, size, scale, bg) {
    const inner = Math.max(1, Math.round(size * scale));
    const content = bg ? flatten(resize(src, inner, inner), bg) : resize(src, inner, inner);
    const canvas = Buffer.alloc(size * size * 4);
    if (bg) {
      for (let i = 0; i < canvas.length; i += 4) {
        canvas[i] = bg[0]; canvas[i + 1] = bg[1]; canvas[i + 2] = bg[2]; canvas[i + 3] = 255;
      }
    }
    const off = Math.floor((size - inner) / 2);
    for (let y = 0; y < inner; y++) {
      content.pixels.copy(
        canvas,
        ((y + off) * size + off) * 4,
        y * inner * 4,
        (y + 1) * inner * 4,
      );
    }
    return { width: size, height: size, pixels: canvas };
  }

/**
 * Sample an opaque background color from the artwork's outer frame (used to
 * flatten icons for surfaces that can't show transparency, e.g. iOS).
 * Falls back to the dominant opaque color, then to the brand purple.
 */
function sampleBackground(src) {
  const { width: w, height: h, pixels } = src;
  const counts = new Map();
  const band = Math.round(Math.min(w, h) * 0.12);
  const visit = (x, y) => {
    const i = (y * w + x) * 4;
    if (pixels[i + 3] < 200) return;
    const key = `${pixels[i] >> 4},${pixels[i + 1] >> 4},${pixels[i + 2] >> 4}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  };
  for (let x = 0; x < w; x++) for (let y = 0; y < band; y++) { visit(x, y); visit(x, h - 1 - y); }
  for (let y = 0; y < h; y++) for (let x = 0; x < band; x++) { visit(x, y); visit(w - 1 - x, y); }
  if (counts.size === 0) {
    // Fully transparent frame: use the dominant opaque color anywhere.
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] < 200) continue;
      const key = `${pixels[i] >> 4},${pixels[i + 1] >> 4},${pixels[i + 2] >> 4}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  if (counts.size === 0) return [108, 92, 231]; // FolyNote brand purple fallback
  let best = null, bestN = -1;
  for (const [key, n] of counts) {
    if (n > bestN) { bestN = n; best = key; }
  }
  const [r, g, b] = best.split(',').map((v) => (parseInt(v, 10) << 4) + 8);
  return [r, g, b];
}
/** Apply a rounded-rectangle alpha mask (radius = 22% of side). */
function roundCorners(img, radiusRatio = 0.22) {
  const { width: w, height: h, pixels } = img;
  const out = Buffer.from(pixels);
  const r = Math.min(w, h) * radiusRatio;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = Math.max(r - x, x - (w - 1 - r), 0);
      const dy = Math.max(r - y, y - (h - 1 - r), 0);
      if (dx > 0 && dy > 0 && Math.hypot(dx, dy) > r) {
        out[(y * w + x) * 4 + 3] = 0;
      }
    }
  }
  return { width: w, height: h, pixels: out };
}

/** ICO container wrapping a PNG entry (supported by all modern browsers). */
function makeICO(png32) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // 1 image
  const entry = Buffer.alloc(16);
  entry[0] = 32; entry[1] = 32;      // width/height (32)
  entry[2] = 0; entry[3] = 0;        // colors, reserved
  entry.writeUInt16LE(1, 4);         // planes
  entry.writeUInt16LE(32, 6);        // bit count
  entry.writeUInt32LE(png32.length, 8);
  entry.writeUInt32LE(22, 12);       // data offset
  return Buffer.concat([header, entry, png32]);
}

// ---------------------------------------------------------------------- main
const src = decodePNG(fs.readFileSync(SRC));
console.log(`source: ${src.width}x${src.height} RGBA`);

// Default: keep the artwork's own transparency everywhere. OPAQUE_ICONS=1
// flattens the maskable/apple tiles onto the sampled artwork color instead.
const OPAQUE = process.env.OPAQUE_ICONS === '1';
const bgColor = OPAQUE ? sampleBackground(src) : null;
console.log(bgColor
  ? `opaque mode: tiles flattened onto rgb(${bgColor.join(',')})`
  : 'transparent mode: artwork alpha preserved in every output');

const write = (name, img) => {
  fs.writeFileSync(path.join(OUT, name), encodePNG(img.width, img.height, img.pixels));
  console.log(`wrote public/${name} (${img.width}x${img.height})`);
};

// The artwork ships backgroundless — every icon keeps its transparency.
// (OPAQUE_ICONS=1 restores an opaque fill for the maskable/apple tiles.)
write('pwa-192x192.png', fit(src, 192, 1.0, null));
write('pwa-512x512.png', fit(src, 512, 1.0, null));
write('pwa-maskable-512x512.png', fit(src, 512, 0.78, bgColor)); // 80% safe zone
write('apple-touch-icon.png', fit(src, 180, 1.0, bgColor));
write('brand.png', roundCorners(fit(src, 512, 0.92, null)));  // in-app mark

const fav32 = encodePNG(32, 32, fit(src, 32, 1.0, null).pixels);
fs.writeFileSync(path.join(OUT, 'favicon.ico'), makeICO(fav32));
console.log('wrote public/favicon.ico (32x32 PNG-in-ICO)');
console.log('All FolyNote icons generated.');
