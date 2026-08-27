/**
 * ضغط لقطات اللاونج والتموينات والمطعم للعرض على الجوال.
 * تشغيل: node scripts/optimize-store-marketing-stills.mjs
 */
import { readdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dirs = [
  join(root, 'public/images/store/lounge'),
  join(root, 'public/images/store/grocers'),
  join(root, 'public/images/store/restaurant'),
  join(root, 'public/images/store/kitchen'),
];
const ONLY_RESTAURANT = process.argv.includes('--restaurant');
const singles = [
  join(root, 'public/images/store/restaurant-hero-marketing.jpg'),
  join(root, 'public/images/store/kitchen-hero-marketing.jpg'),
];
const MAX_WIDTH = 1280;
const QUALITY = 70;

async function compressJpeg(file) {
  const buf = await sharp(file)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true, progressive: true })
    .toBuffer();
  await writeFile(file, buf);
  console.log(`${file.replace(root, '')} ${(buf.length / 1024).toFixed(0)} KB`);
}

const targetDirs = ONLY_RESTAURANT ? dirs.filter((dir) => dir.endsWith('restaurant')) : dirs;
const targetSingles = ONLY_RESTAURANT ? singles : singles;

for (const dir of targetDirs) {
  const names = (await readdir(dir)).filter((name) => name.endsWith('.jpg'));
  for (const name of names) {
    await compressJpeg(join(dir, name));
  }
}

for (const file of targetSingles) {
  await compressJpeg(file);
}
