import { getSupabaseClient } from '@/integrations/supabase/client';

/**
 * يُسجّل في platform_booking_security_log أن مسؤولاً فتح معاينة نظامية لطلب تسجيل.
 * يُخزَّن رقم الطلب والطابع الزمني فقط (لا محتوى الرمز ولا الرابط).
 */
export async function logAdminRegulatoryQrPreviewRemote(input: {
  registrationOrderId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Supabase غير مهيأ' };
  const previewAtIso = new Date().toISOString();
  const { error } = await client.rpc('log_admin_regulatory_preview_event', {
    p_registration_order_id: input.registrationOrderId.trim(),
    p_preview_at_iso: previewAtIso,
  });
  if (error) return { ok: false, error: error.message || 'فشل تسجيل المعاينة في سجل الأمان' };
  return { ok: true };
}
