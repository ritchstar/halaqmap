/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * هوية العلامة + اسم خدمة فزعة لصفحات البحث الثابتة (مدن/أحياء/نوايا/مناسبات).
 */
export const BRAND_NAME_AR = 'حلاق ماب';
export const BRAND_NAME_EN = 'HALAQ MAP';
export const BRAND_SITE_NAME = 'حلاق ماب | HALAQ MAP';
/** اسم خدمة صفحات البحث الظاهرة للزائر القادم من قوقل */
export const FAZAA_NAME_AR = 'فزعة';
export const FAZAA_NAME_EN = 'FAZAA';
export const FAZAA_SERVICE_LINE = 'خدمة بحث سريعة من حلاق ماب';
export const BRAND_LOGO_PATH = '/images/halaqmap_logo_refined.png';
/** يُرفع عند كل تحديث شعار/أيقونة لكسر كاش Google وCDN */
export const BRAND_ICON_VERSION = '20260810';
export const ORIGIN = 'https://www.halaqmap.com';
export const BRAND_LOGO_ABS = `${ORIGIN}${BRAND_LOGO_PATH}`;

export function brandIconLinks() {
  const v = BRAND_ICON_VERSION;
  return `  <link rel="icon" href="/favicon.ico?v=${v}" sizes="any" />
  <link rel="icon" href="/favicon-48.png?v=${v}" type="image/png" sizes="48x48" />
  <link rel="icon" href="/favicon-96.png?v=${v}" type="image/png" sizes="96x96" />
  <link rel="icon" href="/favicon-32.png?v=${v}" type="image/png" sizes="32x32" />
  <link rel="icon" href="/icons/icon-192.png?v=${v}" type="image/png" sizes="192x192" />
  <link rel="icon" href="/favicon.svg?v=${v}" type="image/svg+xml" sizes="any" />
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png?v=${v}" sizes="180x180" />
  <link rel="apple-touch-icon" href="/icons/icon-152.png?v=${v}" sizes="152x152" />`;
}

/**
 * ترويسة فزعة — اسم الخدمة مزيّن بأسلوب شعار المنصة، الضغط يحيل للرئيسية.
 */
export function brandHeaderHtml() {
  return `    <header class="brand fazaa-header">
      <a class="brand-mark" href="${ORIGIN}/" aria-label="${FAZAA_NAME_AR} — إلى الرئيسية">
        <img src="${BRAND_LOGO_PATH}" width="52" height="52" alt="${BRAND_NAME_AR}" />
      </a>
      <a class="brand-lockup" href="${ORIGIN}/" aria-label="${FAZAA_NAME_AR} — ابدأ من الرئيسية">
        <span class="fazaa-ar">${FAZAA_NAME_AR}</span>
        <span class="fazaa-sub">${FAZAA_SERVICE_LINE}</span>
        <span class="brand-en" dir="ltr">${BRAND_NAME_EN}</span>
      </a>
    </header>
    <nav class="fazaa-shortcuts" aria-label="اختصارات سريعة">
      <a class="fazaa-chip fazaa-chip-primary" href="${ORIGIN}/">إلى الرئيسية</a>
      <a class="fazaa-chip" href="${ORIGIN}/#/">ابدأ الاستعلام</a>
      <a class="fazaa-chip" href="/near">اختر مدينتك</a>
      <a class="fazaa-chip" href="/need">حسب حاجتك</a>
      <a class="fazaa-chip" href="${ORIGIN}/#/map-contact-card">بطاقة تواصل ماب</a>
    </nav>`;
}

export function brandHeaderCss() {
  return `    @import url("https://fonts.googleapis.com/css2?family=Tajawal:wght@800;900&family=Outfit:wght@700;800&display=swap");
    header.brand { display:flex; align-items:center; gap:.85rem; margin-bottom:.85rem; }
    header.brand img { width:52px; height:52px; border-radius:14px; object-fit:cover; box-shadow:0 0 0 2px rgba(45,212,191,.4), 0 8px 24px rgba(13,148,136,.25); }
    .brand-lockup { display:flex; flex-direction:column; gap:.1rem; text-decoration:none; line-height:1.15; }
    .fazaa-ar {
      font-family: "Tajawal", "Segoe UI", Tahoma, sans-serif;
      font-weight:900;
      font-size:1.65rem;
      letter-spacing:-0.02em;
      background: linear-gradient(100deg,#5eead4 0%,#22d3ee 45%,#fbbf24 115%);
      -webkit-background-clip:text;
      background-clip:text;
      color:transparent;
    }
    .fazaa-sub {
      font-family: "Tajawal", "Segoe UI", sans-serif;
      font-weight:700;
      font-size:.82rem;
      color:#94a3b8;
    }
    .brand-en {
      font-family: "Outfit", system-ui, sans-serif;
      font-weight:800;
      font-size:.62rem;
      letter-spacing:.16em;
      color:#64748b;
      text-transform:uppercase;
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
      font-family:"Tajawal",sans-serif;
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

/** صياغة موحّدة: فزعة من حلاق ماب */
export function fazaaFromBrand(suffix = '') {
  const base = `فزعة من ${BRAND_NAME_AR}`;
  return suffix ? `${base} ${suffix}` : base;
}

export {
  FAZAA_ALL_SEARCH_PHRASES as NEAR_SEARCH_PHRASES_AR,
  FAZAA_SEARCH_KEYWORDS_META as NEAR_SEARCH_KEYWORDS_META,
  FAZAA_SEARCH_BLURB_AR as NEAR_SEARCH_BLURB_AR,
  fazaaSearchPhrasesSectionHtml as nearSearchPhrasesSectionHtml,
  fazaaSearchPhrasesCss as nearSearchPhrasesCss,
} from './fazaaSearchPhrases.mjs';
