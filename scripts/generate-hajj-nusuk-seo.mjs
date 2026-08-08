/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * يولّد dist/nusuk/index.html — مركز نسك الحج (SEO ثابت).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const ORIGIN = 'https://www.halaqmap.com';
const PATH = '/nusuk';
const PAGE_URL = `${ORIGIN}${PATH}`;

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const META = {
  title: 'نسك الحج — الحلق والتقصير | حلاق ماب',
  description:
    'مركز نسك الحج من حلاق ماب: افهم الحلق والتقصير، ثم ابدأ استعلام أقرب حلاق شريك في مكة أو المدينة — منصة استعلام وليست صالوناً ولا جهة إفتاء.',
};

const TERMS = [
  {
    term: 'النُّسُك',
    body: 'العمل العبادي المرتبط بالتحلل في الحج أو العمرة. ومنه ما يتعلق بشعر الرأس: الحلق أو التقصير — وفق ما يعتمده الحاج مع مرجعه الشرعي.',
  },
  {
    term: 'الحلق',
    body: 'إزالة شعر الرأس بالكامل (حلق الرأس). كثير من الباحثين يكتبون: حلق، حلاقة الحاج، حلق الرأس بعد الحج.',
  },
  {
    term: 'التقصير',
    body: 'أخذ جزء من شعر الرأس دون حلقه كاملاً. يبحث عنه الحاج بكلمات مثل: تقصير، تقصير الشعر، تقصير بعد العمرة.',
  },
];

const CTAS = [
  {
    label: 'ابدأ الاستعلام — مكة المكرمة',
    blurb: 'لنطاق مكة وما حول الحرم ضمن البيانات المتاحة.',
    href: `${ORIGIN}/#/?near=makkah`,
    near: '/near/makkah',
  },
  {
    label: 'ابدأ الاستعلام — المدينة المنورة',
    blurb: 'لنطاق المدينة وما حولها ضمن البيانات المتاحة.',
    href: `${ORIGIN}/#/?near=madinah`,
    near: '/near/madinah',
  },
];

const GEO = [
  { href: '/near/makkah', label: 'أقرب حلاق في مكة' },
  { href: '/near/makkah/aziziyah', label: 'أقرب حلاق في العزيزية (مكة)' },
  { href: '/near/madinah', label: 'أقرب حلاق في المدينة' },
  { href: '/near/madinah/quba', label: 'أقرب حلاق في قباء' },
  { href: '/near', label: 'كل مدن وأحياء التغطية' },
];

const LANGS = [
  {
    lang: 'الإنجليزية',
    line: 'Hajj / Umrah haircut · Halq (full shave) · Taqsir (shortening) · nearest barber Makkah / Madinah',
  },
  { lang: 'الأوردو', line: 'حج حلق · تقصیر · مکّہ / مدینہ قریب حجام' },
  {
    lang: 'الإندونيسية / الملايوية',
    line: 'Cukur haji · Halq · Taqsir · tukang cukur terdekat Mekah / Madinah',
  },
  { lang: 'التركية', line: 'Hac tıraşı · Halq · Takṣīr · Mekke / Medine berber' },
];

