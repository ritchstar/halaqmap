/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * يولّد dist/need/index.html + dist/need/{slug}/index.html — فزعات حسب الحاجة.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FILTER_INTENT_PAGES as PAGES } from './data/filterIntentLandingPages.mjs';
import {
  BRAND_LOGO_ABS,
  BRAND_SITE_NAME,
  NEAR_SEARCH_KEYWORDS_META,
  brandHeaderCss,
  brandHeaderHtml,
  brandIconLinks,
  nearSearchPhrasesCss,
  nearSearchPhrasesSectionHtml,
} from './lib/platformBrandIdentity.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const ORIGIN = 'https://www.halaqmap.com';
const HUB = '/need';
const JSON_OUT = join(ROOT, 'src', 'config', 'filterIntentLandingPages.json');

/** يُزامن JSON المستخدم في الواجهة مع مصدر الصفحات */
function syncLandingPagesJson() {
  writeFileSync(
    JSON_OUT,
    `${JSON.stringify({ version: 1, pages: PAGES }, null, 2)}\n`,
    'utf8',
  );
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function writeFileDeep(filePath, content) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, 'utf8');
}

function htmlShell({ title, description, canonical, h1, bodyInner, jsonLd }) {
  return `<!DOCTYPE html>
<html lang="ar-SA" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="keywords" content="${escapeHtml(NEAR_SEARCH_KEYWORDS_META)}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  <meta property="og:image" content="${BRAND_LOGO_ABS}" />
  <meta property="og:locale" content="ar_SA" />
  <meta property="og:site_name" content="${BRAND_SITE_NAME}" />
  <meta name="application-name" content="${BRAND_SITE_NAME}" />
${brandIconLinks()}
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>
${brandHeaderCss()}
${nearSearchPhrasesCss()}
    :root { color-scheme: dark; --card:#0c1a2e; --text:#e8eef7; --muted:#94a3b8; --accent:#2dd4bf; --line:rgba(45,212,191,.25); }
    * { box-sizing: border-box; }
    body { margin:0; font-family: "Tajawal", "Segoe UI", Tahoma, Arial, sans-serif; background: linear-gradient(180deg,#061223,#0a1f33 55%,#061223); color:var(--text); line-height:1.8; }
    .wrap { max-width: 44rem; margin: 0 auto; padding: 1.5rem 1.15rem 3rem; }
    h1 { font-size: clamp(1.55rem, 4vw, 2.1rem); line-height:1.35; margin: .5rem 0 1rem; font-weight:900; }
    h2 { font-size:1.12rem; margin: 1.6rem 0 .7rem; color:var(--accent); }
    .lead { font-size:1.05rem; }
    .note { color:var(--muted); font-size:.95rem; }
    .crumbs { font-size:.9rem; color:var(--muted); margin-bottom:1rem; }
    .crumbs a { color:var(--accent); }
    .grid { list-style:none; padding:0; margin:1rem 0; display:grid; gap:.65rem; }
    .grid a { display:block; padding:.85rem 1rem; border:1px solid var(--line); border-radius:12px; background:var(--card); color:var(--text); text-decoration:none; font-weight:600; }
    .cta { display:inline-block; background: linear-gradient(135deg,#0d9488,#0891b2); color:#041016; font-weight:800; padding:.9rem 1.3rem; border-radius:12px; text-decoration:none; }
    .chip { display:inline-block; margin:.2rem .35rem .2rem 0; padding:.25rem .65rem; border-radius:999px; border:1px solid var(--line); color:var(--muted); font-size:.85rem; }
    .card { border:1px solid var(--line); border-radius:14px; background:var(--card); padding:1rem 1.1rem; margin:1rem 0; }
    footer { margin-top:2.5rem; padding-top:1rem; border-top:1px solid var(--line); color:var(--muted); font-size:.85rem; }
  </style>
</head>
<body>
  <div class="wrap">
${brandHeaderHtml()}
    <main>
      <h1>${escapeHtml(h1)}</h1>
      ${bodyInner}
    </main>
    <footer>
      <p>© حلاق ماب — منصة استعلام رقمية. ليست صالوناً وليست وسيط حجز. النتائج حسب بيانات الشركاء المفعّلين لحظة الاستعلام.</p>
    </footer>
  </div>
</body>
</html>`;
}

