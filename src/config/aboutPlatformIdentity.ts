/**
 * محاور هوية المنصة (عربي + إنجليزي) — متسقة مع التوجه التقني والامتثال.
 * تُستورد من صفحة «من نحن»؛ مرادف لمحتوى `src/locales/platformIdentity.json` للربط لاحقاً بمحرك i18n.
 */
import type { LucideIcon } from 'lucide-react';
import { Bot, Landmark, ShieldCheck } from 'lucide-react';

export type AboutIdentityPillar = {
  icon: LucideIcon;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
};

export const ABOUT_IDENTITY_PILLARS: readonly AboutIdentityPillar[] = [
  {
    icon: Bot,
    titleAr: 'الابتكار والذكاء الاصطناعي',
    titleEn: 'Innovation & Artificial Intelligence',
    bodyAr:
      'نظام الترجمة في الباقة الماسية يدعم فهم المحادثات بين العميل والصالون بلغات متعددة كمساعد تشغيلي — دون اعتبارها ترجمة رسمية. كما نعتمد أتمتة سحابية للمهام التشغيلية والمراقبة ضمن حدود التصميم المعتمد في المنصة.',
    bodyEn:
      'The Diamond-tier translation flow helps customers and salons understand chat messages across languages as an operational aid — not a legal instrument. Cloud automation supports routine checks and monitoring within the platform’s approved design.',
  },
  {
    icon: ShieldCheck,
    titleAr: 'الخصوصية والسيادة',
    titleEn: 'Privacy & Data Sovereignty',
    bodyAr:
      'مسار الشركاء يعتمد معاينة نظامية عبر الرمز الموحد دون تخزين ملفات السجل التجاري أو الرخص أو الشهادات الصحية كمرفقات على خوادمنا، مع معالجة البيانات وفق إطار حماية البيانات الشخصية في المملكة وإرشادات الهيئة المعنية.',
    bodyEn:
      'Partner onboarding uses QR-based regulatory preview without storing commercial-register, municipal-licence, or health-certificate files on our servers. Personal data is handled in line with Saudi Arabia’s PDPL framework and SDAIA’s data-protection guidance.',
  },
  {
    icon: Landmark,
    titleAr: 'المحتوى المحلي والاستدامة الرقمية',
    titleEn: 'Local Content & Digital Sustainability',
    bodyAr:
      'نركّز على السوق السعودي وباقات تناسب منشآت الخدمات الصغيرة والمتوسطة، ونعتمد ممارسات تقليل البيانات والموارد حيث ينطبق ذلك — بما يدعم التحول الرقمي المنضبط داخل المملكة.',
    bodyEn:
      'We focus on the Saudi market with tiers suited to small and medium service businesses, applying data-minimisation and lean cloud usage where applicable — supporting disciplined in-Kingdom digital transformation.',
  },
] as const;

export const ABOUT_IDENTITY_SECTION = {
  titleAr: 'ابتكار وخصوصية ومحتوى محلي',
  titleEn: 'Innovation, privacy & local footprint',
  leadAr:
    'محاور تقاطع بين التجربة التقنية والامتثال والسوق السعودي — كما تُعرض في وثائق المنصة الداخلية.',
  leadEn:
    'Themes where product design, compliance, and the Saudi market meet — as reflected in our internal technical briefs.',
} as const;
