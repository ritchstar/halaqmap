/**
 * يضغط صور public/ الثقيلة في م place حتى لا تُحسب ميجابايتات على Fast Data Transfer.
 * Usage: node scripts/compress-public-egress-images.mjs
 */
import { readdir, rename, stat, unlink, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const labDir = join(root, 'public', 'images', 'store', 'lab');

const jpegTargets = [
  join(root, 'public', 'images', 'Screenshot8439.jpeg'),
  join(root, 'public', 'images', 'store', 'kitchen', 'kitchen-sky-ambient.jpg'),
];

const pngPhotoTargets = [
  join(root, 'public', 'images', 'store', 'frames', 'hall-field-frame.png'),
  join(root, 'public', 'images', 'coiffeur-map-logo-seal.png'),
];

const pngLogoTargets = [
  join(root, 'public', 'images', 'halaqmap_logo_refined.png'),
  join(root, 'public', 'images', 'halaqmap_logo_20260409_073322.png'),
  join(root, 'public', 'images', 'halaqmap-store-mark-radar-square-1200x1200.png'),
];

const legacyExtras = [
  join(root, 'public', 'images', 'halaqmap_barber_banner_1.png'),
  join(root, 'public', 'images', 'halaqmap-hero.jpg.png'),
];

const pngToJpg = [
  'image_4142826b',
  'image_9bbcc3e5',
  'Screenshot4288',
  'Screenshot8589',
  'Screenshot9905',
];

const orphanRemove = [join(root, 'public', 'images', 'Screenshot1181.png')];

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function writeJpeg(src, dest, maxWidth, quality = 68) {
  if (!(await exists(src))) return null;
  const before = (await stat(src)).size;
  const tmp = `${dest}.tmp.jpg`;
  await sharp(src)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true })
    .toFile(tmp);
  const after = (await stat(tmp)).size;
  if (after >= before && src === dest) {
    await unlink(tmp);
    console.log(`skip jpeg ${src} (${before} >= ${after})`);
    return { before, after: before, dest: src };
  }
  await rename(tmp, dest);
  if (src !== dest) await unlink(src).catch(() => {});
  console.log(`jpeg ${before} -> ${after}  ${dest}`);
  return { before, after, dest };
}

async function optimizePngPhoto(src, maxWidth = 1280) {
  if (!(await exists(src))) return null;
  const before = (await stat(src)).size;
  const tmp = `${src}.tmp.png`;
  await sharp(src)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true, quality: 80 })
    .toFile(tmp);
  const after = (await stat(tmp)).size;
  if (after >= before) {
    await unlink(tmp);
    console.log(`skip png-photo ${src} (${before} >= ${after})`);
    return { before, after: before, dest: src };
  }
  await rename(tmp, src);
  console.log(`png-photo ${before} -> ${after}  ${src}`);
  return { before, after, dest: src };
}

async function optimizePngLogo(src, maxWidth = 1200) {
  if (!(await exists(src))) return null;
  const before = (await stat(src)).size;
  const tmp = `${src}.tmp.png`;
  await sharp(src)
    .rotate()
    .resize({ width: maxWidth, height: maxWidth, fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9, quality: 90, effort: 10 })
    .toFile(tmp);
  const after = (await stat(tmp)).size;
  if (after >= before) {
    await unlink(tmp);
    console.log(`skip png-logo ${src} (${before} >= ${after})`);
    return { before, after: before, dest: src };
  }
  await rename(tmp, src);
  console.log(`png-logo ${before} -> ${after}  ${src}`);
  return { before, after, dest: src };
}

const results = [];

const labFiles = (await readdir(labDir).catch(() => [])).filter((name) => /\.(png|jpe?g)$/i.test(name));
for (const name of labFiles) {
  const src = join(labDir, name);
  const dest = join(labDir, name.replace(/\.png$/i, '.jpg'));
  results.push(await writeJpeg(src, dest, name.includes('panorama') ? 1600 : 1280));
}

for (const src of legacyExtras) {
  const dest = src.replace(/\.jpg\.png$/i, '.jpg').replace(/\.png$/i, '.jpg');
  results.push(await writeJpeg(src, dest, 1400));
}

for (const src of jpegTargets) {
  const maxWidth = src.includes('kitchen-sky-ambient') ? 1920 : 1400;
  const quality = src.includes('kitchen-sky-ambient') ? 72 : 68;
  results.push(await writeJpeg(src, src, maxWidth, quality));
}

for (const src of pngPhotoTargets) {
  results.push(await optimizePngPhoto(src, src.includes('hall-field') ? 1600 : 512));
}

for (const src of pngLogoTargets) {
  results.push(await optimizePngLogo(src));
}

for (const src of orphanRemove) {
  if (!(await exists(src))) continue;
  await unlink(src);
  console.log(`removed orphan ${src}`);
}

const imagesTsPath = join(root, 'src', 'assets', 'images.ts');
let imagesSource = await readFile(imagesTsPath, 'utf8');

for (const base of pngToJpg) {
  const png = join(root, 'public', 'images', `${base}.png`);
  const jpg = join(root, 'public', 'images', `${base}.jpg`);
  if (!(await exists(png))) continue;
  const before = (await stat(png)).size;
  await sharp(png)
    .rotate()
    .resize({ width: 1280, withoutEnlargement: true })
    .jpeg({ quality: 72, mozjpeg: true })
    .toFile(jpg);
  const after = (await stat(jpg)).size;
  if (after < before) {
    await unlink(png);
    imagesSource = imagesSource.replaceAll(`/images/${base}.png`, `/images/${base}.jpg`);
    console.log(`converted ${base}.png -> .jpg (${before} -> ${after})`);
    results.push({ before, after, dest: jpg });
  } else {
    await unlink(jpg).catch(() => {});
  }
}

await writeFile(imagesTsPath, imagesSource);

const saved = results
  .filter(Boolean)
  .reduce((sum, row) => sum + Math.max(0, row.before - row.after), 0);
console.log(`compress-public-egress-images: saved ~${Math.round(saved / 1024)} KiB`);
