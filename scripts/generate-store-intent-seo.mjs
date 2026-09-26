/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * يولّد dist/need/store/index.html + dist/need/{slug}/index.html — نية بحث منتجات المتجر.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STORE_INTENT_HUB,
  STORE_INTENT_OPEN_STORE,
  STORE_INTENT_OPEN_STORE_PATH,
  STORE_INTENT_OPEN_STORE_ROUTES,
  STORE_INTENT_PAGES,
} from './data/storeIntentLandingPages.mjs';
import {
  brandPageTypeCss,
  fazaaMeasurementTagHtml,
} from './lib/platformBrandIdentity.mjs';
import {
  STORE_BRAND_NAME_AR,
  STORE_BRAND_NAME_EN,
  STORE_LOGO_ABS_WWW,
  STORE_SITE_NAME,
  storeIconLinks,
  storeLogoImgHtml,
} from './lib/storeBrandIdentity.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const STORE_INTENT_ORIGIN = 'https://www.halaqmap.com';
export const STORE_INTENT_HUB_PATH = '/need/store';
export { STORE_INTENT_OPEN_STORE_PATH };
const STORE_ORIGIN = 'https://store.halaqmap.com';

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function writeFileDeep(root, filePath, content) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, 'utf8');
}

function storeHeaderHtml() {
  return `    <header class="brand store-header">
      <a class="brand-mark" href="${STORE_ORIGIN}/store" aria-label="${STORE_BRAND_NAME_AR} — المتجر">
        ${storeLogoImgHtml()}
      </a>
      <a class="brand-lockup" href="${STORE_ORIGIN}/store" aria-label="متجر ${STORE_BRAND_NAME_AR}">
        <span class="brand-ar">${STORE_BRAND_NAME_AR}</span>
        <span class="brand-en" dir="ltr">${STORE_BRAND_NAME_EN}</span>
        <span class="store-sub">حلول أعمال · منتج واحد لكل صفحة</span>
      </a>
    </header>
    <nav class="store-shortcuts" aria-label="روابط المتجر">
      <a class="store-chip store-chip-primary" href="${STORE_ORIGIN}/store">متجر خريطة الحل</a>
      <a class="store-chip" href="${STORE_INTENT_HUB_PATH}">كل الحلول</a>
    </nav>`;
}

function storeHeaderCss() {
  return `    header.store-header { display:flex; align-items:center; gap:.9rem; margin-bottom:.85rem; }
    header.store-header img { width:56px; height:56px; border-radius:16px; object-fit:cover; box-shadow:0 0 0 2px rgba(251,191,36,.35), 0 10px 28px rgba(120,53,15,.25); }
    .brand-lockup { display:flex; flex-direction:column; gap:.12rem; text-decoration:none; line-height:1.12; }
    .brand-ar {
      font-family: "Segoe UI", Tahoma, "Noto Naskh Arabic", sans-serif;
      font-weight:700; font-size:1.65rem; letter-spacing:-0.01em;
      background: linear-gradient(105deg,#fde68a 0%,#fbbf24 45%,#f59e0b 120%);
      -webkit-background-clip:text; background-clip:text; color:transparent;
    }
    .brand-en { font-family: system-ui, sans-serif; font-weight:800; font-size:.68rem; letter-spacing:.18em; color:#fcd34d; text-transform:uppercase; }
    .store-sub { font-family: "Segoe UI", Tahoma, sans-serif; font-weight:600; font-size:.8rem; color:#94a3b8; }
    .store-shortcuts { display:flex; flex-wrap:wrap; gap:.45rem; margin:0 0 1.35rem; }
    .store-chip {
      display:inline-block; padding:.4rem .75rem; border-radius:999px;
      border:1px solid rgba(251,191,36,.28); background:rgba(30,20,8,.55);
      color:#fde68a; text-decoration:none; font-weight:700; font-size:.82rem;
    }
    .store-chip:hover { border-color:#fbbf24; color:#fff; }
    .store-chip-primary { background: linear-gradient(135deg,#d97706,#b45309); color:#1c1204; border-color:transparent; }`;
}

const OPEN_STORE_BACKLINK_SLUGS = new Set(
  STORE_INTENT_OPEN_STORE_ROUTES.flatMap((route) => [
    route.slug,
    ...(route.also ?? []).map((item) => item.slug),
  ]),
);

function openStoreGuideLink() {
  return `<p class="related">هذه الصفحة جزء من دليل <a href="${STORE_INTENT_OPEN_STORE_PATH}">كيف تفتح متجراً إلكترونياً لنشاطك</a>.</p>`;
}

