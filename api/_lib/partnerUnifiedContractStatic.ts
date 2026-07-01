/**
 * العقد الرقمي الموحّد — ملف PDF ثابت (عربي سليم) يُرفق لجميع الشركاء.
 * ضع الملف المصدَّر من Word في:
 *   api/_lib/assets/contracts/Halaqmap-Partner-Unified-Contract-AR.pdf
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));

export const STATIC_UNIFIED_CONTRACT_FILENAME = 'Halaqmap-Partner-Unified-Contract-AR.pdf' as const;

const STATIC_CONTRACT_PATH = join(MODULE_DIR, 'assets', 'contracts', STATIC_UNIFIED_CONTRACT_FILENAME);

let cachedPdf: Buffer | null | undefined;

/** يُحمَّل مرة واحدة لكل عملية serverless */
export function loadStaticUnifiedContractPdf(): Buffer {
  if (cachedPdf !== undefined) {
    if (!cachedPdf) throw new Error('static_contract_pdf_missing');
    return cachedPdf;
  }
  try {
    const buf = readFileSync(STATIC_CONTRACT_PATH);
    if (!buf || buf.length < 1024) {
      cachedPdf = null;
      throw new Error('static_contract_pdf_missing');
    }
    cachedPdf = buf;
    return buf;
  } catch (e) {
    cachedPdf = null;
    if (e instanceof Error && e.message === 'static_contract_pdf_missing') throw e;
    throw new Error('static_contract_pdf_missing');
  }
}
