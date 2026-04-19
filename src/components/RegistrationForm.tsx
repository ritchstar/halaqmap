import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  SubscriptionTier,
  ROUTE_PATHS,
  type SubscriptionRequest,
  type RegistrationAttachmentUrls,
} from '@/lib/index';
import {
  appendSubscriptionRequest,
  generateRegistrationOrderId,
  formatSubmissionDateTimeAr,
  saPhoneToInternational,
  saveLastOrderConfirmation,
} from '@/lib/subscriptionRequestStorage';
import { mintRegistrationIntentTokenRemote } from '@/lib/registrationIntentRemote';
import { BANK_TRANSFER } from '@/config/bankTransfer';
import { getBankTransferPayableAmountSar, getBankTransferPlanSummaryAr } from '@/config/subscriptionPricing';
import {
  BARBER_DASHBOARD_DIAMOND_PORTAL_LINE,
  BARBER_DASHBOARD_GOLD_LINE,
  BARBER_DIAMOND_APPOINTMENTS_FROM_DASHBOARD_LINE,
  MAP_FEATURE_HERO,
} from '@/config/subscriptionPlanHero';
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
import {
  createInitialWorkingWeekForm,
  workingWeekFormToPayload,
  type WorkingWeekFormRow,
} from '@/lib/saudiWorkingWeek';
import {
  Check,
  Upload,
  MapPin,
  Phone,
  FileText,
  Image as ImageIcon,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Star,
  Shield,
  MessageSquare,
  Calendar,
  Sparkles,
  AlertCircle,
  Loader2,
  Clock,
} from 'lucide-react';

interface FormData {
  tier: SubscriptionTier | '';
  shopName: string;
  email: string;
  phone: string;
  whatsapp: string;
  categories: string[];
  documents: {
    commercialRegistry: File | null;
    municipalLicense: File | null;
    /** شهادات صحية للعاملين — ملف واحد أو أكثر (إلزامي) */
    healthCertificates: File[];
  };
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
  /** سبعة أيام — للباقة البرونزية يُحدَّد هنا ويُثبَّت في العرض */
  workingWeek: WorkingWeekFormRow[];
  payment: {
    method: 'monthly' | 'bank_transfer' | '';
    receipt: File | null;
  };
  /** إلزامي قبل «إرسال الطلب»: تأشير صريح بالموافقة على الشروط والسياسات */
  registrationTermsAccepted: boolean;
}

const STEPS = [
  { id: 1, title: 'اختيار الباقة', icon: Star },
  { id: 2, title: 'بيانات المحل', icon: FileText },
  { id: 3, title: 'المستندات', icon: Upload },
  { id: 4, title: 'الموقع', icon: MapPin },
  { id: 5, title: 'الصور', icon: ImageIcon },
  { id: 6, title: 'أوقات العمل', icon: Clock },
  { id: 7, title: 'المنيو', icon: FileText },
  { id: 8, title: 'الدفع', icon: CreditCard },
];

type FormPlanFeature = { kind: 'map_hero' } | { kind: 'line'; text: string };

