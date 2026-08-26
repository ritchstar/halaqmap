/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * واتساب يقرأ جذر store.halaqmap.com ويتجاهل الهاش.
 * نعيد كتابة الصفحة إلى وسم المتجر قبل تقديم index.html.
 */
export const config = {
  matcher: ['/', '/index.html', '/store', '/store/:path*'],
};

function isStoreShareHost(host) {
  return String(host || '')
    .trim()
    .toLowerCase()
    .includes('store.halaqmap.com');
}

function isStoreSharePath(pathname) {
  const path = String(pathname || '/').split('?')[0].replace(/\/+$/, '') || '/';
  if (path === '/store/qr') return false;
  return path === '/' || path === '/index.html' || path === '/store' || path.startsWith('/store/');
}

export default function middleware(request) {
  const host = request.headers.get('host') || '';
  if (!isStoreShareHost(host)) return;
  const path = new URL(request.url).pathname;
  if (!isStoreSharePath(path)) return;
  return fetch(new URL('/store-index.html', request.url));
}
