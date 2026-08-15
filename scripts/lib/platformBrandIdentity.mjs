/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * هوية العلامة + اسم خدمة فزعة لصفحات البحث الثابتة (مدن/أحياء/نوايا/مناسبات).
 *
 * ملاحظة SERP: محرّك Google لا يعرض خطوط الموقع داخل نتائج البحث —
 * ما يظهر هناك هو الأيقونة + العنوان + الوصف فقط. الخطوط الفاخرة تنطبق على صفحات الهبوط.
 */
export const BRAND_NAME_AR = 'حلاق ماب';
export const BRAND_NAME_EN = 'HALAQ MAP';
export const BRAND_SITE_NAME = 'حلاق ماب | HALAQ MAP';
/** اسم خدمة صفحات البحث الظاهرة للزائر القادم من قوقل */
export const FAZAA_NAME_AR = 'فزعة';
export const FAZAA_NAME_EN = 'FAZAA';
export const FAZAA_SERVICE_LINE = 'خدمة بحث سريعة من حلاق ماب';
/** شعار العرض في الواجهة (صغير) — الملف الكامل يبقى للمشاركة/OG */
export const BRAND_LOGO_PATH = '/images/halaqmap-logo-mark-128.webp';
export const BRAND_LOGO_PATH_2X = '/images/halaqmap-logo-mark-256.webp';
/** يُرفع عند كل تحديث شعار/أيقونة لكسر كاش Google وCDN */
export const BRAND_ICON_VERSION = '20260813';
export const ORIGIN = 'https://www.halaqmap.com';
/** OG/المشاركة تبقى PNG كامل الدقة */
export const BRAND_OG_LOGO_PATH = '/images/halaqmap_logo_refined.png';
export const BRAND_LOGO_ABS = `${ORIGIN}${BRAND_OG_LOGO_PATH}`;

/** عائلات خطوط الهوية: نظام الجهاز أولاً حتى لا يُحجب LCP بـ Google Fonts */
export const BRAND_FONT_IMPORT = '';

export function brandIconLinks() {
  const v = BRAND_ICON_VERSION;
  return `  <link rel="icon" href="/favicon.ico?v=${v}" sizes="any" />
  <link rel="icon" href="/favicon.svg?v=${v}" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png?v=${v}" sizes="180x180" />`;
}

/**
 * ترويسة فزعة — براند حلاق ماب بخط عربي فاخر + HALAQ MAP بخط المنصة، ثم اسم الخدمة.
 * @param {{ lang?: 'ar' | 'en' }} [opts]
 */
export function brandHeaderHtml(opts = {}) {
  if (opts.lang === 'en') {
    return `    <header class="brand fazaa-header">
      <a class="brand-mark" href="${ORIGIN}/" aria-label="${BRAND_NAME_EN} — home">
        <img src="${BRAND_LOGO_PATH}?v=${BRAND_ICON_VERSION}" srcset="${BRAND_LOGO_PATH}?v=${BRAND_ICON_VERSION} 1x, ${BRAND_LOGO_PATH_2X}?v=${BRAND_ICON_VERSION} 2x" width="56" height="56" alt="${BRAND_NAME_AR}" decoding="async" fetchpriority="high" />
      </a>
      <a class="brand-lockup" href="${ORIGIN}/" aria-label="${BRAND_NAME_EN} — start from home">
        <span class="brand-ar" dir="rtl" lang="ar">${BRAND_NAME_AR}</span>
        <span class="brand-en" dir="ltr">${BRAND_NAME_EN}</span>
        <span class="fazaa-sub">${FAZAA_NAME_EN} · instant nearby search from HalaqMap</span>
      </a>
    </header>
    <nav class="fazaa-shortcuts" aria-label="Start search">
      <a class="fazaa-chip fazaa-chip-primary" href="${ORIGIN}/#/">Search from your location</a>
    </nav>`;
  }
  return `    <header class="brand fazaa-header">
      <a class="brand-mark" href="${ORIGIN}/" aria-label="${BRAND_NAME_AR} — إلى الرئيسية">
        <img src="${BRAND_LOGO_PATH}?v=${BRAND_ICON_VERSION}" srcset="${BRAND_LOGO_PATH}?v=${BRAND_ICON_VERSION} 1x, ${BRAND_LOGO_PATH_2X}?v=${BRAND_ICON_VERSION} 2x" width="56" height="56" alt="${BRAND_NAME_AR}" decoding="async" fetchpriority="high" />
      </a>
      <a class="brand-lockup" href="${ORIGIN}/" aria-label="${BRAND_NAME_AR} — ابدأ من الرئيسية">
        <span class="brand-ar">${BRAND_NAME_AR}</span>
        <span class="brand-en" dir="ltr">${BRAND_NAME_EN}</span>
        <span class="fazaa-sub">${FAZAA_NAME_AR} · ${FAZAA_SERVICE_LINE}</span>
      </a>
    </header>
    <nav class="fazaa-shortcuts" aria-label="ابدأ البحث">
      <a class="fazaa-chip fazaa-chip-primary" href="${ORIGIN}/#/">ابحث من موقعك</a>
    </nav>`;
}

