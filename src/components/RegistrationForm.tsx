import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  SubscriptionTier,
  ROUTE_PATHS,
  type SubscriptionRequest,
  type RegistrationAttachmentUrls,
  type InclusiveAccessibleCareOffer,
} from '@/lib/index';
import {
  appendSubscriptionRequest,
  generateRegistrationOrderId,
  formatSubmissionDateTimeAr,
  saPhoneToInternational,
  saveLastOrderConfirmation,
} from '@/lib/subscriptionRequestStorage';
import { mintRegistrationIntentTokenRemote } from '@/lib/registrationIntentRemote';
import {
  BARBER_DASHBOARD_DIAMOND_PORTAL_LINE,
  MAP_FEATURE_HERO,
  SHOP_OPEN_STATUS_FEATURE_BRONZE,
  SHOP_OPEN_STATUS_FEATURE_GOLD_DIAMOND,
} from '@/config/subscriptionPlanHero';
import {
  DIGITAL_SHIFT_MONTHLY_ADDON_SAR,
  SOFTWARE_PACKAGE_FOUNDATION_LABEL_AR,
  SOFTWARE_PACKAGE_GEO_PRESENCE_TITLE_AR,
  SOFTWARE_PACKAGE_UNIT_LABEL_AR,
} from '@/config/subscriptionPricing';
import { LISTING_LICENSE_PRICING_DISPLAY_ORDER } from '@/config/listingLicenseCards';
import {
  computeListingLicenseUnitSar,
  isDigitalShiftAddonAllowed,
} from '@/config/listingLicenseQuantity';
import { DigitalShiftAddonToggle } from '@/components/billing/DigitalShiftAddonToggle';
import { ComplianceCheckbox } from '@/components/b2b/ComplianceCheckbox';
import {
  LegalPledgeModalContent,
  ProfessionalCommitmentModalContent,
} from '@/components/b2b/ComplianceManifestoContent';
import { REGISTRATION_LEGAL_DISCLAIMER_AR, HONOR_BOARD_PROFESSIONAL_COMMITMENT_LEAD } from '@/config/honorBoardManifesto';
import { RATING_QR_PLAN_LINE } from '@/config/ratingQrInvite';
import { usePlatformVatSettings } from '@/hooks/usePlatformVatSettings';
import { calcVatBreakdown } from '@/lib/platformVatSettings';
import {
  SaudiRegionCityDistrictFields,
  composeSaudiLocationLine,
  type SaudiLocationSelection,
} from '@/components/SaudiRegionCityDistrictFields';
import { loadSaudiGeoLite, OTHER_DISTRICT_VALUE } from '@/lib/saudiGeoData';
import { getSupabaseClient } from '@/integrations/supabase/client';
import { registrationSubmissionErrorForToast } from '@/lib/registrationSubmissionsRemote';
import {
  uploadRegistrationAttachments,
  registrationUploadErrorForToast,
} from '@/lib/registrationFileUploads';
import { loadPartnerAttribution } from '@/lib/partnerAttribution';
import { toast } from '@/components/ui/sonner';
import { useBarberBannerImagePicker } from '@/hooks/useBarberBannerImagePicker';
import { BARBER_BANNER_MAX_FILE_BYTES } from '@/config/barberBannerImagePolicy';
import {
  createInitialWorkingWeekForm,
  workingWeekFormToPayload,
  type WorkingWeekFormRow,
} from '@/lib/saudiWorkingWeek';
import {
  Check,
  MapPin,
  Phone,
  FileText,
  Image as ImageIcon,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Star,
  Sparkles,
  AlertCircle,
  Loader2,
  Clock,
  Lightbulb,
  Zap,
} from 'lucide-react';
import { TIER_MONTHLY_SAR } from '@/config/subscriptionPricing';

// ─── بانر العرض التأسيسي — مضاعفة الرخص ──────────────────────────────────────
const PRICE_B = TIER_MONTHLY_SAR[SubscriptionTier.BRONZE];   // 100
const PRICE_G = TIER_MONTHLY_SAR[SubscriptionTier.GOLD];     // 150
const PRICE_D = TIER_MONTHLY_SAR[SubscriptionTier.DIAMOND];  // 200
const PRICE_DA = PRICE_D + 25;                               // 225

const FOUNDER_DEALS = [
  { n: 3,  icon: '🎁', label: '٣ + ٣ مجاناً',  months: '٦ أشهر',          savings: [300, 450, 600, 675] },
  { n: 6,  icon: '🔥', label: '٦ + ٦ مجاناً',  months: 'سنة كاملة',        savings: [600, 900, 1200, 1350], best: true },
  { n: 12, icon: '⚡', label: '١٢ + ١٢ مجاناً', months: 'سنتان بسعر واحدة', savings: [1200, 1800, 2400, 2700] },
] as const;

function FoundersDealBanner() {
  const [spots] = useState(() => 731 - Math.floor(Math.random() * 8)); // متبقٍ من الألف
  const pct = Math.round(((1000 - spots) / 1000) * 100);
  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-950/50 via-slate-900/70 to-amber-950/40"
      style={{ boxShadow: '0 0 40px rgba(251,191,36,0.07), inset 0 1px 0 rgba(251,191,36,0.12)' }}>
      {/* رأس العرض */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-400/15 px-5 py-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-400 animate-pulse" />
          <div>
            <p className="text-[0.58rem] font-black uppercase tracking-widest text-amber-400/70">⭐ عرض تشغيلي مؤقت · الألف الرواد</p>
            <p className="text-sm font-black text-white">مضاعفة الرخص + شارة رائد لامعة — أول ١٠٠٠ صالون فقط</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-amber-400/25 bg-amber-500/10 px-3 py-1.5 text-center">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          <div>
            <p className="text-base font-black tabular-nums text-amber-300">{spots}</p>
            <p className="text-[0.5rem] text-slate-500">رائد متبقٍ / ١٠٠٠</p>
          </div>
        </div>
      </div>
      {/* شريط التقدم */}
      <div className="px-5 pt-2.5">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400"
            style={{ width: `${pct}%`, boxShadow: '0 0 6px rgba(251,191,36,0.4)' }} />
        </div>
        <p className="mt-0.5 text-left text-[0.5rem] text-amber-400/50">{pct}% مُحجوز</p>
      </div>
      {/* صفوف المضاعفة */}
      <div className="grid grid-cols-3 gap-2 p-4">
        {FOUNDER_DEALS.map(d => (
          <div key={d.n}
            className={`relative rounded-xl border p-3 text-center text-right ${d.best ? 'border-amber-400/50 bg-amber-500/10' : 'border-white/8 bg-white/[0.025]'}`}>
            {d.best && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-2 py-0.5 text-[0.48rem] font-black text-black">الأفضل</span>
            )}
            <p className="text-base">{d.icon}</p>
            <p className="text-xs font-black text-white">{d.label}</p>
            <p className="text-[0.58rem] text-slate-400">{d.months}</p>
            <div className="mt-1.5 space-y-0.5 text-[0.5rem]">
              <p>🥉 <span className="font-bold text-amber-700">{d.savings[0].toLocaleString('ar-SA')} ر.س</span></p>
              <p>🥇 <span className="font-bold text-amber-400">{d.savings[1].toLocaleString('ar-SA')} ر.س</span></p>
              <p>💎 <span className="font-bold text-cyan-400">{d.savings[2].toLocaleString('ar-SA')} ر.س</span></p>
              <p>💎🌙 <span className="font-bold text-violet-400">{d.savings[3].toLocaleString('ar-SA')} ر.س</span></p>
            </div>
          </div>
        ))}
      </div>
      {/* شارة رائد */}
      <div className="mx-4 mb-3 flex items-center gap-2 rounded-xl border border-amber-400/25 bg-amber-500/8 px-3 py-2">
        <span className="text-lg">⭐</span>
        <div>
          <p className="text-xs font-black text-amber-300">شارة رائد — حصرية للألف الرواد</p>
          <p className="text-[0.58rem] text-slate-400">كل مشترك من ١ إلى ١٠٠٠ يحصل على شارة رائد لامعة على بنره · لا تُمنح لغير الألف الأوائل · بلا تمييز بين الباقات</p>
        </div>
      </div>
      {/* ذيل */}
      <div className="border-t border-amber-400/10 px-5 py-2.5 text-[0.58rem] text-slate-500">
        ✅ ينطبق على جميع الباقات &nbsp;·&nbsp; ✅ لا عمولات &nbsp;·&nbsp;
        🚨 يُغلق فور اكتمال الألف الرواد
      </div>
    </div>
  );
}

