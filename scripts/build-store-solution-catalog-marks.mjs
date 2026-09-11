/**
 * توليد صور مصغّرة مربعة لشارات فهرس خريطة الحل.
 * تشغيل: node scripts/build-store-solution-catalog-marks.mjs
 */
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public/images/store/catalog');
const size = 512;

/** @type {ReadonlyArray<{ code: string; src: string }>} */
const MARK_SOURCES = [
  { code: 'A-01', src: 'public/images/halaqmap-logo-mark-256.webp' },
  { code: 'A-02', src: 'public/images/coiffeur-map-logo-seal-512.webp' },
  { code: 'B-01', src: 'public/images/store/saip/produce-26-12-103276978.png' },
  { code: 'B-02', src: 'public/images/store/saip/grocers-26-12-103276933.png' },
  { code: 'C-01', src: 'public/images/store/restaurant-hero-marketing.jpg' },
  { code: 'C-02', src: 'public/images/store/saip/cafe-26-12-103276935.png' },
  { code: 'D-01', src: 'public/images/store/saip/lounge-26-12-103276926.png' },
  { code: 'D-02', src: 'public/images/store/lab/lab-luxury-gold.jpg' },
  { code: 'D-03', src: 'public/images/store/saip/event-26-12-103276923.png' },
  { code: 'E-01', src: 'public/images/coiffeur/card-og.png' },
];

async function buildMark({ code, src }) {
  const inputPath = join(root, src);
  const outputPath = join(outDir, `halaqmap-${code.toLowerCase()}.webp`);
  const image = sharp(await readFile(inputPath)).rotate();
  const meta = await image.metadata();
  const pad = Math.round(size * 0.12);
  const inner = size - pad * 2;

  let pipeline = image.resize({
    width: meta.width >= (meta.height ?? 0) ? inner : undefined,
    height: meta.height > (meta.width ?? 0) ? inner : undefined,
    fit: 'inside',
    withoutEnlargement: false,
  });

  const resized = await pipeline.toBuffer();
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 250, b: 244, alpha: 1 },
    },
  })
    .composite([{ input: resized, gravity: 'center' }])
    .webp({ quality: 82, effort: 4 })
    .toFile(outputPath);

  return outputPath.replace(/\\/g, '/').split('/public/')[1];
}

await mkdir(outDir, { recursive: true });

for (const item of MARK_SOURCES) {
  const publicPath = await buildMark(item);
  console.log(`${item.code} -> /${publicPath}`);
}

console.log('build-store-solution-catalog-marks: ok');
