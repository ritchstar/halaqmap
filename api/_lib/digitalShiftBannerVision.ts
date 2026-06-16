import type { SupabaseClient } from '@supabase/supabase-js';
import type { RecommendationInput } from './digitalShiftAssistant.js';
import { upsertRecommendation } from './digitalShiftAssistant.js';

export type BannerVisionSeverity = 'info' | 'warn' | 'error';

export type BannerVisionIssue = {
  code: string;
  severity: BannerVisionSeverity;
  messageAr: string;
};

export type BannerVisionAudit = {
  analyzedAt: string;
  fingerprint: string;
  imagesAnalyzed: number;
  issues: BannerVisionIssue[];
  summaryAr: string;
  readabilityScore?: number | null;
  mobileCropScore?: number | null;
  discountBadgeVisible?: boolean | null;
  skippedReason?: string;
};

type BannerSnapshotWithVision = {
  bannerImageUrls?: string[];
  showDiscountBadge?: boolean;
  discountPercent?: number | null;
  syncedAt?: string;
  visionAudit?: BannerVisionAudit;
};

const VISION_CACHE_MS = 24 * 60 * 60 * 1000;
const VISION_MAX_IMAGES = 2;

const BANNER_VISION_SYSTEM = `أنت مُدقّق بنرات صالونات حلاقة على منصة «حلاق ماب» السعودية.
حلّل صورة البنر/الواجهة الإعلانية من منظور ظهورها على **بطاقة جوال** (عرض أفقي ~16:9، قد يُقصّ الحواف).

أعد JSON فقط بهذا الشكل:
{
  "issues": [
    { "code": "text_unreadable", "severity": "error", "messageAr": "…" }
  ],
  "summaryAr": "ملخص عربي مختصر (جملتان كحد أقصى)",
  "readabilityScore": 1,
  "mobileCropScore": 1,
  "discountBadgeVisible": true
}

رموز issues المسموحة:
- text_unreadable — النص/الشعار غير مقروء أو صغير جداً
- text_cropped — عناصر مهمة مقصوصة على الجوال
- image_dark — إضاءة داكنة أو ضبابية
- image_cluttered — ازدحام بصري يشتت العين
- discount_missing — شارة خصم مفترضة غير ظاهرة (يُمرَّر في الطلب)
- discount_unreadable — شارة خصم موجودة لكن غير واضحة
- low_contrast — تباين ضعيف بين النص والخلفية
- outdated_look — مظهر قديم/مهمل (تقدير بصري فقط)

severity: info | warn | error
readabilityScore و mobileCropScore: 1 (سيء) إلى 5 (ممتاز)
discountBadgeVisible: true/false/null إن لم يُذكر خصم في الطلب

اكتب messageAr بالعربية الفصيحة الواضحة. لا تختلق نصاً غير موجود في الصورة.`;

export function bannerVisionFingerprint(input: RecommendationInput): string {
  const urls = (input.bannerImageUrls ?? []).map((u) => u.trim()).filter(Boolean).join('|');
  return `${urls}::${Boolean(input.showDiscountBadge)}::${input.discountPercent ?? ''}`;
}

export function isBannerRelatedChatMessage(message: string): boolean {
  const t = message.trim().toLowerCase();
  if (!t) return false;
  return /بنر|banner|ظهور|خصم|صور(?:ة)?|الجوال|واجهة|إعلان|اعلان|لماذا لا يصل|لا يصل زبون|معرض|العرض/.test(t);
}

