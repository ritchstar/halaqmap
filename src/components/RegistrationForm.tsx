import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  BARBER_DASHBOARD_DEVICE_REQUIREMENT_NOTE_AR,
  BARBER_DASHBOARD_DIAMOND_PORTAL_LINE,
  BARBER_DASHBOARD_GOLD_LINE,
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
  OWNER_WATCH_FEATURE_DIAMOND_LINE,
  OWNER_WATCH_FEATURE_GOLD_LINE,
} from '@/config/ownerWatchFeatureCopy';
import {
  clampListingLicenseQuantity,
  computeListingLicenseUnitSar,
  isDigitalShiftAddonAllowed,
  parseDigitalShiftAddonParam,
} from '@/config/listingLicenseQuantity';
import { DigitalShiftAddonToggle } from '@/components/billing/DigitalShiftAddonToggle';
import { ComplianceCheckbox } from '@/components/b2b/ComplianceCheckbox';
import {
  LegalPledgeModalContent,
  ProfessionalCommitmentModalContent,
  SoftwareProductPurchaseModalContent,
} from '@/components/b2b/ComplianceManifestoContent';
import { REGISTRATION_LEGAL_DISCLAIMER_AR, HONOR_BOARD_PROFESSIONAL_COMMITMENT_LEAD } from '@/config/honorBoardManifesto';
import { SOFTWARE_PRODUCT_PURCHASE_ACK_SHORT_AR } from '@/config/legalActivityScope';
import { RATING_QR_PLAN_LINE } from '@/config/ratingQrInvite';
import { usePlatformVatConfigRemote } from '@/hooks/usePlatformVatConfigRemote';
import { calcVatBreakdown } from '@/lib/platformVatSettings';
import { CHILDREN_BARBER_CATEGORY } from '@/lib/barberCategoryLexicon';
import {
  CHILDREN_HAIRCUT_ALL_TIERS_AR,
  CHILDREN_SPECIALIST_DIAMOND_ONLY_AR,
  type BarberSpecialtyTrack,
  resolveRegistrationChildrenFields,
} from '@/config/childrenSpecialistPolicy';
import {
  MENS_GROOMING_CENTER_DIAMOND_OFFICE_AR,
  MENS_GROOMING_MANDATORY_HAIRCUT_AR,
  MENS_GROOMING_CENTER_MAX_BANNER_LINES,
  resolveRegistrationMensGroomingFields,
} from '@/config/mensGroomingCenterPolicy';
import { MENS_GROOMING_CENTER_FILTER_LABEL_AR } from '@/lib/mensGroomingCenterDisplay';
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
  optimizeImageFileForShopProfile,
  shopProfileRawFileTooLargeMessage,
} from '@/lib/barberBannerImageOptimization';
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
  /** نوع الحزمة الحالي في المسار المعتمد */
  plan: 'monthly';
  /** إضافة برمجية متقدمة (Add-on): المناوب الرقمي — ماسي فقط (+25 ر.س/حزمة) */
  digitalShiftAddon: boolean;
  shopName: string;
  email: string;
  phone: string;
  whatsapp: string;
  taxNumber: string;
  categories: string[];
  /** مسار التخصص: عام أو متخصص أطفال (ماسي) أو مركز عناية بالرجل */
  specialtyTrack: BarberSpecialtyTrack;
  /** أسماء خدمات بنر مسار مراكز العناية بالرجل */
  groomingCenterBannerLines: string[];
  /** تعهد قانوني إلزامي قبل إتمام التسجيل */
  legalDisclaimerAccepted: boolean;
  /** التزام مهني إلزامي قبل إتمام التسجيل */
  professionalCommitmentAccepted: boolean;
  /** إقرار شراء منتج برمجي رقمي وفق ISIC4 474151 */
  softwareProductAcknowledged: boolean;
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
      { kind: 'line', text: 'ظهور عند الطلب للمستخدمين المناسبين عندما يبدأ الاستعلام الآن' },
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
      { kind: 'line', text: 'أولوية ذهبية عند الطلب تمنح صالونك حضوراً أوضح أمام المنافسين' },
      { kind: 'line', text: 'معرض أعمال حتى 20 صورة لإقناع العميل قبل أن يتواصل' },
      { kind: 'line', text: RATING_QR_PLAN_LINE },
      { kind: 'line', text: 'واتساب وشات مباشر بجلسة خاصة لتقليل تردد العميل وتحويل الظهور إلى تواصل' },
      { kind: 'line', text: 'خدمات كبار السن وذوي الاحتياجات مع تحكم في السعر والظهور والملاحظات' },
      { kind: 'line', text: SHOP_OPEN_STATUS_FEATURE_GOLD_DIAMOND },
      { kind: 'line', text: BARBER_DASHBOARD_GOLD_LINE },
      { kind: 'line', text: BARBER_DASHBOARD_DEVICE_REQUIREMENT_NOTE_AR },
      { kind: 'line', text: OWNER_WATCH_FEATURE_GOLD_LINE },
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
      { kind: 'line', text: 'أعلى أولوية ماسية عند تنشّط الاستعلام لمن يريد صدارة منطقته' },
      { kind: 'line', text: 'واجهة فاخرة: بنر متوهج، معرض حتى 40 صورة، وشارة نخبة للثقة' },
      { kind: 'line', text: 'شات خاص مع ترجمة فورية لخدمة السياح والعملاء متعددي اللغات' },
      { kind: 'line', text: '🏛️ Add-on اختياري (+25 ر.س): إضافة المكتب الخاص — مساعد داخلي في لوحتك + مناوب شات للزبائن، مترابطان' },
      { kind: 'line', text: '📋 المساعد الداخلي: يستقبل تعليماتك ويمرّرها للمناوب — يتلقى تقارير ما يستقبله من الزبائن — يعرض رصيد حزمتك وروابط الدعم' },
      { kind: 'line', text: '🌙 المناوب على الشات: يرد بذكاء بـ7 لغات، يطبّق تعليماتك، ويرسل لك ملخص كل محادثة' },
      { kind: 'line', text: BARBER_DASHBOARD_DIAMOND_PORTAL_LINE },
      { kind: 'line', text: BARBER_DASHBOARD_DEVICE_REQUIREMENT_NOTE_AR },
      { kind: 'line', text: OWNER_WATCH_FEATURE_DIAMOND_LINE },
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
  const location = useLocation();
  const vatSettings = usePlatformVatConfigRemote();
  const formTopRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const bannerPicker = useBarberBannerImagePicker();
  const [shopImageProcessing, setShopImageProcessing] = useState(false);

  // قراءة المعاملات من URL لضبط الحزمة المُختارة مسبقاً
  const urlParams = new URLSearchParams(location.search);
  const urlTier = urlParams.get('tier') as SubscriptionTier | null;
  const urlQty = clampListingLicenseQuantity(urlParams.get('qty'));
  const urlAddonSelected =
    parseDigitalShiftAddonParam(urlParams.get('aiAddon')) || urlParams.get('addon')?.trim().toLowerCase() === 'office';
  const [formData, setFormData] = useState<FormData>({
    tier: (urlTier && Object.values(SubscriptionTier).includes(urlTier)) ? urlTier : '',
    plan: 'monthly',
    digitalShiftAddon: (urlTier === SubscriptionTier.DIAMOND) && urlAddonSelected,
    shopName: '',
    email: '',
    phone: '',
    whatsapp: '',
    taxNumber: '',
    categories: [],
    specialtyTrack: 'general',
    groomingCenterBannerLines: [MENS_GROOMING_MANDATORY_HAIRCUT_AR, ''],
    legalDisclaimerAccepted: false,
    professionalCommitmentAccepted: false,
    softwareProductAcknowledged: false,
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
      if (!formData.shopName || !formData.email || !formData.phone || !formData.whatsapp) {
        alert('يرجى تعبئة جميع الحقول المطلوبة');
        return;
      }
      if (formData.specialtyTrack === 'children' && formData.tier !== SubscriptionTier.DIAMOND) {
        alert('مسار «متخصص أطفال» متاح للباقة الماسية فقط. اختر الماسي أو حدّد «تخصص عام».');
        return;
      }
      if (formData.specialtyTrack === 'mens_grooming_center') {
        if (formData.tier !== SubscriptionTier.DIAMOND || !formData.digitalShiftAddon) {
          alert('مسار «مراكز العناية بالرجل» يتطلب الباقة الماسية مع إضافة المكتب الخاص.');
          return;
        }
        const bannerLines = formData.groomingCenterBannerLines.map((line) => line.trim()).filter(Boolean);
        if (bannerLines.length < 2) {
          alert('أضف خدمتين على الأقل في بنر مركز العناية بالرجل — حلاقة رجالية وخدمة أخرى.');
          return;
        }
        const hasHaircut = bannerLines.some(
          (line) => line === MENS_GROOMING_MANDATORY_HAIRCUT_AR || line.includes('حلاقة رجال'),
        );
        if (!hasHaircut) {
          alert('يجب تضمين «حلاقة رجالي» ضمن خدمات البنر.');
          return;
        }
      }
      if (formData.specialtyTrack === 'general' && formData.categories.length === 0) {
        alert('يرجى اختيار نوع خدمة واحد على الأقل.');
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
      const normalizedTax = formData.taxNumber.replace(/\s+/g, '');
      if (normalizedTax && !/^\d{15}$/.test(normalizedTax)) {
        alert('إذا أدخلت الرقم الضريبي فيجب أن يكون 15 رقمًا.');
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

  const processShopImageFile = async (
    raw: File,
    setter: (file: File | null) => void,
    label: string,
  ) => {
    const rawMsg = shopProfileRawFileTooLargeMessage(raw);
    if (rawMsg) {
      toast.error(rawMsg);
      return;
    }
    setShopImageProcessing(true);
    const r = await optimizeImageFileForShopProfile(raw);
    setShopImageProcessing(false);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    setter(r.file);
    toast.success(
      `تم تحسين ${label} — الحجم النهائي ${(r.file.size / 1024).toFixed(0)} كيلوبايت`,
    );
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
              lat: String(position.coords.latitude),
              lng: String(position.coords.longitude),
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
    if (!formData.softwareProductAcknowledged) {
      toast.error('يجب تأشير إقرار شراء المنتج البرمجي الرقمي قبل الإرسال.');
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
            toast.error((minted as any).error);
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
        ...(formData.taxNumber.replace(/\s+/g, '') ? { taxNumber: formData.taxNumber.replace(/\s+/g, '') } : {}),
        location: {
          lat,
          lng,
          address: formData.location.address || '—',
          saudi: {
            regionId: formData.location.saudi.regionId,
            cityId: formData.location.saudi.cityId,
            districtId: formData.location.saudi.districtId,
            ...(formData.location.saudi.districtOther.trim()
              ? { districtOther: formData.location.saudi.districtOther.trim() }
              : {}),
          },
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
        ...(() => {
          const childrenResolved = resolveRegistrationChildrenFields({
            specialtyTrack: formData.specialtyTrack,
            tier: formData.tier as SubscriptionTier,
            categories: formData.categories,
          });
          const mensResolved = resolveRegistrationMensGroomingFields({
            specialtyTrack: formData.specialtyTrack,
            tier: formData.tier as SubscriptionTier,
            digitalShiftAddon: formData.digitalShiftAddon,
            groomingCenterBannerLines: formData.groomingCenterBannerLines,
          });
          const categories = mensResolved.mensGroomingCenter
            ? mensResolved.categories
            : childrenResolved.categories;
          return {
            categories,
            ...(childrenResolved.childrenSpecialist ? { childrenSpecialist: true } : {}),
            ...(mensResolved.mensGroomingCenter
              ? {
                  mensGroomingCenter: true,
                  groomingCenterBannerLines: mensResolved.groomingCenterBannerLines,
                }
              : {}),
          };
        })(),
        specialtyTrack: formData.specialtyTrack,
        registrationTermsAccepted: true,
        registrationTermsAcceptedAtIso: submittedAtIso,
        professionalCommitmentAccepted: true,
        professionalCommitmentAcceptedAtIso: submittedAtIso,
        softwareProductAcknowledged: true,
        softwareProductAcknowledgedAtIso: submittedAtIso,
        digitalShiftAddonSelected:
          formData.tier === SubscriptionTier.DIAMOND &&
          isDigitalShiftAddonAllowed(SubscriptionTier.DIAMOND, formData.digitalShiftAddon),
        listingLicenseQuantity: urlQty,
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
        `الرقم الضريبي: ${formData.taxNumber.replace(/\s+/g, '') || '—'}\n` +
        `الباقة: ${tierPackageSummary(
          tierName,
          unitSarForSummary,
          formData.tier === SubscriptionTier.DIAMOND && formData.digitalShiftAddon,
        )}\n` +
        `عدد الحزم: ${urlQty}\n` +
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
        `الرقم الضريبي: ${formData.taxNumber.replace(/\s+/g, '') || '—'}\n` +
        `الباقة: ${tierPackageSummary(
          tierName,
          unitSarForSummary,
          formData.tier === SubscriptionTier.DIAMOND && formData.digitalShiftAddon,
        )}\n` +
        `عدد الحزم: ${urlQty}\n` +
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
        licenseQuantity: urlQty,
        digitalShiftAddonSelected:
          formData.tier === SubscriptionTier.DIAMOND &&
          isDigitalShiftAddonAllowed(SubscriptionTier.DIAMOND, formData.digitalShiftAddon),
        summaryForDownload,
        mailtoBodyShort,
      });

      toast.success('✅ تم تقديم الطلب — يمكنك الآن الانتقال إلى الدفع لبدء مسار التفعيل.');
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
    const unitSar = computeListingLicenseUnitSar(
      formData.tier as SubscriptionTier,
      isDigitalShiftAddonAllowed(formData.tier as SubscriptionTier, formData.digitalShiftAddon)
        ? { digitalShiftAddon: true }
        : undefined,
    );
    return unitSar;
  }, [formData.tier, formData.digitalShiftAddon]);

  const selectedTotalSar = useMemo(() => selectedUnitSar * urlQty, [selectedUnitSar, urlQty]);

  const selectedPlan = SUBSCRIPTION_PLANS.find((p) => p.tier === formData.tier);
  const monthlyPriceBreakdown = useMemo(
    () => (formData.tier ? calcVatBreakdown(selectedTotalSar, vatSettings) : null),
    [formData.tier, selectedTotalSar, vatSettings],
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
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 md:p-7 text-slate-100">
              <header className="mb-5 text-right">
                <h2 className="text-xl font-black text-white">اختر حزمتك</h2>
                <p className="mt-1 text-sm text-slate-400">اختر الحزمة الشهرية المناسبة ثم أكمل بيانات الطلب.</p>
              </header>

              <div>
                  <RadioGroup
                    value={formData.tier}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        tier: value as SubscriptionTier,
                        digitalShiftAddon:
                          value === SubscriptionTier.DIAMOND ? prev.digitalShiftAddon : false,
                        specialtyTrack:
                          value !== SubscriptionTier.DIAMOND &&
                          (prev.specialtyTrack === 'children' || prev.specialtyTrack === 'mens_grooming_center')
                            ? 'general'
                            : prev.specialtyTrack,
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
                              setFormData((prev) => ({
                                ...prev,
                                digitalShiftAddon: checked,
                                specialtyTrack:
                                  !checked && prev.specialtyTrack === 'mens_grooming_center'
                                    ? 'general'
                                    : prev.specialtyTrack,
                              }))
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
                  <Label htmlFor="taxNumber" className={regLabelClass}>
                    الرقم الضريبي للمنشأة
                  </Label>
                  <Input
                    id="taxNumber"
                    inputMode="numeric"
                    placeholder="15 رقمًا — إذا كانت المنشأة مسجلة ضريبياً"
                    value={formData.taxNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, taxNumber: e.target.value.replace(/[^\d\s]/g, '') }))
                    }
                    className={regFieldClass}
                  />
                  <Alert className={regAlertClass}>
                    <AlertCircle className="h-4 w-4 text-slate-400" />
                    <AlertDescription className="text-slate-300">
                      يُستخدم هذا الحقل لإدراج الرقم الضريبي على فواتير الحزم البرمجية ودعم الامتثال مع متطلبات
                      الفوترة الإلكترونية ومرجعية `ZATCA` عند الحاجة. إذا كانت منشأتك غير مسجلة ضريبياً بعد يمكنك
                      تركه فارغًا مؤقتًا.
                    </AlertDescription>
                  </Alert>
                </div>
                <div className="space-y-3">
                  <Label className={regLabelClass}>مسار التخصص *</Label>
                  <RadioGroup
                    value={formData.specialtyTrack}
                    onValueChange={(value) => {
                      const track = value as BarberSpecialtyTrack;
                      setFormData((prev) => ({
                        ...prev,
                        specialtyTrack: track,
                        categories:
                          track === 'children'
                            ? [CHILDREN_BARBER_CATEGORY]
                            : track === 'mens_grooming_center'
                              ? []
                              : prev.categories,
                        digitalShiftAddon: track === 'mens_grooming_center' ? true : prev.digitalShiftAddon,
                        groomingCenterBannerLines:
                          track === 'mens_grooming_center'
                            ? prev.groomingCenterBannerLines.filter(Boolean).length >= 2
                              ? prev.groomingCenterBannerLines
                              : [MENS_GROOMING_MANDATORY_HAIRCUT_AR, '']
                            : prev.groomingCenterBannerLines,
                      }));
                    }}
                    className="grid gap-3"
                  >
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-600 bg-slate-800/60 p-3">
                      <RadioGroupItem value="general" id="specialty-general" className="mt-1" />
                      <div>
                        <span className={`font-semibold ${regLabelClass}`}>تخصص عام</span>
                        <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                          صالون متعدد الخدمات — اختر التصنيفات المناسبة أدناه. {CHILDREN_HAIRCUT_ALL_TIERS_AR}
                        </p>
                      </div>
                    </label>
                    <label
                      className={`flex items-start gap-3 rounded-lg border p-3 ${
                        formData.tier === SubscriptionTier.DIAMOND
                          ? 'cursor-pointer border-sky-400/40 bg-sky-500/5'
                          : 'cursor-not-allowed border-slate-700 bg-slate-900/40 opacity-70'
                      }`}
                    >
                      <RadioGroupItem
                        value="children"
                        id="specialty-children"
                        className="mt-1"
                        disabled={formData.tier !== SubscriptionTier.DIAMOND}
                      />
                      <div>
                        <span className={`font-semibold ${regLabelClass}`}>متخصص أطفال</span>
                        <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                          {CHILDREN_SPECIALIST_DIAMOND_ONLY_AR}
                        </p>
                        {formData.tier !== SubscriptionTier.DIAMOND ? (
                          <p className="mt-1 text-xs text-amber-300/90">اختر الباقة الماسية في الخطوة الأولى لتفعيل هذا المسار.</p>
                        ) : null}
                      </div>
                    </label>
                    <label
                      className={`flex items-start gap-3 rounded-lg border p-3 ${
                        formData.tier === SubscriptionTier.DIAMOND && formData.digitalShiftAddon
                          ? 'cursor-pointer border-amber-400/40 bg-amber-500/5'
                          : 'cursor-not-allowed border-slate-700 bg-slate-900/40 opacity-70'
                      }`}
                    >
                      <RadioGroupItem
                        value="mens_grooming_center"
                        id="specialty-mens-grooming"
                        className="mt-1"
                        disabled={formData.tier !== SubscriptionTier.DIAMOND || !formData.digitalShiftAddon}
                      />
                      <div>
                        <span className={`font-semibold ${regLabelClass}`}>{MENS_GROOMING_CENTER_FILTER_LABEL_AR}</span>
                        <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                          {MENS_GROOMING_CENTER_DIAMOND_OFFICE_AR}
                        </p>
                        {formData.tier !== SubscriptionTier.DIAMOND || !formData.digitalShiftAddon ? (
                          <p className="mt-1 text-xs text-amber-300/90">
                            اختر الباقة الماسية مع إضافة المكتب الخاص في الخطوة الأولى لتفعيل هذا المسار.
                          </p>
                        ) : null}
                      </div>
                    </label>
                  </RadioGroup>
                </div>

                {formData.specialtyTrack === 'general' ? (
                <div className="space-y-2">
                  <Label className={regLabelClass}>نوع الخدمات *</Label>
                  <p className="text-xs leading-relaxed text-slate-400">
                    {CHILDREN_HAIRCUT_ALL_TIERS_AR}
                  </p>
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
                ) : formData.specialtyTrack === 'children' ? (
                  <Alert className={regAlertClass}>
                    <AlertCircle className="h-4 w-4 text-sky-300" />
                    <AlertDescription className="text-slate-300 leading-relaxed">
                      مسار متخصص أطفال: يُسجَّل صالونك كـ«{CHILDREN_BARBER_CATEGORY}» مع بطاقة «متخصص أطفال» ولوحة
                      تحكم مخصصة بعد التفعيل.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    <Alert className={regAlertClass}>
                      <AlertCircle className="h-4 w-4 text-amber-300" />
                      <AlertDescription className="text-slate-300 leading-relaxed">
                        سمِّ خدماتك كما تعرضها في صالونك — تظهر على بنر بطاقتك تحت تصنيف «{MENS_GROOMING_CENTER_FILTER_LABEL_AR}». الحلاقة الرجالية إلزامية.
                      </AlertDescription>
                    </Alert>
                    <div className="space-y-3">
                      <Label className={regLabelClass}>خدمات البنر *</Label>
                      {formData.groomingCenterBannerLines.map((line, index) => (
                        <div key={`grooming-line-${index}`} className="flex gap-2">
                          <Input
                            value={line}
                            disabled={index === 0}
                            onChange={(e) =>
                              setFormData((prev) => {
                                const next = [...prev.groomingCenterBannerLines];
                                next[index] = e.target.value;
                                return { ...prev, groomingCenterBannerLines: next };
                              })
                            }
                            placeholder={index === 0 ? MENS_GROOMING_MANDATORY_HAIRCUT_AR : 'مثال: مساج رأس ورقبة'}
                            className={regFieldClass}
                          />
                          {index > 1 ? (
                            <Button
                              type="button"
                              variant="outline"
                              className="shrink-0 border-slate-600"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  groomingCenterBannerLines: prev.groomingCenterBannerLines.filter((_, i) => i !== index),
                                }))
                              }
                            >
                              حذف
                            </Button>
                          ) : null}
                        </div>
                      ))}
                      {formData.groomingCenterBannerLines.length < MENS_GROOMING_CENTER_MAX_BANNER_LINES ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="border-slate-600"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              groomingCenterBannerLines: [...prev.groomingCenterBannerLines, ''],
                            }))
                          }
                        >
                          إضافة خدمة
                        </Button>
                      ) : null}
                    </div>
                  </div>
                )}
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
                      <strong>لوحة التحكم</strong> في أي وقت. ما ترفعه هنا يظهر على بطاقتك فور التفعيل.
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
                      disabled={shopImageProcessing || bannerPicker.processing}
                      onChange={(e) => {
                        const raw = e.target.files?.[0] ?? null;
                        e.target.value = '';
                        if (!raw) {
                          setShopExterior(null);
                          return;
                        }
                        void processShopImageFile(raw, setShopExterior, 'صورة الواجهة');
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
                      disabled={shopImageProcessing || bannerPicker.processing}
                      onChange={(e) => {
                        const raw = e.target.files?.[0] ?? null;
                        e.target.value = '';
                        if (!raw) {
                          setShopInterior(null);
                          return;
                        }
                        void processShopImageFile(raw, setShopInterior, 'صورة الداخل');
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
                          disabled={shopImageProcessing || bannerPicker.processing}
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
                      <strong>لوحة التحكم</strong> (جدول أسبوعي). ما تُدخله الآن يظهر فور التفعيل ويمكنك
                      تعديله بحرية في أي وقت.
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
                          — قيمة حزمة الرخصة الرقمية ({urlQty} حزمة) {monthlyPriceBreakdown.subtotal} ر.س + ضريبة
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
                          — {selectedTotalSar} ريال لحزمة الرخصة ({urlQty} حزمة)
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
                      الدفع آلي ومباشر — بعد إرسال الطلب ستنتقل إلى صفحة الدفع عبر بوابة ميسر (مدى، فيزا، ماستركارد). يبدأ تفعيل الحزمة وفق مسار الدفع والحالة الحالية في النظام.
                    </p>
                    {selectedPlan && monthlyPriceBreakdown && (
                      <p className="font-medium text-slate-100">
                        المبلغ المتوقع لحزمة الرخصة (٣٠ يوماً):{' '}
                        {vatSettings.enabled && monthlyPriceBreakdown.vat > 0
                          ? `${monthlyPriceBreakdown.total} ر.س (شامل ضريبة ${vatSettings.ratePercent}%)`
                          : `${selectedTotalSar} ر.س`}
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
                  <ComplianceCheckbox
                    id="software-product-ack"
                    label={SOFTWARE_PRODUCT_PURCHASE_ACK_SHORT_AR}
                    checked={formData.softwareProductAcknowledged}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, softwareProductAcknowledged: checked }))
                    }
                    modalTitle="إقرار شراء المنتج البرمجي"
                    modalContent={<SoftwareProductPurchaseModalContent />}
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
            className={currentStep === 1 && formData.tier
              ? 'bg-gradient-to-l from-amber-500 to-amber-600 text-black font-black shadow-[0_4px_20px_rgba(245,158,11,0.40)] hover:from-amber-400 px-6 py-2.5 text-base'
              : 'bg-slate-100 text-slate-900 hover:bg-white'
            }
          >
            {currentStep === 1 && formData.tier
              ? 'ابدأ تعبئة الطلب ←'
              : 'التالي'
            }
            {!(currentStep === 1 && formData.tier) && <ChevronRight className="w-4 h-4 mr-2" />}
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !formData.registrationTermsAccepted ||
              !formData.legalDisclaimerAccepted ||
              !formData.professionalCommitmentAccepted ||
              !formData.softwareProductAcknowledged
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
