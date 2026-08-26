/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صفحة رمز المقابلة الثابتة — بلا HashRouter حتى تظهر على الآيفون فوراً.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

const TARGET = 'https://store.halaqmap.com/store';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export async function buildStoreMeetQrHtml() {
  const svg = await QRCode.toString(TARGET, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 1,
    color: { dark: '#061018', light: '#ffffff' },
  });
  const qr = svg.replace('<svg', '<svg class="qr" role="img" aria-label="رمز متجر خريطة الحل"');

  return `<!DOCTYPE html>
<html lang="ar-SA" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="robots" content="noindex, nofollow" />
    <meta name="theme-color" content="#061018" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="متجر خريطة الحل" />
    <title>رمز متجر خريطة الحل</title>
    <link rel="canonical" href="https://store.halaqmap.com/store/qr" />
    <style>
      :root { color-scheme: dark; }
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        min-height: 100%;
        background: #061018;
        color: #f4efe4;
        font-family: Tajawal, "Segoe UI", Tahoma, Arial, sans-serif;
      }
      body {
        min-height: 100svh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: max(1rem, env(safe-area-inset-top)) 1.1rem max(1.25rem, env(safe-area-inset-bottom));
        background:
          radial-gradient(ellipse 80% 42% at 72% 8%, rgba(232,197,71,0.22), transparent 55%),
          linear-gradient(165deg, #061018 0%, #0c1a2e 48%, #12243a 100%);
      }
      .card {
        width: min(26rem, 100%);
        border-radius: 1.75rem;
        padding: 3px;
        background: conic-gradient(from 140deg, #f4efe4 0%, #e8c547 28%, #b8860b 52%, #e8c547 78%, #f4efe4 100%);
        box-shadow: 0 0 28px rgba(232,197,71,0.28);
      }
      .inner {
        border-radius: 1.6rem;
        padding: 1.35rem 1.15rem 1.25rem;
        background: linear-gradient(165deg, #061018 0%, #0c1a2e 100%);
        text-align: center;
      }
      .bar {
        height: 6px;
        margin: -1.35rem -1.15rem 1rem;
        border-radius: 1.6rem 1.6rem 0 0;
        background: linear-gradient(90deg, #b8860b 0%, #e8c547 48%, #f4efe4 100%);
      }
      .logo {
        width: 5.5rem;
        height: 5.5rem;
        border-radius: 999px;
        object-fit: cover;
        box-shadow: 0 0 28px rgba(232,197,71,0.4);
        border: 3px solid rgba(232,197,71,0.8);
      }
      .latin { margin: 0.55rem 0 0; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em; }
      h1 { margin: 0.2rem 0 0; font-size: 1.35rem; color: #e8c547; }
      .kicker { margin: 0.4rem 0 0; font-size: 0.86rem; line-height: 1.7; font-weight: 700; color: rgba(244,239,228,0.85); }
      .pad {
        margin: 1rem auto 0;
        width: min(17.5rem, 72vw);
        padding: 0.7rem;
        border-radius: 1.2rem;
        background: #fff;
        box-shadow: 0 0 28px rgba(232,197,71,0.35);
      }
      .qr { display: block; width: 100%; height: auto; }
      .host { margin: 0.85rem 0 0; font-size: 0.95rem; font-weight: 800; letter-spacing: 0.03em; }
      .scan { margin: 0.25rem 0 0; font-size: 0.92rem; font-weight: 800; color: #e8c547; }
      .chips { margin: 0.85rem 0 0; padding: 0; list-style: none; display: flex; flex-wrap: wrap; justify-content: center; gap: 0.35rem; }
      .chips li {
        border: 1px solid rgba(232,197,71,0.45);
        border-radius: 999px;
        padding: 0.15rem 0.65rem;
        font-size: 0.68rem;
        font-weight: 800;
        color: #e8c547;
        unicode-bidi: isolate;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <div class="inner">
        <div class="bar" aria-hidden="true"></div>
        <img class="logo" src="/images/halaqmap-store-mark-radar-square-1200x1200.png" width="88" height="88" alt="" />
        <p class="latin" dir="ltr">halaqmap</p>
        <h1>متجر خريطة الحل</h1>
        <p class="kicker">للعرض من الآيفون أثناء المقابلة</p>
        <div class="pad">${qr}</div>
        <p class="host" dir="ltr">store.halaqmap.com/store</p>
        <p class="scan">امسح الرمز لدخول واجهة المتجر</p>
        <ul class="chips">
          <li>افراحي1</li>
          <li>اجواء1</li>
          <li>تمويناتا1</li>
          <li>لاونجا1</li>
          <li>مطعمنا1</li>
        </ul>
      </div>
    </main>
  </body>
</html>
`;
}

const html = await buildStoreMeetQrHtml();
for (const dir of [join(root, 'public'), join(root, 'dist')]) {
  try {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'store-qr.html'), html);
  } catch {
    /* dist قد لا يوجد قبل البناء */
  }
}
console.log('[write-store-meet-qr] wrote store-qr.html');