function parseVisionJson(raw: string): Omit<BannerVisionAudit, 'analyzedAt' | 'fingerprint' | 'imagesAnalyzed'> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { issues: [], summaryAr: 'تعذّر تحليل البنر بصرياً — أعد المحاولة لاحقاً.' };
  }
  const obj = (parsed && typeof parsed === 'object' ? parsed : {}) as Record<string, unknown>;
  const issuesRaw = Array.isArray(obj.issues) ? obj.issues : [];
  const issues: BannerVisionIssue[] = [];
  for (const item of issuesRaw.slice(0, 8)) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const messageAr = String(row.messageAr ?? '').trim();
    if (!messageAr) continue;
    const sev = String(row.severity ?? 'warn');
    const severity: BannerVisionSeverity =
      sev === 'error' || sev === 'info' ? sev : 'warn';
    issues.push({
      code: String(row.code ?? 'unknown').slice(0, 40),
      severity,
      messageAr: messageAr.slice(0, 240),
    });
  }
  const summaryAr = String(obj.summaryAr ?? '').trim().slice(0, 400);
  const readabilityScore = Number(obj.readabilityScore);
  const mobileCropScore = Number(obj.mobileCropScore);
  const discountBadgeVisible =
    obj.discountBadgeVisible === true
      ? true
      : obj.discountBadgeVisible === false
        ? false
        : null;

  return {
    issues,
    summaryAr: summaryAr || (issues.length > 0 ? issues.map((i) => i.messageAr).join(' ') : 'البنر يبدو مقبولاً بصرياً.'),
    readabilityScore: Number.isFinite(readabilityScore) ? Math.min(5, Math.max(1, readabilityScore)) : null,
    mobileCropScore: Number.isFinite(mobileCropScore) ? Math.min(5, Math.max(1, mobileCropScore)) : null,
    discountBadgeVisible,
  };
}

async function callBannerVisionForUrl(
  imageUrl: string,
  input: RecommendationInput,
): Promise<Omit<BannerVisionAudit, 'analyzedAt' | 'fingerprint' | 'imagesAnalyzed'>> {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) {
    return { issues: [], summaryAr: 'تحليل البنر البصري غير متاح — مفتاح OpenAI غير مُعد.', skippedReason: 'no_api_key' };
  }

  const model =
    (process.env.DIGITAL_SHIFT_BANNER_VISION_MODEL ||
      process.env.DIGITAL_SHIFT_OPENAI_MODEL ||
      process.env.PARTNER_ASSISTANT_OPENAI_MODEL ||
      'gpt-4o-mini').trim() || 'gpt-4o-mini';

  const discountHint =
    input.showDiscountBadge && input.discountPercent != null
      ? `الإعدادات تقول: شارة خصم ${input.discountPercent}% يجب أن تكون ظاهرة.`
      : 'لا يُفترض ظهور شارة خصم في الإعدادات.';

  const userText = `حلّل بنر هذا الصالون. ${discountHint}\nرابط الصورة للسياق فقط — اعتمد ما تراه في الصورة.`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 28_000);

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 700,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: BANNER_VISION_SYSTEM },
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: imageUrl, detail: 'low' } },
              { type: 'text', text: userText },
            ],
          },
        ],
      }),
    });

    const json = (await res.json().catch(() => ({}))) as {
      error?: { message?: string };
      choices?: { message?: { content?: string } }[];
    };
    if (!res.ok) throw new Error(json.error?.message || `OpenAI HTTP ${res.status}`);
    const text = json.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('Empty vision response');
    return parseVisionJson(text);
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      return { issues: [], summaryAr: 'انتهت مهلة تحليل البنر البصري.', skippedReason: 'timeout' };
    }
    return {
      issues: [],
      summaryAr: 'تعذّر تحليل البنر بصرياً في هذه الجولة.',
      skippedReason: e instanceof Error ? e.message.slice(0, 120) : 'vision_failed',
    };
  } finally {
    clearTimeout(timer);
  }
}

function mergeVisionResults(
  parts: Omit<BannerVisionAudit, 'analyzedAt' | 'fingerprint' | 'imagesAnalyzed'>[],
): Omit<BannerVisionAudit, 'analyzedAt' | 'fingerprint' | 'imagesAnalyzed'> {
  const issueMap = new Map<string, BannerVisionIssue>();
  for (const part of parts) {
    for (const issue of part.issues) {
      if (!issueMap.has(issue.code)) issueMap.set(issue.code, issue);
    }
  }
  const summaries = parts.map((p) => p.summaryAr).filter(Boolean);
  const readability = parts.map((p) => p.readabilityScore).filter((n): n is number => n != null);
  const mobile = parts.map((p) => p.mobileCropScore).filter((n): n is number => n != null);

  return {
    issues: [...issueMap.values()],
    summaryAr: summaries[0] ?? 'تم فحص البنر بصرياً.',
    readabilityScore: readability.length ? Math.min(...readability) : null,
    mobileCropScore: mobile.length ? Math.min(...mobile) : null,
    discountBadgeVisible: parts.find((p) => p.discountBadgeVisible != null)?.discountBadgeVisible ?? null,
    skippedReason: parts.every((p) => p.skippedReason) ? parts[0]?.skippedReason : undefined,
  };
}

