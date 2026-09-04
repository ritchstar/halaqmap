/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لقطات هاتف لقائمة بلاي — لوحة مشغّلي خريطة الحل.
 * 1080×1920، PNG بلا شفافية.
 */
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'play-store', 'operators', 'screenshots');
const W = 1080;
const H = 1920;
const BG = '#061018';
const CREAM = '#f4efe4';
const GOLD = '#e8c547';
const MUTED = '#b9b3a6';
const CARD = '#0f0f14';
const CAFE = '#c48a4a';

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function frame(body, { logout = false } = {}) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect x="0" y="0" width="${W}" height="168" fill="${BG}"/>
  <line x1="48" y1="168" x2="1032" y2="168" stroke="rgba(255,255,255,0.10)" stroke-width="2"/>
  <text x="1032" y="78" text-anchor="end" fill="${GOLD}" font-family="Tahoma, Arial, sans-serif" font-size="28" font-weight="700">للمشغّل فقط</text>
  <text x="1032" y="132" text-anchor="end" fill="${CREAM}" font-family="Tahoma, Arial, sans-serif" font-size="36" font-weight="800">لوحة مشغّلي خريطة الحل</text>
  ${logout ? `<rect x="48" y="92" width="120" height="52" rx="26" fill="none" stroke="rgba(255,255,255,0.20)"/><text x="108" y="126" text-anchor="middle" fill="#d8d2c6" font-family="Tahoma, Arial, sans-serif" font-size="24">خروج</text>` : ''}
  ${body}
  <line x1="48" y1="1800" x2="1032" y2="1800" stroke="rgba(255,255,255,0.10)" stroke-width="2"/>
  <text x="540" y="1868" text-anchor="middle" fill="#7d786e" font-family="Tahoma, Arial, sans-serif" font-size="26">خريطة الحل</text>
</svg>`;
}

const emailSvg = frame(`
  <text x="1032" y="250" text-anchor="end" fill="${MUTED}" font-family="Tahoma, Arial, sans-serif" font-size="30">
    <tspan x="1032" dy="0">أدخل بريد التشغيل المعتمد. إن طابق بريداً</tspan>
    <tspan x="1032" dy="48">مرتبطاً بلوحة، يصلك رمز من ستة أرقام.</tspan>
  </text>
  <rect x="48" y="390" width="984" height="420" rx="28" fill="${CARD}" stroke="rgba(255,255,255,0.10)"/>
  <text x="996" y="460" text-anchor="end" fill="${CREAM}" font-family="Tahoma, Arial, sans-serif" font-size="30">بريد التشغيل</text>
  <rect x="84" y="488" width="912" height="88" rx="12" fill="${BG}" stroke="rgba(255,255,255,0.15)"/>
  <rect x="84" y="620" width="912" height="88" rx="18" fill="${GOLD}"/>
  <text x="540" y="676" text-anchor="middle" fill="${BG}" font-family="Tahoma, Arial, sans-serif" font-size="32" font-weight="800">أرسل رمز التحقق</text>
`);

const codeSvg = frame(`
  <rect x="48" y="220" width="984" height="560" rx="28" fill="${CARD}" stroke="rgba(255,255,255,0.10)"/>
  <text x="996" y="300" text-anchor="end" fill="${MUTED}" font-family="Tahoma, Arial, sans-serif" font-size="30">
    <tspan x="996" dy="0">إن كان البريد معتمداً فسيصل الرمز</tspan>
    <tspan x="996" dy="48">خلال لحظات.</tspan>
  </text>
  <text x="996" y="420" text-anchor="end" fill="${CREAM}" font-family="Tahoma, Arial, sans-serif" font-size="30">رمز التحقق</text>
  <rect x="84" y="448" width="912" height="96" rx="12" fill="${BG}" stroke="rgba(255,255,255,0.15)"/>
  <text x="540" y="512" text-anchor="middle" fill="${CREAM}" font-family="Tahoma, Arial, sans-serif" font-size="44" letter-spacing="18">••••••</text>
  <text x="996" y="580" text-anchor="end" fill="#7d786e" font-family="Tahoma, Arial, sans-serif" font-size="24">ستة أرقام من رسالة البريد.</text>
  <rect x="84" y="620" width="912" height="88" rx="18" fill="${GOLD}"/>
  <text x="540" y="676" text-anchor="middle" fill="${BG}" font-family="Tahoma, Arial, sans-serif" font-size="32" font-weight="800">ادخل إلى اللوحة</text>
`);

const tilesSvg = frame(`
  <text x="1032" y="250" text-anchor="end" fill="${CREAM}" font-family="Tahoma, Arial, sans-serif" font-size="44" font-weight="800">تشغيلاتك</text>
  <text x="1032" y="318" text-anchor="end" fill="${MUTED}" font-family="Tahoma, Arial, sans-serif" font-size="28">
    <tspan x="1032" dy="0">افتح اللوحة التي تديرها. الزبون يبقى</tspan>
    <tspan x="1032" dy="44">على صفحة الويب في متصفحه.</tspan>
  </text>
  <rect x="48" y="430" width="984" height="220" rx="28" fill="${CARD}" stroke="rgba(255,255,255,0.10)"/>
  <rect x="888" y="486" width="96" height="96" rx="24" fill="${CAFE}"/>
  <text x="936" y="548" text-anchor="middle" fill="${BG}" font-family="Tahoma, Arial, sans-serif" font-size="40" font-weight="800">ك</text>
  <text x="852" y="510" text-anchor="end" fill="${CREAM}" font-family="Tahoma, Arial, sans-serif" font-size="32" font-weight="800">كافينا1</text>
  <text x="852" y="556" text-anchor="end" fill="${MUTED}" font-family="Tahoma, Arial, sans-serif" font-size="24">${escapeXml('مقهى الحي')}</text>
  <text x="852" y="604" text-anchor="end" fill="${CAFE}" font-family="Tahoma, Arial, sans-serif" font-size="24" font-weight="700">افتح لوحة الكاشير</text>
  <rect x="48" y="678" width="984" height="180" rx="28" fill="#16140c" stroke="#e8c547" stroke-opacity="0.4"/>
  <rect x="888" y="720" width="96" height="96" rx="24" fill="${GOLD}"/>
  <text x="936" y="782" text-anchor="middle" fill="${BG}" font-family="Tahoma, Arial, sans-serif" font-size="40" font-weight="800">خ</text>
  <text x="852" y="756" text-anchor="end" fill="${GOLD}" font-family="Tahoma, Arial, sans-serif" font-size="32" font-weight="800">خريطة الحل</text>
  <text x="852" y="804" text-anchor="end" fill="${MUTED}" font-family="Tahoma, Arial, sans-serif" font-size="24">العودة إلى واجهة خريطة الحل.</text>
`, { logout: true });

await mkdir(outDir, { recursive: true });

const shots = [
  ['phone-01-email.png', emailSvg],
  ['phone-02-code.png', codeSvg],
  ['phone-03-tiles.png', tilesSvg],
];

for (const [name, svg] of shots) {
  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9 })
    .flatten({ background: BG })
    .toFile(join(outDir, name));
}

console.log(`operators play screenshots: ${shots.length} files in ${outDir}`);
