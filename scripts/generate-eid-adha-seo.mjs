/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * يولّد dist/occasions/** — عيد الأضحى، رمضان، تحضير الجمعة.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BRAND_LOGO_ABS,
  BRAND_SITE_NAME,
  brandHeaderCss,
  brandHeaderHtml,
  brandIconLinks,
} from './lib/platformBrandIdentity.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const ORIGIN = 'https://www.halaqmap.com';
const HUB = '/occasions';
const PAGE = '/occasions/eid-adha-shaving';
const RAMADAN_PAGE = '/occasions/ramadan';
const FRIDAY_PAGE = '/occasions/friday-prep';

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

const CLUSTERS = [
  {
    title: 'توقيت الأضحية والنسك',
    phrases: [
      'حلاق بعد الأضحية',
      'حلاقة أول أيام العيد صباحاً',
      'أقرب حلاق مفتوح بعد الذبح',
      'حلاق يفتح بعد الظهر في العيد',
      'وين أحلق بعد ما أضحي',
      'حلاقة التحلل بعد الأضحية',
      'حلاق جاهز أول العيد',
      'حلاقة النسك عيد الأضحى',
    ],
  },
  {
    title: 'الهروب من الزحام وترتيب الموعد مسبقاً',
    note: 'عبارة «حجز» شائعة في البحث. دور حلاق ماب: استعلام ثم تواصل مباشر مع الصالون — المنصة ليست وسيط حجز.',
    phrases: [
      'حجز حلاق عيد الأضحى مسبقاً',
      'كيف أحجز حلاق في زحمة العيد',
      'صالون يقبل حجوزات أول أيام العيد',
      'تطبيق لحجز حلاقة العيد دون انتظار',
      'حلاقين فاتحين صباح عيد الأضحى',
      'صالون مفتوح صباح العيد بدون طابور',
    ],
  },
  {
    title: 'لهجات واحتياج مباشر',
    phrases: [
      'وين أحلق بعد الأضحية',
      'حلاق فاتح الحين بعد الذبح',
      'أبي حلاق قريب أول العيد',
      'صالون يشتغل صباح الأضحى',
      'حلاقة رجالي بعد الأضحية مستعجل',
      'أقرب حلاق بعد المنحر',
    ],
  },
];

const STEPS = [
  {
    title: 'انتهت الأضحية — ابدأ الاستعلام',
    body: 'افتح الاستعلام بفلتر «مفتوح الآن» لترى من يعلن الفتح ضمن نطاقك لحظة البحث.',
  },
  {
    title: 'اختر النطاق أو الحي',
    body: 'اربط البحث بمدينتك أو حيك عبر صفحات «أقرب حلاق» ثم ادخل للمنصة حول ذلك النطاق.',
  },
  {
    title: 'تواصل مباشرة مع الصالون',
    body: 'رتّب الموعد أو التوجه عبر اتصال/واتساب الصالون — بلا انتظار أعمى أمام أبواب مغلقة.',
  },
];

const FAQS = [
  {
    q: 'هل حلاق ماب يحجز لي موعد حلاقة عيد الأضحى؟',
    a: 'لا. المنصة أداة استعلام وعرض رقمي. بعد ظهور الشركاء المفتوحين تتواصل معهم مباشرة لترتيب الموعد أو التوجه. كثير يبحث بعبارة «حجز» — والمقصود عملياً إيجاد صالون متاح بسرعة.',
  },
  {
    q: 'ما الفرق بين صفحة عيد الأضحى ومركز نسك الحج؟',
    a: 'مركز النسك يشرح الحلق والتقصير كمفاهيم. صفحة عيد الأضحى مساعدة عملية لذروة الصباح بعد الأضحية: من المفتوح الآن، وأين أقرب نطاق، وكيف تصل للصالون دون طابور أعمى.',
  },
  {
    q: 'هل تضمنون أن الصالون مفتوح صباح العيد؟',
    a: 'لا نضمن. الحالة تعتمد على ما يعلنه الشريك المفعّل لحظة الاستعلام، وقد تتغيّر. أكّد بالتواصل قبل التوجه.',
  },
  {
    q: 'هل الصفحة تقدّم فتوى عن وقت الحلاقة بعد الأضحية؟',
    a: 'لا. أحكام النسك والتوقيت الشرعي تُرجع لمرجعه. دور المنصة تقني: مساعدتك على بدء استعلام عن حلاق قريب/مفتوح.',
  },
];

function shell({ title, description, canonical, h1, bodyInner, jsonLd, keywords, footerNote }) {
  const footer =
    footerNote ||
    '© حلاق ماب — منصة استعلام رقمية. ليست صالوناً ولا وسيط حجز ولا جهة إفتاء.';
  return `<!DOCTYPE html>
<html lang="ar-SA" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="index, follow" />
  ${keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}" />` : ''}
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
    :root { color-scheme: dark; --card:#0c1a2e; --text:#e8eef7; --muted:#94a3b8; --accent:#2dd4bf; --amber:#fbbf24; --line:rgba(45,212,191,.25); --rose:rgba(251,113,133,.35); }
    * { box-sizing: border-box; }
    body { margin:0; font-family: "Tajawal", "Segoe UI", Tahoma, Arial, sans-serif; background: linear-gradient(180deg,#120a06,#0a1f33 40%,#061223 100%); color:var(--text); line-height:1.8; }
    .wrap { max-width: 44rem; margin: 0 auto; padding: 1.5rem 1.15rem 3rem; }
    .badge { display:inline-block; color:var(--amber); font-weight:800; font-size:.9rem; margin-bottom:.5rem; }
    h1 { font-size: clamp(1.55rem, 4.2vw, 2.15rem); line-height:1.35; margin: .35rem 0 1rem; font-weight:900; }
    h2 { font-size:1.12rem; margin: 1.65rem 0 .7rem; color:var(--accent); }
    .lead { font-size:1.05rem; }
    .note { color:var(--muted); font-size:.95rem; }
    .crumbs { font-size:.9rem; color:var(--muted); margin-bottom:1rem; }
    .crumbs a { color:var(--accent); }
    .card { border:1px solid var(--line); border-radius:14px; background:var(--card); padding:1rem 1.1rem; margin: .85rem 0; }
    .warn { border-color: rgba(251,191,36,.4); background: rgba(120,53,15,.28); }
    .urgent { border-color: var(--rose); }
    .chip { display:inline-block; margin:.2rem .35rem .2rem 0; padding:.28rem .7rem; border-radius:999px; border:1px solid var(--line); color:var(--muted); font-size:.86rem; background:rgba(12,26,46,.7); }
    .cta { display:inline-block; background: linear-gradient(135deg,#0d9488,#0891b2); color:#041016; font-weight:800; padding:.9rem 1.25rem; border-radius:12px; text-decoration:none; margin:.35rem 0; }
    .cta-secondary { display:inline-block; border:1px solid var(--line); color:var(--text); font-weight:700; padding:.75rem 1.1rem; border-radius:12px; text-decoration:none; margin:.35rem .35rem .35rem 0; }
    .grid { list-style:none; padding:0; margin:1rem 0; display:grid; gap:.65rem; }
    .grid a { display:block; padding:.85rem 1rem; border:1px solid var(--line); border-radius:12px; background:var(--card); color:var(--text); text-decoration:none; font-weight:600; }
    details { border:1px solid var(--line); border-radius:12px; padding:.75rem 1rem; margin:.55rem 0; background:rgba(12,26,46,.7); }
    summary { cursor:pointer; font-weight:700; }
    .step-n { color:var(--amber); font-weight:800; margin-left:.35rem; }
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
      <p>${escapeHtml(footer)}</p>
    </footer>
  </div>
</body>
</html>`;
}

function renderHub() {
  const title = 'فزعة — مناسبات الحلاقة | حلاق ماب';
  const description =
    'فزعات من حلاق ماب للمناسبات والزحام الأسبوعي: عيد الأضحى، رمضان، وتحضير الجمعة — ثم ابدأ الاستعلام أو ارجع للرئيسية.';
  const canonical = `${ORIGIN}${HUB}`;
  return shell({
    title,
    description,
    canonical,
    h1: 'فزعة — مناسبات الحلاقة وأوقات الزحام',
    bodyInner: `
      <p class="lead">فزعات من <strong>حلاق ماب</strong> لمن يبحث عن حلاق في محيطه في أوقات الذروة — موسمية أو أسبوعية — ثم يبدأ الاستعلام داخل المنصة، مع اختصار سريع للرئيسية من أعلى الصفحة.</p>
      <ul class="grid">
        <li><a href="${FRIDAY_PAGE}">تحضير الجمعة — قبل الصلاة وليلة الخميس</a></li>
        <li><a href="${RAMADAN_PAGE}">رمضان — حلاق الليل وبعد التراويح</a></li>
        <li><a href="${PAGE}">عيد الأضحى — حلاق بعد الأضحية وحلاقة النسك</a></li>
        <li><a href="/nusuk">مركز نسك الحج — الحلق والتقصير</a></li>
        <li><a href="/need/open-now">حلاق مفتوح الآن</a></li>
        <li><a href="/need/classic-barber">حلاق تقليدي</a></li>
      </ul>
    `,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      url: canonical,
      inLanguage: 'ar-SA',
      description,
    },
  });
}

function renderEidPage() {
  const title = 'حلاق بعد الأضحية — حلاقة عيد الأضحى صباحاً | حلاق ماب';
  const description =
    'فزعة من حلاق ماب لصباح عيد الأضحى: بعد الذبح والتحلل ابحث عن أقرب حلاق مفتوح عبر استعلام لحظي وتواصل مباشر مع الصالون.';
  const canonical = `${ORIGIN}${PAGE}`;
  const keywords = [
    'حلاق بعد الأضحية',
    'حلاقة أول أيام العيد صباحاً',
    'أقرب حلاق مفتوح بعد الذبح',
    'وين أحلق بعد ما أضحي',
    'حلاقة التحلل بعد الأضحية',
    'حلاق جاهز أول العيد',
    'حجز حلاق عيد الأضحى',
    'حلاقين فاتحين صباح عيد الأضحى',
    'حلاقة النسك',
    'عيد الأضحى حلاق',
  ].join(', ');

  const clustersHtml = CLUSTERS.map((c) => {
    const chips = c.phrases.map((p) => `<span class="chip">${escapeHtml(p)}</span>`).join('');
    const note = c.note ? `<p class="note">${escapeHtml(c.note)}</p>` : '';
    return `<section class="card"><h2>${escapeHtml(c.title)}</h2>${note}<p>${chips}</p></section>`;
  }).join('\n');

  const stepsHtml = STEPS.map(
    (s, i) => `
    <article class="card">
      <h2><span class="step-n">${i + 1}.</span>${escapeHtml(s.title)}</h2>
      <p>${escapeHtml(s.body)}</p>
    </article>`,
  ).join('\n');

  const faqHtml = FAQS.map(
    (f) => `
    <details>
      <summary>${escapeHtml(f.q)}</summary>
      <p>${escapeHtml(f.a)}</p>
    </details>`,
  ).join('\n');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${canonical}#page`,
        name: title,
        url: canonical,
        inLanguage: 'ar-SA',
        description,
        about: [
          'عيد الأضحى',
          'حلاقة بعد الأضحية',
          'حلاقة النسك',
          'حلاق مفتوح صباح العيد',
        ],
        isPartOf: { '@type': 'WebApplication', name: 'حلاق ماب', url: `${ORIGIN}/` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'حلاق ماب', item: `${ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: 'مناسبات', item: `${ORIGIN}${HUB}` },
          { '@type': 'ListItem', position: 3, name: 'عيد الأضحى', item: canonical },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  return shell({
    title,
    description,
    canonical,
    keywords,
    h1: 'بعد الأضحية… وين أحلق الآن؟',
    jsonLd,
    bodyInner: `
      <nav class="crumbs">
        <a href="${ORIGIN}/">الرئيسية</a> /
        <a href="${HUB}">مناسبات</a> /
        <span>عيد الأضحى</span>
      </nav>
      <p class="badge">فزعة من حلاق ماب · حلاقة النسك</p>
      <p class="lead">زحام عيد الأضحى <strong>نهاري وملح ومقترن بعبادة وتوقيت دقيق</strong>: ذبح، سلخ، أضحية، ثم حاجة فورية لإزالة الشعر أو التقصير للتحلل. هذه فزعة من <strong>حلاق ماب</strong> لتسهيل بدء الاستعلام بفلتر «مفتوح الآن» وأقرب نطاق — والمنصة ليست صالوناً ولا وسيط حجز ولا جهة فتوى.</p>

      <section class="card warn">
        <h2>لماذا الأضحى مختلف عن ليلة الفطر؟</h2>
        <p>بينما ليلة عيد الفطر ليلية واستعراضية، فإن ضغط الأضحى سباق مع الزمن صباحاً: من يخرج من المصلّى أو من المنحر يبحث فوراً عن حلاق جاهز — لا عن واجهة احتفالية.</p>
      </section>

      <section class="card urgent">
        <h2>من الأضحية إلى الحل — بنقرة</h2>
        <p>انتهت العبادة؟ لا تدخل زحاماً أعمى. ابدأ استعلام «مفتوح الآن» حول موقعك أو حيك، ثم تواصل مباشرة مع الصالون لإنهاء حلاقة النسك أو التقصير دون طابور عشوائي.</p>
        <p><a class="cta" href="${ORIGIN}/#/?need=open-now">ابدأ الاستعلام — مفتوح الآن صباح العيد</a></p>
        <p>
          <a class="cta-secondary" href="/nusuk">مركز نسك الحج — الحلق والتقصير</a>
          <a class="cta-secondary" href="/near">أقرب حلاق حسب المدينة</a>
          <a class="cta-secondary" href="/need/open-now">صفحة «مفتوح الآن»</a>
        </p>
      </section>

      <section>
        <h2>كيف تنجو من زحمة صباح العيد؟</h2>
        ${stepsHtml}
      </section>

      <section>
        <h2>عبارات شائعة يبحث بها الناس صباح العيد</h2>
        <p class="note">صيغ بحث معتادة لدى المواطن والمقيم والحاج — مع توضيح دور المنصة كأداة استعلام مساعدة.</p>
        ${clustersHtml}
      </section>

      <section>
        <h2>أسئلة شائعة</h2>
        ${faqHtml}
      </section>

      <p class="note"><a href="${HUB}">كل المناسبات</a> · <a href="/nusuk">النسك</a> · <a href="/need">الفلاتر</a> · <a href="${ORIGIN}/">الرئيسية</a></p>
    `,
  });
}

function renderOccasionPage({
  path,
  title,
  description,
  keywords,
  h1,
  badge,
  leadHtml,
  sectionsHtml,
  about,
  crumbLabel,
  faqs,
  footerNote,
}) {
  const canonical = `${ORIGIN}${path}`;
  const faqHtml = faqs
    .map(
      (f) => `
    <details>
      <summary>${escapeHtml(f.q)}</summary>
      <p>${escapeHtml(f.a)}</p>
    </details>`,
    )
    .join('\n');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${canonical}#page`,
        name: title,
        url: canonical,
        inLanguage: 'ar-SA',
        description,
        about,
        isPartOf: { '@type': 'WebApplication', name: 'حلاق ماب', url: `${ORIGIN}/` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'حلاق ماب', item: `${ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: 'مناسبات', item: `${ORIGIN}${HUB}` },
          { '@type': 'ListItem', position: 3, name: crumbLabel, item: canonical },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };
  return shell({
    title,
    description,
    canonical,
    keywords: keywords.join(', '),
    h1,
    jsonLd,
    footerNote,
    bodyInner: `
      <nav class="crumbs">
        <a href="${ORIGIN}/">الرئيسية</a> /
        <a href="${HUB}">مناسبات</a> /
        <span>${escapeHtml(crumbLabel)}</span>
      </nav>
      <p class="badge">${escapeHtml(badge)}</p>
      ${leadHtml}
      ${sectionsHtml}
      <section>
        <h2>أسئلة شائعة</h2>
        ${faqHtml}
      </section>
      <p class="note"><a href="${HUB}">كل المناسبات</a> · <a href="/need">حسب الحاجة</a> · <a href="/near">حسب المدينة</a> · <a href="${ORIGIN}/">الرئيسية</a></p>
    `,
  });
}

function renderRamadanPage() {
  const phrases = [
    'حلاق رمضان',
    'حلاق يفتح رمضان الليل',
    'حلاق مفتوح رمضان',
    'حلاق بعد التراويح',
    'حلاق ليل رمضان',
    'حلاق يفتح وقت السحور',
    'حلاق رمضان متأخر',
    'صالون مفتوح رمضان',
    'حلاق مفتوح الليل رمضان',
    'حلاق وقت الإجازة الرمضانية',
  ];
  const chips = phrases.map((p) => `<span class="chip">${escapeHtml(p)}</span>`).join('');
  const faqs = [
    {
      q: 'هل يوجد فلتر اسمه رمضان في حلاق ماب؟',
      a: 'لا. رمضان يغيّر أوقات الذروة (مساء، بعد التراويح، قرب السحور). أقرب أداة لحظية هي فلتر «مفتوح الآن» أو «24 ساعة» ثم التأكيد مع الصالون.',
    },
    {
      q: 'هل تضمنون فتح الصالون بعد التراويح؟',
      a: 'لا نضمن. الحالة تعتمد على ما يعلنه الشريك لحظة الاستعلام وقد تتغيّر. أكّد بالتواصل قبل التوجه.',
    },
    {
      q: 'هل الصفحة تقدّم أحكاماً شرعية عن الحلاقة في رمضان؟',
      a: 'لا. دور المنصة تقني: مساعدتك على بدء استعلام عن حلاق قريب/مفتوح — وليست جهة إفتاء.',
    },
  ];
  return renderOccasionPage({
    path: RAMADAN_PAGE,
    title: 'حلاق رمضان — الليل وبعد التراويح | حلاق ماب',
    description:
      'فزعة من حلاق ماب لرمضان: حلاق يفتح الليل، بعد التراويح، وقت السحور — ابدأ بـ«مفتوح الآن» حول موقعك ثم تواصل مباشرة مع الصالون.',
    keywords: phrases,
    h1: 'رمضان… حلاق فاتح الليل؟',
    badge: 'فزعة من حلاق ماب · موسم رمضان',
    crumbLabel: 'رمضان',
    about: ['رمضان', 'حلاق بعد التراويح', 'حلاق ليل رمضان', 'حلاق وقت السحور'],
    footerNote:
      '© حلاق ماب — منصة استعلام رقمية. ليست صالوناً ولا وسيط حجز ولا جهة إفتاء في أحكام الصيام.',
    faqs,
    leadHtml: `
      <p class="lead">في رمضان تتأخّر ذروة الحلاقة إلى <strong>المساء وبعد التراويح وقرب السحور</strong> — بعكس الصباح المعتاد. هذه فزعة من <strong>حلاق ماب</strong> لتسهيل بدء الاستعلام حين تحتاج حلاقاً مفتوحاً في ذلك التوقيت. المنصة ليست صالوناً ولا تضمن جدولاً رمضانياً ثابتاً.</p>
    `,
    sectionsHtml: `
      <section class="card warn">
        <h2>لماذا «مفتوح الآن» أهم من فلتر رمضان؟</h2>
        <p>لا يوجد فلتر تقويم رمضاني داخل المنصة. ما يتغيّر هو سلوك الفتح لدى الصالونات. لذلك نوجّهك لفلتر «مفتوح الآن» لحظة بحثك (ليلاً أو بعد التراويح)، أو «24 ساعة» إن أعلن الشريك ذلك — ثم تسأل عن الدوام الرمضاني مباشرة.</p>
      </section>
      <section class="card urgent">
        <h2>ابدأ الاستعلام الآن</h2>
        <p>امنح إذن الموقع إن أمكن، فعّل «مفتوح الآن»، وتواصل مع الصالون قبل التوجه — خصوصاً قرب السحور أو بعد التراويح.</p>
        <p><a class="cta" href="${ORIGIN}/#/?need=open-now">ابدأ الاستعلام — مفتوح الآن في رمضان</a></p>
        <p>
          <a class="cta-secondary" href="/need/24h">حلاق 24 ساعة</a>
          <a class="cta-secondary" href="/need/near-me">من موقعي</a>
          <a class="cta-secondary" href="${FRIDAY_PAGE}">تحضير الجمعة</a>
          <a class="cta-secondary" href="${PAGE}">عيد الأضحى</a>
        </p>
      </section>
      <section class="card">
        <h2>عبارات شائعة في بحث رمضان</h2>
        <p>${chips}</p>
      </section>
    `,
  });
}

function renderFridayPage() {
  const phrases = [
    'حلاق جمعة',
    'حلاق قبل صلاة الجمعة',
    'حلاق الخميس الليل',
    'حلاق ليلة الجمعة',
    'حلاق عصر الجمعة',
    'حلاق قبل العيد',
    'حلاق الأربعاء الليل',
    'حلاق يفتح الخميس',
    'صالون مفتوح ليلة الجمعة',
    'حلاق قبل صلاة العصر',
  ];
  const chips = phrases.map((p) => `<span class="chip">${escapeHtml(p)}</span>`).join('');
  const faqs = [
    {
      q: 'هل صفحة الجمعة موسمية مثل رمضان؟',
      a: 'لا. تحضير الجمعة نية أسبوعية متكررة وأعلى زحمة معتادة في الأسبوع؛ لذلك الصفحة دائمة ضمن المناسبات/أوقات الذروة.',
    },
    {
      q: 'ما أفضل وقت للاستعلام قبل الجمعة؟',
      a: 'كثير يبحث ليلة الخميس أو صباح الجمعة قبل الصلاة. استخدم «مفتوح الآن» لحظة حاجتك، أو رتّب مع الصالون مسبقاً عبر التواصل المباشر — المنصة ليست وسيط حجز.',
    },
    {
      q: 'هل تضمنون مقعداً قبل صلاة الجمعة؟',
      a: 'لا. النتائج حسب بيانات الشركاء المفعّلين لحظة الاستعلام. أكّد الموعد أو التوجه مع الصالون مباشرة.',
    },
  ];
  return renderOccasionPage({
    path: FRIDAY_PAGE,
    title: 'حلاق قبل الجمعة — ليلة الخميس وعصر الجمعة | حلاق ماب',
    description:
      'فزعة دائمة من حلاق ماب لزحمة الجمعة: قبل الصلاة، ليلة الخميس، عصر الجمعة — ابدأ الاستعلام بـ«مفتوح الآن» ثم تواصل مباشرة مع الصالون.',
    keywords: phrases,
    h1: 'قبل الجمعة… وين أحلق بدون زحمة؟',
    badge: 'فزعة دائمة من حلاق ماب · ذروة الأسبوع',
    crumbLabel: 'تحضير الجمعة',
    about: ['حلاق جمعة', 'قبل صلاة الجمعة', 'حلاق ليلة الجمعة', 'حلاق الخميس الليل'],
    footerNote: '© حلاق ماب — منصة استعلام رقمية. ليست صالوناً ولا وسيط حجز.',
    faqs,
    leadHtml: `
      <p class="lead">الجمعة أعلى زحمة حلاقة أسبوعية: <strong>ليلة الخميس، صباح الجمعة، وقبل الصلاة</strong>. هذه فزعة دائمة من <strong>حلاق ماب</strong> — ليست موسمية — لتسهيل بدء الاستعلام حول موقعك ثم ترتيب التوجه مع الصالون مباشرة.</p>
    `,
    sectionsHtml: `
      <section class="card warn">
        <h2>نية أسبوعية لا موسمية</h2>
        <p>بخلاف رمضان أو العيد، يتكرر ضغط الجمعة كل أسبوع. لا يوجد فلتر باسم «جمعة»؛ الأداة العملية هي «مفتوح الآن» وقت بحثك، مع تواصل مباشر لتفادي الطابور الأعمى.</p>
      </section>
      <section class="card urgent">
        <h2>ابدأ قبل الزحمة</h2>
        <p>ليلة الخميس أو باكراً يوم الجمعة: افتح الاستعلام، اختر نطاقاً قريباً، واتصل بالصالون قبل التوجه.</p>
        <p><a class="cta" href="${ORIGIN}/#/?need=open-now">ابدأ الاستعلام — مفتوح الآن قبل الجمعة</a></p>
        <p>
          <a class="cta-secondary" href="/need/classic-barber">حلاق تقليدي</a>
          <a class="cta-secondary" href="/need/near-me">من موقعي</a>
          <a class="cta-secondary" href="${RAMADAN_PAGE}">رمضان</a>
          <a class="cta-secondary" href="/near">حسب المدينة</a>
        </p>
      </section>
      <section class="card">
        <h2>عبارات شائعة حول الجمعة</h2>
        <p>${chips}</p>
        <p class="note">عبارة «حلاق قبل العيد» تظهر أحياناً مع زحام ما قبل المناسبات؛ لعيد الأضحى خصيصاً استخدم صفحة الأضحى.</p>
      </section>
    `,
  });
}

function main() {
  writeFileDeep(join(DIST, 'occasions', 'index.html'), renderHub());
  writeFileDeep(join(DIST, 'occasions', 'eid-adha-shaving', 'index.html'), renderEidPage());
  writeFileDeep(join(DIST, 'occasions', 'ramadan', 'index.html'), renderRamadanPage());
  writeFileDeep(join(DIST, 'occasions', 'friday-prep', 'index.html'), renderFridayPage());
  console.log(
    `[generate-eid-adha-seo] wrote ${ORIGIN}${HUB}, ${PAGE}, ${RAMADAN_PAGE}, ${FRIDAY_PAGE}`,
  );
}

main();
