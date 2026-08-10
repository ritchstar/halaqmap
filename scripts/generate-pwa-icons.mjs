/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * يولّد أيقونات PWA + Favicon + شاشة تشغيل TWA من الشعار الرسمي الحالي.
 * المصدر: public/images/halaqmap_logo_refined.png (الشعار الرسمي الحالي)
 * Usage: node scripts/generate-pwa-icons.mjs
 */
import sharp from 'sharp';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const sourcePath = join(root, 'public', 'images', 'halaqmap_logo_refined.png');
/** مسار قديم ما زال يُطلب من كاش/روابط خارجية — يُحدَّث لنفس الشعار الجديد */
const legacyLogoPath = join(root, 'public', 'images', 'halaqmap_logo_20260409_073322.png');
const outDir = join(root, 'public', 'icons');
const androidRes = join(root, 'android-partner-twa', 'app', 'src', 'main', 'res');

const TEAL = { r: 13, g: 148, b: 136, alpha: 1 };

await mkdir(outDir, { recursive: true });

/** مربع PNG من الشعار الرسمي بحجم معيّن */
async function logoSquare(size) {
  return sharp(sourcePath)
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .png()
    .toBuffer();
}

/** أيقونة maskable: الشعار داخل هامش آمن على خلفية فيروزية */
async function logoMaskable(size, padRatio = 0.14) {
  const pad = Math.round(size * padRatio);
  const inner = size - pad * 2;
  const innerBuf = await sharp(sourcePath)
    .resize(inner, inner, { fit: 'contain', background: TEAL })
    .png()
    .toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: TEAL },
  })
    .composite([{ input: innerBuf, gravity: 'centre' }])
    .png()
    .toBuffer();
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
for (const s of sizes) {
  await sharp(await logoSquare(s)).toFile(join(outDir, `icon-${s}.png`));
}

await sharp(await logoSquare(180)).toFile(join(outDir, 'apple-touch-icon.png'));
await sharp(await logoMaskable(512)).toFile(join(outDir, 'icon-512-maskable.png'));

// جذر الموقع + أيقونة المتجر
await sharp(await logoSquare(512)).toFile(join(root, 'public', 'icon.png'));
await sharp(await logoSquare(512)).toFile(join(root, 'android-partner-twa', 'store_icon.png'));
await sharp(await logoSquare(512)).toFile(join(root, 'play-store', 'graphics', 'app-icon-512.png'));
await copyFile(join(outDir, 'icon-512-maskable.png'), join(root, 'play-store', 'graphics', 'app-icon-512-web.png'));

// شاشة التشغيل (TWA splash)
const splashSizes = {
  'drawable-mdpi': 300,
  'drawable-hdpi': 450,
  'drawable-xhdpi': 600,
  'drawable-xxhdpi': 900,
  'drawable-xxxhdpi': 1200,
};
for (const [folder, size] of Object.entries(splashSizes)) {
  const dir = join(androidRes, folder);
  await mkdir(dir, { recursive: true });
  await sharp(await logoSquare(size)).toFile(join(dir, 'splash.png'));
}

// أيقونات المشغّل
const launcher = {
  'mipmap-mdpi': { any: 48, maskable: 82 },
  'mipmap-hdpi': { any: 72, maskable: 123 },
  'mipmap-xhdpi': { any: 96, maskable: 164 },
  'mipmap-xxhdpi': { any: 144, maskable: 246 },
  'mipmap-xxxhdpi': { any: 192, maskable: 328 },
};
for (const [folder, dims] of Object.entries(launcher)) {
  const dir = join(androidRes, folder);
  await mkdir(dir, { recursive: true });
  await sharp(await logoSquare(dims.any)).toFile(join(dir, 'ic_launcher.png'));
  await sharp(await logoMaskable(dims.maskable, 0.12)).toFile(join(dir, 'ic_maskable.png'));
}

