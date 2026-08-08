/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * يولّد dist/need/index.html + dist/need/{slug}/index.html — صفحات مساعدة حسب الحاجة.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const ORIGIN = 'https://www.halaqmap.com';
const HUB = '/need';

/** يطابق src/config/filterIntentLandingRegistry.ts */
const PAGES = [
  {
    slug: 'home-visit',
    h1: 'حلاق منزلي يجني البيت',
    title: 'حلاق منزلي يجني البيت | حلاق ماب',
    description:
      'ابحث عن حلاق يقدم زيارة منزلية عبر حلاق ماب — استعلام لحظي عن شركاء يعلنون خدمة منزلية ضمن نطاقك.',
    aliases: ['حلاق يجني البيت', 'حلاق منزلي', 'زيارة منزلية'],
    lead: 'تريد حلاقاً يأتي إليك في المنزل؟',
    body: 'هذه صفحة مساعدة من حلاق ماب لنية «الزيارة المنزلية». حلاق ماب منصة استعلام: عند بدء الاستعلام تُفلتر النتائج على الشركاء الذين يعلنون خدمة منزلية ضمن البيانات المتاحة — وليست المنصة صالوناً ولا وسيط حجز.',
    filterNote: 'يُطبَّق فلتر: زيارة منزلية.',
  },
  {
    slug: 'patient-care',
    h1: 'حلاقة لمريض وكبار السن',
    title: 'حلاقة لمريض وكبار السن | حلاق ماب',
    description:
      'استعلام عن حلاق يعلن تسهيلات لكبار السن أو ذوي الاحتياجات أو ظروف المريض — عبر فلتر المنصة المناسب.',
    aliases: ['حلاقة لمريض', 'حلاق كبار سن', 'ذوي الاحتياجات'],
    lead: 'تحتاج حلاقة بمراعاة ظرف المريض أو كبار السن؟',
    body: 'البحث بكلمات مثل «حلاقة لمريض» أو «كبار سن» يُوجَّه هنا. المنصة تُظهر شركاء يعلنون تسهيلات «احتياجات خاصة» ضمن بياناتهم — والتنسيق يبقى بينك وبين الصالون. حلاق ماب ليست جهة رعاية صحية.',
    filterNote: 'يُطبَّق فلتر: احتياجات خاصة / كبار السن.',
  },
  {
    slug: 'elderly-care',
    h1: 'حلاق لكبار السن وذوي الاحتياجات',
    title: 'حلاق كبار سن وذوي الاحتياجات | حلاق ماب',
    description:
      'ابدأ استعلام حلاق يعلن تسهيلات لكبار السن وذوي الاحتياجات عبر حلاق ماب ضمن نطاق موقعك.',
    aliases: ['حلاق كبار سن', 'كبار السن'],
    lead: 'تسهيلات معلَنة لكبار السن وذوي الاحتياجات.',
    body: 'صفحة مخصّصة لنية كبار السن والاحتياجات الخاصة. النتائج تعتمد على ما يعلنه الشريك المفعّل داخل المنصة لحظة الاستعلام.',
    filterNote: 'يُطبَّق فلتر: احتياجات خاصة / كبار السن.',
  },
  {
    slug: '24h',
    h1: 'حلاق 24 ساعة',
    title: 'حلاق 24 ساعة | حلاق ماب',
    description:
      'ابحث عن حلاق يعلن حلاقة على مدار 24 ساعة عبر استعلام حلاق ماب — فلترة حسب بيانات الشركاء المتاحة.',
    aliases: ['حلاقة 24 ساعة', 'على مدار الساعة'],
    lead: 'تحتاج حلاقة في أي ساعة؟',
    body: 'فلتر «24 ساعة» يعرض الشركاء الذين يعلنون الخدمة أو جدولاً يغطي اليوم كاملاً ضمن بيانات المنصة. التوفر الفعلي يُؤكَّد بالتواصل المباشر مع الصالون.',
    filterNote: 'يُطبَّق فلتر: حلاقة 24 ساعة.',
  },
  {
    slug: 'open-now',
    h1: 'حلاق مفتوح الآن',
    title: 'حلاق مفتوح الآن قريباً منك | حلاق ماب',
    description: 'استعلام عن حلاق مفتوح الآن ضمن نطاقك عبر منصة حلاق ماب.',
    aliases: ['حلاق مفتوح الان', 'مفتوح الآن'],
    lead: 'من المفتوح الآن قربك؟',
    body: 'نية «مفتوح الآن» تفعّل فلتر الفتح اللحظي داخل الاستعلام. الحالة تعتمد على ما يسجّله الشريك وقد تتغيّر.',
    filterNote: 'يُطبَّق فلتر: مفتوح الآن.',
  },
  {
    slug: 'suitable',
    h1: 'حلاق مناسب لحاجتك',
    title: 'حلاق مناسب | حلاق ماب',
    description: 'ابدأ استعلاماً لإيجاد حلاق مناسب عبر فلاتر حلاق ماب.',
    aliases: ['حلاق مناسب', 'الحلاق الأنسب'],
    lead: '«مناسب» يبدأ من القريب المفتوح — ثم تخصّص.',
    body: 'لا يوجد زر واحد اسمه «مناسب للجميع». الأنسب يُبنى من موقعك + فلترك. هذه الصفحة تفتح الاستعلام بفلتر «مفتوح الآن» كنقطة انطلاق.',
    filterNote: 'نقطة الانطلاق: مفتوح الآن.',
  },
  {
    slug: 'clean',
    h1: 'حلاق نظيف بتقييم موثوق',
    title: 'حلاق نظيف | حلاق ماب',
    description: 'البحث عن حلاق نظيف عبر إشارات الجودة — أعلى التقييمات في حلاق ماب.',
    aliases: ['حلاق نظيف', 'صالون نظيف'],
    lead: 'النظافة قرارك الميداني — التقييم بداية فلترة.',
    body: 'المنصة لا تفحص النظافة ميدانياً. أقرب إشارة رقمية هي التقييمات؛ لذلك نوجّه هذه النية إلى فلتر 4.5+.',
    filterNote: 'يُطبَّق فلتر: تقييم 4.5+.',
  },
  {
    slug: 'groom-prep',
    h1: 'حلاق يوفر تجهيز عريس',
    title: 'تجهيز عريس | حلاق ماب',
    description: 'استعلام عن شركاء يعلنون باقة تجهيز عريس عبر حلاق ماب.',
    aliases: ['تجهيز عريس', 'حلاق عريس'],
    lead: 'تجهيز عريس من شركاء يعلنون الباقة.',
    body: 'فلتر «تجهيز عريس» يعرض الشركاء المؤهلين الذين يعلنون العرض. التفاصيل مباشرة مع الصالون.',
    filterNote: 'يُطبَّق فلتر: تجهيز عريس.',
  },
  {
    slug: 'luxury',
    h1: 'حلاق فخم — مركز عناية بالرجل',
    title: 'حلاق فخم | حلاق ماب',
    description: 'البحث عن حلاق فخم يُوجَّه إلى مراكز العناية بالرجل المعلَنة في حلاق ماب.',
    aliases: ['حلاق فخم', 'صالون فخم'],
    lead: '«فخم» أقرب ما يقابله: مركز عناية رجل.',
    body: 'الشركاء الذين يعلنون «مركز عناية بالرجل» هم أقرب مطابقة لنية الفخامة المتكاملة داخل النظام.',
    filterNote: 'يُطبَّق فلتر: مركز عناية رجل.',
  },
  {
    slug: 'artist',
    h1: 'حلاق فنان بتقييم عالٍ',
    title: 'حلاق فنان | حلاق ماب',
    description: 'ابحث عن حلاق بمهارة عالية عبر تقييمات موثّقة في حلاق ماب.',
    aliases: ['حلاق فنان', 'حلاق مبدع'],
    lead: '«فنان» يُقاس عندنا بالتقييم الموثّق أولاً.',
    body: 'المنصة لا تمنح لقب «فنان». الإشارة المتاحة هي التقييمات؛ تُفتح هذه النية على فلتر 4.5+.',
    filterNote: 'يُطبَّق فلتر: تقييم 4.5+.',
  },
  {
    slug: 'top-rated',
    h1: 'حلاق تقييماته عالية',
    title: 'حلاق الأعلى تقييماً | حلاق ماب',
    description: 'استعلام عن حلاق بتقييم 4.5 فأعلى ضمن نطاقك عبر حلاق ماب.',
    aliases: ['تقييمات عالية', 'أفضل حلاق'],
    lead: 'الأعلى تقييماً ضمن نطاقك.',
    body: 'فلتر التقييم يعرض الشركاء الذين تبلغ تقييماتهم 4.5 فأعلى حسب بيانات المنصة.',
    filterNote: 'يُطبَّق فلتر: تقييم 4.5+.',
  },
  {
    slug: 'children',
    h1: 'حلاق أطفال متخصص',
    title: 'حلاق أطفال | حلاق ماب',
    description: 'استعلام عن حلاق أطفال متخصص عبر فلتر متخصصي الأطفال في حلاق ماب.',
    aliases: ['حلاق اطفال', 'حلاقة أطفال'],
    lead: 'حلاقة أطفال من متخصصين معلَنين.',
    body: 'فلتر متخصص الأطفال يعرض الشركاء المؤهلين الذين يعلنون التخصص داخل المنصة.',
    filterNote: 'يُطبَّق فلتر: متخصص أطفال.',
  },
  {
    slug: 'mens-grooming',
    h1: 'مركز عناية بالرجل',
    title: 'مركز عناية رجل | حلاق ماب',
    description: 'استعلام عن مراكز عناية بالرجل المعلَنة في حلاق ماب.',
    aliases: ['مركز عناية رجل', 'عناية بالرجل'],
    lead: 'مركز عناية رجل — تخصص معلَن في المنصة.',
    body: 'هذه النية تطابق فلتر «مركز عناية بالرجل» للشركاء الذين فعّلوا المسار داخل النظام.',
    filterNote: 'يُطبَّق فلتر: مركز عناية رجل.',
  },
];

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
  <meta name="robots" content="index, follow" />
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
    :root { color-scheme: dark; --card:#0c1a2e; --text:#e8eef7; --muted:#94a3b8; --accent:#2dd4bf; --line:rgba(45,212,191,.25); }
    * { box-sizing: border-box; }
    body { margin:0; font-family: "Segoe UI", Tahoma, Arial, sans-serif; background: linear-gradient(180deg,#061223,#0a1f33 55%,#061223); color:var(--text); line-height:1.8; }
    .wrap { max-width: 44rem; margin: 0 auto; padding: 1.5rem 1.15rem 3rem; }
    header { display:flex; align-items:center; gap:.75rem; margin-bottom:1.25rem; }
    header img { width:48px; height:48px; border-radius:12px; }
    header a { color:var(--accent); text-decoration:none; font-weight:800; font-size:1.15rem; }
    h1 { font-size: clamp(1.55rem, 4vw, 2.1rem); line-height:1.35; margin: .5rem 0 1rem; }
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
    <header>
      <a href="${ORIGIN}/"><img src="/images/halaqmap_logo_refined.png" width="48" height="48" alt="حلاق ماب" /></a>
      <a href="${ORIGIN}/">حلاق ماب</a>
    </header>
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
  const title = 'ابحث عن حلاق حسب حاجتك | حلاق ماب';
  const description =
    'صفحات مساعدة من حلاق ماب للبحث حسب حاجتك: منزلي، مفتوح الآن، 24 ساعة، أطفال، تجهيز عريس، كبار سن، مركز عناية رجل والمزيد — ثم ابدأ الاستعلام.';
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
    h1: 'ابحث عن حلاق حسب حاجتك',
    bodyInner: `
      <p class="lead">صفحات مساعدة من <strong>حلاق ماب</strong> لمن يبحث عن حلاق في محيطه أو بما يوافق رغبته — اختر نيتك ثم ابدأ الاستعلام بفلتر يطابق ما يعلنه الشركاء المفعّلون.</p>
      <p class="note">المنصة ليست صالوناً. بعض الكلمات الشائعة (نظيف، فخم، فنان) تُربط بأقرب فلتر بيانات متاح بشفافية.</p>
      <ul class="grid">${links}</ul>
      <p class="note"><a href="/near">أقرب حلاق حسب المدينة</a> · <a href="/nusuk">نسك الحج</a> · <a href="/occasions/eid-adha-shaving">عيد الأضحى</a></p>
    `,
    jsonLd,
  });
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
      <p class="cta-wrap" style="margin:1.5rem 0"><a class="cta" href="${escapeHtml(cta)}">ابدأ الاستعلام — ${escapeHtml(page.h1)}</a></p>
      <section>
        <h2>نيات بحث أخرى</h2>
        <ul class="grid">${siblings}</ul>
      </section>
      <p class="note"><a href="${HUB}">كل الفلاتر</a> · <a href="/near">حسب المدينة</a> · <a href="${ORIGIN}/">الرئيسية</a></p>
    `,
    jsonLd,
  });
}

function main() {
  writeFileDeep(join(DIST, 'need', 'index.html'), renderHub());
  for (const page of PAGES) {
    writeFileDeep(join(DIST, 'need', page.slug, 'index.html'), renderPage(page));
  }
  console.log(`[generate-filter-intent-seo] wrote hub + ${PAGES.length} pages under dist/need`);
}

main();
