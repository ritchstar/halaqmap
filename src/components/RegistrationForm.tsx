import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { SubscriptionTier, ROUTE_PATHS, type SubscriptionRequest } from '@/lib/index';
import {
  appendSubscriptionRequest,
  generateRegistrationOrderId,
  formatSubmissionDateTimeAr,
  saPhoneToInternational,
  saveLastOrderConfirmation,
} from '@/lib/subscriptionRequestStorage';
import { BANK_TRANSFER } from '@/config/bankTransfer';
import { getBankTransferPayableAmountSar, getBankTransferPlanSummaryAr } from '@/config/subscriptionPricing';
import { MAP_FEATURE_HERO } from '@/config/subscriptionPlanHero';
import { RATING_QR_PLAN_LINE } from '@/config/ratingQrInvite';
import { usePlatformVatSettings } from '@/hooks/usePlatformVatSettings';
import { calcVatBreakdown } from '@/lib/platformVatSettings';
import {
  SaudiRegionCityDistrictFields,
  composeSaudiLocationLine,
  type SaudiLocationSelection,
} from '@/components/SaudiRegionCityDistrictFields';
import { loadSaudiGeoLite, OTHER_DISTRICT_VALUE } from '@/lib/saudiGeoData';
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
    healthCertificates: File | null;
  };
  location: {
    lat: string;
    lng: string;
    address: string;
    /** من بيانات العنوان الوطني (ملفات lite) */
    saudi: SaudiLocationSelection;
  };
  images: {
    exterior: File[];
    interior: File[];
  };
  services: {
    name: string;
    price: string;
  }[];
  payment: {
    method: 'monthly' | 'bank_transfer' | '';
    receipt: File | null;
  };
}

