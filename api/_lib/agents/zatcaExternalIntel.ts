import type { ZatcaExternalIntelBrief, ZatcaIntelSourceHit } from './zatcaTaxTypes.js';

const INTEL_CACHE_MS = 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 12_000;

/** مصادر رسمية وذات صلة — ZATCA / ضريبة القيمة المضافة / الزكاة */
const ZATCA_INTEL_SOURCES: { id: string; url: string; labelAr: string; orgAr: string }[] = [
  {
    id: 'zatca_vat_rules',
    url: 'https://zatca.gov.sa/en/RulesRegulations/Pages/VAT.aspx',
    labelAr: 'لوائح ضريبة القيمة المضافة',
    orgAr: 'هيئة الزكاة والضريبة والجمارك (ZATCA)',
  },
  {
    id: 'zatca_vat_services',
    url: 'https://zatca.gov.sa/en/eServices/Pages/VATServices.aspx',
    labelAr: 'خدمات ضريبة القيمة المضافة الإلكترونية',
    orgAr: 'ZATCA',
  },
  {
    id: 'zatca_vat_registration',
    url: 'https://zatca.gov.sa/en/eServices/Pages/eServices_009.aspx',
    labelAr: 'التسجيل في ضريبة القيمة المضافة',
    orgAr: 'ZATCA',
  },
  {
    id: 'zatca_about_ar',
    url: 'https://zatca.gov.sa/ar/aboutUs/Pages/default.aspx',
    labelAr: 'نبذة عن الهيئة — تحديثات وإعلانات',
    orgAr: 'ZATCA',
  },
];

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMeta(html: string, name: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`,
    'i',
  );
  const m = html.match(re);
  if (m?.[1]) return stripHtml(m[1]).slice(0, 400);
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`,
    'i',
  );
  const m2 = html.match(re2);
  return m2?.[1] ? stripHtml(m2[1]).slice(0, 400) : null;
}

function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m?.[1] ? stripHtml(m[1]).slice(0, 200) : null;
}

async function fetchSourceHit(source: (typeof ZATCA_INTEL_SOURCES)[number]): Promise<ZatcaIntelSourceHit> {
  const fetchedAt = new Date().toISOString();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'HalaqMap-ZatcaAdvisor/1.0 (compliance-intel; admin-only)',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'ar,en;q=0.9',
      },
      redirect: 'follow',
    });

    if (!res.ok) {
      return {
        id: source.id,
        url: source.url,
        labelAr: source.labelAr,
        orgAr: source.orgAr,
        fetchedAt,
        ok: false,
        errorAr: `تعذر الوصول (${res.status})`,
      };
    }

    const html = await res.text();
    const title = extractTitle(html) || source.labelAr;
    const description =
      extractMeta(html, 'description') ||
      extractMeta(html, 'og:description') ||
      stripHtml(html).slice(0, 280);

    return {
      id: source.id,
      url: source.url,
      labelAr: source.labelAr,
      orgAr: source.orgAr,
      fetchedAt,
      ok: true,
      title,
      snippetAr: description || 'تمت قراءة الصفحة — راجع الرابط للتفاصيل الكاملة.',
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'fetch_failed';
    return {
      id: source.id,
      url: source.url,
      labelAr: source.labelAr,
      orgAr: source.orgAr,
      fetchedAt,
      ok: false,
      errorAr: msg.includes('abort') ? 'انتهت مهلة الاتصال بالمصدر' : 'تعذر جلب المصدر',
    };
  } finally {
    clearTimeout(timer);
  }
}

export function isZatcaIntelStale(cached: ZatcaExternalIntelBrief | null | undefined, nowMs = Date.now()): boolean {
  if (!cached?.fetchedAt) return true;
  const t = Date.parse(cached.fetchedAt);
  if (!Number.isFinite(t)) return true;
  return nowMs - t > INTEL_CACHE_MS;
}

export async function fetchZatcaExternalIntel(
  existing?: ZatcaExternalIntelBrief | null,
  options?: { force?: boolean },
): Promise<ZatcaExternalIntelBrief> {
  if (!options?.force && existing && !isZatcaIntelStale(existing)) {
    return existing;
  }

  const hits = await Promise.all(ZATCA_INTEL_SOURCES.map((s) => fetchSourceHit(s)));
  const okCount = hits.filter((h) => h.ok).length;

  return {
    fetchedAt: new Date().toISOString(),
    sources: hits,
    summaryAr:
      okCount > 0
        ? `تم مسح ${okCount} من ${hits.length} مصادر ZATCA ذات الصلة — راجع المقتطفات وتابع الروابط الرسمية للتحديثات التنظيمية.`
        : 'تعذر الوصول للمصادر الخارجية حالياً — التقرير الاستباقي يعتمد على حدود ZATCA المُبرمجة في المنصة.',
    learningTopicsAr: [
      'حد التسجيل الاختياري والإلزامي للضريبة (187,500 / 375,000 ر.س)',
      `نسبة ضريبة القيمة المضافة المعتمدة في المنصة (${15}%)`,
      'متى يُفعَّل عرض الضريبة على واجهات الدفع للعملاء',
      'الفوترة الإلكترونية والامتثال لـ ZATCA',
    ],
  };
}
