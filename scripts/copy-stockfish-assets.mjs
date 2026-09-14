#!/usr/bin/env node
/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * ينسخ ملفات محرك Stockfish (WASM/asm.js) من node_modules/stockfish إلى
 * public/stockfish كي يقدر Web Worker في المتصفح يحمّلها كأصول ثابتة.
 * يعمل تلقائياً بعد npm install عبر postinstall.
 *
 * لا يفترض اسم ملف بعينه عمداً — أسماء ملفات الدخول تختلف بين إصدارات
 * حزمة stockfish على npm، فبدل تخمين اسم قد يكون خاطئاً، يُنسخ كل ملف
 * صالح فعلياً موجود داخل الحزمة المثبتة. غلاف المحرك في
 * src/lib/stockfishEngine.ts يجرّب عدة أسماء مرشّحة عند التشغيل، ويتراجع
 * تلقائياً للمحرك المحلي إن لم يجد شيئاً — فشل هذا السكربت (أو غياب
 * الحزمة) ليس خطأ فادحاً، فقط يعطّل مستوى «محترف» الحقيقي مؤقتاً.
 */
import { existsSync, mkdirSync, readdirSync, copyFileSync, statSync } from 'node:fs';
import path from 'node:path';

const CANDIDATE_SOURCE_DIRS = ['node_modules/stockfish/src', 'node_modules/stockfish'];
const DEST_DIR = 'public/stockfish';
const RELEVANT_EXTENSIONS = ['.js', '.mjs', '.wasm', '.nnue'];

function findSourceDir() {
  for (const dir of CANDIDATE_SOURCE_DIRS) {
    if (existsSync(dir) && statSync(dir).isDirectory()) return dir;
  }
  return null;
}

function main() {
  const sourceDir = findSourceDir();
  if (!sourceDir) {
    console.warn(
      '[stockfish-assets] لم يُعثر على حزمة stockfish مثبّتة — تخطّي النسخ. مستوى «محترف» سيعمل بالمحرك المحلي البديل تلقائياً.',
    );
    return;
  }

  mkdirSync(DEST_DIR, { recursive: true });

  let copiedCount = 0;
  for (const entry of readdirSync(sourceDir)) {
    if (!RELEVANT_EXTENSIONS.some((ext) => entry.endsWith(ext))) continue;
    const from = path.join(sourceDir, entry);
    if (!statSync(from).isFile()) continue;
    copyFileSync(from, path.join(DEST_DIR, entry));
    copiedCount++;
  }

  if (copiedCount === 0) {
    console.warn(
      '[stockfish-assets] لم يُعثر على ملفات محرك صالحة داخل الحزمة — تخطّي. راجع بنية حزمة stockfish المثبتة يدوياً إن رغبت بتفعيل مستوى «محترف» الحقيقي.',
    );
  } else {
    console.log(`[stockfish-assets] تم نسخ ${copiedCount} ملف(ات) إلى ${DEST_DIR}`);
  }
}

main();