function listItems(items) {
  return `<ul class="bullets">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function faqHtml(faq) {
  return `<section class="card faq" aria-labelledby="faq-heading">
      <h2 id="faq-heading">أسئلة شائعة</h2>
      <dl>${faq
        .map(
          (row) => `<div class="faq-row">
          <dt>${escapeHtml(row.q)}</dt>
          <dd>${escapeHtml(row.a)}</dd>
        </div>`,
        )
        .join('')}</dl>
    </section>`;
}

function heroImageHtml(heroImage) {
  if (!heroImage) return '';
  const width = heroImage.width ?? 640;
  const height = heroImage.height ?? 349;
  return `<aside class="hero-image">
        <img src="${escapeHtml(heroImage.src)}" alt="${escapeHtml(heroImage.alt)}" width="${width}" height="${height}" loading="eager" decoding="async" />
      </aside>`;
}

export function renderStoreIntentPage(page, { distRoot } = {}) {
  const path = `/need/${page.slug}`;
  const canonical = `${STORE_INTENT_ORIGIN}${path}`;
  const indexable = page.indexable !== false;
  const robots = indexable ? 'index, follow' : 'noindex, follow';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: page.title,
        url: canonical,
        inLanguage: 'ar-SA',
        description: page.description,
        about: page.product,
        isPartOf: { '@type': 'WebSite', name: 'خريطة الحل', url: STORE_ORIGIN },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'خريطة الحل', item: `${STORE_INTENT_ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: 'حلول الأعمال', item: `${STORE_INTENT_ORIGIN}${STORE_INTENT_HUB_PATH}` },
          { '@type': 'ListItem', position: 3, name: page.h1, item: canonical },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: page.faq.map((row) => ({
          '@type': 'Question',
          name: row.q,
          acceptedAnswer: { '@type': 'Answer', text: row.a },
        })),
      },
    ],
  };

  const bodyInner = `
      <nav class="crumbs"><a href="${STORE_INTENT_ORIGIN}/">الرئيسية</a> / <a href="${STORE_INTENT_HUB_PATH}">حلول الأعمال</a> / <span>${escapeHtml(page.product)}</span></nav>
      <p class="product-tag">${escapeHtml(page.product)}</p>
      <p class="lead">${escapeHtml(page.problem)}</p>
      <section class="card">
        <h2>كيف يساعدك ${escapeHtml(page.product)}</h2>
        <p>${escapeHtml(page.solution)}</p>
      </section>
      <section class="card">
        <h2>ما الذي تحصل عليه</h2>
        ${listItems(page.benefits)}
      </section>
      <section class="card muted-card">
        <h2>ما لا نفعله في هذه الصفحة</h2>
        ${listItems(page.notThis)}
      </section>
      ${faqHtml(page.faq)}
      ${OPEN_STORE_BACKLINK_SLUGS.has(page.slug) ? openStoreGuideLink() : ''}
      <p class="cta-wrap"><a class="cta" href="${escapeHtml(page.ctaUrl)}" rel="noopener">${escapeHtml(page.ctaText)}</a></p>
      <p class="keywords" aria-label="كلمات مفتاحية">${escapeHtml(page.keywords)}</p>
  `;

  return htmlShell({
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    canonical,
    robots,
    h1: page.h1,
    bodyInner,
    jsonLd,
    heroImage: page.heroImage,
  });
}