async function loadCachedVisionAudit(
  supabase: SupabaseClient,
  barberId: string,
  fingerprint: string,
): Promise<BannerVisionAudit | null> {
  const { data } = await supabase
    .from('barber_digital_shift_config')
    .select('banner_snapshot')
    .eq('barber_id', barberId)
    .maybeSingle();

  const snap = (data?.banner_snapshot ?? null) as BannerSnapshotWithVision | null;
  const cached = snap?.visionAudit;
  if (!cached || cached.fingerprint !== fingerprint) return null;
  const age = Date.now() - new Date(cached.analyzedAt).getTime();
  if (!Number.isFinite(age) || age > VISION_CACHE_MS) return null;
  return cached;
}

async function saveVisionAudit(
  supabase: SupabaseClient,
  barberId: string,
  audit: BannerVisionAudit,
  input: RecommendationInput,
): Promise<void> {
  const bannerUrls = (input.bannerImageUrls ?? []).map((u) => u.trim()).filter(Boolean).slice(0, 12);
  const { data } = await supabase
    .from('barber_digital_shift_config')
    .select('banner_snapshot, gallery_snapshot')
    .eq('barber_id', barberId)
    .maybeSingle();

  const prev = (data?.banner_snapshot ?? {}) as BannerSnapshotWithVision;
  const gallerySnap = data?.gallery_snapshot;

  await supabase
    .from('barber_digital_shift_config')
    .update({
      banner_snapshot: {
        ...prev,
        bannerImageUrls: bannerUrls.length > 0 ? bannerUrls : prev.bannerImageUrls ?? [],
        showDiscountBadge: input.showDiscountBadge ?? prev.showDiscountBadge ?? false,
        discountPercent: input.discountPercent ?? prev.discountPercent ?? null,
        syncedAt: prev.syncedAt ?? new Date().toISOString(),
        visionAudit: audit,
      },
      ...(gallerySnap !== undefined ? { gallery_snapshot: gallerySnap } : {}),
    })
    .eq('barber_id', barberId);
}

export async function applyBannerVisionRecommendations(
  supabase: SupabaseClient,
  barberId: string,
  audit: BannerVisionAudit,
): Promise<void> {
  const errors = audit.issues.filter((i) => i.severity === 'error');
  const warns = audit.issues.filter((i) => i.severity === 'warn');

  if (errors.length > 0) {
    await upsertRecommendation(supabase, {
      barberId,
      category: 'banner',
      priority: 85,
      dedupeKey: 'banner_vision_errors',
      title: `تدقيق بصري: ${errors.length} مشكلة في البنر`,
      body: errors.map((e) => e.messageAr).join(' · '),
      metadata: { vision: true, issueCodes: errors.map((e) => e.code) },
    });
  } else if (warns.length > 0) {
    await upsertRecommendation(supabase, {
      barberId,
      category: 'banner',
      priority: 65,
      dedupeKey: 'banner_vision_warns',
      title: `تحسين البنر: ${warns.length} ملاحظة بصرية`,
      body: warns.map((w) => w.messageAr).join(' · '),
      metadata: { vision: true, issueCodes: warns.map((w) => w.code) },
    });
  } else if (audit.imagesAnalyzed > 0 && !audit.skippedReason) {
    await upsertRecommendation(supabase, {
      barberId,
      category: 'banner',
      priority: 38,
      dedupeKey: 'banner_vision_ok',
      title: 'البنر يبدو واضحاً على الجوال 👍',
      body: audit.summaryAr || 'الفحص البصري لم يجد مشاكل حرجة — حافظ على تحديث الصورة كل فترة.',
      metadata: { vision: true },
    });
  }
}

