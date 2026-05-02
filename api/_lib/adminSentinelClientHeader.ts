/** يُرسل من `src/lib/adminSentinelRemote.ts` فقط — يقلل استدعاء مسارات Sentinel من سكربتات عشوائية بنفس أصل الموقع. */
export const ADMIN_SENTINEL_UI_HEADER = 'x-halaqmap-admin-sentinel';
export const ADMIN_SENTINEL_UI_HEADER_VALUE = '1';

export function assertSentinelUiHeader(
  request: Request
): { ok: true } | { ok: false; json: Record<string, unknown> } {
  const skip = (process.env.ADMIN_SENTINEL_REQUIRE_UI_HEADER || '1').trim().toLowerCase();
  if (skip === '0' || skip === 'false' || skip === 'no') return { ok: true };
  const v = request.headers.get(ADMIN_SENTINEL_UI_HEADER)?.trim();
  if (v === ADMIN_SENTINEL_UI_HEADER_VALUE) return { ok: true };
  return {
    ok: false,
    json: {
      error: 'Forbidden',
      hint: 'طلب Sentinel غير مكتمل: الرأس x-halaqmap-admin-sentinel: 1 مطلوب من واجهة الوكيل. للاختبار عبر curl عيّن ADMIN_SENTINEL_REQUIRE_UI_HEADER=0.',
    },
  };
}
