/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * يولّد نسخ WebP متجاوبة لصور تسويق المتجر تحت public/images/store:
 *   foo.jpg → foo.w480.webp / foo.w960.webp / foo.w1440.webp
 *
 * الاستخدام: node scripts/optimize-store-images.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STORE_DIR = path.join(ROOT, 'public', 'images', 'store');
const WIDTHS = [480, 960, 1440];
const RASTER_EXT = new Set(['.jpg', '.jpeg', '.png']);

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

function isGeneratedWebp(name) {
  return /\.w(480|960|1440)\.webp$/i.test(name);
}

async function optimizeOne(file) {
  const ext = path.extname(file).toLowerCase();
  if (!RASTER_EXT.has(ext)) return { skipped: true };
  if (isGeneratedWebp(path.basename(file))) return { skipped: true };

  const base = file.slice(0, -ext.length);
  const inputStat = await fs.stat(file);
  const meta = await sharp(file).rotate().metadata();
  const written = [];

  for (const width of WIDTHS) {
    const out = `${base}.w${width}.webp`;
    try {
      const outStat = await fs.stat(out);
      if (outStat.mtimeMs >= inputStat.mtimeMs) continue;
    } catch {
      /* missing → write */
    }
    const targetW = Math.min(width, meta.width || width);
    await sharp(file)
      .rotate()
      .resize({ width: targetW, withoutEnlargement: true })
      .webp({ quality: 78, effort: 4 })
      .toFile(out);
    written.push(path.relative(ROOT, out));
  }
  return { skipped: false, written };
}

async function main() {
  let sources = 0;
  let outputs = 0;
  for await (const file of walk(STORE_DIR)) {
    const result = await optimizeOne(file);
    if (result.skipped) continue;
    sources += 1;
    outputs += result.written.length;
    if (result.written.length) {
      console.log(`ok ${path.relative(ROOT, file)} → ${result.written.length} webp`);
    }
  }
  console.log(`done: scanned sources=${sources}, new/updated outputs=${outputs}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
