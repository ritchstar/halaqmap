/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * واتساب يقرأ جذر store.halaqmap.com ويتجاهل الهاش.
 * نعيد كتابة الصفحة إلى وسم المتجر قبل تقديم index.html.
 * جوجل يقرأ اسم الموقع من جذر coiffeur.halaqmap.com فيُقدَّم رأس كوافير ماب.
 */
export const config = {
  matcher: ['/', '/index.html', '/store', '/store/:path*'],
};

function hostName(host) {
  return String(host || '')
    .trim()
    .toLowerCase()
    .split(':')[0];
}

function isStoreShareHost(host) {
  return hostName(host).includes('store.halaqmap.com');
}

function isCoiffeurSatelliteHost(host) {
  return hostName(host) === 'coiffeur.halaqmap.com';
}

function isCoiffeurIdentityPath(pathname) {
  const path = String(pathname || '/').split('?')[0].replace(/\/+$/, '') || '/';
  return path === '/' || path === '/index.html';
}

function isStoreSharePath(pathname) {
  const path = String(pathname || '/').split('?')[0].replace(/\/+$/, '') || '/';
  if (path === '/store/qr') return false;
  return path === '/' || path === '/index.html' || path === '/store' || path.startsWith('/store/');
}

export default function middleware(request) {
  const host = request.headers.get('host') || '';
  const path = new URL(request.url).pathname;
  if (isCoiffeurSatelliteHost(host) && isCoiffeurIdentityPath(path)) {
    return fetch(new URL('/coiffeur-index.html', request.url));
  }
  if (!isStoreShareHost(host)) return;
  if (!isStoreSharePath(path)) return;
  return fetch(new URL('/store-index.html', request.url));
}
