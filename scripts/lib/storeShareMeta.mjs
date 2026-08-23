/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * وسم مشاركة نطاق المتجر. واتساب لا يرى الهاش في
 * `https://store.halaqmap.com/#/store/...` فيقرأ جذر النطاق.
 */
export const STORE_SHARE_ORIGIN = 'https://store.halaqmap.com';

export const STORE_SHARE_META = {
  title: 'halaqmap — خريطة الحل',
  description:
    'متجر إلكتروني للبيع بالتجزئة للبرمجيات والخدمات السحابية. افراحي1، اجواء1، لاونجا1، تمويناتا1، مطعمنا1، وكاردي8.',
  siteName: 'halaqmap · خريطة الحل',
  url: `${STORE_SHARE_ORIGIN}/`,
  image: `${STORE_SHARE_ORIGIN}/images/halaqmap-store-mark-radar-square-1200x1200.png`,
  imageAlt: 'شعار متجر halaqmap — خريطة الحل',
  author: 'خريطة الحل',
};

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function replaceNamedMeta(html, attr, key, content) {
  const re = new RegExp(
    `<meta\\s+[^>]*${attr}="${key}"[^>]*>`,
    'i',
  );
  const tag = `<meta ${attr}="${key}" content="${escapeAttr(content)}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function replacePropertyMeta(html, key, content) {
  return replaceNamedMeta(html, 'property', key, content);
}

function replaceNameMeta(html, key, content) {
  return replaceNamedMeta(html, 'name', key, content);
}

export function applyStoreShareMeta(html) {
  if (typeof html !== 'string' || !html.includes('<html')) {
    throw new Error('store share meta expects HTML');
  }
  let next = html;
  next = next.replace(/<title>[^<]*<\/title>/i, `<title>${escapeAttr(STORE_SHARE_META.title)}</title>`);
  next = replaceNameMeta(next, 'description', STORE_SHARE_META.description);
  next = replaceNameMeta(next, 'author', STORE_SHARE_META.author);
  next = replaceNameMeta(next, 'application-name', STORE_SHARE_META.siteName);
  next = next.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${escapeAttr(STORE_SHARE_META.url)}" />`,
  );
  next = replacePropertyMeta(next, 'og:title', STORE_SHARE_META.title);
  next = replacePropertyMeta(next, 'og:description', STORE_SHARE_META.description);
  next = replacePropertyMeta(next, 'og:url', STORE_SHARE_META.url);
  next = replacePropertyMeta(next, 'og:image', STORE_SHARE_META.image);
  next = replacePropertyMeta(next, 'og:image:alt', STORE_SHARE_META.imageAlt);
  next = replacePropertyMeta(next, 'og:site_name', STORE_SHARE_META.siteName);
  next = replaceNameMeta(next, 'twitter:title', STORE_SHARE_META.title);
  next = replaceNameMeta(next, 'twitter:description', STORE_SHARE_META.description);
  next = replaceNameMeta(next, 'twitter:image', STORE_SHARE_META.image);
  next = replacePropertyMeta(next, 'og:image:width', '1200');
  next = replacePropertyMeta(next, 'og:image:height', '1200');
  if (next.includes('اقرب حلاق · حلاق قريب | حلاق ماب')) {
    throw new Error('store share HTML still carries Halaq Map share title');
  }
  return next;
}

export function isStoreShareHost(host) {
  return String(host || '')
    .trim()
    .toLowerCase()
    .includes('store.halaqmap.com');
}

export function isStoreSharePath(pathname) {
  const path = String(pathname || '/').split('?')[0] || '/';
  return path === '/' || path === '/index.html' || path === '/store' || path.startsWith('/store/');
}