/**
 * أيقونة متصفح: قصّ على دبوس البوصلة (بدون كلمة HalaqMap السفلية)
 * حتى تبقى واضحة في نتائج Google بمقاس 16–48px.
 */
async function logoFavicon(size) {
  const meta = await sharp(sourcePath).metadata();
  const w = meta.width || 512;
  const h = meta.height || 512;
  const crop = Math.round(Math.min(w, h) * 0.78);
  const left = Math.max(0, Math.round((w - crop) / 2));
  const top = Math.max(0, Math.round(h * 0.06));
  const mark = await sharp(sourcePath)
    .extract({
      left,
      top: Math.min(top, Math.max(0, h - crop)),
      width: Math.min(crop, w - left),
      height: Math.min(crop, h - Math.min(top, Math.max(0, h - crop))),
    })
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .png()
    .toBuffer();

  const pad = Math.max(1, Math.round(size * 0.06));
  const inner = Math.max(1, size - pad * 2);
  const innerBuf = await sharp(mark)
    .resize(inner, inner, { fit: 'contain', background: TEAL })
    .png()
    .toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 4, background: TEAL },
  })
    .composite([{ input: innerBuf, gravity: 'centre' }])
    .png()
    .toBuffer();
}

/** Favicon لمتصفح Google — مضاعفات 48px مفضّلة */
for (const s of [48, 96]) {
  await sharp(await logoFavicon(s)).toFile(join(root, 'public', `favicon-${s}.png`));
}
await sharp(await logoFavicon(48)).toFile(join(outDir, 'favicon-48.png'));
await sharp(await logoFavicon(32)).toFile(join(root, 'public', 'favicon-32.png'));
await copyFile(join(root, 'public', 'favicon-48.png'), join(root, 'public', 'favicon.png'));

/** SVG مضمّن base64 — بديل الأيقونة القديمة (دبوس أصفر) ويعمل دون طلب خارجي */
const fav48 = await logoFavicon(48);
const b64 = fav48.toString('base64');
const svgFavicon = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" role="img">
  <title>حلاق ماب · HALAQ MAP</title>
  <image width="48" height="48" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,${b64}"/>
</svg>
`;
await writeFile(join(root, 'public', 'favicon.svg'), svgFavicon, 'utf8');

/**
 * ICO متعدد المقاسات (PNG داخل ICO) — مسار Google الكلاسيكي `/favicon.ico`.
 * غياب الملف يُبقي أيقونة قديمة في نتائج البحث حتى بعد تحديث PNG/SVG.
 */
function packPngsToIco(pngEntries) {
  const count = pngEntries.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const dir = Buffer.alloc(headerSize);
  dir.writeUInt16LE(0, 0);
  dir.writeUInt16LE(1, 2);
  dir.writeUInt16LE(count, 4);
  for (let i = 0; i < count; i++) {
    const { size, png } = pngEntries[i];
    const entry = 6 + i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, entry);
    dir.writeUInt8(size >= 256 ? 0 : size, entry + 1);
    dir.writeUInt8(0, entry + 2);
    dir.writeUInt8(0, entry + 3);
    dir.writeUInt16LE(1, entry + 4);
    dir.writeUInt16LE(32, entry + 6);
    dir.writeUInt32LE(png.length, entry + 8);
    dir.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  }
  return Buffer.concat([dir, ...pngEntries.map((e) => e.png)]);
}

const icoPngs = await Promise.all(
  [16, 32, 48].map(async (size) => ({ size, png: await logoFavicon(size) })),
);
await writeFile(join(root, 'public', 'favicon.ico'), packPngsToIco(icoPngs));

/** استبدال ملف الشعار القديم بنفس الشعار الجديد حتى لا يظهر في أي صفحة */
await copyFile(sourcePath, legacyLogoPath);

console.log('Official HalaqMap logo applied to PWA icons, favicon.ico, splash, and Android launcher assets.');
