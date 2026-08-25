/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * وسم مشاركة نطاق المتجر. واتساب لا يرى الهاش في
 * `https://store.halaqmap.com/#/store/...` فيقرأ جذر النطاق.
 */
export const STORE_SHARE_ORIGIN = 'https://store.halaqmap.com';

export const STORE_SHARE_META = {
  title: 'متجر خريطة الحل — halaqmap',
  description:
    'متجر خريطة الحل: متجر إلكتروني للبيع بالتجزئة للبرمجيات والخدمات السحابية. افراحي1، اجواء1، لاونجا1، تمويناتا1، مطعمنا1، وكاردي8.',
  siteName: 'متجر خريطة الحل',
  url: `${STORE_SHARE_ORIGIN}/store`,
  image: `${STORE_SHARE_ORIGIN}/images/halaqmap-store-mark-radar-square-1200x1200.png`,
  imageAlt: 'شعار متجر خريطة الحل — halaqmap',
  author: 'خريطة الحل',
};

export const STORE_SHARE_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'OnlineStore',
      '@id': `${STORE_SHARE_ORIGIN}/#store`,
      name: 'متجر خريطة الحل',
      alternateName: ['خريطة الحل', 'halaqmap'],
      url: STORE_SHARE_META.url,
      inLanguage: 'ar-SA',
      description: STORE_SHARE_META.description,
      image: STORE_SHARE_META.image,
    },
    {
      '@type': 'WebSite',
      '@id': `${STORE_SHARE_ORIGIN}/#website`,
      name: 'متجر خريطة الحل',
      url: STORE_SHARE_META.url,
      inLanguage: 'ar-SA',
      publisher: { '@id': `${STORE_SHARE_ORIGIN}/#store` },
    },
  ],
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
  const jsonLdTag = `<script type="application/ld+json">${JSON.stringify(STORE_SHARE_JSON_LD)}</script>`;
  if (/<script type="application\/ld\+json">[\s\S]*?<\/script>/i.test(next)) {
    next = next.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, jsonLdTag);
  } else {
    next = next.replace('</head>', `    ${jsonLdTag}\n  </head>`);
  }
  if (!next.includes('<noscript><h1>متجر خريطة الحل</h1></noscript>')) {
    next = next.replace(/<body([^>]*)>/i, '<body$1>\n    <noscript><h1>متجر خريطة الحل</h1></noscript>');
  }
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