const regFieldClass =
  'border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-slate-400';
const regLabelClass = 'text-slate-300';
const regMutedClass = 'text-slate-400';
const regAlertClass = 'rounded-lg border border-slate-600 bg-slate-800/80 p-4 text-slate-300';

function RegStepShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 md:p-8 text-slate-100">
      <header className="mb-6 space-y-2 text-right">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {description ? <p className={`text-sm leading-relaxed ${regMutedClass}`}>{description}</p> : null}
      </header>
      {children}
    </div>
  );
}

interface FormData {
  tier: SubscriptionTier | '';
  /** إضافة برمجية متقدمة (Add-on): المناوب الرقمي — ماسي فقط (+25 ر.س/حزمة) */
  digitalShiftAddon: boolean;
  shopName: string;
  email: string;
  phone: string;
  whatsapp: string;
  categories: string[];
  /** تعهد قانوني إلزامي قبل إتمام التسجيل */
  legalDisclaimerAccepted: boolean;
  /** التزام مهني إلزامي قبل إتمام التسجيل */
  professionalCommitmentAccepted: boolean;
  location: {
    lat: string;
    lng: string;
    address: string;
    /** من بيانات العنوان الوطني (ملفات lite) */
    saudi: SaudiLocationSelection;
  };
  images: {
    /** صورة واحدة لواجهة المحل من الخارج — إلزامي لجميع الباقات */
    shopExterior: File | null;
    /** صورة واحدة من داخل المحل — إلزامي لجميع الباقات */
    shopInterior: File | null;
    /** أربع صور للبنر — إلزامي لجميع الباقات */
    bannerImages: [File | null, File | null, File | null, File | null];
  };
  services: {
    name: string;
    price: string;
  }[];
  /** اختياري: تسهيلات بالمحل و/أو زيارة منزلية — عند التفعيل يلزم سعر معروض */
  inclusiveAccessibleCare: {
    offered: boolean;
    price: string;
  };
  /** سبعة أيام — للباقة البرونزية يُحدَّد هنا ويُثبَّت في العرض */
  workingWeek: WorkingWeekFormRow[];
  payment: {
    method: 'monthly' | '';
  };
  /** إلزامي قبل «إرسال الطلب»: تأشير صريح بالموافقة على الشروط والسياسات */
  registrationTermsAccepted: boolean;
}

/** @deprecated استورد من `@/config/honorBoardManifesto` */
export { REGISTRATION_LEGAL_DISCLAIMER_AR } from '@/config/honorBoardManifesto';

const STEPS = [
  { id: 1, title: 'اختيار الباقة', icon: Star },
  { id: 2, title: 'بيانات المحل', icon: FileText },
  { id: 3, title: 'الموقع', icon: MapPin },
  { id: 4, title: 'الصور', icon: ImageIcon },
  { id: 5, title: 'أوقات العمل', icon: Clock },
  { id: 6, title: 'المنيو والرعاية المُيسَّرة', icon: FileText },
  { id: 7, title: 'الدفع', icon: CreditCard },
];

type FormPlanFeature = { kind: 'map_hero' } | { kind: 'line'; text: string };

const SUBSCRIPTION_PLANS: {
  tier: SubscriptionTier;
  tierLevel: string;
  label: string;
  features: FormPlanFeature[];
  strategic?: boolean;
  digitalShiftAddonAvailable?: boolean;
}[] = [
  {
    tier: SubscriptionTier.BRONZE,
    tierLevel: 'برونزي',
    label: SOFTWARE_PACKAGE_UNIT_LABEL_AR,
    features: [
      { kind: 'map_hero' },
      { kind: 'line', text: '⭐ شارة رائد لامعة على بنرك — حصرية لألف الرواد الأوائل بلا تمييز بين الباقات' },
      { kind: 'line', text: 'ظهور عند الطلب للزبائن القريبين منك عندما يبحثون الآن' },
      { kind: 'line', text: 'بطاقة صالون واضحة: موقع، اتصال، واتساب، وصور أساسية' },
      { kind: 'line', text: 'صور واجهة وداخل + بنر أساسي تعطي انطباعاً حقيقياً قبل الزيارة' },
      { kind: 'line', text: 'أوقات عمل وحالة مفتوح/مغلق لتقليل الاتصالات في الوقت الخطأ' },
      { kind: 'line', text: SHOP_OPEN_STATUS_FEATURE_BRONZE },
    ],
  },
  {
    tier: SubscriptionTier.GOLD,
    tierLevel: 'ذهبي',
    label: SOFTWARE_PACKAGE_UNIT_LABEL_AR,
    features: [
      { kind: 'map_hero' },
      { kind: 'line', text: '⭐ شارة رائد لامعة على بنرك — حصرية لألف الرواد الأوائل بلا تمييز بين الباقات' },
      { kind: 'line', text: 'أولوية ذهبية عند الطلب تمنح صالونك حضوراً أوضح أمام المنافسين' },
      { kind: 'line', text: 'معرض أعمال حتى 20 صورة لإقناع العميل قبل أن يتواصل' },
      { kind: 'line', text: RATING_QR_PLAN_LINE },
      { kind: 'line', text: 'واتساب وشات مباشر بجلسة خاصة لتقليل تردد العميل وتحويل الظهور إلى تواصل' },
      { kind: 'line', text: 'خدمات كبار السن وذوي الاحتياجات مع تحكم في السعر والظهور والملاحظات' },
      { kind: 'line', text: SHOP_OPEN_STATUS_FEATURE_GOLD_DIAMOND },
    ],
  },
  {
    tier: SubscriptionTier.DIAMOND,
    tierLevel: 'ماسي',
    label: SOFTWARE_PACKAGE_UNIT_LABEL_AR,
    strategic: true,
    digitalShiftAddonAvailable: true,
    features: [
      { kind: 'map_hero' },
      { kind: 'line', text: '⭐ شارة رائد لامعة على بنرك — حصرية لألف الرواد الأوائل بلا تمييز بين الباقات' },
      { kind: 'line', text: 'أعلى أولوية ماسية للطلبات القريبة لمن يريد صدارة منطقته' },
      { kind: 'line', text: 'واجهة فاخرة: بنر متوهج، معرض حتى 40 صورة، وشارة نخبة للثقة' },
      { kind: 'line', text: 'شات خاص مع ترجمة فورية لخدمة السياح والعملاء متعددي اللغات' },
      { kind: 'line', text: '🌙 Add-on اختياري (+25 ر.س): المناوب الرقمي الذكي — يرد على زبائنك بذكاء عند الإغلاق أو تأخر الرد بـ7 لغات' },
      { kind: 'line', text: '🔒 المكتب الخاص — محادثة داخلية حصرية بينك وبين مناوبك: تعليمات دائمة، قائمة مهام، رصيد حزمتك، روابط الدفع والدعم' },
      { kind: 'line', text: BARBER_DASHBOARD_DIAMOND_PORTAL_LINE },
    ],
  },
];

const CATEGORIES = [
  'حلاقة رجالي',
  'حلاقة أطفال',
  'حلاقة تقليدية',
  'احتياجات خاصة',
  'زيارة منزلية',
  'تشذيب لحية',
  'صبغ شعر',
  'عناية بالبشرة',
];

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const MAX_RECEIPT_STORAGE_BYTES = 600 * 1024;

