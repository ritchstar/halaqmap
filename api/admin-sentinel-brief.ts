/**
 * GET /api/admin-sentinel-brief
 * - لا يستدعي OpenAI ولا يقرأ OPENAI_API_KEY (الملخص من قاعدة البيانات فقط).
 * - مفاتيح Supabase تُقرأ من بيئة تنفيذ الخادم فقط: process.env.SUPABASE_URL ثم VITE_SUPABASE_URL، و SUPABASE_SERVICE_ROLE_KEY.
 */
import { verifyPlatformAdminFromRequest } from './_lib/adminManageBarbersAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { moderateUserPlaintext } from './_lib/adminSentinelModeration.js';
import { ADMIN_SENTINEL_UI_HEADER, assertSentinelUiHeader } from './_lib/adminSentinelClientHeader.js';
import { rejectIfSentinelProductionPublicOriginsMisconfigured } from './_lib/adminSentinelProductionCorsPolicy.js';

export const config = { maxDuration: 60 };

const CORS_OPTS = {
  allowMethods: 'GET, OPTIONS',
  allowHeaders: `Content-Type, Authorization, x-client-supabase-url, x-supabase-anon, ${ADMIN_SENTINEL_UI_HEADER}`,
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

/** أسماء منطقية للمخطط (تطابق طلب المنتج) ↔ الجداول الفعلية في قاعدة البيانات. */
const DATA_SOURCES = {
  Users_Activity: 'profiles (إنشاء الحسابات) + private_conversations (بدء محادثات)',
  Barbers_Directory: 'public.barbers',
  Chat_Logs: 'private_messages (عينة خادمية) + platform_support_messages (إحصاءات)',
  Subscriptions_Finance: 'public.payments',
  Security_Events: 'public.platform_booking_security_log',
  Subscription_Health: 'payments(status=failed) + registration_submissions(24h) + ping جدول barbers',
} as const;

export async function OPTIONS(request: Request): Promise<Response> {
  const mis = rejectIfSentinelProductionPublicOriginsMisconfigured();
  if (mis) return mis;
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const mis = rejectIfSentinelProductionPublicOriginsMisconfigured();
  if (mis) return mis;

  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const ui = assertSentinelUiHeader(request);
  if (!ui.ok) {
    return Response.json(ui.json, { status: 403, headers: { ...headers, 'Content-Type': 'application/json' } });
  }

  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json({ error: 'Server not configured' }, { status: 503, headers });
  }

  const adminAuth = await verifyPlatformAdminFromRequest(request, url, serviceRole, 'view_command_center');
  if (adminAuth.ok === false) {
    return Response.json(adminAuth.json, { status: adminAuth.status, headers });
  }
  const supabase = adminAuth.supabase;

  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [
    paymentsRes,
    barbersRes,
    securityRes,
    convRes,
    profilesRes,
    supportRes,
    pmRes,
    failedPaymentsRes,
    registrationRecentRes,
    interestCountRes,
  ] = await Promise.all([
    supabase.from('payments').select('amount, status, tier, created_at').gte('created_at', since30d),
    supabase.from('barbers').select('id, name, tier, total_reviews, city, latitude, longitude').limit(5000),
    supabase
      .from('platform_booking_security_log')
      .select('id, severity, created_at')
      .gte('created_at', since7d)
      .limit(2000),
    supabase.from('private_conversations').select('id, started_at').gte('started_at', since30d).limit(5000),
    supabase.from('profiles').select('id, created_at').gte('created_at', since30d).limit(5000),
    supabase.from('platform_support_messages').select('id, created_at').gte('created_at', since30d).limit(5000),
    supabase
      .from('private_messages')
      .select('body, created_at')
      .order('created_at', { ascending: false })
      .limit(120),
    supabase
      .from('payments')
      .select('id, barber_id, created_at, notes, transaction_id')
      .eq('status', 'failed')
      .gte('created_at', since30d)
      .order('created_at', { ascending: false })
      .limit(4000),
    supabase
      .from('registration_submissions')
      .select('id, created_at, payload')
      .gte('created_at', since24h)
      .order('created_at', { ascending: false })
      .limit(600),
    supabase
      .from('barber_interest_signups')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since24h),
  ]);

  const pingT0 = Date.now();
  const pingRes = await supabase.from('barbers').select('id').limit(1);
  const supabasePingMs = Date.now() - pingT0;
  const supabasePingOk = !pingRes.error;

  type RegPayload = { status?: string; barberName?: string; shopName?: string; email?: string; source?: string };
  const regRows = (registrationRecentRes.data ?? []) as { id: string; created_at: string; payload: unknown }[];
  const stuckSubmissions = regRows.filter((row) => {
    const p = (row.payload && typeof row.payload === 'object' ? row.payload : {}) as RegPayload;
    const st = String(p.status ?? 'pending').toLowerCase();
    return st === 'pending';
  });
  const stuckSample = stuckSubmissions.slice(0, 12).map((row) => {
    const p = row.payload as RegPayload;
    const label = String(p.barberName || p.shopName || p.email || row.id).slice(0, 80);
    return { id: row.id, createdAt: row.created_at, label };
  });

  const failedRows = (failedPaymentsRes.data ?? []) as {
    id: string;
    barber_id: string;
    created_at: string;
    notes: string | null;
    transaction_id: string | null;
  }[];
  const failCountByBarber = new Map<string, number>();
  for (const fr of failedRows) {
    const bid = String(fr.barber_id ?? '');
    if (!bid) continue;
    failCountByBarber.set(bid, (failCountByBarber.get(bid) ?? 0) + 1);
  }
  const recurringFailures = [...failCountByBarber.entries()]
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([barberId, failedCount]) => ({ barberId, failedCount }));

  let recurringWithNames = recurringFailures as { barberId: string; failedCount: number; barberName: string }[];
  if (recurringFailures.length > 0) {
    const ids = recurringFailures.map((r) => r.barberId);
    const { data: nameRows } = await supabase.from('barbers').select('id, name').in('id', ids);
    const nameMap = new Map((nameRows ?? []).map((n) => [String((n as { id: string }).id), String((n as { name: string }).name)]));
    recurringWithNames = recurringFailures.map((r) => ({
      ...r,
      barberName: nameMap.get(r.barberId) ?? '—',
    }));
  } else {
    recurringWithNames = [];
  }

  const interestSignups24h =
    !interestCountRes.error && typeof interestCountRes.count === 'number' ? interestCountRes.count : null;

  const payRows = (paymentsRes.data ?? []) as {
    amount: string | number | null;
    status: string | null;
    tier: string | null;
  }[];

  let completedSar = 0;
  let pendingSar = 0;
  let refundedSar = 0;
  const byTier: Record<string, { completed: number; pending: number; refunded: number }> = {};

  let completedPaymentCount = 0;
  for (const r of payRows) {
    const amt = Number(r.amount ?? 0);
    const st = String(r.status ?? '');
    const tier = String(r.tier ?? 'unknown');
    if (!byTier[tier]) byTier[tier] = { completed: 0, pending: 0, refunded: 0 };
    if (st === 'completed') {
      completedSar += amt;
      completedPaymentCount += 1;
      byTier[tier].completed += amt;
    } else if (st === 'pending') {
      pendingSar += amt;
      byTier[tier].pending += amt;
    } else if (st === 'refunded') {
      refundedSar += amt;
      byTier[tier].refunded += amt;
    }
  }

  const barbers = (barbersRes.data ?? []) as {
    id: string;
    name: string;
    tier: string | null;
    total_reviews: number | null;
    city: string | null;
  }[];

  const tierCounts: Record<string, number> = {};
  for (const b of barbers) {
    const t = String(b.tier ?? 'bronze');
    tierCounts[t] = (tierCounts[t] ?? 0) + 1;
  }

  const highTrafficNoUpgrade = barbers
    .filter((b) => String(b.tier).toLowerCase() === 'bronze' && Number(b.total_reviews ?? 0) >= 12)
    .sort((a, b) => Number(b.total_reviews ?? 0) - Number(a.total_reviews ?? 0))
    .slice(0, 25)
    .map((b) => ({
      barberId: b.id,
      name: b.name,
      tier: b.tier,
      totalReviews: Number(b.total_reviews ?? 0),
      note: 'زيارات/تقييمات مرتفعة نسبياً مع باقة برونز — فرصة ترقية',
    }));

  const securityRows = (securityRes.data ?? []) as { severity: string | null }[];
  const sevCounts: Record<string, number> = {};
  for (const s of securityRows) {
    const k = String(s.severity ?? 'unknown');
    sevCounts[k] = (sevCounts[k] ?? 0) + 1;
  }

  const convStarts = (convRes.data ?? []).length;
  const newProfiles = (profilesRes.data ?? []).length;
  const supportMsgs = (supportRes.data ?? []).length;

  let pmUrlHits = 0;
  let pmBypassHits = 0;
  let pmProfanityHits = 0;
  const pmBodies = (pmRes.data ?? []) as { body: string }[];
  for (const row of pmBodies) {
    const m = moderateUserPlaintext(String(row.body ?? ''));
    if (m.reasons.includes('link')) pmUrlHits += 1;
    if (m.reasons.includes('circumvention_hint')) pmBypassHits += 1;
    if (m.reasons.includes('profanity')) pmProfanityHits += 1;
  }

  const cityMap = new Map<string, number>();
  for (const b of barbers) {
    const c = (b.city || '').trim();
    if (!c) continue;
    cityMap.set(c, (cityMap.get(c) ?? 0) + 1);
  }
  const geoHotspots = [...cityMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([city, barberCount]) => ({ city, barberCount }));

  const activitySignals30d = convStarts + supportMsgs + newProfiles;
  const conversionRate =
    activitySignals30d > 0 ? Math.round((completedPaymentCount / activitySignals30d) * 10_000) / 100 : null;

  const subscriptionHealth = {
    paymentFailureRadar: {
      windowDays: 30,
      queryError: failedPaymentsRes.error?.message ?? null,
      failedPaymentsTotal: failedRows.length,
      distinctBarbersWithFailure: failCountByBarber.size,
      recurringFailureBarbers: recurringWithNames,
      recurringThreshold: 2,
      description: 'سجلات payments بحالة failed؛ «متكرر» = نفس barber_id ظهر فيه فشلان أو أكثر خلال النافذة.',
    },
    stuckFormsRadar: {
      windowHours: 24,
      registrationQueryError: registrationRecentRes.error?.message ?? null,
      interestSignups24h,
      interestQueryError: interestCountRes.error?.message ?? null,
      pendingPartnerSubmissions: stuckSubmissions.length,
      totalSubmissionsScanned24h: regRows.length,
      samplePending: stuckSample,
      description:
        'طلبات registration_submissions المُنشأة خلال 24 ساعة وما زالت pending في الحمولة (لم تُوافق/تُرفض بعد).',
    },
    supabaseLatency: {
      roundTripMs: supabasePingMs,
      ok: supabasePingOk,
      pingError: pingRes.error?.message ?? null,
      measuredAt: new Date().toISOString(),
      description: 'زمن استجابة استعلام واحد (SELECT id FROM barbers LIMIT 1) من دالة Vercel إلى Supabase.',
    },
  };

  const executiveSummary = buildExecutiveSummary({
    completedSar,
    pendingSar,
    refundedSar,
    securityEvents7d: securityRows.length,
    sevCounts,
    leaksCount: highTrafficNoUpgrade.length,
    chatRisk: { sampleSize: pmBodies.length, pmUrlHits, pmBypassHits, pmProfanityHits },
    failedPaymentsTotal: failedRows.length,
    recurringFailureBarbers: recurringWithNames.length,
    stuckPending24h: stuckSubmissions.length,
    supabasePingMs,
  });

  return Response.json(
    {
      ok: true,
      dataSources: DATA_SOURCES,
      subscriptionHealth,
      sales: {
        periodDays: 30,
        completedSar,
        pendingSar,
        refundedSar,
        byTier,
        conversionProxy: {
          privateConversationStarts30d: convStarts,
          newProfiles30d: newProfiles,
          supportMessages30d: supportMsgs,
          activitySignals30d,
          completedPayments30d: completedPaymentCount,
          conversionRatePercent: conversionRate,
          conversionRateNote:
            activitySignals30d === 0
              ? 'لا إشارات نشاط في النافذة — لا يُحسب معدل تحويل.'
              : 'مؤشر تقريبي: عدد مدفوعات مكتملة / (محادثات خاصة + رسائل دعم + ملفات جديدة) خلال 30 يوماً.',
        },
      },
      directory: { totalBarbers: barbers.length, tierCounts },
      security: { eventsLast7d: securityRows.length, bySeverity: sevCounts },
      chatCompliance: {
        privateMessageSampleScanned: pmBodies.length,
        flags: { urls: pmUrlHits, circumventionHints: pmBypassHits, profanity: pmProfanityHits },
      },
      salesAuditor: {
        missedUpgradeOpportunities: highTrafficNoUpgrade,
      },
      geo: { hotspotsByBarberCount: geoHotspots },
      executiveSummary,
    },
    { headers },
  );
}

