/**
 * GET /api/admin-growth-architect
 * Growth Architect Agent — first tactical marketing recommendation.
 *
 * Activated automatically once Engineering Wing handshake reports OK.
 * بعد إزالة سجل البحث الجغرافي من الخلفية، يعود هذا المسار
 * برسالة تعطيل نظيفة بدل الاعتماد على user_searches.
 *
 * Read-only — no schema changes, no destructive operations.
 */
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { readStoredHandshake } from './_lib/engineeringWingHandshake.js';

export const config = { maxDuration: 25 };

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
    },
  });
}

type UserSearchSlim = {
  city_name: string | null;
  district_name: string | null;
  suspicious: boolean;
  result_count: number | null;
  rpc_result_count: number | null;
  created_at: string;
};

type CityAggregate = {
  cityName: string;
  searches7d: number;
  searches24h: number;
  avgResultCount: number;
  zeroResultRatio: number;
  topDistricts: { district: string; count: number }[];
};

type GrowthRecommendation = {
  id: string;
  priority: 'P0' | 'P1' | 'P2';
  scope: 'recruit_barbers' | 'ads_focus' | 'expand_district' | 'monitor';
  cityAr: string;
  districtAr?: string;
  rationaleAr: string;
  metric: {
    searches7d: number;
    searches24h: number;
    zeroResultRatio: number;
  };
  callToActionAr: string;
};

function aggregateByCity(rows: UserSearchSlim[]): CityAggregate[] {
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  const byCity = new Map<
    string,
    {
      searches7d: number;
      searches24h: number;
      resultCountSum: number;
      resultCountSamples: number;
      zeroResultCount: number;
      districts: Map<string, number>;
    }
  >();

  for (const row of rows) {
    const city = (row.city_name || '').trim();
    if (!city) continue;

    const createdMs = Date.parse(row.created_at);
    if (!Number.isFinite(createdMs)) continue;
    const ageMs = now - createdMs;
    if (ageMs > 7 * ONE_DAY_MS) continue;

    let bucket = byCity.get(city);
    if (!bucket) {
      bucket = {
        searches7d: 0,
        searches24h: 0,
        resultCountSum: 0,
        resultCountSamples: 0,
        zeroResultCount: 0,
        districts: new Map(),
      };
      byCity.set(city, bucket);
    }

    bucket.searches7d += 1;
    if (ageMs <= ONE_DAY_MS) bucket.searches24h += 1;

    const resultCount = row.rpc_result_count ?? row.result_count;
    if (typeof resultCount === 'number' && Number.isFinite(resultCount)) {
      bucket.resultCountSum += resultCount;
      bucket.resultCountSamples += 1;
      if (resultCount === 0) bucket.zeroResultCount += 1;
    }

    const district = (row.district_name || '').trim();
    if (district) {
      bucket.districts.set(district, (bucket.districts.get(district) ?? 0) + 1);
    }
  }

  return Array.from(byCity.entries())
    .map(([cityName, bucket]) => ({
      cityName,
      searches7d: bucket.searches7d,
      searches24h: bucket.searches24h,
      avgResultCount:
        bucket.resultCountSamples > 0
          ? Math.round((bucket.resultCountSum / bucket.resultCountSamples) * 10) / 10
          : 0,
      zeroResultRatio:
        bucket.resultCountSamples > 0
          ? Math.round((bucket.zeroResultCount / bucket.resultCountSamples) * 100) / 100
          : 0,
      topDistricts: Array.from(bucket.districts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([district, count]) => ({ district, count })),
    }))
    .sort((a, b) => b.searches7d - a.searches7d);
}