function htmlShell({ title, description, keywords, canonical, robots, h1, bodyInner, jsonLd, heroImage }) {
  const hasHero = Boolean(heroImage);
  const wrapClass = hasHero ? 'wrap wrap-hero' : 'wrap';
  const mainInner = `${storeHeaderHtml()}
    <main>
      <h1>${escapeHtml(h1)}</h1>
      ${bodyInner}
    </main>
    <footer>
      <p>خريطة الحل — شريك تقني. تفاصيل الأسعار والباقات في صفحة المنتج المرتبطة أعلاه.</p>
    </footer>`;
  const wrapInner = hasHero
    ? `${heroImageHtml(heroImage)}\n    <div class="hero-main-col">\n${mainInner}\n    </div>`
    : mainInner;
  return `<!DOCTYPE html>
<html lang="ar-SA" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="keywords" content="${escapeHtml(keywords)}" />
  <meta name="robots" content="${robots}" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  <meta property="og:image" content="${STORE_LOGO_ABS_WWW}" />
  <meta property="og:image:alt" content="${escapeHtml(STORE_BRAND_NAME_AR)}" />
  <meta property="og:locale" content="ar_SA" />
  <meta property="og:site_name" content="${STORE_SITE_NAME}" />
  <meta name="application-name" content="${STORE_SITE_NAME}" />
${storeIconLinks()}
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>
${storeHeaderCss()}
${brandPageTypeCss('linear-gradient(180deg,#120a04,#1a1208 55%,#0c0804)')}
    :root { color-scheme: dark; --card:#1a1208; --text:#f8fafc; --muted:#94a3b8; --accent:#fbbf24; --line:rgba(251,191,36,.22); }
    * { box-sizing: border-box; }
    .wrap { max-width: 44rem; margin: 0 auto; padding: 1.5rem 1.15rem 3rem; }
    .crumbs { font-size:.9rem; color:var(--muted); margin-bottom:1rem; }
    .crumbs a { color:var(--accent); }
    .product-tag { display:inline-block; margin:0 0 .75rem; padding:.25rem .7rem; border-radius:999px; border:1px solid var(--line); color:#fde68a; font-size:.85rem; font-weight:700; }
    .card { border:1px solid var(--line); border-radius:14px; background:var(--card); padding:1rem 1.1rem; margin:1rem 0; }
    .muted-card h2 { color:#cbd5e1; }
    .bullets { margin:.35rem 0 0; padding-right:1.2rem; }
    .bullets li { margin:.35rem 0; }
    .faq-row { margin:.85rem 0; }
    .faq-row dt { font-weight:700; color:#fde68a; margin-bottom:.25rem; }
    .faq-row dd { margin:0; color:var(--text); }
    .cta-wrap { margin:1.5rem 0 .75rem; }
    .cta { display:inline-block; background: linear-gradient(135deg,#d97706,#b45309); color:#1c1204; font-weight:800; padding:.9rem 1.3rem; border-radius:12px; text-decoration:none; }
    .related { margin:1rem 0 0; color:var(--muted); }
    .related a, .also a { color:var(--accent); }
    .also { margin:.45rem 0 0; font-size:.92rem; }
    .route-line { margin:.35rem 0 0; color:var(--muted); }
    .grid { list-style:none; padding:0; margin:1rem 0; display:grid; gap:.65rem; }
    .grid a { display:block; padding:.85rem 1rem; border:1px solid var(--line); border-radius:12px; background:var(--card); color:var(--text); text-decoration:none; }
    .grid a strong { color:#fde68a; }
    footer { margin-top:2.5rem; padding-top:1rem; border-top:1px solid var(--line); color:var(--muted); font-size:.85rem; }
    .wrap-hero { max-width: 68rem; }
    .hero-image img { width:100%; height:auto; display:block; border-radius:18px; border:1px solid var(--line); box-shadow:0 20px 45px rgba(0,0,0,.35); }
    @media (max-width: 859px) {
      .hero-image { max-width: 420px; margin: 0 auto 1.25rem; }
    }
    @media (min-width: 860px) {
      .wrap-hero { display:grid; grid-template-columns: 22rem 1fr; gap:2rem; align-items:start; }
      .wrap-hero .hero-image { position:sticky; top:1.5rem; }
    }
  </style>
${fazaaMeasurementTagHtml({ snapViewContent: true })}
</head>
<body>
  <div class="${wrapClass}">
${wrapInner}
  </div>
</body>
</html>`;
}

export function renderStoreIntentHub(pages = STORE_INTENT_PAGES) {
  const canonical = `${STORE_INTENT_ORIGIN}${STORE_INTENT_HUB_PATH}`;
  const links = pages
    .map(
      (p) =>
        `<li><a href="/need/${p.slug}"><strong>${escapeHtml(p.product)}</strong> — ${escapeHtml(p.h1)}</a></li>`,
    )
    .join('\n');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: STORE_INTENT_HUB.title,
        url: canonical,
        inLanguage: 'ar-SA',
        description: STORE_INTENT_HUB.description,
        isPartOf: { '@type': 'WebSite', name: 'خريطة الحل', url: STORE_ORIGIN },
      },
      {
        '@type': 'ItemList',
        itemListElement: pages.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: p.product,
          url: `${STORE_INTENT_ORIGIN}/need/${p.slug}`,
        })),
      },
    ],
  };
  return htmlShell({
    title: STORE_INTENT_HUB.title,
    description: STORE_INTENT_HUB.description,
    keywords: 'حلول أعمال، متجر خريطة الحل، صفحات نية بحث',
    canonical,
    robots: 'index, follow',
    h1: STORE_INTENT_HUB.h1,
    bodyInner: `
      <p class="lead">${escapeHtml(STORE_INTENT_HUB.description)}</p>
      <p class="related">إن كان سؤالك كيف تفتح متجراً لنشاطك، ابدأ من <a href="${STORE_INTENT_OPEN_STORE_PATH}">دليل اختيار الطريق المناسب لمهنتك</a>.</p>
      <ul class="grid">${links}</ul>
    `,
    jsonLd,
  });
}

