/**
 * الثقة التشغيلية — مرجع خارجي (قابل للتحقق) + برنامج فحص داخلي.
 * صياغة محافظة: لا «اعتماد» ولا «شهادة» من أطراف ثالثة.
 *
 * حدّث تواريخ الفحوص عند إعادة التحقق.
 */

import {
  PLATFORM_TLS_DOMAIN,
  PLATFORM_TLS_SSL_LABS_GRADE,
  PLATFORM_TLS_SSL_LABS_REPORT_DATE_AR,
  PLATFORM_TLS_SSL_LABS_URL,
} from '@/config/platformTlsTrust';

export const PLATFORM_OPERATIONAL_TRUST_SECTION_ID = 'operational-trust';

export const PLATFORM_OPERATIONAL_TRUST_TITLE_AR = 'الثقة التشغيلية — مرجع خارجي وانضباط داخلي';

export const PLATFORM_OPERATIONAL_TRUST_INTRO_AR =
  'نُظهر روابط لفحوصات مستقلة **قابلة للتحقق** على النطاق العام للمنصة. هذه الفحوصات **تكميلية** — لا تغني عن مراجعة التطبيق وقواعد البيانات والصلاحيات.';

export const PLATFORM_EXTERNAL_SCANS_DISCLAIMER_AR =
  'الفحوصات الخارجية تعكس حالة النطاق والسمعة الظاهرية وقت الفحص فقط — وليست شهادة أمان تطبيق ولا اعتماداً رسمياً من مزوّدي الفحص.';

export type PlatformExternalTrustScan = {
  id: string;
  labelAr: string;
  summaryAr: string;
  reportUrl: string;
  reportDateAr: string;
};

export const PLATFORM_EXTERNAL_TRUST_SCANS: PlatformExternalTrustScan[] = [
  {
    id: 'ssl-labs',
    labelAr: 'Qualys SSL Labs',
    summaryAr: `تقييم \`TLS\` — \`${PLATFORM_TLS_SSL_LABS_GRADE}\` على \`${PLATFORM_TLS_DOMAIN}\``,
    reportUrl: PLATFORM_TLS_SSL_LABS_URL,
    reportDateAr: PLATFORM_TLS_SSL_LABS_REPORT_DATE_AR,
  },
  {
    id: 'virustotal',
    labelAr: 'VirusTotal',
    summaryAr: 'سمعة الرابط — 0/92 (لا vendor أبلغ عن URL خبيث)',
    reportUrl: 'https://www.virustotal.com/gui/domain/halaqmap.com',
    reportDateAr: 'يونيو 2026',
  },
  {
    id: 'sucuri',
    labelAr: 'Sucuri SiteCheck',
    summaryAr: 'لا malware ظاهر — غير مُدرج في blacklists المفحوصة',
    reportUrl: 'https://sitecheck.sucuri.net/results/https/www.halaqmap.com',
    reportDateAr: 'يونيو 2026',
  },
];

export const PLATFORM_INTERNAL_PROGRAM_TITLE_AR = 'برنامج الفحص التقني الداخلي';

export const PLATFORM_INTERNAL_PROGRAM_BODY_AR =
  'تعتمد المنصة **برنامجاً ثابتاً للفحص التقني المشدد** قبل الإطلاقات الحساسة: TypeScript، بناء الإنتاج، اختبارات أمان مسارات التسجيل، ومراجعة OWASP وIDOR وRLS. وفي مجال **حماية المنصة وشركائها**، تُطبَّق **فحوصات داخلية صارمة** مستمرة — تشمل بوابات الجاهزية التشغيلية، مراقبة الاختراق، ومسارات الامتثال للتسجيل والدفع — وفق سياسة «استنفار دائم» داخل فريق التطوير.';

export const PLATFORM_OPERATIONAL_TRUST_CLOSING_AR =
  'الفحوص الخارجية = شفافية على النطاق. البرنامج الداخلي = خط الدفاع الأساسي.';

export const PLATFORM_OPERATIONAL_TRUST_FOOTER_SHORT_AR =
  'برنامج فحص تقني داخلي مشدد — مع فحوصات سمعة خارجية قابلة للتحقق.';

export const PLATFORM_OPERATIONAL_TRUST_FOOTER_LINK_AR = 'تفاصيل الثقة التشغيلية';

export const PLATFORM_INTERNAL_PROGRAM_SUMMARY_AR =
  'برنامج فحص تقني مشدد قبل الإطلاقات الحساسة، وفحوصات داخلية صارمة مستمرة لحماية المنصة وشركائها.';
