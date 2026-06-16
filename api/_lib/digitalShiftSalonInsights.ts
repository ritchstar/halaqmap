import type { SupabaseClient } from '@supabase/supabase-js';
import { assessMarketStagnation } from './fleetDemandSignals.js';
import {
  bannerVisionFindingsForAudit,
  bannerVisionFingerprint,
  formatBannerVisionForPrompt,
  runBannerVisionAudit,
  type BannerVisionAudit,
} from './digitalShiftBannerVision.js';
import { emitFleetOperationalPulse } from './fleetOperationalPulse.js';
import {
  refreshHeuristicRecommendations,
  type AiRecommendationRow,
  type DigitalShiftContext,
  type RecommendationInput,
} from './digitalShiftAssistant.js';

export type SalonInsightsOptions = {
  /** تشغيل Vision (مع cache 24h) — مكلف؛ يُستخدم عند refresh أو سؤال عن البنر */
  runBannerVision?: boolean;
  forceBannerVision?: boolean;
  /** مصدر النبض الصاعد لقيادة الأسطول */
  pulseSource?: 'refresh' | 'barber_chat' | 'banner_chat';
};

export { isBannerRelatedChatMessage } from './digitalShiftBannerVision.js';

export type BannerUrlProbeStatus = 'ok' | 'broken' | 'local_only' | 'invalid' | 'timeout';

export type BannerUrlProbe = {
  url: string;
  status: BannerUrlProbeStatus;
  httpStatus?: number;
};

export type SalonOperationalAudit = {
  refreshedAt: string;
  bannerCount: number;
  showDiscountBadge: boolean;
  discountPercent: number | null;
  bannerProbes: BannerUrlProbe[];
  shopOpen: boolean;
  listingDaysRemaining: number;
  walletBalanceHalalas: number;
  walletLow: boolean;
  galleryCount: number;
  stagnation: {
    stagnant: boolean;
    conversations7d: number;
    daysSinceLastContact: number | null;
  };
  bannerVision: BannerVisionAudit | null;
  findingsAr: string[];
};

type BannerSnapshot = {
  bannerImageUrls?: string[];
  showDiscountBadge?: boolean;
  discountPercent?: number | null;
  syncedAt?: string;
  visionAudit?: BannerVisionAudit;
};

type GallerySnapshotItem = { id?: string; createdAt?: string; imageUrl?: string };

