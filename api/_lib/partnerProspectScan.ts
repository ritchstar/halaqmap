import { assertVisionMime, callOpenAIOpsBillingVision } from './opsBillingAi.js';

export type ScannedPartnerLead = {
  name: string;
  phone: string;
  city?: string;
  region?: string;
  address?: string;
};

const SCAN_SYSTEM = `أنت مستخرج leads B2B لمنصة حلاق ماب السعودية.
اقرأ الصورة (جدول Excel/Sheets، لقطة شاشة، خرائط، انستقرام، قائمة محلات…) واستخرج كل صف/محل حلاقة.

أعد JSON فقط:
{"leads":[{"name":"…","phone":"+9665…","city":"…","region":"…","address":"…"}]}

إن كانت الصورة جدولاً بأعمدة مثل:
- **اسم الصالون** → name
- **الحي / المنطقة** → region (وaddress بنفس النص إن لم يوجد عمود عنوان منفصل)
- **رقم الهاتف** → phone (حتى لو عمود «هل يدعم واتساب» يقول نعم)
- **المدينة** إن وُجدت عموداً لها → city؛ وإلا استنتج city من الحي (مثل الربوة/الملقا → الرياض)

قواعد:
- phone مطلوب؛ تجاهل الصف بلا رقم سعودي (+966 أو 05).
- name مطلوب؛ من عمود اسم المحل/الصالون.
- region/address: من عمود الحي أو المنطقة أو العنوان.
- city: المدينة السعودية إن ظهرت أو استنتجت من الحي.
- طبّع phone إلى 9665xxxxxxxx (12 رقم).
- استخرج **كل الصفوف** الظاهرة في الجدول — لا تتوقف عند 5.
- لا تكرّر نفس phone.
- لا حقول إضافية.`;

export function normalizeScannedPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('966') && digits.length >= 12) return digits.slice(0, 12);
  if (digits.startsWith('05') && digits.length >= 10) return `966${digits.slice(1, 10)}`;
  if (digits.startsWith('5') && digits.length >= 9) return `966${digits.slice(0, 9)}`;
  if (digits.length >= 10) return digits;
  return null;
}

function cleanLabel(raw: unknown, max = 120): string | undefined {
  if (typeof raw !== 'string') return undefined;
  const t = raw.replace(/\s+/g, ' ').trim();
  if (t.length < 2) return undefined;
  return t.slice(0, max);
}

function cleanName(raw: unknown): string {
  return cleanLabel(raw, 200) ?? 'محل حلاق';
}

function inferCityFromRegion(region: string | undefined): string | undefined {
  if (!region) return undefined;
  const known = ['الرياض', 'جدة', 'مكة', 'المدينة', 'الدمام', 'الخبر', 'الظهران', 'تبوك', 'أبها', 'الطائف'];
  for (const city of known) {
    if (region.includes(city)) return city;
  }
  return undefined;
}

function parseScanJson(text: string): ScannedPartnerLead[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return [];
  }
  if (!parsed || typeof parsed !== 'object') return [];
  const leadsRaw = (parsed as { leads?: unknown }).leads;
  if (!Array.isArray(leadsRaw)) return [];

  const byPhone = new Map<string, ScannedPartnerLead>();

  for (const item of leadsRaw) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const phone = normalizeScannedPhone(String(row.phone ?? ''));
    if (!phone) continue;

    const name = cleanName(row.name);
    const region = cleanLabel(row.region, 120);
    const address = cleanLabel(row.address, 400) ?? region;
    let city = cleanLabel(row.city, 120);
    if (!city) city = inferCityFromRegion(region) ?? inferCityFromRegion(address);

    byPhone.set(phone, {
      name,
      phone,
      ...(city ? { city } : {}),
      ...(region ? { region } : {}),
      ...(address ? { address } : {}),
    });
  }

  return [...byPhone.values()];
}

export async function scanPartnerProspectsFromImage(
  imageBase64: string,
  imageMime: string,
): Promise<ScannedPartnerLead[]> {
  const mimeErr = assertVisionMime(imageMime);
  if (mimeErr) throw new Error(mimeErr);

  const raw = await callOpenAIOpsBillingVision({
    system: SCAN_SYSTEM,
    userText:
      'استخرج كل الصفوف: اسم الصالون، الحي/المنطقة (عنوان)، رقم الهاتف/واتساب. إن كانت صورة جدول — لا تفوّت أي صف.',
    imageBase64,
    imageMime,
    timeoutMs: 52_000,
    maxTokens: 4096,
  });

  return parseScanJson(raw);
}
