/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * يجهّز webDir + أيقونة/شاشة إقلاع iOS لتطبيق المستخدم (Capacitor Live URL).
 * Usage: node scripts/prepare-consumer-ios-shell.mjs
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const logo = join(root, 'public', 'images', 'halaqmap_logo_refined.png');
const distDir = join(root, 'dist');
const iconDir = join(root, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset');
const splashDir = join(root, 'ios', 'App', 'App', 'Assets.xcassets', 'Splash.imageset');

await mkdir(distDir, { recursive: true });
await writeFile(
  join(distDir, 'index.html'),
  `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>حلاق ماب</title>
    <style>
      html, body { margin: 0; height: 100%; background: #0a4f4a; color: #ecfdf5;
        font-family: Tajawal, system-ui, sans-serif; display: grid; place-items: center; }
    </style>
  </head>
  <body>
    <p>جاري فتح حلاق ماب…</p>
  </body>
</html>
`,
  'utf8',
);

await mkdir(iconDir, { recursive: true });
await mkdir(splashDir, { recursive: true });

await sharp(logo)
  .resize(1024, 1024, { fit: 'cover', position: 'centre' })
  .png()
  .toFile(join(iconDir, 'AppIcon-512@2x.png'));

const BG = { r: 10, g: 79, b: 74, alpha: 1 };
const splashSize = 2732;
const mark = 900;
const markBuf = await sharp(logo)
  .resize(mark, mark, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();
const splash = await sharp({
  create: { width: splashSize, height: splashSize, channels: 4, background: BG },
})
  .composite([{ input: markBuf, gravity: 'centre' }])
  .png()
  .toBuffer();

for (const name of [
  'splash-2732x2732.png',
  'splash-2732x2732-1.png',
  'splash-2732x2732-2.png',
]) {
  await sharp(splash).toFile(join(splashDir, name));
}

console.log('Consumer iOS shell assets ready (dist placeholder + AppIcon + Splash).');
