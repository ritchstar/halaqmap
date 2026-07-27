/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * يضيف وسم الملكية أعلى ملفات المصدر إن لم يكن موجوداً.
 * تشغيل: node scripts/ensure-copyright-headers.mjs
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const ROOT = process.cwd();
const NOTICE = 'Copyright © 2026 HalaqMap. All Rights Reserved.';
const MARKER = 'Copyright © 2026 HalaqMap';

const ROOTS = ['src', 'api', 'scripts', 'supabase/functions', 'supabase/migrations'];
const EXTRA_FILES = [
  'index.html',
  'vite.config.ts',
  'vitest.config.ts',
  'tailwind.config.ts',
  'postcss.config.js',
  'eslint.config.js',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
  'api/tsconfig.json',
];

const SKIP_DIR = new Set([
  'node_modules',
  'dist',
  '.git',
  '.vercel',
  'coverage',
  'halaqmap_partners',
  'halaqmap7',
  'halaqmap_landing',
  'docs',
  'moyasar',
  'nazamsafir',
]);

const EXT_OK = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.css',
  '.scss',
  '.html',
  '.sql',
]);

function headerFor(ext, existingTop) {
  if (ext === '.html') {
    return `<!-- ${NOTICE} -->\n`;
  }
  if (ext === '.css' || ext === '.scss') {
    return `/*! ${NOTICE} */\n`;
  }
  if (ext === '.sql') {
    return `-- ${NOTICE}\n`;
  }
  // JSON: skip (invalid as comments) — handled by caller
  if (ext === '.json') return null;
  // JS/TS: preserve shebang / "use client"
  if (existingTop.startsWith('#!')) {
    return null; // caller inserts after shebang line
  }
  return `/**\n * ${NOTICE}\n */\n`;
}

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const ent of entries) {
    if (SKIP_DIR.has(ent.name)) continue;
    const p = join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.isFile()) {
      const ext = extname(ent.name).toLowerCase();
      if (EXT_OK.has(ext)) out.push(p);
    }
  }
  return out;
}

function insertAfterFirstLine(content, header) {
  const nl = content.indexOf('\n');
  if (nl < 0) return `${content}\n${header}`;
  return `${content.slice(0, nl + 1)}${header}${content.slice(nl + 1)}`;
}

function processFile(absPath) {
  const ext = extname(absPath).toLowerCase();
  if (ext === '.json') return { status: 'skip_json' };

  let raw;
  try {
    raw = readFileSync(absPath, 'utf8');
  } catch {
    return { status: 'read_error' };
  }
  if (!raw || raw.includes(MARKER)) return { status: 'already' };

  // tiny / binary-ish skip
  if (raw.length > 2_000_000) return { status: 'too_large' };

  const trimmedStart = raw.replace(/^\uFEFF/, '');
  let header = headerFor(ext, trimmedStart);
  let next;

  if (ext === '.html') {
    // بعد DOCTYPE إن وُجد
    if (/^<!DOCTYPE html>/i.test(trimmedStart)) {
      next = insertAfterFirstLine(trimmedStart, header);
    } else if (/^<html[\s>]/i.test(trimmedStart)) {
      next = `${header}${trimmedStart}`;
    } else {
      next = `${header}${trimmedStart}`;
    }
  } else if (trimmedStart.startsWith('#!')) {
    header = `/**\n * ${NOTICE}\n */\n`;
    next = insertAfterFirstLine(trimmedStart, header);
  } else if (/^['"]use (client|server|strict)['"];?\r?\n/.test(trimmedStart)) {
    header = `/**\n * ${NOTICE}\n */\n`;
    next = insertAfterFirstLine(trimmedStart, header);
  } else if (ext === '.sql') {
    next = `${header}${trimmedStart}`;
  } else if (ext === '.css' || ext === '.scss') {
    next = `${header}${trimmedStart}`;
  } else {
    next = `${header}${trimmedStart}`;
  }

  if (next === trimmedStart) return { status: 'noop' };
  writeFileSync(absPath, next, 'utf8');
  return { status: 'added' };
}

const files = [];
for (const r of ROOTS) {
  const abs = join(ROOT, r);
  try {
    if (statSync(abs).isDirectory()) walk(abs, files);
  } catch {
    /* missing root */
  }
}
for (const f of EXTRA_FILES) {
  const abs = join(ROOT, f);
  try {
    if (statSync(abs).isFile()) files.push(abs);
  } catch {
    /* missing */
  }
}

const unique = [...new Set(files)];
const counts = {
  added: 0,
  already: 0,
  skip_json: 0,
  read_error: 0,
  too_large: 0,
  noop: 0,
};

for (const f of unique) {
  const res = processFile(f);
  counts[res.status] = (counts[res.status] || 0) + 1;
  if (res.status === 'added') {
    console.log('ADD', relative(ROOT, f).replace(/\\/g, '/'));
  }
}

console.log('\ncopyright_headers_summary', counts, 'files_scanned', unique.length);
