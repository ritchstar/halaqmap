/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * يولّد أيقونات PWA + شاشة تشغيل TWA من الشعار الرسمي.
 * المصدر: public/images/halaqmap_logo_refined.png
 * Usage: node scripts/generate-pwa-icons.mjs
 */
import sharp from 'sharp';
import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const sourcePath = join(root, 'public', 'images', 'halaqmap_logo_refined.png');
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

console.log('Official HalaqMap logo applied to PWA icons, splash, and Android launcher assets.');
