/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/** واجهة العميل لتجربة برونزي متوقفة — لوحات الإدارة والبيانات التاريخية تبقى. */
export function bronzeTrialPublicDisabledResponse(headers: Record<string, string>): Response {
  return Response.json(
    {
      ok: false,
      error: 'BRONZE_TRIAL_PUBLIC_DISABLED',
      messageAr: 'توقفت تجربة برونزي للعملاء — أكمل الدفع عبر صفحة الحزم.',
    },
    { status: 410, headers },
  );
}
