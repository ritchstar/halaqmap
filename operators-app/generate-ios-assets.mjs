/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * توليد أيقونة التطبيق وشاشة الإقلاع لغلاف لوحة المشغّلين عبر Chrome بلا واجهة،
 * حتى يظهر النص العربي بشكله الصحيح. التشغيل: `node generate-ios-assets.mjs`.
 */
import { copyFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const TMP = join(HERE, '.assets-tmp');
const ASSETS = join(HERE, 'ios', 'App', 'App', 'Assets.xcassets');
const MARK = join(ROOT, 'public', 'images', 'halaqmap-store-mark-radar-square-1200x1200.png');

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
];

const TITLE_AR = 'لوحة مشغّلي خريطة الحل';
const KICKER_AR = 'خريطة الحل';
const GOLD = '#e8c547';
const NIGHT = '#061018';

function markUrl() {
  return `file:///${MARK.replace(/\\/g, '/')}`;
}

function iconHtml() {
  return `<!doctype html><html><head><meta charset="utf-8" /><style>
    html,body{margin:0;width:1024px;height:1024px;background:#000;overflow:hidden}
    img{width:1024px;height:1024px;display:block}
  </style></head><body><img src="${markUrl()}" alt="" /></body></html>`;
}

function splashHtml() {
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8" /><style>
    html,body{margin:0;width:2732px;height:2732px;overflow:hidden;background:${NIGHT}}
    body{
      display:flex;flex-direction:column;align-items:center;justify-content:center;gap:96px;
      font-family:'Segoe UI','Noto Naskh Arabic',system-ui,sans-serif;
      background:
        radial-gradient(circle at 50% 42%, rgba(232,197,71,0.16), transparent 46%),
        radial-gradient(circle at 50% 66%, rgba(13,148,136,0.14), transparent 52%),
        ${NIGHT};
    }
    img{width:760px;height:760px;border-radius:180px;box-shadow:0 60px 160px -40px rgba(232,197,71,0.5)}
    h1{margin:0;font-size:132px;font-weight:800;color:${GOLD};letter-spacing:0}
    p{margin:0;font-size:76px;font-weight:700;color:rgba(244,239,228,0.62)}
  </style></head><body>
    <img src="${markUrl()}" alt="" />
    <h1>${TITLE_AR}</h1>
    <p>${KICKER_AR}</p>
  </body></html>`;
}

function shoot(chrome, html, size, outFile) {
  const page = join(TMP, `${outFile}.html`);
  writeFileSync(page, html, 'utf8');
  const result = spawnSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--window-size=${size},${size}`,
      `--screenshot=${join(TMP, outFile)}`,
      `file:///${page.replace(/\\/g, '/')}`,
    ],
    { stdio: 'inherit' },
  );
  if (result.status !== 0) throw new Error(`تعذّر توليد ${outFile}`);
  return join(TMP, outFile);
}

function resolveChrome() {
  const found = CHROME_CANDIDATES.find((candidate) => {
    const probe = spawnSync(candidate, ['--version'], { stdio: 'ignore' });
    return probe.status === 0;
  });
  if (!found) throw new Error('لم يُعثر على متصفح Chrome لتوليد الصور.');
  return found;
}

const chrome = resolveChrome();
rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

const icon = shoot(chrome, iconHtml(), 1024, 'AppIcon-512@2x.png');
copyFileSync(icon, join(ASSETS, 'AppIcon.appiconset', 'AppIcon-512@2x.png'));

const splash = shoot(chrome, splashHtml(), 2732, 'splash-2732x2732.png');
for (const name of ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']) {
  copyFileSync(splash, join(ASSETS, 'Splash.imageset', name));
}

rmSync(TMP, { recursive: true, force: true });
console.log('تم توليد أيقونة التطبيق وشاشة الإقلاع.');