export function renderStoreIntentOpenStorePage() {
  const canonical = `${STORE_INTENT_ORIGIN}${STORE_INTENT_OPEN_STORE_PATH}`;
  const routes = STORE_INTENT_OPEN_STORE_ROUTES.map((route) => {
    const also = (route.also ?? [])
      .map(
        (item) =>
          `<p class="also">زاوية قريبة: <a href="/need/${item.slug}">${escapeHtml(item.label)}</a></p>`,
      )
      .join('');
    return `<li><a href="/need/${route.slug}"><strong>${escapeHtml(route.activity)}</strong> — ${escapeHtml(route.product)}</a><p class="route-line">${escapeHtml(route.line)}</p>${also}</li>`;
  }).join('\n');
  const faq = [
    {
      q: 'هل هذه الصفحة تبيع منتجاً واحداً؟',
      a: 'لا. توضّح الفرق بين القالب العام والصفحة المتخصصة، ثم تحيلك إلى صفحة النشاط المناسب. السعر والباقة في صفحة ذلك المنتج.',
    },
    {
      q: 'هل تحصّل المنصة ثمن طلب الزبون؟',
      a: 'لا. اشتراك المنتج عبر بوابة خريطة الحل. ثمن الطلب بين المشغّل وزبونه، بلا عمولة على السلة وبلا تحصيل لقيمة الطلب عبر المنصة.',
    },
    {
      q: 'أين دعوات المناسبات وبطاقات الاحتفاء؟',
      a: 'ليست هذه الكلمة. افراحي1 وكاردي8 في فهرس حلول الأعمال، لأنهما ليستا صفحة طلبات لمتجر.',
    },
  ];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: STORE_INTENT_OPEN_STORE.title,
        url: canonical,
        inLanguage: 'ar-SA',
        description: STORE_INTENT_OPEN_STORE.description,
        isPartOf: { '@type': 'WebSite', name: 'خريطة الحل', url: STORE_ORIGIN },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'خريطة الحل', item: `${STORE_INTENT_ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: 'حلول الأعمال', item: `${STORE_INTENT_ORIGIN}${STORE_INTENT_HUB_PATH}` },
          { '@type': 'ListItem', position: 3, name: STORE_INTENT_OPEN_STORE.h1, item: canonical },
        ],
      },
      {
        '@type': 'ItemList',
        itemListElement: STORE_INTENT_OPEN_STORE_ROUTES.map((route, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: `${route.activity} — ${route.product}`,
          url: `${STORE_INTENT_ORIGIN}/need/${route.slug}`,
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: faq.map((row) => ({
          '@type': 'Question',
          name: row.q,
          acceptedAnswer: { '@type': 'Answer', text: row.a },
        })),
      },
    ],
  };
  return htmlShell({
    title: STORE_INTENT_OPEN_STORE.title,
    description: STORE_INTENT_OPEN_STORE.description,
    keywords: STORE_INTENT_OPEN_STORE.keywords,
    canonical,
    robots: 'index, follow',
    h1: STORE_INTENT_OPEN_STORE.h1,
    bodyInner: `
      <nav class="crumbs"><a href="${STORE_INTENT_ORIGIN}/">الرئيسية</a> / <a href="${STORE_INTENT_HUB_PATH}">حلول الأعمال</a> / <span>كيف تفتح متجراً</span></nav>
      <p class="lead">لا تحتاج إلى البدء بقالب متجر عام ومكلف. ابدأ بصفحة رقمية مصممة لطبيعة نشاطك، ثم شارك الرابط مع من تريد أن يصل إليك.</p>
      <section class="card">
        <h2>ما الذي تحتاجه قبل فتح متجر إلكتروني؟</h2>
        <p>اسماً لنشاطك، وعرضاً واضحاً لما تقدمه، وطريقاً يصل به الزبون إليك: رابط أو رمز على الباب. والطلبات تصل إلى لوحة واحدة تديرها أنت. هذا يكفي للبدء، قبل أي خصائص متجر كبير.</p>
      </section>
      <section class="card">
        <h2>هل تحتاج متجراً عاماً أم صفحة رقمية متخصصة؟</h2>
        <p>القالب العام يفرض إعداداً طويلاً لا يشبه طريقة عملك. خريطة الحل تعطيك منتجاً واحداً لمهنتك. اشتراك هذا المنتج عبر بوابة المنصة. ثمن طلب الزبون يبقى بينك وبينه: بلا عمولة على السلة، وبلا تحصيل لقيمة الطلب عبر المنصة.</p>
      </section>
      <section class="card">
        <h2>اختر نشاطك</h2>
        <ul class="grid">${routes}</ul>
      </section>
      <section class="card">
        <h2>ماذا تعرض في صفحتك؟</h2>
        <p>اسم النشاط، وما تقدمه، وكيف يُطلب. في الطبخ والتموينات والخضار والمطعم والقهوة: أصناف أو قائمة، ثم طلب بتوصيل أو استلام حسب ما يتيحه نشاطك. في التمور تُضاف زاوية الهدايا، وصناديق الموسم حين يُفتح لها مزاد. في الحلويات الخاصة: معرض وأعمال، ثم تفاصيل المناسبة وعرض سعر، والموعد بعد أن تؤكد المتخصصة العربون بيدها.</p>
      </section>
      <section class="card">
        <h2>كيف تشارك الرابط ورمز الاستجابة؟</h2>
        <p>من لوحة نشاطك تنسخ الرابط أو تطبع الملصق. الزبون يفتح الصفحة من جواله. الإرسال من جهازك، لا من قائمة ترسلها المنصة نيابة عنك.</p>
      </section>
      <section class="card muted-card">
        <h2>كيف تبدأ بلا وعود مبالغ فيها؟</h2>
        ${listItems([
          'ليست الصفحة منصة تجارة بكل خصائص المتاجر الكبيرة.',
          'لا أسطول توصيل تملكه المنصة، ولا دفتر زبائن لديها.',
          'لا تحصيل لثمن الطلب عبر المنصة، ولا عمولة على السلة.',
          'دعوات المناسبات وبطاقات الاحتفاء طريق آخر، تجده في فهرس الحلول.',
        ])}
      </section>
      ${faqHtml(faq)}
      <p class="cta-wrap"><a class="cta" href="${STORE_INTENT_HUB_PATH}">تصفح كل حلول الأعمال</a></p>
    `,
    jsonLd,
  });
}

export function buildStoreIntentSitemapXml(pages = STORE_INTENT_PAGES) {
  const urls = [
    { loc: `${STORE_INTENT_ORIGIN}${STORE_INTENT_HUB_PATH}`, priority: '0.88', changefreq: 'weekly' },
    { loc: `${STORE_INTENT_ORIGIN}${STORE_INTENT_OPEN_STORE_PATH}`, priority: '0.86', changefreq: 'weekly' },
    ...pages
      .filter((p) => p.indexable !== false)
      .map((p) => ({
        loc: `${STORE_INTENT_ORIGIN}/need/${p.slug}`,
        priority: '0.84',
        changefreq: 'weekly',
      })),
  ];
  const body = urls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

export function writeStoreIntentSeo(distRoot) {
  writeFileDeep(distRoot, join(distRoot, 'need', 'store', 'index.html'), renderStoreIntentHub());
  writeFileDeep(
    distRoot,
    join(distRoot, 'need', 'how-to-open-online-store', 'index.html'),
    renderStoreIntentOpenStorePage(),
  );
  for (const page of STORE_INTENT_PAGES) {
    writeFileDeep(
      distRoot,
      join(distRoot, 'need', page.slug, 'index.html'),
      renderStoreIntentPage(page, { distRoot }),
    );
  }
  writeFileDeep(distRoot, join(distRoot, 'sitemap-store-intent.xml'), buildStoreIntentSitemapXml());
}

function main() {
  const distRoot = join(__dirname, '..', 'dist');
  writeStoreIntentSeo(distRoot);
  const indexed = STORE_INTENT_PAGES.filter((p) => p.indexable !== false).length;
  console.log(
    `[generate-store-intent-seo] wrote hub + open-store guide + ${STORE_INTENT_PAGES.length} pages (${indexed} indexable) + sitemap-store-intent.xml`,
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
