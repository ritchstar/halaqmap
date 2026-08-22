/**
 * ضغط لقطات اللاونج والتموينات للعرض على الجوال.
 * تشغيل: node scripts/optimize-store-marketing-stills.mjs
 */
import { readdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dirs = [join(root, 'public/images/store/lounge'), join(root, 'public/images/store/grocers')];
const MAX_WIDTH = 1280;
const QUALITY = 70;

for (const dir of dirs) {
  const names = (await readdir(dir)).filter((name) => name.endsWith('.jpg'));
  for (const name of names) {
    const file = join(dir, name);
    const buf = await sharp(file)
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true, progressive: true })
      .toBuffer();
    await writeFile(file, buf);
    console.log(`${name} ${(buf.length / 1024).toFixed(0)} KB`);
  }
}
