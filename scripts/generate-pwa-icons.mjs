/**
 * Generates PNG PWA icons from public/favicon.svg (run after logo changes).
 * Usage: node scripts/generate-pwa-icons.mjs
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const svgPath = join(root, 'public', 'favicon.svg');
const outDir = join(root, 'public', 'icons');

await mkdir(outDir, { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
for (const s of sizes) {
  await sharp(svgPath).resize(s, s).png().toFile(join(outDir, `icon-${s}.png`));
}

await sharp(svgPath).resize(180, 180).png().toFile(join(outDir, 'apple-touch-icon.png'));

const pad = 72;
const inner = 512 - pad * 2;
const innerBuf = await sharp(svgPath).resize(inner, inner).png().toBuffer();
await sharp({
  create: {
    width: 512,
    height: 512,
    channels: 4,
    background: { r: 13, g: 148, b: 136, alpha: 1 },
  },
})
  .composite([{ input: innerBuf, gravity: 'center' }])
  .png()
  .toFile(join(outDir, 'icon-512-maskable.png'));

console.log('PWA icons written to public/icons/');
