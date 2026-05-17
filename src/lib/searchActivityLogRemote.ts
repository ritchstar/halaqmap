/**
 * تسجيل نشاط البحث عبر `/api/log-search-activity` (يُنفَّذ على الخادم بمفتاح الخدمة).
 * عند فصل الواجهة عن Vercel استخدم `VITE_REGISTRATION_API_ORIGIN` كما في مسارات التسجيل.
 */
import type { FilterState } from '@/lib/index';
import { SubscriptionTier } from '@/lib/index';

function registrationApiOrigin(): string {
  return String(import.meta.env.VITE_REGISTRATION_API_ORIGIN || '')
    .trim()
    .replace(/\/$/, '');
}

export function logSearchActivityEndpoint(): string {
  const origin = registrationApiOrigin();
  if (!origin) return '/api/log-search-activity';
  return `${origin}/api/log-search-activity`;
}

export type LogSearchScope = 'district' | 'city' | 'service' | 'geo_nearby' | 'filter' | 'composite';

export type LogSearchActivityInput = {
  queryText: string;
  scopeType: LogSearchScope;
  districtName?: string | null;
  cityName?: string | null;
  serviceTags?: string[];
  userLat?: number | null;
  userLng?: number | null;
  /** true عندما وافق المستخدم على استخدام الموقع لعرض النتائج القريبة */
  locationSharing?: boolean;
  filters?: Record<string, unknown>;
  resultCount?: number | null;
  rpcResultCount?: number | null;
};

export async function postLogSearchActivity(input: LogSearchActivityInput): Promise<{ ok: boolean }> {
  try {
    const res = await fetch(logSearchActivityEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        queryText: input.queryText.slice(0, 500),
        scopeType: input.scopeType,
        districtName: input.districtName ?? undefined,
        cityName: input.cityName ?? undefined,
        serviceTags: input.serviceTags,
        userLat: input.userLat ?? undefined,
        userLng: input.userLng ?? undefined,
        locationSharing: input.locationSharing === true,
        filters: input.filters,
        resultCount: input.resultCount ?? undefined,
        rpcResultCount: input.rpcResultCount ?? undefined,
      }),
    });
    if (!res.ok) return { ok: false };
    const j = (await res.json().catch(() => ({}))) as { ok?: boolean };
    return { ok: j.ok === true };
  } catch {
    return { ok: false };
  }
}

const tierAr: Record<SubscriptionTier, string> = {
  [SubscriptionTier.BRONZE]: 'برونزي',
  [SubscriptionTier.GOLD]: 'ذهبي',
  [SubscriptionTier.DIAMOND]: 'ماسي',
};

/** وصف نصي قصير للبحث من الصفحة الرئيسية (للتحليل وليس للعرض للمستخدم). */
export function buildHomeSearchQueryText(input: {
  radiusKm: number;
  filters: FilterState;
  rpcResultCount: number;
  listAfterLocalFilters: number;
}): string {
  const { radiusKm, filters, rpcResultCount, listAfterLocalFilters } = input;
  const tiers =
    filters.tiers.length > 0
      ? filters.tiers.map((t) => tierAr[t] ?? String(t)).join('،')
      : 'كل الباقات';
  const cats = filters.categories.length ? filters.categories.join('،') : 'كل الفئات';
  return `رصد ذكي؛ قربي نصف قطر ${radiusKm}كم؛ تقييم≥${filters.minRating}؛ باقات: ${tiers}؛ فئات خدمة: ${cats}؛ مفتوح الآن: ${filters.openNow ? 'نعم' : 'لا'}؛ نتائج الرصد (خادم): ${rpcResultCount}؛ بعد تصفية الواجهة: ${listAfterLocalFilters}`;
}
