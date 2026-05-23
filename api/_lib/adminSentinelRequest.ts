/**
 * عناوين IP للتحقق من القائمة البيضاء (قيمة بيئة ADMIN_SENTINEL_IP_ALLOWLIST مفصولة بفواصل).
 * يُستدعى من دوال Vercel فقط — لا تعتمد على المتصفح لأن المستخدم يمكن تزوير العنوان.
 */
export function clientIpFromRequest(request: Request): string {
  const xf = request.headers.get('x-forwarded-for');
  if (xf) {
    const first = xf.split(',')[0]?.trim();
    if (first) return first.slice(0, 128);
  }
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp.slice(0, 128);
  const cf = request.headers.get('cf-connecting-ip')?.trim();
  if (cf) return cf.slice(0, 128);
  return 'unknown';
}

export function parseIpAllowlist(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function ipAllowlistOk(request: Request, allowlist: string[]): boolean {
  if (allowlist.length === 0) return true;
  const ip = clientIpFromRequest(request);
  return allowlist.some((entry) => entry === ip || entry === '*');
}

/** قراءة مستوى AAL من JWT (بعد التحقق من التوقيع عبر getUser) — aal2 يعني اجتياز MFA عند تفعيلها على الحساب. */
export function jwtAssuranceLevelFromAccessToken(accessToken: string): 'aal1' | 'aal2' | 'unknown' {
  try {
    const parts = accessToken.split('.');
    if (parts.length < 2) return 'unknown';
    const payload = parts[1];
    if (!payload) return 'unknown';
    const padded = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as { aal?: string };
    if (json.aal === 'aal2') return 'aal2';
    if (json.aal === 'aal1') return 'aal1';
    return 'unknown';
  } catch {
    return 'unknown';
  }
}
