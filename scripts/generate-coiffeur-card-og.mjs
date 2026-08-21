/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * صورة احتياطية لمعاينة واتساب — 1200×1200 PNG.
 */
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LOGO = join(ROOT, 'public/images/coiffeur-map-logo-seal.png');
const OUT_DIR = join(ROOT, 'public/images/coiffeur');
const OUT = join(OUT_DIR, 'card-og.png');

const W = 1200;
const H = 1200;

const bg = await sharp({
  create: {
    width: W,
    height: H,
    channels: 3,
    background: { r: 20, g: 8, b: 14 },
  },
})
  .png()
  .toBuffer();

const logo = await sharp(LOGO).resize(320, 320).png().toBuffer();

const ring = await sharp({
  create: {
    width: 360,
    height: 360,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([
    {
      input: Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360">
          <circle cx="180" cy="180" r="174" fill="none" stroke="rgb(247,239,232)" stroke-width="8"/>
          <circle cx="180" cy="180" r="162" fill="none" stroke="rgb(201,139,150)" stroke-width="3"/>
        </svg>`,
      ),
      gravity: 'center',
    },
  ])
  .png()
  .toBuffer();

mkdirSync(OUT_DIR, { recursive: true });
await sharp(bg)
  .composite([
    { input: ring, gravity: 'center' },
    { input: logo, gravity: 'center' },
  ])
  .png({ compressionLevel: 9 })
  .toFile(OUT);

console.log('wrote', OUT);