function buildRecommendations(cities: CityAggregate[]): GrowthRecommendation[] {
  const recs: GrowthRecommendation[] = [];
  let counter = 0;

  for (const city of cities.slice(0, 6)) {
    counter += 1;

    // Strongest signal: high demand + low fulfillment → recruit barbers
    if (city.zeroResultRatio >= 0.4 && city.searches7d >= 10) {
      recs.push({
        id: `rec-${counter}-recruit`,
        priority: city.zeroResultRatio >= 0.6 ? 'P0' : 'P1',
        scope: 'recruit_barbers',
        cityAr: city.cityName,
        districtAr: city.topDistricts[0]?.district,
        rationaleAr: `طلب مرتفع غير مُلبَّى في ${city.cityName} — ${Math.round(city.zeroResultRatio * 100)}% من عمليات البحث أعادت 0 نتائج خلال آخر 7 أيام.`,
        metric: {
          searches7d: city.searches7d,
          searches24h: city.searches24h,
          zeroResultRatio: city.zeroResultRatio,
        },
        callToActionAr: 'تجنيد حلاقين معتمدين في هذه المدينة — هذه فرصة P0/P1 لاكتساب حصة سوقية بسرعة.',
      });
      continue;
    }

    // Strong steady demand + decent fulfillment → push ads
    if (city.searches7d >= 25 && city.avgResultCount >= 3) {
      recs.push({
        id: `rec-${counter}-ads`,
        priority: city.searches7d >= 80 ? 'P1' : 'P2',
        scope: 'ads_focus',
        cityAr: city.cityName,
        districtAr: city.topDistricts[0]?.district,
        rationaleAr: `${city.cityName} — ${city.searches7d} بحث خلال 7 أيام · ${city.searches24h} في آخر 24 ساعة. الإمداد متوفر (${city.avgResultCount} نتيجة بالمتوسط) — استثمار إعلاني هنا يضاعف التحويل.`,
        metric: {
          searches7d: city.searches7d,
          searches24h: city.searches24h,
          zeroResultRatio: city.zeroResultRatio,
        },
        callToActionAr: city.topDistricts[0]
          ? `أطلق حملة Google/Meta Ads مستهدفة لحي ${city.topDistricts[0].district} في ${city.cityName}.`
          : `أطلق حملة Google/Meta Ads مستهدفة لمدينة ${city.cityName}.`,
      });
      continue;
    }

    // Low demand or new city — monitor
    if (city.searches7d > 0) {
      recs.push({
        id: `rec-${counter}-monitor`,
        priority: 'P2',
        scope: 'monitor',
        cityAr: city.cityName,
        districtAr: city.topDistricts[0]?.district,
        rationaleAr: `${city.cityName} — مستوى طلب أولي (${city.searches7d} بحث/7 أيام). مراقبة فقط قبل أي استثمار.`,
        metric: {
          searches7d: city.searches7d,
          searches24h: city.searches24h,
          zeroResultRatio: city.zeroResultRatio,
        },
        callToActionAr: 'مراقبة الإشارة لمدة 14 يوماً قبل اتخاذ إجراء.',
      });
    }
  }

  // If no recs at all (cold-start / no data), seed a default observation.
  if (recs.length === 0) {
    recs.push({
      id: 'rec-cold-start',
      priority: 'P2',
      scope: 'monitor',
      cityAr: 'لا توجد بيانات كافية بعد',
      rationaleAr:
        'سجل البحث لا يحتوي على إشارات كافية لاستخراج توصيات استراتيجية حالياً — تحتاج المنظومة إلى 7+ أيام من حركة المستخدمين قبل تفعيل أولى توصيات النمو.',
      metric: { searches7d: 0, searches24h: 0, zeroResultRatio: 0 },
      callToActionAr:
        'هذا المسار متوقف حالياً بعد حذف سجل البحث الجغرافي من الخلفية التزاماً بنهج المعالجة اللحظية.',
    });
  }

  return recs;
}

export async function GET(request: Request): Promise<Response> {
  const serverUrl = (process.env.SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceKey, [
    'manage_admins',
    'view_overview',
  ]);
  if (auth.ok === false) return json(auth.json, auth.status);

  // Gate behind Engineering Wing — Growth Architect activates only after handshake OK.
  let handshakeOk = false;
  try {
    const stored = await readStoredHandshake(auth.supabase);
    handshakeOk = Boolean(stored?.ops_controller_enabled);
  } catch {
    handshakeOk = false;
  }

  if (!handshakeOk) {
    return json({
      ok: true,
      activated: false,
      gateMessageAr:
        'مهندس النمو معطّل — ينتظر Handshake OK من الجناح الهندسي قبل تفعيل التوصيات التسويقية.',
      recommendations: [],
    });
  }
  return json({
    ok: true,
    activated: false,
    generatedAt: new Date().toISOString(),
    gateMessageAr:
      'تم إيقاف توصيات الطلب الجغرافي بعد حذف سجل البحث من الخلفية التزاماً بنهج المعالجة اللحظية في الذاكرة فقط.',
    sample: {
      searchCount7d: 0,
      citiesAnalyzed: 0,
    },
    topCities: [],
    recommendations: [],
  });
}
