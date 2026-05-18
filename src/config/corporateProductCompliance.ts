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
    body: 'منتج برمجي تقني (SaaS) تم تطويره وإنتاجه بالكامل كملكية فكرية وتجارية تابعة للمؤسسة.',
  },
  {
    id: 'b2c',
    label: 'قطاع الأفراد (B2C)',
    body: 'تقديم خدمة بحث جغرافية متطورة تخدم المستخدم (الباحث عن خدمات صالونات الحلاقة) بشكل مجاني بالكامل.',
  },
  {
    id: 'b2b',
    label: 'قطاع الأعمال (B2B)',
    body: 'تقديم حلول رقمية وأنظمة رصد ذكية مخصصة لقطاع صالونات الحلاقة بمميزات متطورة وأسعار محددة وواضحة.',
  },
  {
    id: 'vision',
    label: 'البعد الإستراتيجي',
    body: 'الارتقاء بجودة الخدمات الرقمية وبقطاع الحلاقة خاصة، تماشياً وتدعيماً للرؤية المباركة للمملكة العربية السعودية (2030) نحو مستقبل مشرق بأيدٍ وطنية.',
  },
] as const;
