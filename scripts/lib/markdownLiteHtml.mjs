/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * تحويل خفيف لنصوص السياسات: فقرات، قوائم، وتغميق **نص**.
 */
export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function markdownLiteToHtml(text) {
  const escaped = escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  const blocks = escaped.split(/\n\n+/).map((block) => block.trim()).filter(Boolean);
  return blocks
    .map((block) => {
      const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
      if (lines.length && lines.every((line) => line.startsWith('- '))) {
        return `<ul>${lines.map((line) => `<li>${line.slice(2)}</li>`).join('')}</ul>`;
      }
      return `<p>${lines.join('<br />')}</p>`;
    })
    .join('\n');
}
