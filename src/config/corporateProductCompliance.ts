import { LEGAL_TRADE_NAME_AR } from '@/config/partnerLegal';

export const CORPORATE_PRODUCT_COMPLIANCE_TITLE = 'وثيقة التعريف بالمنتج والامتثال الرقمي 🇸🇦';

export const CORPORATE_PRODUCT_COMPLIANCE_BADGE = 'منتج وطني معتمد / ممتثل للأنظمة التجارية';

export const CORPORATE_PRODUCT_COMPLIANCE_SECTIONS = [
  {
    id: 'owner',
    label: 'الجهة المالكة والمطورة',
    body: LEGAL_TRADE_NAME_AR,
  },
  {
    id: 'product',
    label: 'طبيعة المنتج',
    body: 'برمجيات حاسوبية جاهزة (Software) — رخصة نفاذ رقمية وإضافات برمجية، وفق ISIC4 474151 (GaStat: البيع بالتجزئة للبرمجيات). الملكية الفكرية للمنصة مملوكة للمؤسسة.',
  },
  {
    id: 'b2c',
    label: 'قطاع الأفراد (B2C)',
    body: 'تقديم خدمة بحث جغرافية متطورة تخدم المستخدم بشكل مجاني بالكامل لتسهيل رصد واكتشاف الخدمات.',
  },
  {
    id: 'b2b',
    label: 'قطاع الأعمال (B2B)',
    body: 'بيع منتجات برمجية رقمية (رخصة نفاذ + إضافات برمجية) بموجب نشاط ISIC4 474151 — بيع برمجيات بالتجزئة. لا عمولة على الحلاقة.',
  },
  {
    id: 'vision',
    label: 'البعد الإستراتيجي',
    body: 'الارتقاء بجودة الخدمات الرقمية وبقطاع الحلاقة خاصة، تماشياً وتدعيماً للرؤية المباركة للمملكة العربية السعودية (2030) نحو مستقبل مشرق بأيدٍ وطنية.',
  },
] as const;