export function RegistrationForm() {
  const navigate = useNavigate();
  const vatSettings = usePlatformVatSettings();
  const formTopRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const bannerPicker = useBarberBannerImagePicker();
  const [formData, setFormData] = useState<FormData>({
    tier: '',
    digitalShiftAddon: false,
    shopName: '',
    email: '',
    phone: '',
    whatsapp: '',
    categories: [],
    legalDisclaimerAccepted: false,
    professionalCommitmentAccepted: false,
    location: {
      lat: '',
      lng: '',
      address: '',
      saudi: {
        regionId: '',
        cityId: '',
        districtId: '',
        districtOther: '',
      },
    },
    images: {
      shopExterior: null,
      shopInterior: null,
      bannerImages: [null, null, null, null],
    },
    services: [{ name: '', price: '' }],
    inclusiveAccessibleCare: { offered: false, price: '' },
    workingWeek: createInitialWorkingWeekForm(),
    payment: {
      method: 'monthly',
    },
    registrationTermsAccepted: false,
  });

  /** عند الانتقال بين خطوات التسجيل يُمرَّر العرض لأعلى النموذج (وليس للفوتر). */
  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => window.cancelAnimationFrame(id);
  }, [currentStep]);

  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = () => {
    // Validation for each step
    if (currentStep === 1 && !formData.tier) {
      alert('يرجى اختيار باقة قبل المتابعة');
      return;
    }
    if (currentStep === 2) {
      if (!formData.shopName || !formData.email || !formData.phone || !formData.whatsapp || formData.categories.length === 0) {
        alert('يرجى تعبئة جميع الحقول المطلوبة');
        return;
      }
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('يرجى إدخال بريد إلكتروني صحيح');
        return;
      }
      // Phone validation (Saudi format)
      const phoneRegex = /^05\d{8}$/;
      if (!phoneRegex.test(formData.phone)) {
        alert('يرجى إدخال رقم هاتف صحيح (يبدأ بـ 05 ويتكون من 10 أرقام)');
        return;
      }
      if (!phoneRegex.test(formData.whatsapp)) {
        alert('يرجى إدخال رقم واتساب صحيح (يبدأ بـ 05 ويتكون من 10 أرقام)');
        return;
      }
    }
    if (currentStep === 3) {
      const { saudi, address, lat, lng } = formData.location;
      if (!saudi.regionId || !saudi.cityId || !saudi.districtId) {
        alert('يرجى اختيار المنطقة والمدينة والحي من القوائم.');
        return;
      }
      if (saudi.districtId === OTHER_DISTRICT_VALUE && !saudi.districtOther.trim()) {
        alert('يرجى كتابة اسم الحي عند اختيار «حي غير مدرج».');
        return;
      }
      if (!address.trim()) {
        alert('يرجى إدخال العنوان التفصيلي (الشارع أو المعلم القريب).');
        return;
      }
      const latN = parseFloat(lat);
      const lngN = parseFloat(lng);
      if (!lat.trim() || !lng.trim() || Number.isNaN(latN) || Number.isNaN(lngN)) {
        alert('يرجى إدخال خطي العرض والطول بشكل صحيح أو استخدام «حدد موقعي الحالي».');
        return;
      }
    }
    if (currentStep === 4) {
      if (!formData.images.shopExterior || !formData.images.shopInterior) {
        alert('يرجى رفع صورة واحدة لواجهة المحل من الخارج وصورة واحدة من الداخل (إلزامي لجميع الباقات).');
        return;
      }
      if (formData.images.bannerImages.some((f) => !f)) {
        alert('يرجى رفع أربع صور للبنر (كل خانة إلزامية) لعرض محلك في البطاقة.');
        return;
      }
    }
    if (currentStep === 5) {
      if (formData.tier === SubscriptionTier.BRONZE) {
        for (const row of formData.workingWeek) {
          if (!row.closed && (!row.open.trim() || !row.close.trim())) {
            alert(
              'الباقة البرونزية: يرجى تحديد وقت الفتح والإغلاق لكل يوم مفتوح، أو تفعيل «مغلق» لأيام الإجازة.'
            );
            return;
          }
        }
      }
    }
    if (currentStep === 6) {
      const namedServices = formData.services.filter((s) => s.name.trim());
      if (namedServices.length === 0) {
        alert('أضف خدمة واحدة على الأقل في المنيو (اسم الخدمة مطلوب).');
        return;
      }
      if (formData.inclusiveAccessibleCare.offered) {
        const p = parseFloat(String(formData.inclusiveAccessibleCare.price).replace(/,/g, '.'));
        if (!Number.isFinite(p) || p <= 0) {
          alert(
            'عند تأشير «خدمة مُيسَّرة / منزلية»: أدخل سعراً معروضاً بالريال أكبر من صفر، أو ألغِ التأشير إن لم تُوفّر الخدمة.'
          );
          return;
        }
      }
    }

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const patchWorkingWeekRow = (index: number, patch: Partial<WorkingWeekFormRow>) => {
    setFormData((prev) => ({
      ...prev,
      workingWeek: prev.workingWeek.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    }));
  };

  const setShopExterior = (file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      images: { ...prev.images, shopExterior: file },
    }));
  };

  const setShopInterior = (file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      images: { ...prev.images, shopInterior: file },
    }));
  };

  const setBannerImage = (index: 0 | 1 | 2 | 3, file: File | null) => {
    setFormData((prev) => {
      const next: [File | null, File | null, File | null, File | null] = [...prev.images.bannerImages] as [
        File | null,
        File | null,
        File | null,
        File | null,
      ];
      next[index] = file;
      return { ...prev, images: { ...prev.images, bannerImages: next } };
    });
  };

  const handleGetLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              lat: position.coords.latitude.toFixed(6),
              lng: position.coords.longitude.toFixed(6),
            },
          }));
          setLocationLoading(false);
        },
        () => {
          setLocationLoading(false);
        }
      );
    } else {
      setLocationLoading(false);
    }
  };

  const handleTestLocation = () => {
    if (formData.location.lat && formData.location.lng) {
      window.open(
        `https://www.google.com/maps?q=${formData.location.lat},${formData.location.lng}`,
        '_blank'
      );
    }
  };

  const addService = () => {
    setFormData((prev) => ({
      ...prev,
      services: [...prev.services, { name: '', price: '' }],
    }));
  };

  const removeService = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.tier) {
      alert('يرجى اختيار الباقة');
      return;
    }
    if (!formData.payment.method) {
      alert('يرجى اختيار طريقة الدفع');
      return;
    }
    if (!formData.registrationTermsAccepted) {
      toast.error('يجب تأشير الموافقة الصريحة على شروط التسجيل وسياسة الشركاء قبل الإرسال.');
      window.requestAnimationFrame(() =>
        formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      );
      return;
    }
    if (!formData.legalDisclaimerAccepted) {
      toast.error('يجب تأشير التعهد القانوني الإلزامي قبل الإرسال.');
      window.requestAnimationFrame(() =>
        formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      );
      return;
    }
    if (!formData.professionalCommitmentAccepted) {
      toast.error('يجب تأشير الالتزام المهني الإلزامي قبل الإرسال.');
      window.requestAnimationFrame(() =>
        formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      );
      return;
    }
    if (!formData.images.shopExterior || !formData.images.shopInterior) {
      alert('يرجى إكمال خطوة الصور: صورة خارجية وصورة داخلية إلزاميتان.');
      return;
    }
    if (formData.images.bannerImages.some((f) => !f)) {
      alert('يرجى إكمال خطوة الصور: أربع صور للبنر إلزامية.');
      return;
    }
    if (formData.tier === SubscriptionTier.BRONZE) {
      for (const row of formData.workingWeek) {
        if (!row.closed && (!row.open.trim() || !row.close.trim())) {
          alert('يرجى إكمال أوقات العمل: لكل يوم مفتوح حدّد وقت الفتح والإغلاق (الباقة البرونزية إلزامية).');
          return;
        }
      }
    }
    const namedServicesSubmit = formData.services.filter((s) => s.name.trim());
    if (namedServicesSubmit.length === 0) {
      alert('أضف خدمة واحدة على الأقل في المنيو (اسم الخدمة مطلوب) قبل الإرسال.');
      return;
    }
    if (formData.inclusiveAccessibleCare.offered) {
      const p = parseFloat(String(formData.inclusiveAccessibleCare.price).replace(/,/g, '.'));
      if (!Number.isFinite(p) || p <= 0) {
        alert(
          'عند تأشير خدمة كبار السن والمرضى وذوي الاحتياجات: أدخل سعراً معروضاً بالريال أكبر من صفر، أو ألغِ التأشير.'
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const orderId = generateRegistrationOrderId();
      const submittedAtLabel = formatSubmissionDateTimeAr();
      const submittedAtIso = new Date().toISOString();

      const minted = await mintRegistrationIntentTokenRemote(orderId);
      if (!minted.ok) {
        toast.error(minted.error);
        setIsSubmitting(false);
        return;
      }
      const intentToken = minted.intentToken;

      let registrationAttachmentUrls: RegistrationAttachmentUrls | undefined;
      const supabase = getSupabaseClient();
      /* 1) رفع المرفقات أولاً — يتطلب orderId مطابقاً لسياسة التخزين؛ فشل مبكر دون تحميل بيانات إضافية */
      if (supabase) {
        const up = await uploadRegistrationAttachments(
          supabase,
          orderId,
          {
            shopExterior: formData.images.shopExterior!,
            shopInterior: formData.images.shopInterior!,
            bannerImages: formData.images.bannerImages.filter(Boolean) as File[],
            receipt: null,
          },
          { intentToken }
        );
        if (!up.ok) {
          const uploadError = 'error' in up ? up.error : 'تعذر رفع المرفقات.';
          toast.error(registrationUploadErrorForToast(uploadError));
          window.requestAnimationFrame(() =>
            formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          );
          return;
        }
        registrationAttachmentUrls = up.urls;
      }

      const geoBundle = await loadSaudiGeoLite();
      const composedAddress = composeSaudiLocationLine(
        geoBundle,
        formData.location.saudi,
        formData.location.address || ''
      );

      const docLabels: string[] = [
        `التعهد القانوني: تم التأشير بتاريخ ${submittedAtIso} — صاحب المحل يقر بامتثال المنشأة النظامي وتحمّل المسؤولية وإخلاء مسؤولية منصة حلاق ماب.`,
        `الالتزام المهني: تم التأشير بتاريخ ${submittedAtIso} — الشريك يقر بمعايير الجودة والشفافية وامتثال منشأته للأنظمة المعمول بها.`,
      ];
      if (
        formData.tier === SubscriptionTier.DIAMOND &&
        isDigitalShiftAddonAllowed(SubscriptionTier.DIAMOND, formData.digitalShiftAddon)
      ) {
        docLabels.push(
          `إضافة برمجية متقدمة: المناوب الرقمي الذكي (+${DIGITAL_SHIFT_MONTHLY_ADDON_SAR} ر.س/حزمة رخصة) — Add-on اختياري يعزّز الرخصة التقنية.`,
        );
      }

      const servicesSummaryLines = formData.services
        .filter((s) => s.name.trim())
        .map((s) => `${s.name.trim()} — ${s.price || '—'} ر.س`);
      const inclusivePriceParsed = parseFloat(
        String(formData.inclusiveAccessibleCare.price).replace(/,/g, '.')
      );
      let inclusiveAccessibleCarePayload: InclusiveAccessibleCareOffer | undefined;
      if (formData.inclusiveAccessibleCare.offered && Number.isFinite(inclusivePriceParsed) && inclusivePriceParsed > 0) {
        inclusiveAccessibleCarePayload = {
          offered: true,
          displayedPriceSar: Math.round(inclusivePriceParsed * 100) / 100,
        };
        servicesSummaryLines.push(
          `خدمة كبار السن والمرضى وذوي الاحتياجات (تسهيلات بالمحل و/أو زيارة منزلية بحسب الحالة) — ${inclusiveAccessibleCarePayload.displayedPriceSar} ر.س (معروض)`
        );
      }
      const servicesSummary = servicesSummaryLines.join('\n');

      const weeklyWorkingHoursPayload = workingWeekFormToPayload(formData.workingWeek);
      const workingHoursSummaryText = weeklyWorkingHoursPayload
        .map((h) => `${h.day}: ${h.open === 'مغلق' ? 'مغلق' : `${h.open} – ${h.close}`}`)
        .join('\n');

      const lat = parseFloat(formData.location.lat) || 0;
      const lng = parseFloat(formData.location.lng) || 0;
      const partnerAttribution = loadPartnerAttribution();

      const request: SubscriptionRequest = {
        id: orderId,
        barberName: formData.shopName,
        email: formData.email,
        phone: saPhoneToInternational(formData.phone),
        whatsapp: saPhoneToInternational(formData.whatsapp),
        location: {
          lat,
          lng,
          address: formData.location.address || '—',
        },
        tier: formData.tier as SubscriptionTier,
        documents: docLabels,
        shopImages: registrationAttachmentUrls
          ? [
              registrationAttachmentUrls.shopExterior!,
              registrationAttachmentUrls.shopInterior!,
              ...(registrationAttachmentUrls.banners ?? []),
            ]
          : [
              `خارجي: ${formData.images.shopExterior?.name ?? '—'}`,
              `داخلي: ${formData.images.shopInterior?.name ?? '—'}`,
              ...formData.images.bannerImages.map((f, i) =>
                f ? `بنر ${i + 1}: ${f.name}` : `بنر ${i + 1}: —`
              ),
            ],
        status: 'pending',
        submittedAt: submittedAtLabel,
        source: 'registration',
        partnerAttribution,
        paymentMethod: formData.payment.method,
        registrationAttachmentUrls,
        legalDisclaimerAccepted: true,
        legalDisclaimerAcceptedAtIso: submittedAtIso,
        weeklyWorkingHours: weeklyWorkingHoursPayload,
        servicesSummary: servicesSummary || '—',
        ...(inclusiveAccessibleCarePayload
          ? { inclusiveAccessibleCare: inclusiveAccessibleCarePayload }
          : {}),
        categories: [...formData.categories],
        registrationTermsAccepted: true,
        registrationTermsAcceptedAtIso: submittedAtIso,
        professionalCommitmentAccepted: true,
        professionalCommitmentAcceptedAtIso: submittedAtIso,
        digitalShiftAddonSelected:
          formData.tier === SubscriptionTier.DIAMOND &&
          isDigitalShiftAddonAllowed(SubscriptionTier.DIAMOND, formData.digitalShiftAddon),
      };

      /* 3) حفظ الطلب في قاعدة البيانات ثم النسخ المحلي (عند تهيئة Supabase) */
      const appended = await appendSubscriptionRequest(request, { intentToken });
      if (!appended.ok) {
        const ref = `\u2066${orderId}\u2069`;
        const submissionError = 'error' in appended ? appended.error : 'تعذر حفظ الطلب.';
        toast.error(`${registrationSubmissionErrorForToast(submissionError)} (مرجع الطلب: ${ref})`);
        window.requestAnimationFrame(() =>
          formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        );
        return;
      }

      const plan = SUBSCRIPTION_PLANS.find((p) => p.tier === formData.tier);
      const tierName = plan?.tierLevel ?? String(formData.tier);
      const unitSarForSummary =
        formData.tier && plan
          ? computeListingLicenseUnitSar(
              formData.tier as SubscriptionTier,
              isDigitalShiftAddonAllowed(formData.tier as SubscriptionTier, formData.digitalShiftAddon)
                ? { digitalShiftAddon: true }
                : undefined,
            )
          : 0;
      const payLabel = 'حزمة رخصة (ميسر — بطاقة)';

      const attributionLines = partnerAttribution
        ? [
            `مسار الاستقطاب (UTM):`,
            `- capturedAt: ${partnerAttribution.capturedAtIso}`,
            `- pagePath: ${partnerAttribution.pagePath}`,
            `- referrer: ${partnerAttribution.referrer || '—'}`,
            `- utm_source: ${partnerAttribution.utmSource || '—'}`,
            `- utm_medium: ${partnerAttribution.utmMedium || '—'}`,
            `- utm_campaign: ${partnerAttribution.utmCampaign || '—'}`,
            `- utm_term: ${partnerAttribution.utmTerm || '—'}`,
            `- utm_content: ${partnerAttribution.utmContent || '—'}`,
            `- gclid: ${partnerAttribution.gclid || '—'}`,
            `- fbclid: ${partnerAttribution.fbclid || '—'}`,
            `- ttclid: ${partnerAttribution.ttclid || '—'}`,
            `- msclkid: ${partnerAttribution.msclkid || '—'}`,
          ].join('\n')
        : 'مسار الاستقطاب (UTM): غير متوفر';

      const summaryForDownload =
        `حلاق ماب — طلب حزمة إدراج برمجية\n` +
        `================================\n` +
        `رقم الطلب: ${orderId}\n` +
        `تاريخ التقديم: ${submittedAtLabel}\n` +
        `\n` +
        `اسم المحل: ${formData.shopName}\n` +
        `البريد: ${formData.email}\n` +
        `الهاتف: ${formData.phone}\n` +
        `الواتساب: ${formData.whatsapp}\n` +
        `الباقة: ${tierPackageSummary(
          tierName,
          unitSarForSummary,
          formData.tier === SubscriptionTier.DIAMOND && formData.digitalShiftAddon,
        )}\n` +
        `تصنيفات: ${formData.categories.join('، ') || '—'}\n` +
        `طريقة الدفع: ${payLabel}\n` +
        `${attributionLines}\n` +
        `\n` +
        `العنوان: ${composedAddress || formData.location.address || '—'}\n` +
        `الإحداثيات: ${formData.location.lat || '—'}, ${formData.location.lng || '—'}\n` +
        `\n` +
        `الخدمات والأسعار:\n${servicesSummary || '—'}\n` +
        `\n` +
        `أوقات العمل (أسبوع كامل):\n${workingHoursSummaryText}\n` +
        `\n` +
        `التعهد القانوني:\n${REGISTRATION_LEGAL_DISCLAIMER_AR}\n` +
        `(تم التأشير — ${submittedAtIso})\n` +
        `\n` +
        `الالتزام المهني:\n${HONOR_BOARD_PROFESSIONAL_COMMITMENT_LEAD}\n` +
        `(تم التأشير — ${submittedAtIso})\n` +
        `\n` +
        `صور المحل (أسماء الملفات):\n` +
        `  — خارجي: ${formData.images.shopExterior?.name ?? '—'}\n` +
        `  — داخلي: ${formData.images.shopInterior?.name ?? '—'}\n` +
        `  — بنر (4): ${formData.images.bannerImages
          .filter(Boolean)
          .map((f) => f!.name)
          .join('، ')}\n` +
        (registrationAttachmentUrls
          ? `\nروابط المرفقات على السيرفر (صور المحل والإيصال فقط):\n` +
            `- صورة خارجية: ${registrationAttachmentUrls.shopExterior}\n` +
            `- صورة داخلية: ${registrationAttachmentUrls.shopInterior}\n` +
            `- بنرات: ${(registrationAttachmentUrls.banners ?? []).join(' | ')}\n`
          : '') +
        `\n` +
        `— نهاية الملخص —\n`;

      const mailtoBodyShort =
        `رقم الطلب: ${orderId}\n` +
        `التقديم: ${submittedAtLabel}\n` +
        `المحل: ${formData.shopName}\n` +
        `الباقة: ${tierPackageSummary(
          tierName,
          unitSarForSummary,
          formData.tier === SubscriptionTier.DIAMOND && formData.digitalShiftAddon,
        )}\n` +
        `الدفع: ${payLabel}\n` +
        `\n` +
        `للاطلاع على التفاصيل الكاملة استخدم زر «تحميل ملخص الطلب» في صفحة التأكيد.\n`;

      saveLastOrderConfirmation({
        orderId,
        submittedAtLabel,
        submittedAtIso,
        email: formData.email,
        shopName: formData.shopName,
        tier: formData.tier as SubscriptionTier,
        paymentMethod: formData.payment.method,
        summaryForDownload,
        mailtoBodyShort,
      });

      toast.success('تم إرسال الطلب. طلبك قيد المراجعة وسيتم التواصل معك بعد التدقيق.');
      await new Promise((r) => setTimeout(r, 600));
      navigate(ROUTE_PATHS.REGISTER_SUCCESS);
    } finally {
      setIsSubmitting(false);
    }
  };

  const registrationPlansOrdered = useMemo(
    () =>
      LISTING_LICENSE_PRICING_DISPLAY_ORDER.map(
        (tier) => SUBSCRIPTION_PLANS.find((plan) => plan.tier === tier)!,
      ),
    [],
  );

  const selectedUnitSar = useMemo(() => {
    if (!formData.tier) return 0;
    return computeListingLicenseUnitSar(
      formData.tier as SubscriptionTier,
      isDigitalShiftAddonAllowed(formData.tier as SubscriptionTier, formData.digitalShiftAddon)
        ? { digitalShiftAddon: true }
        : undefined,
    );
  }, [formData.tier, formData.digitalShiftAddon]);

  const selectedPlan = SUBSCRIPTION_PLANS.find((p) => p.tier === formData.tier);
  const monthlyPriceBreakdown = useMemo(
    () => (formData.tier ? calcVatBreakdown(selectedUnitSar, vatSettings) : null),
    [formData.tier, selectedUnitSar, vatSettings],
  );

  const tierPackageSummary = (tierName: string, unitSar: number, withShift: boolean) =>
    `${tierName} — ${unitSar} ر.س${withShift ? ` (+ Add-on المناوب ${DIGITAL_SHIFT_MONTHLY_ADDON_SAR})` : ''}`;

  return (
    <div
      ref={formTopRef}
      className="w-full max-w-4xl mx-auto py-4 px-1 sm:px-2 scroll-mt-24 min-w-0 overflow-x-hidden text-slate-100"
    >
      <div className="mb-8 w-full min-w-0 rounded-xl border border-slate-700 bg-slate-900 p-4 md:p-6">
        <p className="text-center text-sm font-medium text-slate-400 mb-3 md:hidden">
          الخطوة {currentStep} من {STEPS.length}
        </p>
        <div className="overflow-x-auto overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch] pb-2 md:overflow-visible">
          <div className="flex items-center mb-4 min-w-max md:min-w-0 md:w-full md:justify-between pr-1 md:pr-0">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <div key={step.id} className="flex items-center shrink-0">
                  <div
                    className={`flex flex-col items-center w-[4.5rem] sm:w-[5.25rem] md:flex-1 md:w-auto md:min-w-0 ${
                      index < STEPS.length - 1 ? '' : ''
                    }`}
                  >
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-slate-100 text-slate-900'
                          : isCompleted
                            ? 'bg-slate-700 text-slate-100'
                            : 'bg-slate-800 text-slate-500 border border-slate-600'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs mt-1.5 text-center leading-tight px-0.5 line-clamp-2 max-w-[4.5rem] sm:max-w-none ${
                        isActive ? 'text-white font-semibold' : 'text-slate-500'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 w-6 sm:w-8 md:flex-1 shrink-0 mx-1 sm:mx-2 transition-colors ${
                        isCompleted ? 'bg-slate-400' : 'bg-slate-700'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <Progress value={progress} className="h-2 bg-slate-800 [&>div]:bg-slate-300" />
      </div>

      <div key={currentStep} className="min-w-0">
          {currentStep === 1 && (
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 md:p-8 text-slate-100">
              <header className="mb-6 space-y-2 text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  حزم رخصة B2B
                </p>
                <h2 className="text-2xl font-bold text-white">اختر حزمة الرخصة المناسبة</h2>
                <p className="text-sm leading-relaxed text-slate-300">
                  {SOFTWARE_PACKAGE_GEO_PRESENCE_TITLE_AR} — مبنية على{' '}
                  <span className="font-semibold text-slate-100">{SOFTWARE_PACKAGE_FOUNDATION_LABEL_AR}</span>{' '}
                  كأساس تقني لكل مستوى.
                </p>
              </header>
              <FoundersDealBanner />

              <RadioGroup
                value={formData.tier}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    tier: value as SubscriptionTier,
                    digitalShiftAddon:
                      value === SubscriptionTier.DIAMOND ? prev.digitalShiftAddon : false,
                  }))
                }
                className="grid gap-4 md:grid-cols-3 md:items-stretch"
              >
                {registrationPlansOrdered.map((plan) => {
                  const isSelected = formData.tier === plan.tier;
                  const isStrategic = plan.strategic === true;
                  const shiftActive =
                    plan.tier === SubscriptionTier.DIAMOND &&
                    isDigitalShiftAddonAllowed(plan.tier, formData.digitalShiftAddon);
                  const unitSar = computeListingLicenseUnitSar(
                    plan.tier,
                    shiftActive ? { digitalShiftAddon: true } : undefined,
                  );
                  return (
                    <label
                      key={plan.tier}
                      className="relative flex cursor-pointer flex-col"
                    >
                      {isStrategic ? (
                        <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded border border-slate-500 bg-slate-700 px-3 py-0.5 text-[11px] font-semibold text-slate-100">
                          الاختيار الاستراتيجي
                        </span>
                      ) : null}
                      <div
                        className={[
                          'flex h-full min-h-[520px] flex-col rounded-lg bg-slate-800 p-5 text-right',
                          isStrategic
                            ? 'border-2 border-slate-500'
                            : 'border border-slate-700',
                          isSelected ? 'ring-1 ring-slate-400' : '',
                        ].join(' ')}
                      >
                        <div className="mb-4 flex items-start gap-3">
                          <RadioGroupItem
                            value={plan.tier}
                            id={plan.tier}
                            className="mt-1 border-slate-500 text-slate-100"
                          />
                          <div className="min-w-0 flex-1 space-y-1">
                            <p className="text-xs text-slate-400">{plan.tierLevel}</p>
                            <h3 className="text-base font-bold leading-snug text-white">
                              {SOFTWARE_PACKAGE_GEO_PRESENCE_TITLE_AR}
                            </h3>
                            <p className="text-2xl font-bold text-white">
                              {unitSar}{' '}
                              <span className="text-sm font-normal text-slate-400">ريال</span>
                              <span className="text-xs font-normal text-slate-500"> /{plan.label}</span>
                            </p>
                            {shiftActive ? (
                              <p className="text-[11px] text-slate-500">
                                + Add-on المناوب ({DIGITAL_SHIFT_MONTHLY_ADDON_SAR} ر.س)
                              </p>
                            ) : null}
                          </div>
                        </div>
                        {plan.digitalShiftAddonAvailable && isSelected ? (
                          <DigitalShiftAddonToggle
                            checked={formData.digitalShiftAddon}
                            onCheckedChange={(checked) =>
                              setFormData((prev) => ({ ...prev, digitalShiftAddon: checked }))
                            }
                            id="registration-digital-shift"
                            className="mb-3 mt-0"
                          />
                        ) : null}
                        <ul className="m-0 flex flex-1 list-none flex-col gap-2 p-0">
                          {plan.features.map((feature, index) =>
                            feature.kind === 'map_hero' ? (
                              <li key={index} className="mb-1 list-none">
                                <div className="rounded-lg border border-slate-600 bg-slate-900 p-3">
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-600 bg-slate-800 text-slate-200">
                                      <MapPin className="h-5 w-5" strokeWidth={2} aria-hidden />
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-0.5">
                                      <p className="text-sm font-semibold leading-snug text-slate-100">
                                        {MAP_FEATURE_HERO.title}
                                      </p>
                                      <p className="text-[11px] leading-relaxed text-slate-400 sm:text-xs">
                                        {MAP_FEATURE_HERO.subtitle}
                                      </p>
                                    </div>
                                    <Check className="h-4 w-4 shrink-0 text-slate-300" aria-label="مشمول" />
                                  </div>
                                </div>
                              </li>
                            ) : (
                              <li key={index} className="flex items-start gap-2 text-sm leading-relaxed text-slate-300">
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                <span>{feature.text}</span>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    </label>
                  );
                })}
              </RadioGroup>
            </div>
          )}
          {currentStep === 2 && (
            <RegStepShell title="بيانات المحل" description="أدخل معلومات محل الحلاقة">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shopName" className={regLabelClass}>
                    اسم المحل *
                  </Label>
                  <Input
                    id="shopName"
                    placeholder="مثال: صالون الأناقة"
                    value={formData.shopName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, shopName: e.target.value }))
                    }
                    className={regFieldClass}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className={regLabelClass}>
                    البريد الإلكتروني *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@domain.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className={regFieldClass}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className={regLabelClass}>
                      رقم الهاتف *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="05xxxxxxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      className={regFieldClass}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className={regLabelClass}>
                      رقم الواتساب *
                    </Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      placeholder="05xxxxxxxx"
                      value={formData.whatsapp}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, whatsapp: e.target.value }))
                      }
                      className={regFieldClass}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className={regLabelClass}>نوع الخدمات *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {CATEGORIES.map((category) => (
                      <div key={category} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox
                          id={category}
                          checked={formData.categories.includes(category)}
                          onCheckedChange={(checked) => {
                            setFormData((prev) => ({
                              ...prev,
                              categories: checked
                                ? [...prev.categories, category]
                                : prev.categories.filter((c) => c !== category),
                            }));
                          }}
                          className="border-slate-500 data-[state=checked]:bg-slate-200 data-[state=checked]:text-slate-900"
                        />
                        <Label htmlFor={category} className={`cursor-pointer ${regLabelClass}`}>
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </RegStepShell>
          )}

          {currentStep === 3 && (
            <RegStepShell title="تحديد الموقع" description="حدد موقع محلك بدقة عبر نظام الرصد الذكي">
              <div className="space-y-4">
                <SaudiRegionCityDistrictFields
                  value={formData.location.saudi}
                  onChange={(saudi) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: { ...prev.location, saudi },
                    }))
                  }
                  disabled={isSubmitting}
                />
                <Alert className={regAlertClass}>
                  <AlertCircle className="h-4 w-4 text-slate-400" />
                  <AlertDescription className="text-slate-300">
                    يمكنك الحصول على الإحداثيات من خرائط جوجل بالضغط مطولاً على موقع المحل
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lat" className={regLabelClass}>خط العرض (Latitude) *</Label>
                    <Input
                      id="lat"
                      placeholder="24.7136"
                      value={formData.location.lat}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          location: { ...prev.location, lat: e.target.value },
                        }))
                      }
                      className={regFieldClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lng" className={regLabelClass}>خط الطول (Longitude) *</Label>
                    <Input
                      id="lng"
                      placeholder="46.6753"
                      value={formData.location.lng}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          location: { ...prev.location, lng: e.target.value },
                        }))
                      }
                      className={regFieldClass}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className={regLabelClass}>العنوان التفصيلي (الشارع / المبنى / علامة مميزة) *</Label>
                  <Textarea
                    id="address"
                    placeholder="مثال: شارع الأمير سلطان، مجمع النخيل، مدخل B"
                    value={formData.location.address}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: { ...prev.location, address: e.target.value },
                      }))
                    }
                    rows={3}
                    className={regFieldClass}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGetLocation}
                    disabled={locationLoading}
                    className="flex-1 border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700"
                  >
                    {locationLoading ? (
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    ) : (
                      <MapPin className="w-4 h-4 ml-2" />
                    )}
                    حدد موقعي الحالي
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestLocation}
                    disabled={!formData.location.lat || !formData.location.lng}
                    className="flex-1 border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700"
                  >
                    <MapPin className="w-4 h-4 ml-2" />
                    اختبر الموقع
                  </Button>
                </div>
              </div>
            </RegStepShell>
          )}

          {currentStep === 4 && (
            <RegStepShell
              title="صور المحل والبنر"
              description="لجميع الباقات: صورتان أساسيتان (خارج وداخل) وأربع صور مخصّصة لمنطقة البنر في بطاقة المحل"
            >
              <div className="space-y-6">
                {(formData.tier === SubscriptionTier.GOLD || formData.tier === SubscriptionTier.DIAMOND) && (
                  <Alert className="border-slate-500 bg-slate-800/80">
                    <Sparkles className="h-4 w-4 text-slate-300" />
                    <AlertDescription className="text-sm leading-relaxed text-slate-300">
                      بعد تفعيل حزمتك البرمجية يمكنك <strong>إضافة وحذف وتعديل</strong> صور المحل والبنر من{' '}
                      <strong>لوحة التحكم</strong> في أي وقت. ما ترفعه هنا هو المعتمد لمراجعة الطلب الأولى.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <Label htmlFor="shop-exterior" className={regLabelClass}>صورة واحدة — واجهة المحل من الخارج *</Label>
                  <p className={`text-xs ${regMutedClass}`}>
                    صورة واضحة للمدخل أو الواجهة؛ تُستخدم كمرجع أساسي لجميع فئات حزم الرخصة.
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      id="shop-exterior"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        setShopExterior(e.target.files?.[0] || null);
                        e.target.value = '';
                      }}
                    />
                    {formData.images.shopExterior && (
                      <span className="text-sm text-primary flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        {formData.images.shopExterior.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="shop-interior">صورة واحدة — داخل المحل *</Label>
                  <p className="text-xs text-muted-foreground">
                    صورة للداخل (الكراسي، الممر، أو أجواء العمل)؛ إلزامية لجميع الباقات.
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      id="shop-interior"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        setShopInterior(e.target.files?.[0] || null);
                        e.target.value = '';
                      }}
                    />
                    {formData.images.shopInterior && (
                      <span className="text-sm text-primary flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        {formData.images.shopInterior.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>أربع صور للبنر (عرض البطاقة) *</Label>
                  <p className="text-xs text-muted-foreground">
                    تُعالَج الصور تلقائياً لتناسب عرض البطاقة مع الحفاظ على الوضوح، وبحد أقصى{' '}
                    {Math.round(BARBER_BANNER_MAX_FILE_BYTES / 1024)} كيلوبايت لكل صورة. إن تجاوز الملف الحد بعد
                    الضغط يُرفض ويُعرض توضيح للحلاق.
                  </p>
                  <Alert className="border-amber-500/40 bg-amber-500/5">
                    <Lightbulb className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                    <AlertDescription className="text-sm leading-relaxed">
                      <span className="font-medium text-foreground">نصيحة لتحسين الصورة:</span> {bannerPicker.activeTip}
                    </AlertDescription>
                  </Alert>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {([0, 1, 2, 3] as const).map((slot) => (
                      <div key={slot} className="space-y-2 rounded-lg border border-border p-3 bg-muted/20">
                        <Label htmlFor={`banner-slot-${slot}`} className="text-sm">
                          صورة البنر {slot + 1} *
                        </Label>
                        <Input
                          id={`banner-slot-${slot}`}
                          type="file"
                          accept="image/*"
                          disabled={bannerPicker.processing}
                          onChange={(e) => {
                            const raw = e.target.files?.[0] ?? null;
                            e.target.value = '';
                            if (!raw) {
                              setBannerImage(slot, null);
                              return;
                            }
                            void (async () => {
                              const r = await bannerPicker.processBannerFile(raw);
                              if (!r.ok) {
                                toast.error(r.error);
                                return;
                              }
                              setBannerImage(slot, r.file);
                              toast.success(
                                `تم تحسين البنر ${slot + 1} — الحجم النهائي ${(r.file.size / 1024).toFixed(0)} كيلوبايت`
                              );
                            })();
                          }}
                        />
                        {bannerPicker.processing ? (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                            جاري معالجة الصورة…
                          </p>
                        ) : null}
                        {formData.images.bannerImages[slot] && (
                          <p className="text-xs text-primary flex items-center gap-1 truncate">
                            <Check className="w-3 h-3 shrink-0" />
                            {formData.images.bannerImages[slot]!.name}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Alert className={regAlertClass}>
                  <AlertCircle className="h-4 w-4 text-slate-400" />
                  <AlertDescription className="text-slate-300">
                    نفضّل صوراً جيدة الإضاءة وبدون تشويش؛ ذلك يساعد في قبول الطلب وظهور محلك بشكل احترافي.
                  </AlertDescription>
                </Alert>
              </div>
            </RegStepShell>
          )}

          {currentStep === 5 && (
            <RegStepShell
              title="أوقات العمل (الأسبوع كاملاً)"
              description="من السبت إلى الجمعة — صفٌّ مضغوط لكل يوم. الباقة البرونزية: إلزامي ويُعرَض للعملاء كما تُدخله هنا."
            >
              <div className="space-y-4">
                {(formData.tier === SubscriptionTier.GOLD || formData.tier === SubscriptionTier.DIAMOND) && (
                  <Alert className="border-slate-500 bg-slate-800/80">
                    <Sparkles className="h-4 w-4 text-slate-300" />
                    <AlertDescription className="text-sm leading-relaxed text-slate-300">
                      باقتك تتيح لك بعد التفعيل <strong>تحكّماً كاملاً</strong> في أوقات العمل لكل يوم من{' '}
                      <strong>لوحة التحكم</strong> (جدول أسبوعي). ما تُدخله الآن يُستخدم لمراجعة الطلب؛ يمكنك
                      تعديله لاحقاً بحرية.
                    </AlertDescription>
                  </Alert>
                )}
                {formData.tier === SubscriptionTier.BRONZE && (
                  <Alert className={regAlertClass}>
                    <Clock className="h-4 w-4 text-slate-400" />
                    <AlertDescription className="text-sm text-slate-300">
                      <strong>الباقة البرونزية:</strong> أوقات العمل هنا <strong>إلزامية</strong> وتُثبَّت في بطاقة
                      المحل للعملاء. عيّن «مغلق» لأيام الراحة.
                    </AlertDescription>
                  </Alert>
                )}
                <div className="rounded-lg border border-slate-600 divide-y divide-slate-700 overflow-hidden max-w-full">
                  {formData.workingWeek.map((row, index) => (
                    <div
                      key={row.day}
                      className="w-full min-w-0 p-3 sm:p-2.5 bg-slate-800/50 space-y-3 sm:space-y-0 sm:flex sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 gap-y-2 min-w-0 sm:min-w-[12rem] sm:justify-start sm:flex-nowrap">
                        <span className="text-sm font-semibold text-slate-100 shrink-0">{row.day}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <Checkbox
                            id={`closed-${index}`}
                            checked={row.closed}
                            onCheckedChange={(checked) =>
                              patchWorkingWeekRow(index, { closed: checked === true })
                            }
                            className="border-slate-500 data-[state=checked]:bg-slate-200 data-[state=checked]:text-slate-900"
                          />
                          <Label htmlFor={`closed-${index}`} className={`text-xs ${regMutedClass} cursor-pointer`}>
                            مغلق
                          </Label>
                        </div>
                      </div>
                      {!row.closed ? (
                        <div className="grid grid-cols-2 gap-3 w-full min-w-0 md:flex md:flex-row md:flex-wrap md:items-end md:justify-end md:gap-3 md:max-w-lg md:shrink-0">
                          <div className="space-y-1 min-w-0 md:w-[7.75rem]">
                            <Label className={`text-[11px] ${regMutedClass} md:sr-only`} htmlFor={`open-${index}`}>
                              من
                            </Label>
                            <Input
                              id={`open-${index}`}
                              type="time"
                              value={row.open}
                              disabled={row.closed}
                              onChange={(e) => patchWorkingWeekRow(index, { open: e.target.value })}
                              className={`h-11 w-full min-w-0 max-w-full text-base md:h-9 md:text-sm box-border ${regFieldClass}`}
                              aria-label={`${row.day} من`}
                            />
                          </div>
                          <div className="space-y-1 min-w-0 md:w-[7.75rem]">
                            <Label className={`text-[11px] ${regMutedClass} md:sr-only`} htmlFor={`close-${index}`}>
                              إلى
                            </Label>
                            <Input
                              id={`close-${index}`}
                              type="time"
                              value={row.close}
                              disabled={row.closed}
                              onChange={(e) => patchWorkingWeekRow(index, { close: e.target.value })}
                              className={`h-11 w-full min-w-0 max-w-full text-base md:h-9 md:text-sm box-border ${regFieldClass}`}
                              aria-label={`${row.day} إلى`}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className={`text-xs ${regMutedClass} py-1 md:text-right md:py-0 md:min-w-[10rem]`}>يوم عطلة</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </RegStepShell>
          )}

          {currentStep === 6 && (
            <RegStepShell
              title="منيو الحلاقة والأسعار"
              description="أضف الخدمات الاعتيادية، ثم — اختيارياً — أعلن إن كنت تُوفّر تسهيلات داخل المحل و/أو زيارة منزلية لكبار السن والمرضى وذوي الاحتياجات الخاصة بحسب ظروف العميل."
            >
              <div className="space-y-4">
                {formData.services.map((service, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="اسم الخدمة (مثال: حلاقة كاملة)"
                        value={service.name}
                        onChange={(e) => {
                          const newServices = [...formData.services];
                          newServices[index].name = e.target.value;
                          setFormData((prev) => ({ ...prev, services: newServices }));
                        }}
                        className={regFieldClass}
                      />
                    </div>
                    <div className="w-32 space-y-2">
                      <Input
                        type="number"
                        placeholder="السعر"
                        value={service.price}
                        onChange={(e) => {
                          const newServices = [...formData.services];
                          newServices[index].price = e.target.value;
                          setFormData((prev) => ({ ...prev, services: newServices }));
                        }}
                        className={regFieldClass}
                      />
                    </div>
                    {formData.services.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeService(index)}
                        className="border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addService}
                  className="w-full border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700"
                >
                  + إضافة خدمة
                </Button>

                <div className={`rounded-lg border border-slate-600 bg-slate-800/50 p-4 space-y-4`}>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="inclusive-accessible-care"
                      checked={formData.inclusiveAccessibleCare.offered}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          inclusiveAccessibleCare: {
                            offered: checked === true,
                            price: checked === true ? prev.inclusiveAccessibleCare.price : '',
                          },
                        }))
                      }
                      className="border-slate-500 data-[state=checked]:bg-slate-200 data-[state=checked]:text-slate-900"
                    />
                    <div className="space-y-1 min-w-0">
                      <Label htmlFor="inclusive-accessible-care" className={`text-sm font-semibold cursor-pointer leading-snug ${regLabelClass}`}>
                        أوفر تسهيلات بالمحل و/أو زيارة منزلية لكبار السن والمرضى وذوي الاحتياجات الخاصة (بحسب
                        الظروف)
                      </Label>
                      <p className={`text-xs leading-relaxed ${regMutedClass}`}>
                        اختياري — إن لم تُشِر هنا فلن يُعرَض على المنصة أنك تلتزم بهذه الخدمة. عند التأشير يجب
                        إدخال سعر معروض للعميل (قد يشمل رسوماً إضافية للتنقل حسب ما تذكره في التواصل).
                      </p>
                    </div>
                  </div>
                  {formData.inclusiveAccessibleCare.offered && (
                    <div className="space-y-2 ps-1 sm:ps-8">
                      <Label htmlFor="inclusive-accessible-care-price" className={regLabelClass}>
                        السعر المعروض (ر.س) *
                      </Label>
                      <Input
                        id="inclusive-accessible-care-price"
                        type="number"
                        min={1}
                        step="1"
                        inputMode="decimal"
                        placeholder="مثال: 80"
                        value={formData.inclusiveAccessibleCare.price}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            inclusiveAccessibleCare: {
                              ...prev.inclusiveAccessibleCare,
                              price: e.target.value,
                            },
                          }))
                        }
                        className={`max-w-xs ${regFieldClass}`}
                      />
                    </div>
                  )}
                </div>
              </div>
            </RegStepShell>
          )}

          {currentStep === 7 && (
            <RegStepShell title="طريقة الدفع" description="اختر طريقة الدفع المناسبة">
              <div className="space-y-4">
                {selectedPlan && (
                  <Alert className={`${regAlertClass} border-slate-500`}>
                    <Star className="h-4 w-4 text-slate-300" />
                    <AlertDescription className="text-slate-200">
                      {vatSettings.enabled && monthlyPriceBreakdown && monthlyPriceBreakdown.vat > 0 ? (
                        <>
                          الباقة المختارة: <strong>{selectedPlan.tierLevel}</strong>
                          {formData.digitalShiftAddon && formData.tier === SubscriptionTier.DIAMOND
                            ? ' (+ Add-on المناوب)'
                            : ''}{' '}
                          — قيمة حزمة الرخصة الرقمية الموحد {monthlyPriceBreakdown.subtotal} ر.س + ضريبة
                          القيمة المضافة ({vatSettings.ratePercent}%){' '}
                          {monthlyPriceBreakdown.vat} ر.س = الإجمالي{' '}
                          <strong>{monthlyPriceBreakdown.total} ر.س</strong>
                        </>
                      ) : (
                        <>
                          الباقة المختارة: <strong>{selectedPlan.tierLevel}</strong>
                          {formData.digitalShiftAddon && formData.tier === SubscriptionTier.DIAMOND
                            ? ' (+ Add-on المناوب)'
                            : ''}{' '}
                          — {selectedUnitSar} ريال لحزمة الرخصة
                          <span className={`block text-xs mt-1 ${regMutedClass}`}>
                            المبلغ المعروض قيمة حزمة رخصة فقط دون ضريبة قيمة مضافة في الوضع الحالي.
                          </span>
                        </>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
                <Alert className={regAlertClass}>
                  <AlertDescription className="text-sm leading-relaxed space-y-2 text-slate-300">
                    <p>
                      <strong className="text-slate-100">الدفع عبر بطاقة (ميسر)</strong> — الطريقة الوحيدة لشراء
                      حزمة الرخصة الرقمية على المنصة.
                    </p>
                    <p className={regMutedClass}>
                      بعد مراجعة طلبك والموافقة عليه، ستتلقى رابط الدفع لإتمام السداد بأمان عبر بوابة ميسر (مدى،
                      فيزا، ماستركارد). لا يوجد تحويل بنكي أو رفع إيصال ضمن التسجيل.
                    </p>
                    {selectedPlan && monthlyPriceBreakdown && (
                      <p className="font-medium text-slate-100">
                        المبلغ المتوقع لحزمة الرخصة (30 يوماً):{' '}
                        {vatSettings.enabled && monthlyPriceBreakdown.vat > 0
                          ? `${monthlyPriceBreakdown.total} ر.س (شامل ضريبة ${vatSettings.ratePercent}%)`
                          : `${selectedUnitSar} ر.س`}
                      </p>
                    )}
                  </AlertDescription>
                </Alert>
                <div className="space-y-3 rounded-lg border border-slate-600 bg-slate-800/50 p-4">
                  <p className="text-right text-sm font-semibold text-slate-100">التزامات إلزامية قبل الإرسال</p>
                  <ComplianceCheckbox
                    id="legal-disclaimer-accept"
                    label="أوافق على التعهد القانوني"
                    checked={formData.legalDisclaimerAccepted}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, legalDisclaimerAccepted: checked }))
                    }
                    modalTitle="التعهد القانوني"
                    modalContent={<LegalPledgeModalContent />}
                    disabled={isSubmitting}
                  />
                  <ComplianceCheckbox
                    id="professional-commitment-accept"
                    label="أوافق على الالتزام المهني"
                    checked={formData.professionalCommitmentAccepted}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, professionalCommitmentAccepted: checked }))
                    }
                    modalTitle="الالتزام المهني"
                    modalContent={<ProfessionalCommitmentModalContent />}
                    disabled={isSubmitting}
                  />
                  <div className="flex items-start gap-3 rounded-lg border border-slate-600/80 bg-slate-800/40 px-4 py-3">
                    <Checkbox
                      id="registration-terms-accept"
                      checked={formData.registrationTermsAccepted}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          registrationTermsAccepted: checked === true,
                        }))
                      }
                      className="mt-1 border-slate-500 data-[state=checked]:bg-slate-200 data-[state=checked]:text-slate-900"
                    />
                    <Label
                      htmlFor="registration-terms-accept"
                      className="cursor-pointer text-sm font-normal leading-relaxed text-slate-300"
                    >
                      <span className="font-semibold text-slate-100">أقرّ بموافقتي الصريحة</span> على أنني قرأت
                      وفهمت{' '}
                      <Link
                        to={ROUTE_PATHS.SUBSCRIPTION_POLICY}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-200 underline-offset-2 hover:underline font-medium"
                      >
                        شروط التسجيل وشراء حزم الرخصة
                      </Link>{' '}
                      و{' '}
                      <Link
                        to={ROUTE_PATHS.PARTNER_PRIVACY}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-200 underline-offset-2 hover:underline font-medium"
                      >
                        سياسة خصوصية الشركاء
                      </Link>
                      ، وأوافق على الالتزام بها.
                    </Label>
                  </div>
                </div>
              </div>
            </RegStepShell>
          )}
      </div>

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1 || isSubmitting}
          className="border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700"
        >
          <ChevronLeft className="w-4 h-4 ml-2" />
          السابق
        </Button>
        {currentStep < STEPS.length ? (
          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            className="bg-slate-100 text-slate-900 hover:bg-white"
          >
            التالي
            <ChevronRight className="w-4 h-4 mr-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !formData.registrationTermsAccepted ||
              !formData.legalDisclaimerAccepted ||
              !formData.professionalCommitmentAccepted
            }
            className="bg-slate-100 text-slate-900 hover:bg-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              'إرسال الطلب'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
