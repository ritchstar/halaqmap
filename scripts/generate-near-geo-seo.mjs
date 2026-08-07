/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * يولّد صفحات SEO ثابتة تحت dist/near/** وملف sitemap-geo.xml
 * من src/config/geoNearRegistry.json — يُشغَّل بعد vite build.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const REGISTRY_PATH = join(ROOT, 'src', 'config', 'geoNearRegistry.json');
const DIST = join(ROOT, 'dist');
const ORIGIN = 'https://www.halaqmap.com';

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function nodePath(node) {
  return `/near/${[...node.parentSlugs, node.slug].join('/')}`;
}

function absoluteUrl(path) {
  return `${ORIGIN}${path}`;
}

function childrenOf(nodes, citySlug) {
  return nodes
    .filter((n) => n.parentSlugs.length === 1 && n.parentSlugs[0] === citySlug)
    .sort((a, b) => b.priority - a.priority);
}

function findCity(nodes, citySlug) {
  return nodes.find((n) => n.kind === 'city' && n.slug === citySlug) ?? null;
}

function placeType(kind) {
  if (kind === 'city') return 'City';
  if (kind === 'direction') return 'AdministrativeArea';
  return 'Place';
}

function buildFaqs(nameAr) {
  return [
    {
      q: `كيف أجد أقرب حلاق في ${nameAr} عبر حلاق ماب؟`,
      a: `افتح صفحة الاستعلام في حلاق ماب وابدأ الاستعلام قرب موقعك أو ضمن نطاق ${nameAr}. تعالج المنصة البيانات المتاحة لحظياً وتعرض الخيارات المناسبة — دون أن تكون صالوناً أو وسيط حجز.`,
    },
    {
      q: `هل حلاق ماب صالون في ${nameAr}؟`,
      a: `لا. حلاق ماب منصة برمجية (تطبيق ويب) للاستعلام والعرض الرقمي. الصالونات الظاهرة بيانات شركاء مفعّلين داخل المنصة، والعلاقة في تنفيذ الخدمة بينهم وبينك مباشرة.`,
    },
    {
      q: `هل تغطي المنصة ${nameAr} فقط؟`,
      a: `تغطي حلاق ماب مدناً سعودية متعددة. هذه الصفحة مخصّصة لنية البحث المحلي حول ${nameAr}، ويمكنك الاستعلام من أي مكان داخل نطاق التغطية.`,
    },
  ];
}

function jsonLdGraph({ node, path, city, children, faqs }) {
  const pageUrl = absoluteUrl(path);
  const placeName = node.nameAr;
  const breadcrumbItems = [
    { name: 'حلاق ماب', item: `${ORIGIN}/` },
    { name: 'أقرب حلاق', item: `${ORIGIN}/near` },
  ];
  if (city && node.kind !== 'city') {
    breadcrumbItems.push({ name: city.nameAr, item: absoluteUrl(nodePath(city)) });
  }
  breadcrumbItems.push({ name: placeName, item: pageUrl });

  const graph = [
    {
      '@type': 'Organization',
      '@id': `${ORIGIN}/#organization`,
      name: 'حلاق ماب',
      alternateName: 'HALAQ MAP',
      url: `${ORIGIN}/`,
    },
    {
      '@type': 'WebApplication',
      '@id': `${ORIGIN}/#webapp`,
      name: 'حلاق ماب',
      url: `${ORIGIN}/`,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      inLanguage: 'ar-SA',
      provider: { '@id': `${ORIGIN}/#organization` },
      description:
        'منصة رقمية ذكية للاستعلام عن الحلاق الأنسب عبر المعالجة والفلترة اللحظية داخل المملكة.',
    },
    {
      '@type': 'CollectionPage',
      '@id': `${pageUrl}#page`,
      name: `أقرب حلاق في ${placeName}`,
      url: pageUrl,
      inLanguage: 'ar-SA',
      isPartOf: { '@id': `${ORIGIN}/#webapp` },
      about: { '@id': `${pageUrl}#place` },
      spatialCoverage: { '@id': `${pageUrl}#place` },
      description: `صفحة هبوط جغرافية من حلاق ماب لمساعدتك على بدء استعلام أقرب حلاق في ${placeName}.`,
      mainEntity: { '@id': `${ORIGIN}/#webapp` },
    },
    {
      '@type': placeType(node.kind),
      '@id': `${pageUrl}#place`,
      name: placeName,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: node.lat,
        longitude: node.lng,
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: breadcrumbItems.map((b, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: b.name,
        item: b.item,
      })),
    },
    {
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];

  if (children.length > 0) {
    graph.push({
      '@type': 'ItemList',
      '@id': `${pageUrl}#children`,
      name: `مناطق ضمن ${placeName}`,
      itemListElement: children.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.nameAr,
        url: absoluteUrl(nodePath(c)),
      })),
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

function renderPage({ node, nodes, isHub = false }) {
  if (isHub) {
    const cities = nodes.filter((n) => n.kind === 'city').sort((a, b) => b.priority - a.priority);
    const title = 'أقرب حلاق حسب المدينة | حلاق ماب';
    const description =
      'صفحات هبوط جغرافية من منصة حلاق ماب لبدء استعلام أقرب حلاق في مدن المملكة — برمجيات استعلام لحظي وليست صالوناً.';
    const canonical = `${ORIGIN}/near`;
    const cityLinks = cities
      .map(
        (c) =>
          `<li><a href="${escapeHtml(nodePath(c))}">أقرب حلاق في ${escapeHtml(c.nameAr)}</a></li>`,
      )
      .join('\n');
    const graph = {
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
          itemListElement: cities.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c.nameAr,
            url: absoluteUrl(nodePath(c)),
          })),
        },
      ],
    };
    return htmlShell({
      title,
      description,
      canonical,
      h1: 'أقرب حلاق حسب المدينة',
      bodyInner: `
        <p class="lead">اختر مدينتك لفتح صفحة هبوط محلية من <strong>حلاق ماب</strong> — منصة برمجية للاستعلام اللحظي عن الحلاق الأنسب ضمن البيانات المتاحة.</p>
        <p class="note">حلاق ماب ليست صالوناً وليست وسيط حجز. بعد فتح الصفحة اضغط «ابدأ الاستعلام» للمتابعة داخل التطبيق.</p>
        <ul class="grid">${cityLinks}</ul>
        <p class="cta-wrap"><a class="cta" href="${ORIGIN}/#/">ابدأ الاستعلام الآن</a></p>
      `,
      jsonLd: graph,
    });
  }

  const path = nodePath(node);
  const city = node.kind === 'city' ? node : findCity(nodes, node.parentSlugs[0]);
  const children = node.kind === 'city' ? childrenOf(nodes, node.slug) : [];
  const faqs = buildFaqs(node.nameAr);
  const title = `أقرب حلاق في ${node.nameAr} | حلاق ماب`;
  const description = `ابدأ استعلام أقرب حلاق في ${node.nameAr} عبر منصة حلاق ماب — معالجة وفلترة لحظية للبيانات المتاحة داخل المنصة، دون أن تكون صالوناً أو دليل حجوزات.`;
  const canonical = absoluteUrl(path);
  const cta = `${ORIGIN}/#/?near=${encodeURIComponent([...node.parentSlugs, node.slug].join('/'))}`;

  const crumbs = [
    `<a href="${ORIGIN}/">الرئيسية</a>`,
    `<a href="/near">أقرب حلاق</a>`,
  ];
  if (city && node.kind !== 'city') {
    crumbs.push(`<a href="${escapeHtml(nodePath(city))}">${escapeHtml(city.nameAr)}</a>`);
  }
  crumbs.push(`<span>${escapeHtml(node.nameAr)}</span>`);

  const childBlock =
    children.length > 0
      ? `<section>
        <h2>مناطق واتجاهات ضمن ${escapeHtml(node.nameAr)}</h2>
        <ul class="grid">${children
          .map(
            (c) =>
              `<li><a href="${escapeHtml(nodePath(c))}">أقرب حلاق في ${escapeHtml(c.nameAr)}</a></li>`,
          )
          .join('\n')}</ul>
      </section>`
      : city
        ? `<p class="note">عد إلى صفحة <a href="${escapeHtml(nodePath(city))}">${escapeHtml(city.nameAr)}</a> لرؤية بقية المناطق.</p>`
        : '';

  const faqHtml = faqs
    .map(
      (f) => `
      <details>
        <summary>${escapeHtml(f.q)}</summary>
        <p>${escapeHtml(f.a)}</p>
      </details>`,
    )
    .join('\n');

  return htmlShell({
    title,
    description,
    canonical,
    h1: `أقرب حلاق في ${node.nameAr}`,
    bodyInner: `
      <nav class="crumbs" aria-label="مسار التنقل">${crumbs.join(' <span aria-hidden="true">/</span> ')}</nav>
      <p class="lead">هذه صفحة هبوط جغرافية من منصة <strong>حلاق ماب</strong> لنية البحث عن أقرب حلاق في <strong>${escapeHtml(node.nameAr)}</strong>. المنصة تطبيق ويب للاستعلام والعرض الرقمي — وليست منشأة حلاقة.</p>
      <p>اضغط الزر أدناه لبدء الاستعلام داخل التطبيق حول نطاق ${escapeHtml(node.nameAr)}. تُعرض النتائج وفق البيانات المتاحة من الشركاء المفعّلين لحظة الاستعلام.</p>
      <p class="cta-wrap"><a class="cta" href="${escapeHtml(cta)}">ابدأ الاستعلام — ${escapeHtml(node.nameAr)}</a></p>
      ${childBlock}
      <section>
        <h2>أسئلة شائعة</h2>
        ${faqHtml}
      </section>
      <p class="note"><a href="/near">كل المدن</a> · <a href="${ORIGIN}/">الصفحة الرئيسية</a></p>
    `,
    jsonLd: jsonLdGraph({ node, path, city, children, faqs }),
  });
}

function htmlShell({ title, description, canonical, h1, bodyInner, jsonLd }) {
  return `<!DOCTYPE html>
<html lang="ar-SA" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  <meta property="og:image" content="${ORIGIN}/images/halaqmap_logo_refined.png" />
  <meta property="og:locale" content="ar_SA" />
  <meta property="og:site_name" content="حلاق ماب" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${ORIGIN}/images/halaqmap_logo_refined.png" />
  <link rel="icon" href="/icons/icon-192.png" type="image/png" sizes="192x192" />
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>
    :root { color-scheme: dark; --bg:#061223; --card:#0c1a2e; --text:#e8eef7; --muted:#94a3b8; --accent:#2dd4bf; --line:rgba(45,212,191,.25); }
    * { box-sizing: border-box; }
    body { margin:0; font-family: "Segoe UI", Tahoma, Arial, sans-serif; background: linear-gradient(180deg,#061223,#0a1f33 55%,#061223); color:var(--text); line-height:1.75; }
    .wrap { max-width: 44rem; margin: 0 auto; padding: 1.5rem 1.15rem 3rem; }
    header { display:flex; align-items:center; gap:.75rem; margin-bottom:1.25rem; }
    header img { width:48px; height:48px; border-radius:12px; }
    header a { color:var(--accent); text-decoration:none; font-weight:800; font-size:1.15rem; }
    h1 { font-size: clamp(1.55rem, 4vw, 2.1rem); line-height:1.35; margin: .5rem 0 1rem; }
    h2 { font-size:1.15rem; margin: 1.75rem 0 .75rem; color:var(--accent); }
    .lead { font-size:1.05rem; }
    .note { color:var(--muted); font-size:.95rem; }
    .crumbs { font-size:.9rem; color:var(--muted); margin-bottom:1rem; }
    .crumbs a { color:var(--accent); }
    .grid { list-style:none; padding:0; margin:1rem 0; display:grid; gap:.65rem; }
    .grid a { display:block; padding:.85rem 1rem; border:1px solid var(--line); border-radius:12px; background:var(--card); color:var(--text); text-decoration:none; font-weight:600; }
    .grid a:hover { border-color: var(--accent); }
    .cta-wrap { margin: 1.5rem 0; }
    .cta { display:inline-block; background: linear-gradient(135deg,#0d9488,#0891b2); color:#041016; font-weight:800; padding:.85rem 1.25rem; border-radius:12px; text-decoration:none; }
    details { border:1px solid var(--line); border-radius:12px; padding:.75rem 1rem; margin:.55rem 0; background:rgba(12,26,46,.7); }
    summary { cursor:pointer; font-weight:700; }
    footer { margin-top:2.5rem; padding-top:1rem; border-top:1px solid var(--line); color:var(--muted); font-size:.85rem; }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <a href="${ORIGIN}/"><img src="/images/halaqmap_logo_refined.png" width="48" height="48" alt="حلاق ماب" /></a>
      <a href="${ORIGIN}/">حلاق ماب</a>
    </header>
    <main>
      <h1>${escapeHtml(h1)}</h1>
      ${bodyInner}
    </main>
    <footer>
      <p>© حلاق ماب — منصة برمجية للاستعلام الرقمي. ليست صالوناً وليست وسيط حجز.</p>
    </footer>
  </div>
</body>
</html>
`;
}

function writeFileDeep(filePath, content) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, 'utf8');
}

function main() {
  const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8'));
  const nodes = registry.nodes;
  if (!Array.isArray(nodes) || nodes.length === 0) {
    throw new Error('geoNearRegistry.json: nodes empty');
  }

  const hubHtml = renderPage({ node: null, nodes, isHub: true });
  writeFileDeep(join(DIST, 'near', 'index.html'), hubHtml);

  const urls = [`${ORIGIN}/near`];
  for (const node of nodes) {
    const path = nodePath(node);
    const html = renderPage({ node, nodes, isHub: false });
    writeFileDeep(join(DIST, ...path.split('/').filter(Boolean), 'index.html'), html);
    urls.push(absoluteUrl(path));
  }

  const lastmod = new Date().toISOString().slice(0, 10);
  const sitemapGeo = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (loc) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${loc.endsWith('/near') ? '0.85' : '0.8'}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;
  writeFileDeep(join(DIST, 'sitemap-geo.xml'), sitemapGeo);

  console.log(`[generate-near-geo-seo] wrote ${urls.length} geo URLs + hub under dist/near`);
}

main();