export async function loadGalleryItemsFromDb(
  supabase: SupabaseClient,
  barberId: string,
): Promise<NonNullable<RecommendationInput['galleryItems']>> {
  const { data } = await supabase
    .from('barber_gallery_items')
    .select('id, public_url, created_at')
    .eq('barber_id', barberId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(50);

  return (data ?? []).map((row) => {
    const r = row as { id?: string; public_url?: string; created_at?: string };
    return {
      id: String(r.id ?? ''),
      createdAt: r.created_at ? String(r.created_at) : undefined,
      imageUrl: r.public_url ? String(r.public_url) : undefined,
    };
  });
}

export async function persistSalonSnapshot(
  supabase: SupabaseClient,
  barberId: string,
  input: RecommendationInput,
): Promise<{ syncedAt: string }> {
  const syncedAt = new Date().toISOString();
  const bannerUrls = (input.bannerImageUrls ?? []).map((u) => u.trim()).filter(Boolean).slice(0, 12);
  const gallery = (input.galleryItems ?? []).slice(0, 50);
  const fp = bannerVisionFingerprint(input);

  const { data: existing } = await supabase
    .from('barber_digital_shift_config')
    .select('banner_snapshot')
    .eq('barber_id', barberId)
    .maybeSingle();

  const prevSnap = (existing?.banner_snapshot ?? null) as BannerSnapshot | null;
  const keepVision =
    prevSnap?.visionAudit && prevSnap.visionAudit.fingerprint === fp
      ? prevSnap.visionAudit
      : undefined;

  const { error } = await supabase
    .from('barber_digital_shift_config')
    .update({
      banner_snapshot: {
        bannerImageUrls: bannerUrls,
        showDiscountBadge: input.showDiscountBadge ?? false,
        discountPercent: input.discountPercent ?? null,
        syncedAt,
        ...(keepVision ? { visionAudit: keepVision } : {}),
      },
      gallery_snapshot: gallery,
    })
    .eq('barber_id', barberId);

  if (error) throw new Error(error.message);
  return { syncedAt };
}

export function formatCustomerSalonContextForPrompt(
  ctx: DigitalShiftContext,
  input: RecommendationInput,
): string {
  const lines: string[] = ['【سياق الصالون الموثّق — للمناوب فقط】'];

  lines.push(`- حالة المحل: ${ctx.shopOpen ? 'مفتوح للزبائن' : 'مغلق حالياً'}`);

  const banners = input.bannerImageUrls ?? [];
  if (banners.length > 0) {
    lines.push(`- بنر نشط: ${banners.length} صورة`);
  }

  if (input.showDiscountBadge && input.discountPercent != null && input.discountPercent > 0) {
    lines.push(`- عرض بنر مفعّل: خصم ${input.discountPercent}% — يمكن ذكره للعميل إن سأل عن العروض`);
  } else if (banners.length > 0) {
    lines.push('- لا يوجد خصم مفعّل على البنر حالياً — لا تعد بخصم');
  }

  const gallery = input.galleryItems ?? [];
  if (gallery.length > 0) {
    lines.push(`- معرض أعمال: ${gallery.length} صورة — يمكن الإشارة لجودة الأعمال دون وعود`);
  }

  lines.push('- لا تذكر للعميل: رصيد المحفظة، أيام الحزمة، روابط معطّلة، أو تفاصيل فنية داخلية');

  return lines.join('\n');
}

export function parseRecommendationInputFromBody(body: Record<string, unknown>): RecommendationInput {
  const input: RecommendationInput = {};

  if (Array.isArray(body.bannerImageUrls)) {
    input.bannerImageUrls = (body.bannerImageUrls as unknown[])
      .map(String)
      .map((u) => u.trim())
      .filter(Boolean)
      .slice(0, 12);
  }

  if (body.showDiscountBadge !== undefined && body.showDiscountBadge !== null) {
    input.showDiscountBadge = body.showDiscountBadge === true;
  }

  if (body.discountPercent !== undefined && body.discountPercent !== '') {
    const n = Number(body.discountPercent);
    input.discountPercent = Number.isFinite(n) ? n : null;
  } else if (body.discountPercent === null || body.discountPercent === '') {
    input.discountPercent = null;
  }

  if (Array.isArray(body.galleryItems)) {
    input.galleryItems = (body.galleryItems as GallerySnapshotItem[]).map((g) => ({
      id: String(g.id ?? ''),
      createdAt: g.createdAt ? String(g.createdAt) : undefined,
      imageUrl: g.imageUrl ? String(g.imageUrl) : undefined,
    }));
  }

  return input;
}

export async function resolveRecommendationInput(
  supabase: SupabaseClient,
  barberId: string,
  body: Record<string, unknown>,
): Promise<RecommendationInput> {
  const fromBody = parseRecommendationInputFromBody(body);

  const { data: cfg } = await supabase
    .from('barber_digital_shift_config')
    .select('banner_snapshot, gallery_snapshot')
    .eq('barber_id', barberId)
    .maybeSingle();

  const bannerSnap = (cfg?.banner_snapshot ?? null) as BannerSnapshot | null;
  const gallerySnap = Array.isArray(cfg?.gallery_snapshot)
    ? (cfg.gallery_snapshot as GallerySnapshotItem[])
    : null;

  const galleryFromSnap =
    gallerySnap && gallerySnap.length > 0
      ? gallerySnap.map((g) => ({
          id: String(g.id ?? ''),
          createdAt: g.createdAt ? String(g.createdAt) : undefined,
          imageUrl: g.imageUrl ? String(g.imageUrl) : undefined,
        }))
      : null;

  let galleryItems =
    fromBody.galleryItems ??
    galleryFromSnap ??
    [];

  if (galleryItems.length === 0) {
    galleryItems = await loadGalleryItemsFromDb(supabase, barberId);
  }

  return {
    bannerImageUrls:
      fromBody.bannerImageUrls ??
      (Array.isArray(bannerSnap?.bannerImageUrls) ? bannerSnap.bannerImageUrls : []),
    showDiscountBadge:
      fromBody.showDiscountBadge !== undefined
        ? fromBody.showDiscountBadge
        : Boolean(bannerSnap?.showDiscountBadge),
    discountPercent:
      fromBody.discountPercent !== undefined
        ? fromBody.discountPercent
        : (bannerSnap?.discountPercent ?? null),
    galleryItems,
  };
}

async function probeOneBannerUrl(url: string): Promise<BannerUrlProbe> {
  const trimmed = url.trim();
  if (!trimmed) return { url: trimmed, status: 'invalid' };
  if (trimmed.startsWith('blob:')) return { url: trimmed, status: 'local_only' };
  if (trimmed.startsWith('data:')) return { url: '[data-url]', status: 'ok' };

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { url: trimmed.slice(0, 120), status: 'invalid' };
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { url: trimmed.slice(0, 120), status: 'invalid' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4500);
  try {
    const res = await fetch(trimmed, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    });
    if (res.ok) return { url: trimmed.slice(0, 160), status: 'ok', httpStatus: res.status };
    if (res.status === 405 || res.status === 501) {
      const getRes = await fetch(trimmed, {
        method: 'GET',
        signal: controller.signal,
        redirect: 'follow',
        headers: { Range: 'bytes=0-0' },
      });
      return {
        url: trimmed.slice(0, 160),
        status: getRes.ok ? 'ok' : 'broken',
        httpStatus: getRes.status,
      };
    }
    return { url: trimmed.slice(0, 160), status: 'broken', httpStatus: res.status };
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      return { url: trimmed.slice(0, 160), status: 'timeout' };
    }
    return { url: trimmed.slice(0, 160), status: 'broken' };
  } finally {
    clearTimeout(timer);
  }
}

