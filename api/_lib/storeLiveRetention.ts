/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إتلاف فعلي لمحتوى دعوات أفراحي1 / اجواء1 غير التجريبية بعد انتهاء مدة
 * التفعيل (٩٠ يوماً من الشراء)، تنفيذاً لوعد التسويق الحالي («تُحذف بيانات
 * مناسبتكم تلقائياً وفق مدة التفعيل») الذي لم يكن له أي كود منفِّذ فعلياً.
 *
 * القرار الهندسي: يُفرَّغ عمود payload بالكامل (الأسماء، الصور، التهنئات،
 * روابط/بصمات أجهزة المدعوين) ويُخفى اسم المشتري، ويتحوّل status إلى
 * 'expired' — لكن لا يُحذف الصف نفسه ولا buyer_email ولا مراجع الدفع
 * (moyasar_payment_id/moyasar_invoice_id/price_halalas)، لأن هذه سجلات
 * محاسبية/ضريبية يلزم الاحتفاظ بها. هذا لا يشمل الطلبات التجريبية
 * (is_trial=true) — لها مسار انتهاء منفصل في storeProductTrial.ts يمنحها
 * مهلة قبل أي حذف حقيقي، وهو خارج نطاق هذه المهمة (التي حصرها صاحب المتجر
 * صراحة بالطلبات المدفوعة غير التجريبية).
 *
 * الإتلاف مضمون بمسارين لا يعتمد أحدهما على الآخر:
 *  1) فحص كسول عند كل قراءة (readByRole) أو تعديل مضيف (saveHost) — يُتلف
 *     فوراً أي طلب مُنتهٍ إن زاره أحد قبل أن يمرّ عليه الفحص الدوري.
 *  2) مسح دوري حقيقي (sweepStoreLiveRetention)، يستدعيه
 *     api/cron-store-live-retention.ts يومياً عبر Vercel Cron — يضمن
 *     الإتلاف خلال يوم واحد من الانتهاء حتى لو لم يزر أحد الرابط إطلاقاً.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { buildStoreMailHtml, sendStoreResendEmail } from './storeMailIconLayout.js';

type Db = SupabaseClient;

export type StoreLiveRetentionProduct = 'wedding' | 'event';

export const STORE_LIVE_RETENTION_TABLE: Record<StoreLiveRetentionProduct, string> = {
  wedding: 'store_wedding_live_orders',
  event: 'store_event_live_orders',
};

const PRODUCT_LABEL_AR: Record<StoreLiveRetentionProduct, string> = {
  wedding: 'أفراحي1',
  event: 'اجواء1',
};

const PRODUCT_SUBJECT_AR: Record<StoreLiveRetentionProduct, string> = {
  wedding: 'إتلاف بيانات دعوة الزواج التفاعلية بعد انتهاء مدة التفعيل — خريطة الحل',
  event: 'إتلاف بيانات الدعوة الحرة التفاعلية بعد انتهاء مدة التفعيل — خريطة الحل',
};

export type StoreLiveRetentionRow = {
  id: string;
  status?: string | null;
  buyer_email?: string | null;
  buyer_name?: string | null;
  display_token?: string | null;
  price_halalas?: number | null;
  moyasar_payment_id?: string | null;
  moyasar_invoice_id?: string | null;
  payload?: Record<string, unknown> | null;
  policy_version?: string | null;
  expires_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  is_trial?: boolean | null;
  deleted_at?: string | null;
};

function base64Json(value: unknown): string {
  return Buffer.from(JSON.stringify(value, null, 2), 'utf8').toString('base64');
}

function dateLabel(iso: string | null | undefined): string {
  const raw = String(iso || '').trim();
  return raw ? raw.slice(0, 10) : '—';
}

/** نسخة كاملة من سجل قاعدة البيانات قبل إتلافه — هذه هي «نسخة من القاعدة» التي تُرفق بالإشعار. */
function buildDeletionSnapshot(product: StoreLiveRetentionProduct, row: StoreLiveRetentionRow) {
  return {
    المنصة: 'خريطة الحل — متجر',
    المنتج: PRODUCT_LABEL_AR[product],
    الجدول: STORE_LIVE_RETENTION_TABLE[product],
    رقم_الطلب: row.id,
    البريد_المسجل: row.buyer_email || null,
    اسم_المضيف_قبل_الإتلاف: row.buyer_name || null,
    الحالة_قبل_الإتلاف: row.status || null,
    تاريخ_إنشاء_الطلب: row.created_at || null,
    تاريخ_انتهاء_مدة_التفعيل: row.expires_at || null,
    تاريخ_تنفيذ_الإتلاف: new Date().toISOString(),
    السعر_هللة: row.price_halalas ?? null,
    مرجع_الدفع_Moyasar: row.moyasar_payment_id || null,
    مرجع_الفاتورة_Moyasar: row.moyasar_invoice_id || null,
    إصدار_السياسة_وقت_الشراء: row.policy_version || null,
    محتوى_الدعوة_الكامل_قبل_الإتلاف: row.payload || {},
  };
}

