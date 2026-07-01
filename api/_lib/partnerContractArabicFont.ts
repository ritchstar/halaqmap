/**
 * تحميل خط عربي لـ PDF العقد — محلي أولاً (موثوق على Vercel) ثم URL اختياري.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const BUNDLED_FONT_PATH = join(MODULE_DIR, 'assets', 'fonts', 'NotoNaskhArabic-Regular.ttf');

const DEFAULT_AR_FONT_URL =
  'https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoNaskhArabic/NotoNaskhArabic-Regular.ttf';

let cachedFont: Buffer | null | undefined;

function readBundledFont(): Buffer | null {
  try {
    return readFileSync(BUNDLED_FONT_PATH);
  } catch {
    return null;
  }
}

async function fetchFontFromUrl(url: string): Promise<Buffer | null> {
  try {
    const r = await fetch(url, { redirect: 'follow' });
    if (!r.ok) return null;
    return Buffer.from(await r.arrayBuffer());
  } catch {
    return null;
  }
}

/** يُحمَّل مرة واحدة لكل عملية serverless */
export async function loadPartnerContractArabicFont(): Promise<Buffer | null> {
  if (cachedFont !== undefined) return cachedFont;

  const bundled = readBundledFont();
  if (bundled && bundled.length > 10_000) {
    cachedFont = bundled;
    return cachedFont;
  }

  const customUrl = (process.env.PARTNER_CONTRACT_ARABIC_FONT_URL || '').trim();
  const fromCustom = customUrl ? await fetchFontFromUrl(customUrl) : null;
  if (fromCustom && fromCustom.length > 10_000) {
    cachedFont = fromCustom;
    return cachedFont;
  }

  const fromDefault = await fetchFontFromUrl(DEFAULT_AR_FONT_URL);
  cachedFont = fromDefault && fromDefault.length > 10_000 ? fromDefault : null;
  return cachedFont;
}