export async function probeBannerImageUrls(urls: string[]): Promise<BannerUrlProbe[]> {
  const unique = [...new Set(urls.map((u) => u.trim()).filter(Boolean))].slice(0, 8);
  return Promise.all(unique.map((url) => probeOneBannerUrl(url)));
}

function buildFindingsAr(
  ctx: DigitalShiftContext,
  input: RecommendationInput,
  probes: BannerUrlProbe[],
  stagnation: SalonOperationalAudit['stagnation'],
  bannerVision: BannerVisionAudit | null,
): string[] {
  const findings: string[] = [];
  const banners = input.bannerImageUrls ?? [];

  if (ctx.listingDaysRemaining <= 0) {
    findings.push('🚨 حزمة رخصة النفاذ منتهية — الصالون غير ظاهر على المنصة حتى التجديد.');
  } else if (ctx.listingDaysRemaining <= 7) {
    findings.push(`⚠️ حزمة رخصة النفاذ تنتهي خلال ${ctx.listingDaysRemaining} يوماً.`);
  }

  if (!ctx.shopOpen) {
    findings.push('⚠️ المحل مُعلَّن «مغلق للزبائن» في لوحة التحكم — يقلل الظهور والتواصل.');
  }

  if (ctx.walletBalanceHalalas <= ctx.walletLowThresholdHalalas) {
    findings.push(
      `⚠️ رصيد محفظة المناوب منخفض (${(ctx.walletBalanceHalalas / 100).toFixed(2)} ر.س) — قد يتوقف الرد الآلي.`,
    );
  }

  if (banners.length === 0) {
    findings.push('❌ لا توجد صور بنر مفعّلة — أضف بنراً من لوحة التحكم.');
  } else {
    findings.push(`✓ عدد صور البنر: ${banners.length}.`);
    const broken = probes.filter((p) => p.status === 'broken' || p.status === 'timeout');
    const localOnly = probes.filter((p) => p.status === 'local_only');
    const invalid = probes.filter((p) => p.status === 'invalid');
    if (broken.length > 0) {
      findings.push(`❌ ${broken.length} رابط بنر لا يستجيب أو معطّل — أعد رفع الصورة من اللوحة.`);
    }
    if (localOnly.length > 0) {
      findings.push(
        `⚠️ ${localOnly.length} صورة بنر محلية على الجهاز فقط — احفظ/ارفع من اللوحة ثم حدّث التوصيات.`,
      );
    }
    if (invalid.length > 0) {
      findings.push(`❌ ${invalid.length} رابط بنر غير صالح — راجع إعدادات البنر.`);
    }
    if (input.showDiscountBadge && (input.discountPercent == null || input.discountPercent <= 0)) {
      findings.push('⚠️ شارة الخصم مفعّلة دون نسبة خصم — أدخل نسبة أو عطّل الشارة.');
    } else if (input.showDiscountBadge && input.discountPercent != null && input.discountPercent > 90) {
      findings.push('⚠️ نسبة الخصم مرتفعة جداً — راجع إعداد البنر.');
    } else if (!input.showDiscountBadge && banners.length > 0) {
      findings.push('💡 البنر موجود دون شارة خصم — فكّر بعرض موسمي لرفع النقرات.');
    } else if (input.showDiscountBadge && input.discountPercent != null) {
      findings.push(`✓ شارة خصم ${input.discountPercent}% مفعّلة على البنر.`);
    }
  }

  const gallery = input.galleryItems ?? [];
  if (gallery.length === 0) {
    findings.push('❌ معرض الأعمال فارغ — أضف صوراً حديثة من لوحة التحكم.');
  } else {
    findings.push(`✓ معرض الأعمال: ${gallery.length} عنصراً.`);
  }

  if (stagnation.stagnant) {
    findings.push(
      `📉 حركة الشات هادئة (${stagnation.conversations7d} محادثة خلال 7 أيام` +
        (stagnation.daysSinceLastContact != null
          ? ` · آخر تواصل منذ ${stagnation.daysSinceLastContact} يوم`
          : '') +
        ').',
    );
  } else if (stagnation.conversations7d > 0) {
    findings.push(`✓ نشاط الشات: ${stagnation.conversations7d} محادثة خلال 7 أيام.`);
  }

  findings.push(...bannerVisionFindingsForAudit(bannerVision));

  return findings;
}