export async function runBannerVisionAudit(
  supabase: SupabaseClient,
  barberId: string,
  input: RecommendationInput,
  okPublicUrls: string[],
  options: { forceRefresh?: boolean } = {},
): Promise<BannerVisionAudit | null> {
  const fingerprint = bannerVisionFingerprint(input);
  const okUrls = okPublicUrls.filter((u) => u.startsWith('http')).slice(0, VISION_MAX_IMAGES);

  if (okUrls.length === 0) {
    return {
      analyzedAt: new Date().toISOString(),
      fingerprint,
      imagesAnalyzed: 0,
      issues: [],
      summaryAr: 'تعذّر الفحص البصري — لا توجد روابط بنر عامة تعمل (blob/محلي لا يُحلَّل).',
      skippedReason: 'no_public_urls',
    };
  }

  if (!options.forceRefresh) {
    const cached = await loadCachedVisionAudit(supabase, barberId, fingerprint);
    if (cached) return cached;
  }

  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) return null;

  const toAnalyze = okUrls;
  const parts = await Promise.all(toAnalyze.map((url) => callBannerVisionForUrl(url, input)));
  const merged = mergeVisionResults(parts);

  const audit: BannerVisionAudit = {
    analyzedAt: new Date().toISOString(),
    fingerprint,
    imagesAnalyzed: toAnalyze.length,
    ...merged,
  };

  try {
    await saveVisionAudit(supabase, barberId, audit, input);
    await applyBannerVisionRecommendations(supabase, barberId, audit);
  } catch {
    /* cache/recommendations لا تُوقف الفحص */
  }

  return audit;
}

export function bannerVisionFindingsForAudit(audit: BannerVisionAudit | null | undefined): string[] {
  if (!audit) return [];
  const findings: string[] = [];
  if (audit.skippedReason === 'no_public_urls') {
    findings.push('⚠️ الفحص البصري: لا يمكن تحليل صور محلية — ارفع البنر إلى التخزين السحابي أولاً.');
    return findings;
  }
  if (audit.imagesAnalyzed === 0) return findings;

  findings.push(`🔍 فحص بصري (Vision): ${audit.imagesAnalyzed} صورة — ${audit.summaryAr}`);

  if (audit.readabilityScore != null && audit.readabilityScore <= 2) {
    findings.push('❌ وضوح النص/الشعار ضعيف على البنر — كبّر الخط أو بسّط التصميم.');
  }
  if (audit.mobileCropScore != null && audit.mobileCropScore <= 2) {
    findings.push('❌ قصّ/تخطيط البنر غير مناسب لعرض الجوال — أعد تصميم الهوامش.');
  }

  for (const issue of audit.issues) {
    const prefix = issue.severity === 'error' ? '❌' : issue.severity === 'warn' ? '⚠️' : '💡';
    findings.push(`${prefix} ${issue.messageAr}`);
  }

  return findings;
}

export function formatBannerVisionForPrompt(audit: BannerVisionAudit | null | undefined): string[] {
  if (!audit || audit.imagesAnalyzed === 0) return [];
  const lines = [
    '',
    '【فحص بصري للبنر (Vision — تم فعلياً)】',
    `وقت التحليل: ${audit.analyzedAt}`,
    `الملخص: ${audit.summaryAr}`,
  ];
  if (audit.readabilityScore != null) lines.push(`- وضوح النص: ${audit.readabilityScore}/5`);
  if (audit.mobileCropScore != null) lines.push(`- ملاءمة الجوال: ${audit.mobileCropScore}/5`);
  if (audit.discountBadgeVisible != null) {
    lines.push(`- شارة الخصم ظاهرة في الصورة: ${audit.discountBadgeVisible ? 'نعم' : 'لا'}`);
  }
  if (audit.issues.length > 0) {
    lines.push('المشاكل المكتشفة:');
    audit.issues.forEach((i, n) => lines.push(`${n + 1}. [${i.severity}] ${i.messageAr}`));
  }
  return lines;
}