function buildExecutiveSummary(args: {
  completedSar: number;
  pendingSar: number;
  refundedSar: number;
  securityEvents7d: number;
  sevCounts: Record<string, number>;
  leaksCount: number;
  chatRisk: { sampleSize: number; pmUrlHits: number; pmBypassHits: number; pmProfanityHits: number };
  failedPaymentsTotal: number;
  recurringFailureBarbers: number;
  stuckPending24h: number;
  supabasePingMs: number;
}): { salesLine: string; securityLine: string; revenueRecommendation: string } {
  const highSev = (args.sevCounts.error ?? 0) + (args.sevCounts.critical ?? 0);
  const salesLine = `آخر 30 يوماً: ${args.completedSar.toFixed(2)} ر.س مكتملة، ${args.pendingSar.toFixed(2)} معلّقة، ${args.refundedSar.toFixed(2)} مستردة.`;
  const securityLine = `آخر 7 أيام: ${args.securityEvents7d} حدث أمني${highSev ? ` (خطورة مرتفعة تقريباً: ${highSev})` : ''}. عيّنة شات: ${args.chatRisk.sampleSize} رسالة — روابط/التفاف/نابية: ${args.chatRisk.pmUrlHits}/${args.chatRisk.pmBypassHits}/${args.chatRisk.pmProfanityHits}.`;
  let revenueRecommendation =
    args.leaksCount > 0
      ? `ركّز على ترقية ${args.leaksCount} حلّاق برونزي بمراجعات قوية — أعلى عائد متوقع من الباقات.`
      : 'راجع الحملات الإقليمية على المدن ذات كثافة الحلاقين في لوحة التحليل المكاني.';
  if (args.pendingSar > args.completedSar * 0.25) {
    revenueRecommendation += ' لديكم معلّقات مرتفعة نسبياً: تابعوا تأكيد التحويلات البنكية/بوابات الدفع.';
  }
  const healthBits: string[] = [];
  if (args.failedPaymentsTotal > 0) {
    healthBits.push(
      `فشل دفع: ${args.failedPaymentsTotal} سجل خلال 30 يوماً${args.recurringFailureBarbers ? `؛ ${args.recurringFailureBarbers} حلاق بتكرار فشل` : ''}.`,
    );
  }
  if (args.stuckPending24h > 0) {
    healthBits.push(`نماذج شركاء معلّقة (<24س): ${args.stuckPending24h}.`);
  }
  healthBits.push(`استجابة Supabase (ping): ${args.supabasePingMs}ms.`);
  if (healthBits.length) revenueRecommendation += ` ${healthBits.join(' ')}`;
  return { salesLine, securityLine, revenueRecommendation };
}
