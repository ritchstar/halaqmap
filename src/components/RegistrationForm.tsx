import { useState } from 'react';
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
import { SubscriptionTier } from '@/lib/index';
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

const SUBSCRIPTION_PLANS = [
  {
    tier: SubscriptionTier.BRONZE,
    name: 'برونزي',
    price: 100,
    color: 'from-amber-700 to-amber-900',
    features: [
      '4 صور مصغرة للمحل',
      'عرض الموقع على الخريطة',
      'رقم الهاتف للتواصل',
      'ظهور في نتائج البحث',
    ],
  },
  {
    tier: SubscriptionTier.GOLD,
    name: 'ذهبي',
    price: 150,
    color: 'from-accent to-yellow-600',
    features: [
      'كل مميزات البرونزي',
      'بنر موسع بصور متعددة',
      'رابط واتساب مباشر',
      'شات مباشر مع العملاء',
      'أولوية في الظهور',
    ],
    popular: true,
  },
  {
    tier: SubscriptionTier.DIAMOND,
    name: 'ماسي',
    price: 200,
    color: 'from-primary to-cyan-600',
    features: [
      'كل مميزات الذهبي',
      'شارة ماسية مميزة',
      'أولوية قصوى في الظهور',
      'نظام حجز المواعيد',
      'ترجمة تلقائية في الشات',
      'تقييمات ذكية بـ QR Code',
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

export function RegistrationForm() {
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
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
  };

  const selectedPlan = SUBSCRIPTION_PLANS.find((p) => p.tier === formData.tier);

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
                          <ul className="space-y-2">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm">
                                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
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
                  <Label htmlFor="address">العنوان التفصيلي *</Label>
                  <Textarea
                    id="address"
                    placeholder="مثال: حي النخيل، شارع الملك فهد، بجوار مركز التسوق"
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
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="exterior">صور خارجية *</Label>
                  <Input
                    id="exterior"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload('exterior', e.target.files)}
                  />
                  {formData.images.exterior.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      تم رفع {formData.images.exterior.length} صورة
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interior">صور داخلية *</Label>
                  <Input
                    id="interior"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload('interior', e.target.files)}
                  />
                  {formData.images.interior.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      تم رفع {formData.images.interior.length} صورة
                    </p>
                  )}
                </div>
                <Alert>
                  <ImageIcon className="h-4 w-4" />
                  <AlertDescription>
                    الصور عالية الجودة تزيد من فرص جذب العملاء. يُفضل رفع 4-8 صور متنوعة
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
                      الباقة المختارة: <strong>{selectedPlan.name}</strong> - {selectedPlan.price}{' '}ريال شهرياً
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
                      <div className="font-semibold">تحويل بنكي (6 أشهر)</div>
                      <p className="text-sm text-muted-foreground">
                        دفع مقدم لـ 6 أشهر - وفر 10% من قيمة الاشتراك
                      </p>
                      {selectedPlan && (
                        <p className="text-sm font-semibold text-primary mt-1">
                          المبلغ المطلوب: {(selectedPlan.price * 6 * 0.9).toFixed(0)} ريال
                        </p>
                      )}
                    </div>
                  </label>
                </RadioGroup>
                {formData.payment.method === 'bank_transfer' && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                    <div className="space-y-2">
                      <h4 className="font-semibold">معلومات التحويل البنكي:</h4>
                      <div className="text-sm space-y-1">
                        <p>البنك: البنك الأهلي السعودي</p>
                        <p>رقم الحساب: SA1234567890123456789012</p>
                        <p>اسم المستفيد: شركة حلاق ماب</p>
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