export function formatOperationalInsightsForPrompt(
  audit: SalonOperationalAudit,
  recommendations: Pick<AiRecommendationRow, 'category' | 'title' | 'body' | 'priority'>[],
): string {
  const lines: string[] = [
    `وقت الفحص: ${audit.refreshedAt}`,
    '',
    '【نتائج الفحص الآلي — حقائق من المنصة】',
    ...audit.findingsAr.map((f, i) => `${i + 1}. ${f}`),
  ];

  if (audit.bannerProbes.length > 0) {
    lines.push('');
    lines.push('【فحص روابط البنر】');
    for (const p of audit.bannerProbes) {
      const detail =
        p.status === 'ok'
          ? 'يعمل'
          : p.status === 'local_only'
            ? 'محلي على الجهاز فقط'
            : p.status === 'timeout'
              ? 'انتهت المهلة'
              : p.status === 'invalid'
                ? 'رابط غير صالح'
                : `معطّل${p.httpStatus ? ` (${p.httpStatus})` : ''}`;
      lines.push(`- ${p.url.slice(0, 80)} → ${detail}`);
    }
  }

  lines.push(...formatBannerVisionForPrompt(audit.bannerVision));

  const top = [...recommendations]
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 10);

  if (top.length > 0) {
    lines.push('');
    lines.push('【توصيات نشطة من طاولة المناوب】');
    top.forEach((r, i) => {
      lines.push(`${i + 1}. [${r.category}] ${r.title}: ${r.body}`);
    });
  }

  return lines.join('\n');
}

async function loadCachedBannerVision(
  supabase: SupabaseClient,
  barberId: string,
  fingerprint: string,
): Promise<BannerVisionAudit | null> {
  const { data } = await supabase
    .from('barber_digital_shift_config')
    .select('banner_snapshot')
    .eq('barber_id', barberId)
    .maybeSingle();
  const snap = (data?.banner_snapshot ?? null) as BannerSnapshot | null;
  const cached = snap?.visionAudit;
  if (!cached || cached.fingerprint !== fingerprint) return null;
  return cached;
}

export async function runSalonOperationalInsights(
  supabase: SupabaseClient,
  barberId: string,
  ctx: DigitalShiftContext,
  input: RecommendationInput,
  options: SalonInsightsOptions = {},
): Promise<{ audit: SalonOperationalAudit; recommendations: AiRecommendationRow[] }> {
  await refreshHeuristicRecommendations(supabase, barberId, ctx, input);
  const stagnation = await assessMarketStagnation(supabase, barberId, ctx);
  const bannerProbes = await probeBannerImageUrls(input.bannerImageUrls ?? []);

  const okPublicUrls = bannerProbes.filter((p) => p.status === 'ok').map((p) => p.url);
  const fp = bannerVisionFingerprint(input);

  let bannerVision: BannerVisionAudit | null = null;
  if (options.runBannerVision) {
    bannerVision = await runBannerVisionAudit(supabase, barberId, input, okPublicUrls, {
      forceRefresh: options.forceBannerVision,
    });
  } else {
    bannerVision = await loadCachedBannerVision(supabase, barberId, fp);
  }

  const { data: recs } = await supabase
    .from('barber_ai_recommendations')
    .select('*')
    .eq('barber_id', barberId)
    .eq('status', 'active')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(40);

  const stagnationSummary = {
    stagnant: stagnation.stagnant,
    conversations7d: stagnation.conversations7d,
    daysSinceLastContact: stagnation.daysSinceLastContact,
  };

  const audit: SalonOperationalAudit = {
    refreshedAt: new Date().toISOString(),
    bannerCount: input.bannerImageUrls?.length ?? 0,
    showDiscountBadge: input.showDiscountBadge ?? false,
    discountPercent: input.discountPercent ?? null,
    bannerProbes,
    shopOpen: ctx.shopOpen,
    listingDaysRemaining: ctx.listingDaysRemaining,
    walletBalanceHalalas: ctx.walletBalanceHalalas,
    walletLow: ctx.walletBalanceHalalas <= ctx.walletLowThresholdHalalas,
    galleryCount: input.galleryItems?.length ?? 0,
    stagnation: stagnationSummary,
    bannerVision,
    findingsAr: buildFindingsAr(ctx, input, bannerProbes, stagnationSummary, bannerVision),
  };

  try {
    await emitFleetOperationalPulse(
      supabase,
      barberId,
      ctx,
      audit,
      options.pulseSource ?? 'salon_insights',
    );
  } catch {
    /* صامت — النبض الصاعد لا يوقف الفحص */
  }

  return {
    audit,
    recommendations: (recs ?? []) as AiRecommendationRow[],
  };
}
