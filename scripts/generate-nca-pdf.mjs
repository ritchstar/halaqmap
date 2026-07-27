/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * يحوّل تقارير NCA من Markdown إلى PDF (RTL عربي) — بلا تبعيات npm إضافية.
 * Usage: node scripts/generate-nca-pdf.mjs
 */
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const exportDir = resolve(root, 'docs/export');
const cssPath = resolve(exportDir, 'nca-pdf-style.css');
const css = readFileSync(cssPath, 'utf8');

const inputs = [
  {
    md: resolve(exportDir, 'NCA-AI-CYBERSECURITY-POSITION-AR.md'),
    pdf: resolve(exportDir, 'NCA-AI-CYBERSECURITY-POSITION-AR.pdf'),
    html: resolve(exportDir, 'NCA-AI-CYBERSECURITY-POSITION-AR.html'),
  },
  {
    md: resolve(exportDir, 'NCA-AI-CYBERSECURITY-POSITION-AR-SHORT.md'),
    pdf: resolve(exportDir, 'NCA-AI-CYBERSECURITY-POSITION-AR-SHORT.pdf'),
    html: resolve(exportDir, 'NCA-AI-CYBERSECURITY-POSITION-AR-SHORT.html'),
  },
];

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inlineMd(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function parseTable(lines) {
  const rows = lines.filter((l) => l.trim().startsWith('|'));
  if (rows.length < 2) return '';
  const cells = rows.map((row) =>
    row
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((c) => c.trim()),
  );
  const header = cells[0];
  const body = cells.slice(2);
  let html = '<table><thead><tr>';
  for (const h of header) html += `<th>${inlineMd(h)}</th>`;
  html += '</tr></thead><tbody>';
  for (const row of body) {
    html += '<tr>';
    for (const c of row) html += `<td>${inlineMd(c)}</td>`;
    html += '</tr>';
  }
  html += '</tbody></table>';
  return html;
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    if (trimmed === '---') {
      out.push('<hr />');
      i += 1;
      continue;
    }

    if (trimmed.startsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i += 1;
      }
      out.push(parseTable(tableLines));
      continue;
    }

    if (trimmed.startsWith('### ')) {
      out.push(`<h3>${inlineMd(trimmed.slice(4))}</h3>`);
      i += 1;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      out.push(`<h2>${inlineMd(trimmed.slice(3))}</h2>`);
      i += 1;
      continue;
    }
    if (trimmed.startsWith('# ')) {
      out.push(`<h1>${inlineMd(trimmed.slice(2))}</h1>`);
      i += 1;
      continue;
    }

    if (trimmed.startsWith('- ')) {
      out.push('<ul>');
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        out.push(`<li>${inlineMd(lines[i].trim().slice(2))}</li>`);
        i += 1;
      }
      out.push('</ul>');
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      out.push('<ol>');
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        out.push(`<li>${inlineMd(lines[i].trim().replace(/^\d+\.\s/, ''))}</li>`);
        i += 1;
      }
      out.push('</ol>');
      continue;
    }

    const para = [trimmed];
    i += 1;
    while (i < lines.length) {
      const next = lines[i].trim();
      if (
        !next ||
        next === '---' ||
        next.startsWith('#') ||
        next.startsWith('- ') ||
        next.startsWith('|') ||
        /^\d+\.\s/.test(next)
      ) {
        break;
      }
      para.push(next);
      i += 1;
    }
    out.push(`<p>${inlineMd(para.join(' '))}</p>`);
  }

  return out.join('\n');
}

function wrapHtml(body, title) {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>
  <style>${css}</style>
</head>
<body>
${body}
</body>
</html>`;
}

function findHeadlessBrowser() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  ].filter(Boolean);

  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

function printHtmlToPdf(htmlPath, pdfPath) {
  const browser = findHeadlessBrowser();
  if (!browser) {
    console.warn('No Chrome/Edge found — HTML only:', htmlPath);
    return false;
  }

  const fileUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--print-to-pdf=${pdfPath}`,
    fileUrl,
  ];

  const r = spawnSync(browser, args, { encoding: 'utf8', shell: false });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    return false;
  }
  return existsSync(pdfPath);
}

function main() {
  for (const { md, pdf, html } of inputs) {
    if (!existsSync(md)) {
      console.error('Missing:', md);
      process.exitCode = 1;
      continue;
    }
    const markdown = readFileSync(md, 'utf8');
    const title = basename(md, '.md');
    const body = markdownToHtml(markdown);
    const fullHtml = wrapHtml(body, title);
    writeFileSync(html, fullHtml, 'utf8');
    console.log('Wrote', html);

    if (printHtmlToPdf(html, pdf)) {
      console.log('Wrote', pdf);
    } else {
      console.warn('PDF skipped — open HTML in browser → Print → Save as PDF');
      process.exitCode = 1;
    }
  }
}

main();
