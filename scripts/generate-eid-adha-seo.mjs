/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * يولّد dist/occasions/index.html و dist/occasions/eid-adha-shaving/index.html
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const ORIGIN = 'https://www.halaqmap.com';
const HUB = '/occasions';
const PAGE = '/occasions/eid-adha-shaving';

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

function shell({ title, description, canonical, h1, bodyInner, jsonLd, keywords }) {
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
  <meta property="og:image" content="${ORIGIN}/images/halaqmap_logo_refined.png" />
  <meta property="og:locale" content="ar_SA" />
  <meta property="og:site_name" content="حلاق ماب" />
  <link rel="icon" href="/icons/icon-192.png" type="image/png" sizes="192x192" />
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>
    :root { color-scheme: dark; --card:#0c1a2e; --text:#e8eef7; --muted:#94a3b8; --accent:#2dd4bf; --amber:#fbbf24; --line:rgba(45,212,191,.25); --rose:rgba(251,113,133,.35); }
    * { box-sizing: border-box; }
    body { margin:0; font-family: "Segoe UI", Tahoma, Arial, sans-serif; background: linear-gradient(180deg,#120a06,#0a1f33 40%,#061223 100%); color:var(--text); line-height:1.8; }
    .wrap { max-width: 44rem; margin: 0 auto; padding: 1.5rem 1.15rem 3rem; }
    header { display:flex; align-items:center; gap:.75rem; margin-bottom:1.25rem; }
    header img { width:48px; height:48px; border-radius:12px; }
    header a { color:var(--accent); text-decoration:none; font-weight:800; font-size:1.15rem; }
    .badge { display:inline-block; color:var(--amber); font-weight:800; font-size:.9rem; margin-bottom:.5rem; }
    h1 { font-size: clamp(1.55rem, 4.2vw, 2.15rem); line-height:1.35; margin: .35rem 0 1rem; }
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
    <header>
      <a href="${ORIGIN}/"><img src="/images/halaqmap_logo_refined.png" width="48" height="48" alt="حلاق ماب" /></a>
      <a href="${ORIGIN}/">حلاق ماب</a>
    </header>
    <main>
      <h1>${escapeHtml(h1)}</h1>
      ${bodyInner}
    </main>
    <footer>
      <p>© حلاق ماب — منصة استعلام رقمية. ليست صالوناً ولا وسيط حجز ولا جهة إفتاء في أحكام النسك أو الأضحية.</p>
    </footer>
  </div>
</body>
</html>`;
}

function renderHub() {
  const title = 'مناسبات الحلاقة | حلاق ماب';
  const description =
    'صفحات مساعدة من حلاق ماب للمناسبات — عيد الأضحى وحلاقة النسك بعد الأضحية، والمزيد لاحقاً.';
  const canonical = `${ORIGIN}${HUB}`;
  return shell({
    title,
    description,
    canonical,
    h1: 'مناسبات الحلاقة',
    bodyInner: `
      <p class="lead">صفحات مساعدة من <strong>حلاق ماب</strong> لمن يبحث عن حلاق في محيطه أو بما يوافق رغبته في أوقات الزحام — ثم يبدأ الاستعلام داخل المنصة.</p>
      <ul class="grid">
        <li><a href="${PAGE}">عيد الأضحى — حلاق بعد الأضحية وحلاقة النسك</a></li>
        <li><a href="/nusuk">مركز نسك الحج — الحلق والتقصير</a></li>
        <li><a href="/need/open-now">حلاق مفتوح الآن</a></li>
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
    'صفحة مساعدة من حلاق ماب لصباح عيد الأضحى: بعد الذبح والتحلل ابحث عن أقرب حلاق مفتوح عبر استعلام لحظي وتواصل مباشر مع الصالون.';
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
      <p class="badge">صفحة مساعدة من حلاق ماب · حلاقة النسك</p>
      <p class="lead">زحام عيد الأضحى <strong>نهاري وملح ومقترن بعبادة وتوقيت دقيق</strong>: ذبح، سلخ، أضحية، ثم حاجة فورية لإزالة الشعر أو التقصير للتحلل. هذه صفحة مساعدة من <strong>حلاق ماب</strong> لتسهيل بدء الاستعلام بفلتر «مفتوح الآن» وأقرب نطاق — والمنصة ليست صالوناً ولا وسيط حجز ولا جهة فتوى.</p>

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

function main() {
  writeFileDeep(join(DIST, 'occasions', 'index.html'), renderHub());
  writeFileDeep(join(DIST, 'occasions', 'eid-adha-shaving', 'index.html'), renderEidPage());
  console.log(`[generate-eid-adha-seo] wrote ${ORIGIN}${HUB} and ${ORIGIN}${PAGE}`);
}

main();
