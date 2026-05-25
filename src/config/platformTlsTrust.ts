/**
 * SSL/TLS trust — single source of truth for public-facing security badges.
 *
 * Grade verified via Qualys SSL Labs on the platform domain (Cloudflare edge).
 * Update `PLATFORM_TLS_SSL_LABS_REPORT_DATE_AR` when re-tested.
 */

export const PLATFORM_TLS_DOMAIN = 'halaqmap.com';

export const PLATFORM_TLS_SSL_LABS_GRADE = 'A+';

export const PLATFORM_TLS_SSL_LABS_URL =
  'https://www.ssllabs.com/ssltest/analyze.html?d=halaqmap.com&latest';

export const PLATFORM_TLS_SSL_LABS_REPORT_DATE_AR = '25 مايو 2026';

export const PLATFORM_TLS_SUMMARY_AR =
  'اتصال `HTTPS/TLS` على `halaqmap.com` حاصل على أعلى تقييم `A+` من `Qualys SSL Labs` — تشفير قوي عبر `Cloudflare` مع `HSTS` على جميع نقاط الخادم.';

export const PLATFORM_TLS_POLICY_LINE_AR =
  'تشفير البيانات أثناء النقل (`TLS 1.2+` / `TLS 1.3`) مع تقييم `SSL Labs A+` على النطاق الرئيسي للمنصة — يمكنك مراجعة التقرير العلني عبر الرابط أدناه.';

export const PLATFORM_TLS_COMPACT_LABEL_AR = 'SSL Labs A+ — اتصال مشفّر';

export const PLATFORM_TLS_CARD_TITLE_AR = 'اتصال آمن — SSL Labs A+';

export const PLATFORM_TLS_CARD_BODY_AR =
  'جميع جلسات التصفح والدفع على halaqmap.com تمر عبر HTTPS بأعلى تقييم صناعي (A+) — بروتوCOLات TLS حديثة وحماية HSTS على شبكة Cloudflare.';