export function brandHeaderCss() {
  return `    header.brand { display:flex; align-items:center; gap:.9rem; margin-bottom:.85rem; }
    header.brand img { width:56px; height:56px; border-radius:16px; object-fit:cover; box-shadow:0 0 0 2px rgba(45,212,191,.45), 0 10px 28px rgba(13,148,136,.28); }
    .brand-lockup { display:flex; flex-direction:column; gap:.12rem; text-decoration:none; line-height:1.12; }
    .brand-ar {
      font-family: "Segoe UI", Tahoma, "Noto Naskh Arabic", sans-serif;
      font-weight:700;
      font-size:1.75rem;
      letter-spacing:-0.01em;
      background: linear-gradient(105deg,#99f6e4 0%,#2dd4bf 42%,#fbbf24 120%);
      -webkit-background-clip:text;
      background-clip:text;
      color:transparent;
    }
    .brand-en {
      font-family: system-ui, sans-serif;
      font-weight:800;
      font-size:.72rem;
      letter-spacing:.22em;
      color:#5eead4;
      text-transform:uppercase;
    }
    .fazaa-sub {
      font-family: "Segoe UI", Tahoma, sans-serif;
      font-weight:600;
      font-size:.8rem;
      color:#94a3b8;
    }
    .fazaa-shortcuts {
      display:flex; flex-wrap:wrap; gap:.45rem; margin:0 0 1.35rem;
    }
    .fazaa-chip {
      display:inline-block;
      padding:.4rem .75rem;
      border-radius:999px;
      border:1px solid rgba(45,212,191,.28);
      background:rgba(12,26,46,.65);
      color:#e2e8f0;
      text-decoration:none;
      font-family:"Segoe UI",Tahoma,sans-serif;
      font-weight:700;
      font-size:.82rem;
    }
    .fazaa-chip:hover { border-color:#2dd4bf; color:#fff; }
    .fazaa-chip-primary {
      background: linear-gradient(135deg,#0d9488,#0891b2);
      color:#041016;
      border-color:transparent;
    }`;
}

/**
 * أنماط نص الصفحة المشتركة لصفحات فزعة.
 * الخلفية تُترك لكل مولّد (ألوان المناسبات/نسك تختلف).
 */
export function brandPageTypeCss(background = 'linear-gradient(180deg,#061223,#0a1f33 55%,#061223)') {
  return `    body { margin:0; font-family: "Segoe UI", Tahoma, Arial, sans-serif; background: ${background}; color:var(--text); line-height:1.8; }
    h1 { font-family: "Segoe UI", Tahoma, sans-serif; font-size: clamp(1.6rem, 4.2vw, 2.25rem); line-height:1.35; margin: .5rem 0 1rem; font-weight:700; letter-spacing:-0.01em; }
    h2 { font-family: "Segoe UI", Tahoma, sans-serif; font-size:1.2rem; margin: 1.75rem 0 .75rem; color:var(--accent); font-weight:700; }
    .lead { font-size:1.06rem; font-weight:600; }
    .cta { font-family: "Segoe UI", Tahoma, sans-serif; }`;
}

/** صياغة موحّدة: فزعة من حلاق ماب */
export function fazaaFromBrand(suffix = '') {
  const base = `فزعة من ${BRAND_NAME_AR}`;
  return suffix ? `${base} ${suffix}` : base;
}

/** معرّفات القياس — تطابق index.html و src/config/googleAdsTag.ts */
export const FAZAA_GA4_MEASUREMENT_ID = 'G-NVQ8BJDN30';
export const FAZAA_GOOGLE_ADS_ID = 'AW-18240041811';

/**
 * تاج Google (GA4 + Ads) لصفحات فزعة الثابتة — يُحمَّل بعد idle مثل الرئيسية
 * حتى لا تظهر /near و /need كـ «غير موسومة» في تشخيص العلامة.
 */
export function fazaaMeasurementTagHtml() {
  return `  <!-- Google tag (GA4 + Ads) — idle boot, matches main index.html -->
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    (function(){
      function bootGtag(){
        if (window.__hmGtagBooted) return;
        window.__hmGtagBooted = true;
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=${FAZAA_GOOGLE_ADS_ID}';
        document.head.appendChild(s);
        gtag('js', new Date());
        gtag('config', '${FAZAA_GA4_MEASUREMENT_ID}', { send_page_view: true });
        gtag('config', '${FAZAA_GOOGLE_ADS_ID}', {
          send_page_view: true,
          conversion_linker: true
        });
      }
      function schedule(){
        if (typeof window.requestIdleCallback === 'function') {
          window.requestIdleCallback(bootGtag, { timeout: 8000 });
        } else {
          window.setTimeout(bootGtag, 5000);
        }
      }
      if (document.readyState === 'complete') schedule();
      else window.addEventListener('load', schedule, { once: true });
    })();
  </script>`;
}

export {
  FAZAA_ALL_SEARCH_PHRASES as NEAR_SEARCH_PHRASES_AR,
  FAZAA_SEARCH_KEYWORDS_META as NEAR_SEARCH_KEYWORDS_META,
  FAZAA_SEARCH_BLURB_AR as NEAR_SEARCH_BLURB_AR,
  fazaaSearchPhrasesSectionHtml as nearSearchPhrasesSectionHtml,
  fazaaSearchPhrasesCss as nearSearchPhrasesCss,
} from './fazaaSearchPhrases.mjs';