const SUBSCRIPTION_PLANS: {
  tier: SubscriptionTier;
  name: string;
  price: number;
  color: string;
  features: FormPlanFeature[];
  popular?: boolean;
  premium?: boolean;
}[] = [
  {
    tier: SubscriptionTier.BRONZE,
    name: 'برونزي',
    price: 100,
    color: 'from-amber-700 to-amber-900',
    features: [
      { kind: 'map_hero' },
      { kind: 'line', text: 'صورتان أساسيتان (خارجي وداخل المحل) وأربع صور للبنر مع الطلب' },
      { kind: 'line', text: 'جدول أسبوعي كامل لأوقات العمل (إلزامي مع الطلب ويُعرَض للعملاء)' },
      { kind: 'line', text: 'رقم الهاتف للتواصل' },
      { kind: 'line', text: 'ظهور في نتائج البحث والخريطة' },
    ],
  },
  {
    tier: SubscriptionTier.GOLD,
    name: 'ذهبي',
    price: 150,
    color: 'from-accent to-yellow-600',
    features: [
      { kind: 'map_hero' },
      { kind: 'line', text: RATING_QR_PLAN_LINE },
      { kind: 'line', text: 'جميع مزايا الباقة البرونزية' },
      { kind: 'line', text: 'بنر موسع بصور متعددة' },
      { kind: 'line', text: 'إدارة صور المحل والبنر من لوحة التحكم بعد التفعيل' },
      { kind: 'line', text: 'جدول أسبوعي لأوقات العمل من لوحة التحكم (تحكم كامل بكل يوم)' },
      { kind: 'line', text: 'رابط واتساب مباشر' },
      { kind: 'line', text: 'شات مباشر مع العملاء' },
      { kind: 'line', text: 'جلسة شات خاصة لكل عميل تنتهي تلقائياً بعد 60 دقيقة لخصوصية أعلى' },
      { kind: 'line', text: 'أولوية في الظهور على الخريطة والبحث' },
      { kind: 'line', text: BARBER_DASHBOARD_GOLD_LINE },
    ],
    popular: true,
  },
  {
    tier: SubscriptionTier.DIAMOND,
    name: 'ماسي',
    price: 200,
    color: 'from-primary to-cyan-600',
    features: [
      { kind: 'map_hero' },
      { kind: 'line', text: RATING_QR_PLAN_LINE },
      { kind: 'line', text: 'جميع مزايا الباقة الذهبية' },
      { kind: 'line', text: BARBER_DASHBOARD_DIAMOND_PORTAL_LINE },
      { kind: 'line', text: BARBER_DIAMOND_APPOINTMENTS_FROM_DASHBOARD_LINE },
      { kind: 'line', text: 'شارة ماسية مميزة على الخريطة' },
      { kind: 'line', text: 'إدارة صور المحل والبنر من لوحة التحكم بعد التفعيل' },
      { kind: 'line', text: 'جدول أسبوعي لأوقات العمل من لوحة التحكم (تحكم كامل بكل يوم)' },
      { kind: 'line', text: 'أولوية قصوى في الظهور على الخريطة والبحث' },
      { kind: 'line', text: 'ترجمة تلقائية في الشات' },
      { kind: 'line', text: 'شات خاص لكل عميل مع ترجمة ذكية فورية للطرفين وانتهاء تلقائي بعد 60 دقيقة' },
    ],
    premium: true,
  },
];