const STEPS = [
  { id: 1, title: 'اختيار الباقة', icon: Star },
  { id: 2, title: 'بيانات المحل', icon: FileText },
  { id: 3, title: 'المستندات', icon: Upload },
  { id: 4, title: 'الموقع', icon: MapPin },
  { id: 5, title: 'الصور', icon: ImageIcon },
  { id: 6, title: 'المنيو', icon: FileText },
  { id: 7, title: 'الدفع', icon: CreditCard },
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
      { kind: 'line', text: RATING_QR_PLAN_LINE },
      { kind: 'line', text: '4 صور مصغرة للمحل' },
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
      { kind: 'line', text: 'رابط واتساب مباشر' },
      { kind: 'line', text: 'شات مباشر مع العملاء' },
      { kind: 'line', text: 'أولوية في الظهور على الخريطة والبحث' },
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
      { kind: 'line', text: 'جميع مزايا الباقة الذهبية' },
      { kind: 'line', text: 'شارة ماسية مميزة على الخريطة' },
      { kind: 'line', text: 'أولوية قصوى في الظهور على الخريطة والبحث' },
      { kind: 'line', text: 'نظام حجز المواعيد' },
      { kind: 'line', text: 'ترجمة تلقائية في الشات' },
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
      healthCertificates: null,
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
      exterior: [],
      interior: [],
    },
    services: [{ name: '', price: '' }],
    payment: {
      method: '',
      receipt: null,
    },
  });

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

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = (field: string, file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: file,
      },
    }));
  };

  const handleImageUpload = (type: 'exterior' | 'interior', files: FileList | null) => {
    if (files) {
      setFormData((prev) => ({
        ...prev,
        images: {
          ...prev.images,
          [type]: [...prev.images[type], ...Array.from(files)],
        },
      }));
    }
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

    setIsSubmitting(true);
    try {
      const orderId = generateRegistrationOrderId();
      const submittedAtLabel = formatSubmissionDateTimeAr();
      const submittedAtIso = new Date().toISOString();

      const docLabels: string[] = [];
      if (formData.documents.commercialRegistry) {
        docLabels.push(`سجل تجاري: ${formData.documents.commercialRegistry.name}`);
      }
      if (formData.documents.municipalLicense) {
        docLabels.push(`رخصة بلدية: ${formData.documents.municipalLicense.name}`);
      }
      if (formData.documents.healthCertificates) {
        docLabels.push(`شهادات صحية: ${formData.documents.healthCertificates.name}`);
      }

      const servicesSummary = formData.services
        .filter((s) => s.name.trim())
        .map((s) => `${s.name.trim()} — ${s.price || '—'} ر.س`)
        .join('\n');

      let receiptDataUrl: string | undefined;
      const receiptFile = formData.payment.receipt;
      if (receiptFile && receiptFile.size <= MAX_RECEIPT_STORAGE_BYTES) {
        try {
          receiptDataUrl = await readFileAsDataURL(receiptFile);
        } catch {
          receiptDataUrl = undefined;
        }
      }

      const lat = parseFloat(formData.location.lat) || 0;
      const lng = parseFloat(formData.location.lng) || 0;

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
        shopImages: ['/placeholder.svg'],
        status: 'pending',
        submittedAt: submittedAtLabel,
        source: 'registration',
        paymentMethod: formData.payment.method,
        receiptFileName: receiptFile?.name,
        receiptDataUrl,
        servicesSummary: servicesSummary || '—',
        categories: [...formData.categories],
      };

      await appendSubscriptionRequest(request);

      const plan = SUBSCRIPTION_PLANS.find((p) => p.tier === formData.tier);
      const tierName = plan?.name ?? String(formData.tier);
      const payLabel =
        formData.payment.method === 'bank_transfer' && plan
          ? `تحويل بنكي — ${getBankTransferPlanSummaryAr(plan.tier)}`
          : formData.payment.method === 'bank_transfer'
            ? 'تحويل بنكي'
            : 'اشتراك شهري';

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
        (receiptFile ? `ملف الإيصال: ${receiptFile.name}\n` : '') +
        `\n` +
        `العنوان: ${composedAddress || formData.location.address || '—'}\n` +
        `الإحداثيات: ${formData.location.lat || '—'}, ${formData.location.lng || '—'}\n` +
        `\n` +
        `الخدمات والأسعار:\n${servicesSummary || '—'}\n` +
        `\n` +
        `المستندات (أسماء الملفات):\n${docLabels.join('\n') || '—'}\n` +
        `\n` +
        `صور المحل: خارجي ${formData.images.exterior.length} — داخلي ${formData.images.interior.length}\n` +
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
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex flex-col items-center ${
                    index < STEPS.length - 1 ? 'flex-1' : ''
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground scale-110'
                        : isCompleted
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span
                    className={`text-xs mt-2 text-center ${
                      isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-all ${
                      isCompleted ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
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
                <CardDescription>يرجى رفع المستندات الرسمية المطلوبة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    جميع المستندات سيتم مراجعتها والتحقق منها قبل تفعيل الحساب
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
                        handleFileUpload('commercialRegistry', e.target.files?.[0] || null)
                      }
                    />
                    {formData.documents.commercialRegistry && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="municipalLicense">الرخصة البلدية *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="municipalLicense"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        handleFileUpload('municipalLicense', e.target.files?.[0] || null)
                      }
                    />
                    {formData.documents.municipalLicense && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="healthCertificates">الشهادات الصحية *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="healthCertificates"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        handleFileUpload('healthCertificates', e.target.files?.[0] || null)
                      }
                    />
                    {formData.documents.healthCertificates && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </div>
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
                <CardTitle className="text-2xl">صور المحل</CardTitle>
                <CardDescription>ارفع صور واضحة للمحل من الخارج والداخل</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Exterior Images */}
                <div className="space-y-3">
                  <Label>صور خارجية *</Label>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById('exterior')?.click();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        document.getElementById('exterior')?.click();
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    <input
                      id="exterior"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        handleImageUpload('exterior', e.target.files);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <p className="text-base font-medium text-foreground mb-1">
                          الصور عالية الجودة تزيد من فرص جذب العملاء. تفضل رفع 4-8 صور متنوعة
                        </p>
                        <p className="text-sm text-muted-foreground">
                          اضغط هنا لرفع الصور أو اسحب الصور إلى هذه المنطقة
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        PNG, JPG, JPEG حتى 10MB
                      </Badge>
                    </div>
                  </div>
                  {formData.images.exterior.length > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <Check className="w-5 h-5 text-green-600" />
                      <p className="text-sm font-medium text-green-600">
                        تم رفع {formData.images.exterior.length} صورة خارجية
                      </p>
                    </div>
                  )}
                </div>

                {/* Interior Images */}
                <div className="space-y-3">
                  <Label>صور داخلية *</Label>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById('interior')?.click();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        document.getElementById('interior')?.click();
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    <input
                      id="interior"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        handleImageUpload('interior', e.target.files);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <p className="text-base font-medium text-foreground mb-1">
                          الصور عالية الجودة تزيد من فرص جذب العملاء. تفضل رفع 4-8 صور متنوعة
                        </p>
                        <p className="text-sm text-muted-foreground">
                          اضغط هنا لرفع الصور أو اسحب الصور إلى هذه المنطقة
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        PNG, JPG, JPEG حتى 10MB
                      </Badge>
                    </div>
                  </div>
                  {formData.images.interior.length > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <Check className="w-5 h-5 text-green-600" />
                      <p className="text-sm font-medium text-green-600">
                        تم رفع {formData.images.interior.length} صورة داخلية
                      </p>
                    </div>
                  )}
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    💡 <strong>نصيحة:</strong> الصور الواضحة والمتنوعة تزيد من فرص ظهور محلك في نتائج البحث الأولى
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {currentStep === 6 && (
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

          {currentStep === 7 && (
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
                        <p className="text-sm text-primary flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          تم رفع الإيصال
                        </p>
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
          <Button onClick={handleSubmit} disabled={isSubmitting}>
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
