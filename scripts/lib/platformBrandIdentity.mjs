/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * هوية العلامة المشتركة لمولّدات صفحات SEO الثابتة.
 */
export const BRAND_NAME_AR = 'حلاق ماب';
export const BRAND_NAME_EN = 'HALAQ MAP';
export const BRAND_SITE_NAME = 'حلاق ماب | HALAQ MAP';
export const BRAND_LOGO_PATH = '/images/halaqmap_logo_20260409_073322.png';
export const BRAND_ICON_VERSION = '20260808';
export const ORIGIN = 'https://www.halaqmap.com';
export const BRAND_LOGO_ABS = `${ORIGIN}${BRAND_LOGO_PATH}`;

export function brandIconLinks() {
  const v = BRAND_ICON_VERSION;
  return `  <link rel="icon" href="/favicon-48.png?v=${v}" type="image/png" sizes="48x48" />
  <link rel="icon" href="/favicon-96.png?v=${v}" type="image/png" sizes="96x96" />
  <link rel="icon" href="/favicon-32.png?v=${v}" type="image/png" sizes="32x32" />
  <link rel="icon" href="/icons/icon-192.png?v=${v}" type="image/png" sizes="192x192" />
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png?v=${v}" sizes="180x180" />`;
}

/** ترويسة علامة ثنائية اللغة بخطوط بارزة */
export function brandHeaderHtml() {
  return `    <header class="brand">
      <a class="brand-mark" href="${ORIGIN}/"><img src="${BRAND_LOGO_PATH}" width="52" height="52" alt="${BRAND_NAME_AR} · ${BRAND_NAME_EN}" /></a>
      <a class="brand-lockup" href="${ORIGIN}/">
        <span class="brand-ar">${BRAND_NAME_AR}</span>
        <span class="brand-en" dir="ltr">${BRAND_NAME_EN}</span>
      </a>
    </header>`;
}

export function brandHeaderCss() {
  return `    @import url("https://fonts.googleapis.com/css2?family=Tajawal:wght@800;900&family=Outfit:wght@700;800&display=swap");
    header.brand { display:flex; align-items:center; gap:.85rem; margin-bottom:1.35rem; }
    header.brand img { width:52px; height:52px; border-radius:14px; object-fit:cover; box-shadow:0 0 0 2px rgba(45,212,191,.4), 0 8px 24px rgba(13,148,136,.25); }
    .brand-lockup { display:flex; flex-direction:column; gap:.12rem; text-decoration:none; line-height:1.1; }
    .brand-ar {
      font-family: "Tajawal", "Segoe UI", Tahoma, sans-serif;
      font-weight:900;
      font-size:1.4rem;
      letter-spacing:-0.02em;
      background: linear-gradient(100deg,#5eead4 0%,#22d3ee 55%,#fbbf24 120%);
      -webkit-background-clip:text;
      background-clip:text;
      color:transparent;
    }
    .brand-en {
      font-family: "Outfit", system-ui, sans-serif;
      font-weight:800;
      font-size:.7rem;
      letter-spacing:.16em;
      color:#94a3b8;
      text-transform:uppercase;
    }`;
}
