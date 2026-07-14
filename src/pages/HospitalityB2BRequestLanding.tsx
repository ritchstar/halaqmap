import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { Building2, Hotel, MapPin, PackageCheck, QrCode, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROUTE_PATHS } from '@/lib';
import {
  submitHospitalityB2BRequest,
  type HospitalityFacilityType,
} from '@/lib/hospitalityB2BRequestRemote';
import { toast } from '@/components/ui/sonner';

type FormState = {
  facilityName: string;
  facilityType: HospitalityFacilityType;
  receptionBannersCount: string;
  roomsBannersCount: string;
  shippingCity: string;
  shippingDistrict: string;
  shippingRecipientName: string;
  shippingPhone: string;
  shippingGoogleMapsUrl: string;
  ambassadorCode: string;
  website: string;
};

const INITIAL_FORM: FormState = {
  facilityName: '',
  facilityType: 'hotel',
  receptionBannersCount: '',
  roomsBannersCount: '',
  shippingCity: '',
  shippingDistrict: '',
  shippingRecipientName: '',
  shippingPhone: '',
  shippingGoogleMapsUrl: '',
  ambassadorCode: '',
  website: '',
};

export default function HospitalityB2BRequestLanding() {
  const [searchParams] = useSearchParams();
  const ambFromUrl = useMemo(() => {
    const raw =
      searchParams.get('amb') || searchParams.get('ref') || searchParams.get('ambassadorCode') || '';
    return raw.trim().toUpperCase().slice(0, 40);
  }, [searchParams]);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ambFromUrl) return;
    setForm((prev) => (prev.ambassadorCode ? prev : { ...prev, ambassadorCode: ambFromUrl }));
  }, [ambFromUrl]);

  const patch = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const reception = Number(form.receptionBannersCount || '0');
    const rooms = Number(form.roomsBannersCount || '0');

    if (!form.facilityName.trim()) {
      toast.error('يرجى إدخال اسم المنشأة.');
      return;
    }
    if (!form.shippingCity.trim() || !form.shippingDistrict.trim()) {
      toast.error('يرجى استكمال المدينة والحي.');
      return;
    }
    if (!form.shippingRecipientName.trim() || !form.shippingPhone.trim()) {
      toast.error('يرجى إدخال اسم المستلم والجوال.');
      return;
    }
    if (!form.shippingGoogleMapsUrl.trim()) {
      toast.error('يرجى إدخال رابط خرائط Google للتوثيق.');
      return;
    }
    if (reception <= 0 && rooms <= 0) {
      toast.error('يجب إدخال عدد بنرات الاستقبال أو بنرات الغرف.');
      return;
    }

    setLoading(true);
    const ambCode = (form.ambassadorCode || ambFromUrl).trim().toUpperCase();
    const result = await submitHospitalityB2BRequest({
      facilityName: form.facilityName.trim(),
      facilityType: form.facilityType,
      receptionBannersCount: reception,
      roomsBannersCount: rooms,
      shippingCity: form.shippingCity.trim(),
      shippingDistrict: form.shippingDistrict.trim(),
      shippingRecipientName: form.shippingRecipientName.trim(),
      shippingPhone: form.shippingPhone.trim(),
      shippingGoogleMapsUrl: form.shippingGoogleMapsUrl.trim(),
      ambassadorCode: ambCode || undefined,
      website: form.website,
    });
    setLoading(false);

    if (!result.ok) {
      toast.error(result.error || 'تعذّر إرسال الطلب');
      return;
    }

    toast.success('تم إرسال الطلب بنجاح. سيتم مراجعته ثم تحويله للتنفيذ.');
    void import('@/lib/analytics/productAnalytics').then(({ ProductEvents }) => {
      ProductEvents.hospitalityRequestStarted();
    });
    setForm({ ...INITIAL_FORM, ambassadorCode: ambFromUrl });
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border bg-gradient-to-b from-primary/10 via-background to-background py-12 md:py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            <Building2 className="h-4 w-4" />
            مسار B2B للمنشآت الفندقية
          </div>
          <h1 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
            طلب بنرات QR للغرف والاستقبال
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            يُملأ هذا النموذج من المنشأة نفسها (أعداد البنرات وعنوان الشحن). إن زاركم مسوّق ميداني، أدخلوا كوده لربط
            الطلب به.
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-4xl px-4 py-10 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              <QrCode className="mb-2 h-5 w-5 text-primary" />
              تجربة QR مباشرة للنزيل للوصول إلى حلاق مناسب في المنطقة.
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              <Truck className="mb-2 h-5 w-5 text-primary" />
              البنرات والشحن على حساب المنصة ضمن برنامج التسويق الميداني الرسمي.
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              <PackageCheck className="mb-2 h-5 w-5 text-primary" />
              الطلب يمر بدورة: اعتماد → تحويل للمختص → تنفيذ → إغلاق.
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/25 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hotel className="h-5 w-5 text-primary" />
              نموذج الطلب المباشر
            </CardTitle>
            <CardDescription>
              الرجاء تعبئة البيانات بدقة من جهة المنشأة. يتم التوثيق برابط خرائط Google لضمان دقة الشحن.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="facility-name">اسم المنشأة</Label>
                  <Input
                    id="facility-name"
                    value={form.facilityName}
                    onChange={(e) => patch('facilityName', e.target.value)}
                    placeholder="مثال: شقق الفخامة الفندقية"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>تصنيف المنشأة</Label>
                  <Select
                    value={form.facilityType}
                    onValueChange={(v) => patch('facilityType', v as HospitalityFacilityType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hotel">فندق</SelectItem>
                      <SelectItem value="furnished_apartments">شقق مفروشة</SelectItem>
                      <SelectItem value="guest_house">دور ضيافة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ambassador-code">كود المسوّق الميداني (إن وُجد)</Label>
                  <Input
                    id="ambassador-code"
                    dir="ltr"
                    value={form.ambassadorCode}
                    onChange={(e) => patch('ambassadorCode', e.target.value.toUpperCase())}
                    placeholder="HM-AMB-…"
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    يُملأ تلقائياً إن فُتح الرابط من المسوّق. لا يُطلب من المسوّق تعبئة أعداد البنرات أو الشحن.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reception-count">عدد بنرات الاستقبال</Label>
                  <Input
                    id="reception-count"
                    type="number"
                    min={0}
                    step={1}
                    value={form.receptionBannersCount}
                    onChange={(e) => patch('receptionBannersCount', e.target.value)}
                    placeholder="مثال: 2"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rooms-count">عدد بنرات الغرف/الأجنحة</Label>
                  <Input
                    id="rooms-count"
                    type="number"
                    min={0}
                    step={1}
                    value={form.roomsBannersCount}
                    onChange={(e) => patch('roomsBannersCount', e.target.value)}
                    placeholder="مثال: 120"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shipping-city">مدينة الشحن</Label>
                  <Input
                    id="shipping-city"
                    value={form.shippingCity}
                    onChange={(e) => patch('shippingCity', e.target.value)}
                    placeholder="الرياض"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shipping-district">الحي</Label>
                  <Input
                    id="shipping-district"
                    value={form.shippingDistrict}
                    onChange={(e) => patch('shippingDistrict', e.target.value)}
                    placeholder="حي العليا"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shipping-recipient">اسم المستلم</Label>
                  <Input
                    id="shipping-recipient"
                    value={form.shippingRecipientName}
                    onChange={(e) => patch('shippingRecipientName', e.target.value)}
                    placeholder="الاسم الثلاثي"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shipping-phone">جوال المستلم</Label>
                  <Input
                    id="shipping-phone"
                    dir="ltr"
                    value={form.shippingPhone}
                    onChange={(e) => patch('shippingPhone', e.target.value)}
                    placeholder="+9665xxxxxxxx"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="maps-link" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    رابط الموقع على خرائط Google
                  </Label>
                  <Input
                    id="maps-link"
                    dir="ltr"
                    value={form.shippingGoogleMapsUrl}
                    onChange={(e) => patch('shippingGoogleMapsUrl', e.target.value)}
                    placeholder="https://maps.google.com/..."
                    required
                  />
                </div>
              </div>

              <div className="sr-only" aria-hidden="true">
                <Label htmlFor="hospitality-website">Website</Label>
                <Input
                  id="hospitality-website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={(e) => patch('website', e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" size="lg" disabled={loading}>
                  {loading ? 'جاري إرسال الطلب…' : 'إرسال الطلب'}
                </Button>
                <NavLink to={ROUTE_PATHS.BARBERS_LANDING}>
                  <Button type="button" variant="outline" size="lg">
                    العودة
                  </Button>
                </NavLink>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
