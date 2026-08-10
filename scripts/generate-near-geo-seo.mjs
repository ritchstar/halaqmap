/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * يولّد صفحات SEO ثابتة تحت dist/near/** وملف sitemap-geo.xml
 * من geoNearRegistry.json + geoNearNeighborhoods.json — يُشغَّل بعد vite build.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BRAND_LOGO_ABS,
  BRAND_SITE_NAME,
  brandHeaderCss,
  brandHeaderHtml,
  brandIconLinks,
  NEAR_SEARCH_KEYWORDS_META,
  nearSearchPhrasesCss,
  nearSearchPhrasesSectionHtml,
} from './lib/platformBrandIdentity.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const REGISTRY_PATH = join(ROOT, 'src', 'config', 'geoNearRegistry.json');
const NEIGHBORHOODS_PATH = join(ROOT, 'src', 'config', 'geoNearNeighborhoods.json');
const DIST = join(ROOT, 'dist');
const ORIGIN = 'https://www.halaqmap.com';
const SIBLING_LIMIT = 12;

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

function childrenOf(nodes, citySlug, kind = null) {
  return nodes
    .filter(
      (n) =>
        n.parentSlugs.length === 1 &&
        n.parentSlugs[0] === citySlug &&
        (kind == null || n.kind === kind),
    )
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

function sitemapPriority(node, isHub = false) {
  if (isHub) return '0.9';
  if (node.kind === 'city') return '0.85';
  if (node.kind === 'neighborhood') return '0.75';
  if (node.kind === 'direction') return '0.65';
  return '0.7';
}

function buildFaqs(node, city) {
  const nameAr = node.nameAr;
  if (node.kind === 'neighborhood' && city) {
    return [
      {
        q: `كيف أجد أقرب حلاق من موقعي في حي ${nameAr} بمدينة ${city.nameAr}؟`,
        a: `افتح فزعة الاستعلام في حلاق ماب حول نطاق حي ${nameAr} في ${city.nameAr}. إن قلت أبي حلاق قريب أو عطني أقرب حلاق أو ابحث لي عن أقرب حلاق — تعالج المنصة البيانات المتاحة لحظياً وتعرض الخيارات المناسبة، دون أن تكون صالوناً أو وسيط حجز.`,
      },
      {
        q: `هل حلاق ماب صالون في حي ${nameAr}؟`,
        a: `لا. حلاق ماب منصة برمجية (تطبيق ويب) للاستعلام والعرض الرقمي في ${city.nameAr} وبقية مدن التغطية. الصالونات الظاهرة بيانات شركاء مفعّلين داخل المنصة.`,
      },
      {
        q: `هل صفحة حي ${nameAr} تغني عن صفحة ${city.nameAr}؟`,
        a: `هذه الصفحة مخصّصة لنية البحث المحلي داخل الحي. يمكنك أيضاً فتح صفحة ${city.nameAr} لاستكشاف الاتجاهات والأحياء الأخرى، ثم بدء الاستعلام داخل المنصة.`,
      },
    ];
  }
  return [
    {
      q: `كيف أجد أقرب حلاق من موقعي في ${nameAr}؟`,
      a: `افتح فزعة الاستعلام في حلاق ماب وابدأ من موقعك أو ضمن نطاق ${nameAr}. إن قلت أبي حلاق قريب أو عطني أقرب حلاق أو ابحث لي عن أقرب حلاق — تعالج المنصة البيانات المتاحة لحظياً وتعرض الخيارات المناسبة، دون أن تكون صالوناً أو وسيط حجز.`,
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

function linkList(items) {
  return items
    .map(
      (c) =>
        `<li><a href="${escapeHtml(nodePath(c))}">أقرب حلاق في ${escapeHtml(c.nameAr)}</a></li>`,
    )
    .join('\n');
}

function jsonLdGraph({ node, path, city, directions, neighborhoods, faqs }) {
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

  const place = {
    '@type': placeType(node.kind),
    '@id': `${pageUrl}#place`,
    name: placeName,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: node.lat,
      longitude: node.lng,
    },
  };
  if (Array.isArray(node.aliasesAr) && node.aliasesAr.length > 0) {
    place.alternateName = node.aliasesAr;
  }
  if (city && node.kind !== 'city') {
    place.containedInPlace = {
      '@type': 'City',
      name: city.nameAr,
      url: absoluteUrl(nodePath(city)),
    };
  }

  const collectionDesc =
    node.kind === 'neighborhood' && city
      ? `فزعة لحي ${placeName} في ${city.nameAr} من حلاق ماب لبدء استعلام أقرب حلاق.`
      : `فزعة جغرافية من حلاق ماب لمساعدتك على بدء استعلام أقرب حلاق في ${placeName}.`;

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
      name:
        node.kind === 'neighborhood' && city
          ? `أقرب حلاق في ${placeName} | ${city.nameAr}`
          : `أقرب حلاق في ${placeName}`,
      url: pageUrl,
      inLanguage: 'ar-SA',
      isPartOf: { '@id': `${ORIGIN}/#webapp` },
      about: { '@id': `${pageUrl}#place` },
      spatialCoverage: { '@id': `${pageUrl}#place` },
      description: collectionDesc,
      mainEntity: { '@id': `${ORIGIN}/#webapp` },
    },
    place,
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

  const listItems = [...directions, ...neighborhoods];
  if (listItems.length > 0) {
    graph.push({
      '@type': 'ItemList',
      '@id': `${pageUrl}#children`,
      name: `مناطق ضمن ${placeName}`,
      itemListElement: listItems.map((c, i) => ({
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
    const topNeighborhoodCities = cities.slice(0, 8);
    // عنوان يبدأ بعبارات البحث التنافسية لـ «أقرب حلاق من موقعي»
    const title = 'أقرب حلاق من موقعي حسب المدينة والحي | حلاق ماب';
    const description =
      'أقرب حلاق من موقعك عبر حلاق ماب: أبي حلاق قريب، عطني أقرب حلاق، ابحث لي عن أقرب حلاق — اختر المدينة أو الحي وابدأ استعلاماً لحظياً. فزعة بحث وليست صالوناً ولا وسيط حجز.';
    const canonical = `${ORIGIN}/near`;
    const cityLinks = linkList(cities);
    const neighHint = topNeighborhoodCities
      .map(
        (c) =>
          `<li><a href="${escapeHtml(nodePath(c))}">أحياء ${escapeHtml(c.nameAr)} — تصفّح بالحي</a></li>`,
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
      h1: 'أقرب حلاق من موقعي حسب المدينة والحي',
      bodyInner: `
        <p class="lead"><strong>أقرب حلاق من موقعك</strong> حسب مدينتك وحيّك عبر <strong>حلاق ماب</strong> — فزعة بحث لحظي ضمن البيانات المتاحة على المنصة.</p>
        <p class="note">حلاق ماب ليست صالوناً وليست وسيط حجز. اختر المدينة أدناه ثم اضغط «ابدأ الاستعلام». يمكنك أيضاً تصفّح أحياء الرياض أو أحياء جدة أو أحياء مكة ثم بدء الاستعلام.</p>
        ${nearSearchPhrasesSectionHtml()}
        <p class="note"><a href="/nusuk">مركز نسك الحج — الحلق والتقصير للحجاج</a> · <a href="/need">ابحث حسب حاجتك — الفلاتر</a> · <a href="/occasions/eid-adha-shaving">عيد الأضحى — بعد الأضحية</a></p>
        <section>
          <h2>تصفّح بالأحياء — مدن رئيسية</h2>
          <ul class="grid">${neighHint}</ul>
        </section>
        <section>
          <h2>كل المدن</h2>
          <ul class="grid">${cityLinks}</ul>
        </section>
        <p class="cta-wrap"><a class="cta" href="${ORIGIN}/#/">ابدأ الاستعلام الآن</a></p>
      `,
      jsonLd: graph,
    });
  }

  const path = nodePath(node);
  const city = node.kind === 'city' ? node : findCity(nodes, node.parentSlugs[0]);
  const directions = node.kind === 'city' ? childrenOf(nodes, node.slug, 'direction') : [];
  const neighborhoods = node.kind === 'city' ? childrenOf(nodes, node.slug, 'neighborhood') : [];
  const faqs = buildFaqs(node, city);
  const title =
    node.kind === 'neighborhood' && city
      ? `أقرب حلاق من موقعي في ${node.nameAr} | ${city.nameAr} | حلاق ماب`
      : `أقرب حلاق من موقعي في ${node.nameAr} | حلاق ماب`;
  const description =
    node.kind === 'neighborhood' && city
      ? `أفضل حلاقين بالقرب مني في حي ${node.nameAr} بمدينة ${city.nameAr} — أقرب حلاق من موقعي، صالون قريب، أقرب صالون حولي عبر حلاق ماب. فزعة بحث وليست صالوناً ولا دليل حجوزات.`
      : `أفضل حلاقين بالقرب مني في ${node.nameAr} — أقرب حلاق من موقعي، صالون قريب، أقرب صالون حولي، عطني أقرب صالون من موقعي عبر حلاق ماب. فزعة بحث وليست صالوناً ولا دليل حجوزات.`;
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

  let childBlock = '';
  if (node.kind === 'city') {
    const parts = [];
    if (directions.length > 0) {
      parts.push(`<section>
        <h2>اتجاهات ضمن ${escapeHtml(node.nameAr)}</h2>
        <ul class="grid">${linkList(directions)}</ul>
      </section>`);
    }
    if (neighborhoods.length > 0) {
      parts.push(`<section>
        <h2>أحياء ${escapeHtml(node.nameAr)} — أقرب حلاق حسب الحي</h2>
        <p class="note">فزعات محلية من حلاق ماب لبدء الاستعلام حول الحي بما يوافق رغبتك.</p>
        <ul class="grid">${linkList(neighborhoods)}</ul>
      </section>`);
    }
    childBlock = parts.join('\n');
  } else if (node.kind === 'neighborhood' && city) {
    const siblings = childrenOf(nodes, city.slug, 'neighborhood')
      .filter((n) => n.slug !== node.slug)
      .slice(0, SIBLING_LIMIT);
    childBlock = `
      <p class="note">حي <strong>${escapeHtml(node.nameAr)}</strong> ضمن مدينة <a href="${escapeHtml(nodePath(city))}">${escapeHtml(city.nameAr)}</a> — عد لصفحة المدينة لرؤية كل الأحياء والاتجاهات.</p>
      ${
        siblings.length > 0
          ? `<section>
        <h2>أحياء قريبة ضمن ${escapeHtml(city.nameAr)}</h2>
        <ul class="grid">${linkList(siblings)}</ul>
      </section>`
          : ''
      }
    `;
  } else if (city) {
    childBlock = `<p class="note">عد إلى صفحة <a href="${escapeHtml(nodePath(city))}">${escapeHtml(city.nameAr)}</a> لرؤية الاتجاهات والأحياء.</p>`;
  }

  const faqHtml = faqs
    .map(
      (f) => `
      <details>
        <summary>${escapeHtml(f.q)}</summary>
        <p>${escapeHtml(f.a)}</p>
      </details>`,
    )
    .join('\n');

  const isHajjCity =
    node.kind === 'city' && (node.slug === 'makkah' || node.slug === 'madinah');
  const nusukNote = isHajjCity
    ? `<p class="note"><a href="/nusuk">مركز نسك الحج — الحلق والتقصير</a> للحجاج والزوار في ${escapeHtml(node.nameAr)}.</p>`
    : '';

  const lead =
    node.kind === 'neighborhood' && city
      ? `<p class="lead">هذه فزعة من <strong>حلاق ماب</strong> لمن يبحث عن <strong>أقرب حلاق من موقعه</strong> في حي <strong>${escapeHtml(node.nameAr)}</strong> بمدينة <strong>${escapeHtml(city.nameAr)}</strong>. المنصة تطبيق ويب للاستعلام والعرض الرقمي — وليست منشأة حلاقة في الحي.</p>
      <p>سواء قلت أبي حلاق قريب أو عطني أقرب حلاق أو ابحث لي عن أقرب حلاق — اضغط الزر أدناه لبدء الاستعلام حول نطاق حي ${escapeHtml(node.nameAr)}. تُعرض النتائج وفق البيانات المتاحة من الشركاء المفعّلين لحظة الاستعلام.</p>`
      : `<p class="lead">هذه فزعة من <strong>حلاق ماب</strong> لمن يبحث عن <strong>أقرب حلاق من موقعه</strong> في <strong>${escapeHtml(node.nameAr)}</strong> أو بما يوافق رغبته في محيطه. المنصة تطبيق ويب للاستعلام والعرض الرقمي — وليست منشأة حلاقة.</p>
      <p>سواء قلت أبي حلاق قريب أو عطني أقرب حلاق أو ابحث لي عن أقرب حلاق — اضغط الزر أدناه لبدء الاستعلام حول نطاق ${escapeHtml(node.nameAr)}. تُعرض النتائج وفق البيانات المتاحة من الشركاء المفعّلين لحظة الاستعلام.</p>
      ${nusukNote}`;

  return htmlShell({
    title,
    description,
    canonical,
    h1: `أقرب حلاق من موقعي في ${node.nameAr}`,
    bodyInner: `
      <nav class="crumbs" aria-label="مسار التنقل">${crumbs.join(' <span aria-hidden="true">/</span> ')}</nav>
      ${lead}
      ${nearSearchPhrasesSectionHtml({ compact: true })}
      <p class="cta-wrap"><a class="cta" href="${escapeHtml(cta)}">ابدأ الاستعلام — ${escapeHtml(node.nameAr)}</a></p>
      ${childBlock}
      <section>
        <h2>أسئلة شائعة</h2>
        ${faqHtml}
      </section>
      <p class="note"><a href="/near">كل المدن</a> · <a href="${ORIGIN}/">الصفحة الرئيسية</a></p>
    `,
    jsonLd: jsonLdGraph({
      node,
      path,
      city,
      directions,
      neighborhoods:
        node.kind === 'neighborhood' && city
          ? childrenOf(nodes, city.slug, 'neighborhood')
              .filter((n) => n.slug !== node.slug)
              .slice(0, SIBLING_LIMIT)
          : neighborhoods,
      faqs,
    }),
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
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${BRAND_LOGO_ABS}" />
${brandIconLinks()}
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>
${brandHeaderCss()}
${nearSearchPhrasesCss()}
    :root { color-scheme: dark; --bg:#061223; --card:#0c1a2e; --text:#e8eef7; --muted:#94a3b8; --accent:#2dd4bf; --line:rgba(45,212,191,.25); }
    * { box-sizing: border-box; }
    body { margin:0; font-family: "Tajawal", "Segoe UI", Tahoma, Arial, sans-serif; background: linear-gradient(180deg,#061223,#0a1f33 55%,#061223); color:var(--text); line-height:1.75; }
    .wrap { max-width: 44rem; margin: 0 auto; padding: 1.5rem 1.15rem 3rem; }
    h1 { font-size: clamp(1.55rem, 4vw, 2.1rem); line-height:1.35; margin: .5rem 0 1rem; font-weight:900; }
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
${brandHeaderHtml()}
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

function loadAllNodes() {
  const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8'));
  let neighborhoods = { nodes: [] };
  try {
    neighborhoods = JSON.parse(readFileSync(NEIGHBORHOODS_PATH, 'utf8'));
  } catch {
    /* optional */
  }
  const nodes = [...(registry.nodes || []), ...(neighborhoods.nodes || [])];
  if (nodes.length === 0) {
    throw new Error('geo near registry empty');
  }
  return nodes;
}

function main() {
  const nodes = loadAllNodes();

  const hubHtml = renderPage({ node: null, nodes, isHub: true });
  writeFileDeep(join(DIST, 'near', 'index.html'), hubHtml);

  const urlEntries = [{ loc: `${ORIGIN}/near`, priority: '0.9' }];
  for (const node of nodes) {
    const path = nodePath(node);
    const html = renderPage({ node, nodes, isHub: false });
    writeFileDeep(join(DIST, ...path.split('/').filter(Boolean), 'index.html'), html);
    urlEntries.push({ loc: absoluteUrl(path), priority: sitemapPriority(node) });
  }

  const lastmod = new Date().toISOString().slice(0, 10);
  const sitemapGeo = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;
  writeFileDeep(join(DIST, 'sitemap-geo.xml'), sitemapGeo);

  const neighCount = nodes.filter((n) => n.kind === 'neighborhood').length;
  console.log(
    `[generate-near-geo-seo] wrote ${urlEntries.length} geo URLs (${neighCount} neighborhoods) under dist/near`,
  );
}

main();
