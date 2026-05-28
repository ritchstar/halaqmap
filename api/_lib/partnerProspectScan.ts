import { assertVisionMime, callOpenAIOpsBillingVision } from './opsBillingAi.js';

export type ScannedPartnerLead = {
  name: string;
  phone: string;
  city?: string;
  region?: string;
};

const SCAN_SYSTEM = `أنت مستخرج leads B2B لمنصة حلاق ماب السعودية.
مهمتك: قراءة الصورة (لقطة شاشة خرائط، انستقرام، قائمة جهات اتصال، بطاقة محل، إلخ) واستخراج كل محل/صالون حلاقة ظاهر.

أعد JSON فقط بهذا الشكل:
{"leads":[{"name":"اسم المحل","phone":"05xxxxxxxx أو +9665…","city":"اختياري","region":"اختياري"}]}

قواعد:
- phone مطلوب لكل lead؛ تجاهل أي صف بلا رقم سعودي واضح.
- name: اسم المحل أو الشخص؛ إن لم يظهر استخدم "محل حلاق".
- city/region اختياريان؛ إن لم يظهرا اتركهما فارغين.
- طبّع أرقام السعودية: 05xxxxxxxx أو 9665xxxxxxxx.
- لا تكرّر نفس الرقم مرتين.
- لا تضف حقولاً أخرى.`;

export function normalizeScannedPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('966') && digits.length >= 12) return digits.slice(0, 12);
  if (digits.startsWith('05') && digits.length >= 10) return `966${digits.slice(1, 10)}`;
  if (digits.startsWith('5') && digits.length >= 9) return `966${digits.slice(0, 9)}`;
  if (digits.length >= 10) return digits;
  return null;
}

function cleanLabel(raw: unknown, fallback: string, max = 120): string {
  if (typeof raw !== 'string') return fallback;
  const t = raw.replace(/\s+/g, ' ').trim();
  if (t.length < 2) return fallback;
  return t.slice(0, max);
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
    const name = cleanLabel(row.name, 'محل حلاق', 200);
    const city = cleanLabel(row.city, '', 120);
    const region = cleanLabel(row.region, '', 120);
    byPhone.set(phone, {
      name,
      phone,
      ...(city ? { city } : {}),
      ...(region ? { region } : {}),
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
      'استخرج كل leads ظاهرة في الصورة: الاسم ورقم واتساب/جوال سعودي. ركّز على أرقام المراسلة.',
    imageBase64,
    imageMime,
    timeoutMs: 52_000,
  });

  return parseScanJson(raw);
}
