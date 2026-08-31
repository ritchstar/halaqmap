/**
 * يضغط صور المتجر الثقيلة في مكانها حتى لا تُحسب ميجابايتات على فيرسل.
 * Usage: node scripts/compress-public-egress-images.mjs
 */
import { readdir, stat, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const labDir = join(process.cwd(), 'public', 'images', 'store', 'lab');
const extras = [
  join(process.cwd(), 'public', 'images', 'Screenshot8439.jpeg'),
  join(process.cwd(), 'public', 'images', 'halaqmap_barber_banner_1.png'),
  join(process.cwd(), 'public', 'images', 'halaqmap-hero.jpg.png'),
];

async function writeJpeg(src, dest, maxWidth) {
  const before = (await stat(src)).size;
  const tmp = `${dest}.tmp.jpg`;
  await sharp(src)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .jpeg({ quality: 68, mozjpeg: true })
    .toFile(tmp);
  const after = (await stat(tmp)).size;
  if (after >= before && src === dest) {
    await unlink(tmp);
    console.log(`skip ${src} (${before} >= ${after})`);
    return { before, after: before, dest: src };
  }
  const { rename } = await import('node:fs/promises');
  await rename(tmp, dest);
  if (src !== dest) await unlink(src).catch(() => {});
  console.log(`${before} -> ${after}  ${dest}`);
  return { before, after, dest };
}

const labFiles = (await readdir(labDir)).filter((name) => /\.(png|jpe?g)$/i.test(name));
for (const name of labFiles) {
  const src = join(labDir, name);
  const dest = join(labDir, name.replace(/\.png$/i, '.jpg'));
  await writeJpeg(src, dest, name.includes('panorama') ? 1600 : 1280);
}

for (const src of extras) {
  const dest = src.replace(/\.jpg\.png$/i, '.jpg').replace(/\.png$/i, '.jpg');
  await writeJpeg(src, dest, 1400);
}
