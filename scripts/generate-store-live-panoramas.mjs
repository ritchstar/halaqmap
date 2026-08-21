/**
 * سبع بانوراما جوّية لصفحات المناسبة المشتراة.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public/images/store/live');
mkdirSync(outDir, { recursive: true });

const WIDTH = 1920;
const HEIGHT = 860;

const SCENES = [
  { file: 'pano-01-gold.jpg', a: '#1a1208', b: '#3d2a12', c: '#d4af67', d: '#f7e7b0' },
  { file: 'pano-02-amber.jpg', a: '#140a06', b: '#4a2410', c: '#e08a3a', d: '#ffd7a1' },
  { file: 'pano-03-rose.jpg', a: '#180810', b: '#4a2030', c: '#e4b7c5', d: '#ffe6ef' },
  { file: 'pano-04-emerald.jpg', a: '#06140e', b: '#123528', c: '#3d8b6e', d: '#b8f0d4' },
  { file: 'pano-05-sapphire.jpg', a: '#070b18', b: '#142448', c: '#6ea3e8', d: '#d7e8ff' },
  { file: 'pano-06-ivory.jpg', a: '#1c1710', b: '#4a3d28', c: '#e8d5a3', d: '#fff6df' },
  { file: 'pano-07-midnight.jpg', a: '#05060c', b: '#1a1420', c: '#d4a574', d: '#ffe4c4' },
];

function svgFor(scene) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${scene.a}"/>
      <stop offset="0.55" stop-color="${scene.b}"/>
      <stop offset="1" stop-color="${scene.a}"/>
    </linearGradient>
    <radialGradient id="orbL" cx="18%" cy="28%" r="38%">
      <stop offset="0" stop-color="${scene.d}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${scene.d}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="orbR" cx="82%" cy="22%" r="34%">
      <stop offset="0" stop-color="${scene.c}" stop-opacity="0.42"/>
      <stop offset="1" stop-color="${scene.c}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="floor" cx="50%" cy="92%" r="48%">
      <stop offset="0" stop-color="${scene.c}" stop-opacity="0.38"/>
      <stop offset="1" stop-color="${scene.a}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#sky)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#orbL)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#orbR)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#floor)"/>
  <rect x="0" y="${HEIGHT * 0.62}" width="${WIDTH}" height="${HEIGHT * 0.38}" fill="${scene.a}" opacity="0.55"/>
  <rect x="${WIDTH * 0.08}" y="${HEIGHT * 0.18}" width="${WIDTH * 0.84}" height="${HEIGHT * 0.08}" rx="8" fill="${scene.c}" opacity="0.18"/>
  <rect x="${WIDTH * 0.22}" y="${HEIGHT * 0.28}" width="${WIDTH * 0.56}" height="${HEIGHT * 0.34}" rx="18" fill="${scene.c}" opacity="0.12"/>
  <circle cx="${WIDTH * 0.5}" cy="${HEIGHT * 0.2}" r="70" fill="${scene.d}" opacity="0.22"/>
  <circle cx="${WIDTH * 0.18}" cy="${HEIGHT * 0.72}" r="28" fill="${scene.d}" opacity="0.28"/>
  <circle cx="${WIDTH * 0.82}" cy="${HEIGHT * 0.7}" r="24" fill="${scene.c}" opacity="0.3"/>
  <circle cx="${WIDTH * 0.36}" cy="${HEIGHT * 0.78}" r="16" fill="${scene.d}" opacity="0.2"/>
  <circle cx="${WIDTH * 0.64}" cy="${HEIGHT * 0.8}" r="14" fill="${scene.c}" opacity="0.22"/>
</svg>`;
}

for (const scene of SCENES) {
  const svg = Buffer.from(svgFor(scene));
  const jpg = await sharp(svg).jpeg({ quality: 78, mozjpeg: true }).toBuffer();
  writeFileSync(join(outDir, scene.file), jpg);
  console.log(scene.file, jpg.length);
}