function renderHub() {
  const title = 'ابحث لي عن أقرب حلاق حسب حاجتك | حلاق ماب';
  const description =
    'ابحث لي عن أقرب حلاق أو أبي حلاق قريب أو عطني أقرب حلاق حسب حاجتك عبر فزعات حلاق ماب: منزلي، مفتوح الآن، 24 ساعة، أطفال والمزيد — ثم ابدأ الاستعلام.';
  const canonical = `${ORIGIN}${HUB}`;
  const links = PAGES.map(
    (p) => `<li><a href="${HUB}/${p.slug}">${escapeHtml(p.h1)}</a></li>`,
  ).join('\n');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: title,
        url: canonical,
        inLanguage: 'ar-SA',
        description,
        isPartOf: { '@type': 'WebApplication', name: 'حلاق ماب', url: `${ORIGIN}/` },
      },
      {
        '@type': 'ItemList',
        itemListElement: PAGES.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: p.h1,
          url: `${ORIGIN}${HUB}/${p.slug}`,
        })),
      },
    ],
  };
  return htmlShell({
    title,
    description,
    canonical,
    h1: 'ابحث لي عن أقرب حلاق حسب حاجتك',
    bodyInner: `
      <p class="lead">فزعات من <strong>حلاق ماب</strong> لمن يقول <strong>أبي حلاق قريب</strong> أو <strong>عطني أقرب حلاق</strong> أو يريد <strong>أقرب حلاق من موقعه</strong> بما يوافق حاجته — اختر نيتك ثم ابدأ الاستعلام، أو ارجع للرئيسية من أعلى الصفحة.</p>
      <p class="note">المنصة ليست صالوناً. بعض الكلمات الشائعة (نظيف، فخم، فنان، لحية، فيد، رخيص) تُربط بأقرب فلتر بيانات متاح بشفافية — دون اختراع فلتر غير موجود.</p>
      ${nearSearchPhrasesSectionHtml()}
      <ul class="grid">${links}</ul>
      <p class="note"><a href="/near">أقرب حلاق من موقعي حسب المدينة</a> · <a href="/nusuk">نسك الحج</a> · <a href="/occasions">المناسبات والزحام</a> · <a href="/occasions/friday-prep">الجمعة</a> · <a href="/occasions/ramadan">رمضان</a></p>
    `,
    jsonLd,
  });
}

function renderRelatedNearLinks(page) {
  const links = page.relatedNearLinks;
  if (!Array.isArray(links) || links.length === 0) return '';
  const items = links
    .map((l) => '<li><a href="' + escapeHtml(l.href) + '">' + escapeHtml(l.labelAr) + '</a></li>')
    .join("\n");
  return (
    "\n      <section>\n" +
    "        <h2>روابط قريبة ومساعدة</h2>\n" +
    "        <ul class=\"grid\">" +
    items +
    "</ul>\n" +
    "      </section>"
  );
}

function renderPage(page) {
  const path = `${HUB}/${page.slug}`;
  const canonical = `${ORIGIN}${path}`;
  const cta = `${ORIGIN}/#/?need=${encodeURIComponent(page.slug)}`;
  const aliases = page.aliases.map((a) => `<span class="chip">${escapeHtml(a)}</span>`).join('');
  const siblings = PAGES.filter((p) => p.slug !== page.slug)
    .slice(0, 8)
    .map((p) => `<li><a href="${HUB}/${p.slug}">${escapeHtml(p.h1)}</a></li>`)
    .join('\n');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: page.title,
        url: canonical,
        inLanguage: 'ar-SA',
        description: page.description,
        about: page.aliases,
        isPartOf: { '@type': 'WebApplication', name: 'حلاق ماب', url: `${ORIGIN}/` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'حلاق ماب', item: `${ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: 'حسب الحاجة', item: `${ORIGIN}${HUB}` },
          { '@type': 'ListItem', position: 3, name: page.h1, item: canonical },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `هل حلاق ماب يوفر ${page.h1} مباشرة؟`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'لا. حلاق ماب منصة استعلام رقمية. تُفلتر النتائج حسب ما يعلنه الشركاء المفعّلون، والتنسيق معهم مباشرة.',
            },
          },
          {
            '@type': 'Question',
            name: 'ماذا يحدث بعد الضغط على ابدأ الاستعلام؟',
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${page.filterNote} ثم تتابع داخل التطبيق حول موقعك أو النطاق الجغرافي.`,
            },
          },
        ],
      },
    ],
  };
  return htmlShell({
    title: page.title,
    description: page.description,
    canonical,
    h1: page.h1,
    bodyInner: `
      <nav class="crumbs"><a href="${ORIGIN}/">الرئيسية</a> / <a href="${HUB}">حسب الحاجة</a> / <span>${escapeHtml(page.h1)}</span></nav>
      <p class="lead">${escapeHtml(page.lead)}</p>
      <p>${escapeHtml(page.body)}</p>
      <div class="card"><p class="note">${escapeHtml(page.filterNote)}</p></div>
      <p>${aliases}</p>
      ${nearSearchPhrasesSectionHtml()}
      <p class="cta-wrap" style="margin:1.5rem 0"><a class="cta" href="${escapeHtml(cta)}">ابدأ الاستعلام — ${escapeHtml(page.h1)}</a></p>
      ${renderRelatedNearLinks(page)}
      <section>
        <h2>نيات بحث أخرى</h2>
        <ul class="grid">${siblings}</ul>
      </section>
      <p class="note"><a href="${HUB}">كل الفلاتر</a> · <a href="/near">أقرب حلاق من موقعي</a> · <a href="${ORIGIN}/">الرئيسية</a></p>
    `,
    jsonLd,
  });
}

function main() {
  syncLandingPagesJson();
  writeFileDeep(join(DIST, 'need', 'index.html'), renderHub());
  for (const page of PAGES) {
    writeFileDeep(join(DIST, 'need', page.slug, 'index.html'), renderPage(page));
  }
  console.log(`[generate-filter-intent-seo] synced JSON + wrote hub + ${PAGES.length} pages under dist/need`);
}

main();
