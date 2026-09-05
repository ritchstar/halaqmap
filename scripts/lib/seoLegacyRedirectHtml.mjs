/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * صفحة HTML خفيفة تُحوّل فوراً إلى مسار فزعة معتمد — للتهجئات القديمة في الفهرسة.
 */
import { ORIGIN } from './platformBrandIdentity.mjs';

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function absoluteSeoUrl(path) {
  const normalized = String(path || '/').startsWith('/') ? String(path) : `/${path}`;
  return `${ORIGIN}${normalized}`;
}

export function renderLegacyRedirect(toPath, { title = 'نقل إلى الصفحة الصحيحة' } = {}) {
  const dest = absoluteSeoUrl(toPath);
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <link rel="canonical" href="${escapeHtml(dest)}">
  <meta http-equiv="refresh" content="0;url=${escapeHtml(dest)}">
  <script>location.replace(${JSON.stringify(dest)})</script>
</head>
<body>
  <p><a href="${escapeHtml(dest)}">افتح الصفحة المعتمدة</a></p>
</body>
</html>
`;
}