const CATEGORIES = [
  'حلاقة رجالي',
  'حلاقة أطفال',
  'حلاقة تقليدية',
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
  const [formData, setFormData] = useState<FormData>({
    tier: '',
    shopName: '',
    email: '',
    phone: '',
    whatsapp: '',
    categories: [],
    documents: {
      commercialRegistry: null,
      municipalLicense: null,
      healthCertificates: [],
    },
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
    workingWeek: createInitialWorkingWeekForm(),
    payment: {
      method: '',
      receipt: null,
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
      if (!formData.documents.commercialRegistry || !formData.documents.municipalLicense) {
        alert('يرجى رفع السجل التجاري والرخصة البلدية (إلزامي).');
        return;
      }
      if (formData.documents.healthCertificates.length === 0) {
        alert('يرجى رفع شهادة صحية واحدة على الأقل للعاملين في المحل (إلزامي مع المستندات الرسمية).');
        return;
      }
    }
    if (currentStep === 4) {
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
    if (currentStep === 5) {
      if (!formData.images.shopExterior || !formData.images.shopInterior) {
        alert('يرجى رفع صورة واحدة لواجهة المحل من الخارج وصورة واحدة من الداخل (إلزامي لجميع الباقات).');
        return;
      }
      if (formData.images.bannerImages.some((f) => !f)) {
        alert('يرجى رفع أربع صور للبنر (كل خانة إلزامية) لعرض محلك في البطاقة.');
        return;
      }
    }
    if (currentStep === 6) {
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

  const handleLegalDocumentUpload = (field: 'commercialRegistry' | 'municipalLicense', file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: file,
      },
    }));
  };

  const handleHealthCertificatesAdd = (files: FileList | null) => {
    if (!files?.length) {
      toast.error('لم يتم التقاط أي ملف. حاول اختيار الملف مرة أخرى.');
      return;
    }
    const incoming = Array.from(files);
    const current = formData.documents.healthCertificates;
    const uniqueIncoming = incoming.filter(
      (f) =>
        !current.some(
          (p) => p.name === f.name && p.size === f.size && p.lastModified === f.lastModified
        )
    );
    const addedCount = uniqueIncoming.length;

    if (addedCount === 0) {
      toast.error('هذا الملف مضاف مسبقاً. اختر ملفاً آخر أو احذف القديم أولاً.');
      return;
    }

    setFormData((prev) => {
      const next = [
        ...prev.documents.healthCertificates,
        ...uniqueIncoming.filter(
          (f) =>
            !prev.documents.healthCertificates.some(
              (p) => p.name === f.name && p.size === f.size && p.lastModified === f.lastModified
            )
        ),
      ];
      return {
        ...prev,
        documents: {
          ...prev.documents,
          // دمج مع منع تكرار نفس الملف (name + size + lastModified)
          healthCertificates: next,
        },
      };
    });
    toast.success(`تمت إضافة ${addedCount} ملف/ملفات للشهادات الصحية`);
  };

  const removeHealthCertificate = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        healthCertificates: prev.documents.healthCertificates.filter((_, i) => i !== index),
      },
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
    if (formData.payment.method === 'bank_transfer' && !formData.payment.receipt) {
      alert('يرجى رفع إيصال التحويل البنكي');
      return;
    }
    if (!formData.registrationTermsAccepted) {
      toast.error('يجب تأشير الموافقة الصريحة على شروط التسجيل وسياسة الشركاء قبل الإرسال.');
      window.requestAnimationFrame(() =>
        formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      );
      return;
    }
    if (!formData.documents.commercialRegistry || !formData.documents.municipalLicense) {
      alert('يرجى إكمال خطوة المستندات: السجل التجاري والرخصة البلدية إلزاميان.');
      return;
    }
    if (formData.documents.healthCertificates.length === 0) {
      alert('يرجى إكمال خطوة المستندات: رفع شهادة صحية واحدة على الأقل للعاملين.');
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
      const receiptFile = formData.payment.receipt;
      /* 1) رفع المرفقات أولاً — يتطلب orderId مطابقاً لسياسة التخزين؛ فشل مبكر دون تحميل بيانات إضافية */
      if (supabase) {
        const up = await uploadRegistrationAttachments(
          supabase,
          orderId,
          {
            commercialRegistry: formData.documents.commercialRegistry!,
            municipalLicense: formData.documents.municipalLicense!,
            healthCertificates: formData.documents.healthCertificates,
            shopExterior: formData.images.shopExterior!,
            shopInterior: formData.images.shopInterior!,
            bannerImages: formData.images.bannerImages.filter(Boolean) as File[],
            receipt: formData.payment.method === 'bank_transfer' ? receiptFile : null,
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

      const docLabels: string[] = [];
      if (formData.documents.commercialRegistry) {
        docLabels.push(`سجل تجاري: ${formData.documents.commercialRegistry.name}`);
      }
      if (formData.documents.municipalLicense) {
        docLabels.push(`رخصة بلدية: ${formData.documents.municipalLicense.name}`);
      }
      formData.documents.healthCertificates.forEach((f, i) => {
        docLabels.push(`شهادة صحية للعاملين (${i + 1}): ${f.name}`);
      });

      const servicesSummary = formData.services
        .filter((s) => s.name.trim())
        .map((s) => `${s.name.trim()} — ${s.price || '—'} ر.س`)
        .join('\n');

      const weeklyWorkingHoursPayload = workingWeekFormToPayload(formData.workingWeek);
      const workingHoursSummaryText = weeklyWorkingHoursPayload
        .map((h) => `${h.day}: ${h.open === 'مغلق' ? 'مغلق' : `${h.open} – ${h.close}`}`)
        .join('\n');

      /* 2) إيصال احتياطي محلي صغير إن لم يُرفع للتخزين */
      let receiptDataUrl: string | undefined;
      if (!registrationAttachmentUrls?.receipt && receiptFile && receiptFile.size <= MAX_RECEIPT_STORAGE_BYTES) {
        try {
          receiptDataUrl = await readFileAsDataURL(receiptFile);
        } catch {
          receiptDataUrl = undefined;
        }
      }

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
        documents: docLabels.length > 0 ? docLabels : ['لم يُرفع أسماء ملفات (تحقق من الخطوات السابقة)'],
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
        receiptFileName: receiptFile?.name,
        receiptDataUrl,
        registrationAttachmentUrls,
        weeklyWorkingHours: weeklyWorkingHoursPayload,
        servicesSummary: servicesSummary || '—',
        categories: [...formData.categories],
        registrationTermsAccepted: true,
        registrationTermsAcceptedAtIso: submittedAtIso,
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
      const tierName = plan?.name ?? String(formData.tier);
      const payLabel =
        formData.payment.method === 'bank_transfer' && plan
          ? `تحويل بنكي — ${getBankTransferPlanSummaryAr(plan.tier)}`
          : formData.payment.method === 'bank_transfer'
            ? 'تحويل بنكي'
            : 'اشتراك شهري';

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
        `حلاق ماب — طلب اشتراك جديد\n` +
        `================================\n` +
        `رقم الطلب: ${orderId}\n` +
        `تاريخ التقديم: ${submittedAtLabel}\n` +
        `\n` +
        `اسم المحل: ${formData.shopName}\n` +
        `البريد: ${formData.email}\n` +
        `الهاتف: ${formData.phone}\n` +
        `الواتساب: ${formData.whatsapp}\n` +
        `الباقة: ${tierName}\n` +
        `تصنيفات: ${formData.categories.join('، ') || '—'}\n` +
        `طريقة الدفع: ${payLabel}\n` +
        `${attributionLines}\n` +
        (receiptFile ? `ملف الإيصال: ${receiptFile.name}\n` : '') +
        `\n` +
        `العنوان: ${composedAddress || formData.location.address || '—'}\n` +
        `الإحداثيات: ${formData.location.lat || '—'}, ${formData.location.lng || '—'}\n` +
        `\n` +
        `الخدمات والأسعار:\n${servicesSummary || '—'}\n` +
        `\n` +
        `أوقات العمل (أسبوع كامل):\n${workingHoursSummaryText}\n` +
        `\n` +
        `المستندات (أسماء الملفات):\n${docLabels.join('\n') || '—'}\n` +
        `\n` +
        `صور المحل (أسماء الملفات):\n` +
        `  — خارجي: ${formData.images.shopExterior?.name ?? '—'}\n` +
        `  — داخلي: ${formData.images.shopInterior?.name ?? '—'}\n` +
        `  — بنر (4): ${formData.images.bannerImages
          .filter(Boolean)
          .map((f) => f!.name)
          .join('، ')}\n` +
        (registrationAttachmentUrls
          ? `\nروابط المرفقات على السيرفر:\n` +
            `- السجل التجاري: ${registrationAttachmentUrls.commercialRegistry}\n` +
            `- الرخصة البلدية: ${registrationAttachmentUrls.municipalLicense}\n` +
            `- الشهادات الصحية:\n${(registrationAttachmentUrls.healthCertificates ?? [])
              .map((u, i) => `    ${i + 1}. ${u}`)
              .join('\n')}\n` +
            `- صورة خارجية: ${registrationAttachmentUrls.shopExterior}\n` +
            `- صورة داخلية: ${registrationAttachmentUrls.shopInterior}\n` +
            `- بنرات: ${(registrationAttachmentUrls.banners ?? []).join(' | ')}\n` +
            (registrationAttachmentUrls.receipt
              ? `- إيصال التحويل: ${registrationAttachmentUrls.receipt}\n`
              : '')
          : '') +
        `\n` +
        `— نهاية الملخص —\n`;

      const mailtoBodyShort =
        `رقم الطلب: ${orderId}\n` +
        `التقديم: ${submittedAtLabel}\n` +
        `المحل: ${formData.shopName}\n` +
        `الباقة: ${tierName}\n` +
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
        receiptFileName: receiptFile?.name,
        summaryForDownload,
        mailtoBodyShort,
      });

      await new Promise((r) => setTimeout(r, 600));
      navigate(ROUTE_PATHS.REGISTER_SUCCESS);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPlan = SUBSCRIPTION_PLANS.find((p) => p.tier === formData.tier);
  const monthlyPriceBreakdown = useMemo(
    () => (selectedPlan ? calcVatBreakdown(selectedPlan.price, vatSettings) : null),
    [selectedPlan, vatSettings],
  );

  return (
    <div
      ref={formTopRef}
      className="w-full max-w-4xl mx-auto py-8 px-3 sm:px-4 scroll-mt-24 min-w-0 overflow-x-hidden"
    >
      <div className="mb-8 w-full min-w-0">
        <p className="text-center text-sm font-medium text-muted-foreground mb-3 md:hidden">
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
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-primary text-primary-foreground scale-110'
                          : isCompleted
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs mt-1.5 text-center leading-tight px-0.5 line-clamp-2 max-w-[4.5rem] sm:max-w-none ${
                        isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 w-6 sm:w-8 md:flex-1 shrink-0 mx-1 sm:mx-2 transition-all ${
                        isCompleted ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="min-w-0"
        >
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">اختر الباقة المناسبة</CardTitle>
                <CardDescription>اختر الباقة التي تناسب احتياجات محلك</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.tier}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, tier: value as SubscriptionTier }))
                  }
                  className="grid gap-4"
                >
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <label
                      key={plan.tier}
                      className={`relative cursor-pointer ${
                        formData.tier === plan.tier ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <Card
                        className={`transition-all hover:shadow-lg ${
                          formData.tier === plan.tier ? 'border-primary' : ''
                        }`}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value={plan.tier} id={plan.tier} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-xl font-bold">{plan.name}</h3>
                                  {plan.popular && (
                                    <Badge className="bg-accent text-accent-foreground">
                                      الأكثر شعبية
                                    </Badge>
                                  )}
                                  {plan.premium && (
                                    <Badge className="bg-primary text-primary-foreground">
                                      <Sparkles className="w-3 h-3 ml-1" />
                                      مميز
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-2xl font-bold text-primary mt-1">
                                  {plan.price} ريال
                                  <span className="text-sm text-muted-foreground">/شهرياً</span>
                                </p>
                              </div>
                            </div>
                          </div>
                          <ul className="space-y-2 list-none p-0 m-0">
                            {plan.features.map((feature, index) =>
                              feature.kind === 'map_hero' ? (
                                <li key={index} className="mb-3 list-none">
                                  <div className="rounded-xl border-2 border-primary/40 bg-gradient-to-br from-primary/18 via-primary/[0.06] to-cyan-500/12 p-3 shadow-md shadow-primary/15">
                                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-3 sm:text-right">
                                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-cyan-600 text-white shadow-md ring-2 ring-primary/15">
                                        <MapPin className="h-6 w-6" strokeWidth={2.25} aria-hidden />
                                      </div>
                                      <div className="min-w-0 flex-1 space-y-0.5 text-center sm:text-right">
                                        <p className="text-sm font-bold text-foreground leading-snug">
                                          {MAP_FEATURE_HERO.title}
                                        </p>
                                        <p className="text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                                          {MAP_FEATURE_HERO.subtitle}
                                        </p>
                                      </div>
                                      <Check className="h-5 w-5 shrink-0 text-primary" aria-label="مشمول" />
                                    </div>
                                  </div>
                                </li>
                              ) : (
                                <li key={index} className="flex items-center gap-2 text-sm">
                                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                  <span>{feature.text}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </CardContent>
                      </Card>
                    </label>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">بيانات المحل</CardTitle>
                <CardDescription>أدخل معلومات محل الحلاقة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shopName">اسم المحل *</Label>
                  <Input
                    id="shopName"
                    placeholder="مثال: صالون الأناقة"
                    value={formData.shopName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, shopName: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@domain.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="05xxxxxxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">رقم الواتساب *</Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      placeholder="05xxxxxxxx"
                      value={formData.whatsapp}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, whatsapp: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>نوع الخدمات *</Label>
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
                        />
                        <Label htmlFor={category} className="cursor-pointer">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">رفع المستندات</CardTitle>
                <CardDescription>
                  مستندات إلزامية لجميع الباقات قبل مراجعة الطلب وتفعيل الحساب
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="space-y-2 text-sm leading-relaxed">
                    <p>
                      <strong>شرط أساسي:</strong> السجل التجاري، ورخصة البلدية، و<strong>شهادات صحية للعاملين</strong>{' '}
                      في المحل. يمكن رفع أكثر من ملف للشهادات (صورة أو PDF لكل عامل أو ملف مجمّع).
                    </p>
                    <p className="text-muted-foreground">
                      سيتم مراجعة المستندات والتحقق منها؛ الطلبات الناقصة لا تُعتمد.
                    </p>
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="commercialRegistry">السجل التجاري *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="commercialRegistry"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        handleLegalDocumentUpload('commercialRegistry', e.target.files?.[0] || null)
                      }
                    />
                    {formData.documents.commercialRegistry && (
                      <Check className="w-5 h-5 text-primary shrink-0" aria-hidden />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="municipalLicense">رخصة البلدية *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="municipalLicense"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        handleLegalDocumentUpload('municipalLicense', e.target.files?.[0] || null)
                      }
                    />
                    {formData.documents.municipalLicense && (
                      <Check className="w-5 h-5 text-primary shrink-0" aria-hidden />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="healthCertificates">الشهادات الصحية للعاملين *</Label>
                  <p className="text-xs text-muted-foreground">
                    أرفق شهادةً صحيةً سارية لكل من يقدّم خدمة الحلاقة في المحل (يمكن اختيار عدة ملفات دفعة واحدة).
                  </p>
                  <Input
                    id="healthCertificates"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    onChange={(e) => {
                      handleHealthCertificatesAdd(e.currentTarget.files);
                      // يسمح بإعادة اختيار نفس الملف لاحقاً ويمنع تعلّق الحالة في بعض المتصفحات
                      e.currentTarget.value = '';
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.documents.healthCertificates.length > 0
                      ? `تمت إضافة ${formData.documents.healthCertificates.length} ملف/ملفات للشهادات الصحية`
                      : 'لم تتم إضافة ملفات للشهادات الصحية بعد'}
                  </p>
                  {formData.documents.healthCertificates.length > 0 && (
                    <ul className="rounded-lg border border-border bg-muted/30 p-3 space-y-2 text-sm">
                      {formData.documents.healthCertificates.map((file, idx) => (
                        <li key={`${file.name}-${idx}`} className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2 min-w-0">
                            <Check className="w-4 h-4 text-primary shrink-0" aria-hidden />
                            <span className="truncate">{file.name}</span>
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="shrink-0 text-destructive hover:text-destructive"
                            onClick={() => removeHealthCertificate(idx)}
                          >
                            إزالة
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">تحديد الموقع</CardTitle>
                <CardDescription>حدد موقع محلك بدقة على الخريطة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    يمكنك الحصول على الإحداثيات من خرائط جوجل بالضغط مطولاً على موقع المحل
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lat">خط العرض (Latitude) *</Label>
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lng">خط الطول (Longitude) *</Label>
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
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">العنوان التفصيلي (الشارع / المبنى / علامة مميزة) *</Label>
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
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGetLocation}
                    disabled={locationLoading}
                    className="flex-1"
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
                    className="flex-1"
                  >
                    <MapPin className="w-4 h-4 ml-2" />
                    اختبر الموقع
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">صور المحل والبنر</CardTitle>
                <CardDescription>
                  لجميع الباقات: صورتان أساسيتان (خارج وداخل) وأربع صور مخصّصة لمنطقة البنر في بطاقة المحل
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {(formData.tier === SubscriptionTier.GOLD || formData.tier === SubscriptionTier.DIAMOND) && (
                  <Alert className="border-primary/40 bg-primary/5">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-sm leading-relaxed">
                      بعد تفعيل اشتراكك يمكنك <strong>إضافة وحذف وتعديل</strong> صور المحل والبنر من{' '}
                      <strong>لوحة التحكم</strong> في أي وقت. ما ترفعه هنا هو المعتمد لمراجعة الطلب الأولى.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <Label htmlFor="shop-exterior">صورة واحدة — واجهة المحل من الخارج *</Label>
                  <p className="text-xs text-muted-foreground">
                    صورة واضحة للمدخل أو الواجهة؛ تُستخدم كمرجع أساسي لجميع فئات الاشتراك.
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
                    ارفع أربع صور منفصلة؛ تُعرض في شبكة البنر (الباقة البرونزية تعتمد على هذه الصور مع الطلب،
                    والباقتان الأعلى يمكن تطويرها لاحقاً من لوحة التحكم).
                  </p>
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
                          onChange={(e) => {
                            setBannerImage(slot, e.target.files?.[0] || null);
                            e.target.value = '';
                          }}
                        />
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

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    نفضّل صوراً جيدة الإضاءة وبدون تشويش؛ ذلك يساعد في قبول الطلب وظهور محلك بشكل احترافي.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {currentStep === 6 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">أوقات العمل (الأسبوع كاملاً)</CardTitle>
                <CardDescription>
                  من السبت إلى الجمعة — صفٌّ مضغوط لكل يوم. الباقة البرونزية: إلزامي ويُعرَض للعملاء كما تُدخله هنا.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(formData.tier === SubscriptionTier.GOLD || formData.tier === SubscriptionTier.DIAMOND) && (
                  <Alert className="border-primary/40 bg-primary/5">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-sm leading-relaxed">
                      باقتك تتيح لك بعد التفعيل <strong>تحكّماً كاملاً</strong> في أوقات العمل لكل يوم من{' '}
                      <strong>لوحة التحكم</strong> (جدول أسبوعي). ما تُدخله الآن يُستخدم لمراجعة الطلب؛ يمكنك
                      تعديله لاحقاً بحرية.
                    </AlertDescription>
                  </Alert>
                )}
                {formData.tier === SubscriptionTier.BRONZE && (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      <strong>الباقة البرونزية:</strong> أوقات العمل هنا <strong>إلزامية</strong> وتُثبَّت في بطاقة
                      المحل للعملاء. عيّن «مغلق» لأيام الراحة.
                    </AlertDescription>
                  </Alert>
                )}
                <div className="rounded-lg border border-border divide-y divide-border overflow-hidden max-w-full">
                  {formData.workingWeek.map((row, index) => (
                    <div
                      key={row.day}
                      className="w-full min-w-0 p-3 sm:p-2.5 bg-muted/20 space-y-3 sm:space-y-0 sm:flex sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 gap-y-2 min-w-0 sm:min-w-[12rem] sm:justify-start sm:flex-nowrap">
                        <span className="text-sm font-semibold text-foreground shrink-0">{row.day}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <Checkbox
                            id={`closed-${index}`}
                            checked={row.closed}
                            onCheckedChange={(checked) =>
                              patchWorkingWeekRow(index, { closed: checked === true })
                            }
                          />
                          <Label htmlFor={`closed-${index}`} className="text-xs text-muted-foreground cursor-pointer">
                            مغلق
                          </Label>
                        </div>
                      </div>
                      {!row.closed ? (
                        <div className="grid grid-cols-2 gap-3 w-full min-w-0 md:flex md:flex-row md:flex-wrap md:items-end md:justify-end md:gap-3 md:max-w-lg md:shrink-0">
                          <div className="space-y-1 min-w-0 md:w-[7.75rem]">
                            <Label className="text-[11px] text-muted-foreground md:sr-only" htmlFor={`open-${index}`}>
                              من
                            </Label>
                            <Input
                              id={`open-${index}`}
                              type="time"
                              value={row.open}
                              disabled={row.closed}
                              onChange={(e) => patchWorkingWeekRow(index, { open: e.target.value })}
                              className="h-11 w-full min-w-0 max-w-full text-base md:h-9 md:text-sm box-border"
                              aria-label={`${row.day} من`}
                            />
                          </div>
                          <div className="space-y-1 min-w-0 md:w-[7.75rem]">
                            <Label className="text-[11px] text-muted-foreground md:sr-only" htmlFor={`close-${index}`}>
                              إلى
                            </Label>
                            <Input
                              id={`close-${index}`}
                              type="time"
                              value={row.close}
                              disabled={row.closed}
                              onChange={(e) => patchWorkingWeekRow(index, { close: e.target.value })}
                              className="h-11 w-full min-w-0 max-w-full text-base md:h-9 md:text-sm box-border"
                              aria-label={`${row.day} إلى`}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground py-1 md:text-right md:py-0 md:min-w-[10rem]">يوم عطلة</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 7 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">منيو الحلاقة والأسعار</CardTitle>
                <CardDescription>أضف الخدمات المتوفرة وأسعارها</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      />
                    </div>
                    {formData.services.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeService(index)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addService} className="w-full">
                  + إضافة خدمة
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === 8 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">طريقة الدفع</CardTitle>
                <CardDescription>اختر طريقة الدفع المناسبة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPlan && (
                  <Alert className="bg-primary/10 border-primary">
                    <Star className="h-4 w-4" />
                    <AlertDescription>
                      {vatSettings.enabled && monthlyPriceBreakdown && monthlyPriceBreakdown.vat > 0 ? (
                        <>
                          الباقة المختارة: <strong>{selectedPlan.name}</strong> — أتعاب الاشتراك{' '}
                          {monthlyPriceBreakdown.subtotal} ر.س شهرياً + ضريبة القيمة المضافة (
                          {vatSettings.ratePercent}%){' '}
                          {monthlyPriceBreakdown.vat} ر.س = الإجمالي{' '}
                          <strong>{monthlyPriceBreakdown.total} ر.س شهرياً</strong>
                        </>
                      ) : (
                        <>
                          الباقة المختارة: <strong>{selectedPlan.name}</strong> - {selectedPlan.price} ريال شهرياً
                          <span className="block text-xs mt-1 opacity-90">
                            المبلغ المعروض أتعاب اشتراك فقط دون ضريبة قيمة مضافة في الوضع الحالي.
                          </span>
                        </>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
                <RadioGroup
                  value={formData.payment.method}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      payment: { ...prev.payment, method: value as 'monthly' | 'bank_transfer' },
                    }))
                  }
                  className="space-y-3"
                >
                  <label className="flex items-center space-x-3 space-x-reverse border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <div className="flex-1">
                      <div className="font-semibold">اشتراك شهري</div>
                      <p className="text-sm text-muted-foreground">
                        دفع شهري متجدد تلقائياً - يمكن الإلغاء في أي وقت
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3 space-x-reverse border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                    <div className="flex-1">
                      <div className="font-semibold">تحويل بنكي (6 أشهر مقدماً)</div>
                      <p className="text-sm text-muted-foreground">
                        خلال فترة العرض: خصم 10% على إجمالي 6 أشهر + شهران إضافيان (8 أشهر صلاحية). بعد انتهاء
                        العرض: السعر الكامل لـ 6 أشهر فقط.
                      </p>
                      {selectedPlan && (() => {
                        const base = getBankTransferPayableAmountSar(selectedPlan.tier);
                        const bd = calcVatBreakdown(base, vatSettings);
                        return (
                          <div className="text-sm font-semibold text-primary mt-1 space-y-1">
                            <p>
                              المبلغ المطلوب الآن للتحويل:{' '}
                              {vatSettings.enabled && bd.vat > 0 ? (
                                <>
                                  {bd.total} ريال (يشمل ضريبة القيمة المضافة {vatSettings.ratePercent}%:{' '}
                                  {bd.vat} ريال على أتعاب {bd.subtotal} ريال)
                                </>
                              ) : (
                                <>{base} ريال (أتعاب اشتراك دون ضريبة قيمة مضافة)</>
                              )}
                            </p>
                            <p className="text-xs font-normal text-muted-foreground">
                              {getBankTransferPlanSummaryAr(selectedPlan.tier)}
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  </label>
                </RadioGroup>
                <div className="space-y-3 rounded-lg border border-border bg-muted/25 p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="registration-terms-accept"
                      checked={formData.registrationTermsAccepted}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          registrationTermsAccepted: checked === true,
                        }))
                      }
                      className="mt-1"
                    />
                    <Label htmlFor="registration-terms-accept" className="cursor-pointer text-sm font-normal leading-relaxed">
                      <span className="font-semibold text-foreground">أقرّ بموافقتي الصريحة</span> على أنني قرأت وفهمت{' '}
                      <Link
                        to={ROUTE_PATHS.SUBSCRIPTION_POLICY}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline-offset-2 hover:underline font-medium"
                      >
                        شروط التسجيل والاشتراك
                      </Link>{' '}
                      و{' '}
                      <Link
                        to={ROUTE_PATHS.PARTNER_PRIVACY}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline-offset-2 hover:underline font-medium"
                      >
                        سياسة خصوصية الشركاء
                      </Link>
                      ، وأوافق على الالتزام بها. أعلم أن مجرد تصفح النصوص دون التأشير هنا لا يُعد موافقة.
                    </Label>
                  </div>
                </div>
                {formData.payment.method === 'bank_transfer' && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                    <div className="space-y-2">
                      <h4 className="font-semibold">معلومات التحويل البنكي:</h4>
                      <div className="text-sm space-y-1">
                        <p>البنك: {BANK_TRANSFER.bankDisplayAr}</p>
                        <p>رقم الحساب (IBAN): {BANK_TRANSFER.iban}</p>
                        <p>اسم المستفيد: {BANK_TRANSFER.beneficiaryDisplay}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="receipt">رفع إيصال التحويل *</Label>
                      <Input
                        id="receipt"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            payment: { ...prev.payment, receipt: e.target.files?.[0] || null },
                          }))
                        }
                      />
                      {formData.payment.receipt && (
                        <div className="space-y-1 text-sm">
                          <p className="flex items-center gap-2 text-foreground min-w-0">
                            <Check className="w-4 h-4 shrink-0 text-primary" aria-hidden />
                            <span className="text-muted-foreground">تم اختيار الملف:</span>
                            <span className="font-medium truncate" dir="ltr">
                              {formData.payment.receipt.name}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed pr-6">
                            الرفع إلى السيرفر يتم فقط عند الضغط على «إرسال الطلب» — لا يُعتبر الملف مرفوعاً قبل نجاح الإرسال.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1 || isSubmitting}
        >
          <ChevronLeft className="w-4 h-4 ml-2" />
          السابق
        </Button>
        {currentStep < STEPS.length ? (
          <Button onClick={handleNext} disabled={isSubmitting}>
            التالي
            <ChevronRight className="w-4 h-4 mr-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.registrationTermsAccepted}
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