function noticeNotesAr(product: StoreLiveRetentionProduct, row: StoreLiveRetentionRow): string[] {
  const notes = [
    `رقم الطلب: ${row.id}`,
    `تاريخ إنشاء الدعوة: ${dateLabel(row.created_at)}`,
    `تاريخ انتهاء مدة التفعيل (٩٠ يوماً من الشراء): ${dateLabel(row.expires_at)}`,
    row.moyasar_payment_id ? `مرجع الدفع: ${row.moyasar_payment_id}` : '',
    'تم إتلاف محتوى الدعوة بالكامل من قاعدتنا نهائياً: الأسماء، الصور، التهنئات، وروابط/بيانات المدعوين. لا يمكن استرجاعه من عندنا بعد الآن.',
    'سجل الدفع والفاتورة فقط يُحتفظ به للأغراض المحاسبية والقانونية، دون أي من محتوى الدعوة أو بيانات المدعوين.',
    'نسخة كاملة من محتوى الدعوة كما كان قبل الإتلاف مُرفقة مع هذه الرسالة بصيغة JSON — يُنصح بحفظها إن رغبتم بالرجوع إليها مستقبلاً، فهي النسخة الوحيدة المتبقية.',
  ];
  return notes.filter((line) => line.length > 0);
}

async function sendDeletionNoticeEmail(
  product: StoreLiveRetentionProduct,
  row: StoreLiveRetentionRow,
): Promise<boolean> {
  const to = String(row.buyer_email || '').trim();
  if (!to) return false;
  const snapshot = buildDeletionSnapshot(product, row);
  const attachmentName = `halaqmap-${product}-${row.id}-deleted-record.json`;
  return sendStoreResendEmail({
    to,
    subject: PRODUCT_SUBJECT_AR[product],
    html: buildStoreMailHtml({
      theme: product,
      kickerAr: 'إشعار إتلاف بيانات تلقائي',
      titleAr: `تم إتلاف بيانات ${PRODUCT_LABEL_AR[product]} بعد انتهاء مدة التفعيل`,
      leadAr:
        'انتهت مدة تفعيل دعوتكم (٩٠ يوماً من الشراء)، فتم إتلاف محتواها تلقائياً من أنظمتنا وفق سياسة الاحتفاظ بالبيانات المعلَنة عند الشراء.',
      iconRows: [],
      notesAr: noticeNotesAr(product, row),
    }),
    attachments: [{ filename: attachmentName, content: base64Json(snapshot) }],
  });
}

/** يُنفّذ الإتلاف الفعلي لصف واحد: يرسل الإشعار أولاً، ثم يُفرّغ payload ويُخفي اسم المشتري. */
async function destroyStoreLiveOrder(
  db: Db,
  product: StoreLiveRetentionProduct,
  row: StoreLiveRetentionRow,
): Promise<void> {
  const table = STORE_LIVE_RETENTION_TABLE[product];
  const stamp = new Date().toISOString();
  const sent = await sendDeletionNoticeEmail(product, row);
  await db
    .from(table)
    .update({
      status: 'expired',
      payload: {},
      buyer_name: null,
      deleted_at: stamp,
      deletion_notice_sent_at: sent ? stamp : null,
      updated_at: stamp,
    })
    .eq('id', row.id)
    .is('deleted_at', null);
}

/**
 * فحص كسول لصف واحد (يُستدعى من readByRole/saveHost). لا يفعل شيئاً إلا إذا
 * كان الطلب مدفوعاً (غير تجريبي)، مُفعَّلاً (status='live')، وتجاوز expires_at.
 */
export async function applyStoreLiveRetentionClock(
  db: Db,
  product: StoreLiveRetentionProduct,
  row: StoreLiveRetentionRow,
): Promise<{ deleted: boolean }> {
  if (row.deleted_at) return { deleted: true };
  if (row.is_trial === true) return { deleted: false };
  if (row.status !== 'live') return { deleted: false };
  const endMs = row.expires_at ? Date.parse(row.expires_at) : NaN;
  if (!Number.isFinite(endMs) || endMs > Date.now()) return { deleted: false };
  await destroyStoreLiveOrder(db, product, row);
  return { deleted: true };
}

const RETENTION_SELECT =
  'id, status, buyer_email, buyer_name, price_halalas, moyasar_payment_id, moyasar_invoice_id, payload, policy_version, expires_at, created_at, updated_at, is_trial, deleted_at';

/** المسح الدوري الحقيقي — يستدعيه cron-store-live-retention.ts. يعمل بمعزل عن أي زيارة. */
export async function sweepStoreLiveRetention(db: Db): Promise<{ wedding: number; event: number; failed: number }> {
  const nowIso = new Date().toISOString();
  let weddingCount = 0;
  let eventCount = 0;
  let failed = 0;
  for (const product of ['wedding', 'event'] as const) {
    const table = STORE_LIVE_RETENTION_TABLE[product];
    const { data, error } = await db
      .from(table)
      .select(RETENTION_SELECT)
      .eq('status', 'live')
      .eq('is_trial', false)
      .is('deleted_at', null)
      .lte('expires_at', nowIso)
      .limit(200);
    if (error) {
      failed += 1;
      continue;
    }
    for (const row of (data || []) as StoreLiveRetentionRow[]) {
      try {
        await destroyStoreLiveOrder(db, product, row);
        if (product === 'wedding') weddingCount += 1;
        else eventCount += 1;
      } catch {
        failed += 1;
      }
    }
  }
  return { wedding: weddingCount, event: eventCount, failed };
}