const FAQS = [
  {
    q: 'ما الفرق بين الحلق والتقصير؟',
    a: 'الحلق إزالة شعر الرأس بالكامل، والتقصير أخذ جزء منه. اختيار أحدهما نسكٌ عبادي يُرجع فيه الحاج إلى ما يعتمده شرعاً — والمنصة لا تُفتي في ذلك.',
  },
  {
    q: 'هل حلاق ماب صالون للحجاج في مكة؟',
    a: 'لا. حلاق ماب منصة برمجية للاستعلام والعرض الرقمي. الصالونات الظاهرة — إن وُجدت — شركاء مفعّلون داخل المنصة، والتنسيق معهم مباشرة.',
  },
  {
    q: 'كيف أبدأ البحث عن حلاق للحلق أو التقصير؟',
    a: 'اختر مكة أو المدينة أدناه لبدء الاستعلام داخل التطبيق حول ذلك النطاق، أو افتح صفحات «أقرب حلاق» حسب الحي ثم اضغط ابدأ الاستعلام.',
  },
  {
    q: 'هل الصفحة تغطي لغات الحجاج المختلفة؟',
    a: 'المركز عربي أولاً لأن أغلب استعلامات المنطقة كذلك. أضفنا إشارات بكلمات شائعة بلغات أخرى (Halq، Taqsir، cukur haji…) لنفس مسار الاستعلام — وصفحات لغات كاملة قد تُضاف لاحقاً دون إضعاف جودة المحتوى.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
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
      '@type': 'WebPage',
      '@id': `${PAGE_URL}#page`,
      name: META.title,
      url: PAGE_URL,
      inLanguage: 'ar-SA',
      description: META.description,
      isPartOf: { '@id': `${ORIGIN}/#webapp` },
      about: ['نسك الحج', 'الحلق', 'التقصير', 'Halq', 'Taqsir'],
      mainEntity: { '@id': `${ORIGIN}/#webapp` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'حلاق ماب', item: `${ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: 'نسك الحج', item: PAGE_URL },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': `${PAGE_URL}#faq`,
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};

const termsHtml = TERMS.map(
  (t) => `
  <article class="card">
    <h2>${escapeHtml(t.term)}</h2>
    <p>${escapeHtml(t.body)}</p>
  </article>`,
).join('\n');

const ctasHtml = CTAS.map(
  (c) => `
  <div class="cta-card">
    <a class="cta" href="${escapeHtml(c.href)}">${escapeHtml(c.label)}</a>
    <p class="note">${escapeHtml(c.blurb)}</p>
    <p class="note"><a href="${escapeHtml(c.near)}">صفحة أقرب حلاق المحلية</a></p>
  </div>`,
).join('\n');

const geoHtml = GEO.map(
  (g) => `<li><a href="${escapeHtml(g.href)}">${escapeHtml(g.label)}</a></li>`,
).join('\n');

const langsHtml = LANGS.map(
  (l) => `
  <li>
    <strong>${escapeHtml(l.lang)}</strong>
    <span dir="auto">${escapeHtml(l.line)}</span>
  </li>`,
).join('\n');

const faqHtml = FAQS.map(
  (f) => `
  <details>
    <summary>${escapeHtml(f.q)}</summary>
    <p>${escapeHtml(f.a)}</p>
  </details>`,
).join('\n');

const html = `<!DOCTYPE html>
<html lang="ar-SA" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(META.title)}</title>
  <meta name="description" content="${escapeHtml(META.description)}" />
  <meta name="robots" content="index, follow" />
  <meta name="keywords" content="نسك الحج, الحلق, التقصير, حلاقة الحاج, حلق الرأس, Halq, Taqsir, Hajj haircut, أقرب حلاق مكة, أقرب حلاق المدينة" />
  <link rel="canonical" href="${PAGE_URL}" />
  <meta property="og:title" content="${escapeHtml(META.title)}" />
  <meta property="og:description" content="${escapeHtml(META.description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${PAGE_URL}" />
  <meta property="og:image" content="${ORIGIN}/images/halaqmap_logo_refined.png" />
  <meta property="og:locale" content="ar_SA" />
  <meta property="og:site_name" content="حلاق ماب" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(META.title)}" />
  <meta name="twitter:description" content="${escapeHtml(META.description)}" />
  <link rel="icon" href="/icons/icon-192.png" type="image/png" sizes="192x192" />
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>
    :root { color-scheme: dark; --bg:#061223; --card:#0c1a2e; --text:#e8eef7; --muted:#94a3b8; --accent:#2dd4bf; --amber:#fbbf24; --line:rgba(45,212,191,.25); }
    * { box-sizing: border-box; }
    body { margin:0; font-family: "Segoe UI", Tahoma, Arial, sans-serif; background: linear-gradient(180deg,#061223,#0a1f33 50%,#120a06 100%); color:var(--text); line-height:1.8; }
    .wrap { max-width: 44rem; margin: 0 auto; padding: 1.5rem 1.15rem 3rem; }
    header { display:flex; align-items:center; gap:.75rem; margin-bottom:1.25rem; }
    header img { width:48px; height:48px; border-radius:12px; }
    header a { color:var(--accent); text-decoration:none; font-weight:800; font-size:1.15rem; }
    .badge { display:inline-block; color:var(--amber); font-weight:800; font-size:.9rem; margin-bottom:.5rem; }
    h1 { font-size: clamp(1.6rem, 4.2vw, 2.2rem); line-height:1.35; margin: .35rem 0 1rem; }
    h2 { font-size:1.12rem; margin: 0 0 .55rem; color:var(--accent); }
    .lead { font-size:1.05rem; }
    .note { color:var(--muted); font-size:.95rem; }
    .crumbs { font-size:.9rem; color:var(--muted); margin-bottom:1rem; }
    .crumbs a { color:var(--accent); }
    .card, .cta-card { border:1px solid var(--line); border-radius:14px; background:var(--card); padding:1rem 1.1rem; margin: .85rem 0; }
    .grid { list-style:none; padding:0; margin:1rem 0; display:grid; gap:.65rem; }
    .grid a { display:block; padding:.85rem 1rem; border:1px solid var(--line); border-radius:12px; background:var(--card); color:var(--text); text-decoration:none; font-weight:600; }
    .grid a:hover { border-color: var(--accent); }
    .cta { display:inline-block; background: linear-gradient(135deg,#0d9488,#0891b2); color:#041016; font-weight:800; padding:.85rem 1.25rem; border-radius:12px; text-decoration:none; }
    .cta-card .cta { width:100%; text-align:center; }
    details { border:1px solid var(--line); border-radius:12px; padding:.75rem 1rem; margin:.55rem 0; background:rgba(12,26,46,.7); }
    summary { cursor:pointer; font-weight:700; }
    .langs li { margin:.65rem 0; padding:.75rem 1rem; border:1px solid var(--line); border-radius:12px; background:rgba(12,26,46,.55); list-style:none; }
    .langs strong { display:block; color:var(--amber); margin-bottom:.25rem; }
    footer { margin-top:2.5rem; padding-top:1rem; border-top:1px solid var(--line); color:var(--muted); font-size:.85rem; }
    .warn { border-color: rgba(251,191,36,.35); background: rgba(120,53,15,.25); }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <a href="${ORIGIN}/"><img src="/images/halaqmap_logo_refined.png" width="48" height="48" alt="حلاق ماب" /></a>
      <a href="${ORIGIN}/">حلاق ماب</a>
    </header>
    <main>
      <nav class="crumbs" aria-label="مسار التنقل">
        <a href="${ORIGIN}/">الرئيسية</a>
        <span aria-hidden="true"> / </span>
        <span>نسك الحج</span>
      </nav>
      <p class="badge">مركز نسك الحج</p>
      <h1>النُّسُك: الحلق والتقصير</h1>
      <p class="lead">بعد أداء المناسك يحتاج كثير من الحجاج إلى حلق شعر الرأس أو تقصيره. <strong>حلاق ماب</strong> منصة استعلام رقمية تساعدك على بدء البحث عن حلاق قريب ضمن الشركاء المفعّلين — دون أن تكون صالوناً أو وسيط حجز أو جهة فتوى.</p>

      <section>
        <h2>مصطلحات النسك</h2>
        ${termsHtml}
      </section>

      <section class="card warn">
        <h2>دور المنصة</h2>
        <p>حلاق ماب لا تقدّم خدمة الحلاقة بنفسها، ولا تُفتي في أحكام النسك، ولا تضمن توفر صالون في كل لحظة. دورها برمجي: استعلام وعرض رقمي لشركاء مفعّلين داخل المنصة، والعلاقة في تنفيذ الخدمة مباشرة بينك وبين الصالون.</p>
      </section>

      <section>
        <h2>ابدأ الاستعلام الآن</h2>
        ${ctasHtml}
      </section>

      <section>
        <h2>صفحات أقرب حلاق — مكة والمدينة</h2>
        <ul class="grid">${geoHtml}</ul>
      </section>

      <section>
        <h2>كلمات يبحث بها الحجاج بلغات أخرى</h2>
        <p class="note">نفس المسار: اختر مكة أو المدينة أعلاه. هذه إشارات لغوية مساعدة — وليست إفتاءً ولا دليلاً سياحياً.</p>
        <ul class="langs">${langsHtml}</ul>
      </section>

      <section>
        <h2>أسئلة شائعة</h2>
        ${faqHtml}
      </section>

      <p class="note"><a href="/near">أقرب حلاق حسب المدينة والحي</a> · <a href="/need">ابحث حسب حاجتك</a> · <a href="${ORIGIN}/">الصفحة الرئيسية</a></p>
    </main>
    <footer>
      <p>© حلاق ماب — منصة برمجية للاستعلام الرقمي. ليست صالوناً وليست جهة إفتاء في أحكام النسك.</p>
    </footer>
  </div>
</body>
</html>
`;

mkdirSync(join(DIST, 'nusuk'), { recursive: true });
writeFileSync(join(DIST, 'nusuk', 'index.html'), html, 'utf8');
console.log(`[generate-hajj-nusuk-seo] wrote ${PAGE_URL}`);
