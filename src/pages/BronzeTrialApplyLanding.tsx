import { useMemo, useState, type FormEvent } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { MapPin, ShieldAlert, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { ROUTE_PATHS } from '@/lib';
import { getSupabaseClient } from '@/integrations/supabase/client';
import { generateRegistrationOrderId } from '@/lib/subscriptionRequestStorage';
import {
  registrationUploadErrorForToast,
  uploadRegistrationPathFile,
} from '@/lib/registrationFileUploads';
import { mintRegistrationIntentTokenRemote } from '@/lib/registrationIntentRemote';
import {
  bronzeTrialApplyErrorAr,
  submitBronzeTrialApplicationRemote,
} from '@/lib/bronzeTrialApplyRemote';
import {
  SaudiRegionCityDistrictFields,
  type SaudiLocationSelection,
} from '@/components/SaudiRegionCityDistrictFields';
import { loadSaudiGeoLite, OTHER_DISTRICT_VALUE } from '@/lib/saudiGeoData';
import { toast } from 'sonner';

const TRIAL_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

type PhotoKey = 'exteriorSign' | 'exterior2' | 'interior1' | 'interior2';

const PHOTO_LABELS: Record<PhotoKey, string> = {
  exteriorSign: 'خارج — لوحة المحل (إلزامي، واضحة)',
  exterior2: 'خارج — صورة ثانية للواجهة',
  interior1: 'داخل — صورة 1',
  interior2: 'داخل — صورة 2',
};

export default function BronzeTrialApplyLanding() {
  const [salonName, setSalonName] = useState('');
  const [establishmentName, setEstablishmentName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [geo, setGeo] = useState<SaudiLocationSelection>({
    regionId: '',
    cityId: '',
    districtId: '',
    districtOther: '',
  });
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<Partial<Record<PhotoKey, File>>>({});
  const [ack, setAck] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [locating, setLocating] = useState(false);

  const photoReady = useMemo(
    () => Boolean(photos.exteriorSign && photos.exterior2 && photos.interior1 && photos.interior2),
    [photos],
  );

  const locateMe = () => {
    if (!navigator.geolocation) {
      toast.error('المتصفح لا يدعم تحديد الموقع');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude.toFixed(6)));
        setLng(String(pos.coords.longitude.toFixed(6)));
        setLocating(false);
        toast.success('تم تحديد موقعك — راجع الإحداثيات');
      },
      () => {
        setLocating(false);
        toast.error('تعذّر تحديد الموقع — أدخل الإحداثيات يدوياً');
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const onFile = (key: PhotoKey, file: File | null) => {
    if (!file) {
      setPhotos((p) => {
        const n = { ...p };
        delete n[key];
        return n;
      });
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('الملف يجب أن يكون صورة');
      return;
    }
    if (file.size > TRIAL_PHOTO_MAX_BYTES) {
      toast.error(`حجم الصورة يتجاوز 5 ميغابايت: ${PHOTO_LABELS[key]}`);
      return;
    }
    setPhotos((p) => ({ ...p, [key]: file }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ack) {
      toast.error('يجب الإقرار بأن هذا ليس تسجيلاً رسمياً');
      return;
    }
    if (!photoReady) {
      toast.error('ارفع الصور الأربع المطلوبة');
      return;
    }
    const latitude = Number(lat);
    const longitude = Number(lng);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      toast.error('أدخل إحداثيات صالحة أو استخدم «حدد موقعي»');
      return;
    }

    setLoading(true);
    try {
      const bundle = await loadSaudiGeoLite();
      const city = bundle.cities.find((c) => c.city_id === Number(geo.cityId));
      const district =
        geo.districtId === OTHER_DISTRICT_VALUE
          ? geo.districtOther.trim()
          : bundle.districts.find((d) => d.district_id === Number(geo.districtId))?.name_ar || '';
      const region = bundle.regions.find((r) => r.region_id === Number(geo.regionId))?.name_ar || '';
      const cityAr = city?.name_ar || '';
      const districtAr = district || '';
      if (!cityAr || !districtAr) {
        toast.error('أكمل المنطقة والمدينة والحي');
        setLoading(false);
        return;
      }

      const client = getSupabaseClient();
      if (!client) {
        toast.error('إعداد الواجهة غير مكتمل');
        setLoading(false);
        return;
      }

      const orderId = generateRegistrationOrderId();
      const intent = await mintRegistrationIntentTokenRemote(orderId);
      if (!intent.ok) {
        toast.error(intent.error);
        setLoading(false);
        return;
      }
      const intentToken = intent.intentToken;

      const uploads: Record<PhotoKey, string> = {
        exteriorSign: '',
        exterior2: '',
        interior1: '',
        interior2: '',
      };
      for (const key of Object.keys(PHOTO_LABELS) as PhotoKey[]) {
        const file = photos[key]!;
        const up = await uploadRegistrationPathFile(client, orderId, 'shop', file, intentToken);
        if (!up.ok) {
          toast.error(registrationUploadErrorForToast(up.error));
          setLoading(false);
          return;
        }
        uploads[key] = up.url;
      }

      const result = await submitBronzeTrialApplicationRemote({
        salonName: salonName.trim(),
        establishmentName: establishmentName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        cityAr,
        districtAr,
        regionAr: region || undefined,
        latitude,
        longitude,
        notes: notes.trim() || undefined,
        photoExteriorSignUrl: uploads.exteriorSign,
        photoExterior2Url: uploads.exterior2,
        photoInterior1Url: uploads.interior1,
        photoInterior2Url: uploads.interior2,
        uploadOrderId: orderId,
        website: honeypot,
      });

      if (!result.ok) {
        toast.error(bronzeTrialApplyErrorAr(result.error));
        setLoading(false);
        return;
      }

      setDone(true);
      toast.success(
        result.confirmEmailSent
          ? 'تم الإرسال — افتح بريدك وأكّد الرابط'
          : 'تم حفظ الطلب — إن لم يصلك بريد التأكيد تواصل مع الدعم',
      );
    } catch {
      toast.error('تعذّر إرسال الطلب');
    }
    setLoading(false);
  };

  if (done) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <Alert className="border-emerald-400/50 bg-emerald-50 text-emerald-950 shadow-lg">
          <AlertTitle className="text-lg font-bold text-emerald-950">تم استلام طلب التجربة</AlertTitle>
          <AlertDescription className="space-y-3 text-base leading-relaxed text-emerald-900">
            <p>أرسلنا رابط تأكيد إلى بريدك. بعد التأكيد يُراجع الطلب خلال 3–5 أيام عمل.</p>
            <p>
              هذا <strong>ليس تسجيلاً رسمياً</strong>. عند الموافقة يصلك كود تفعيل، ثم تكمل من{' '}
              <NavLink to={ROUTE_PATHS.REGISTER} className="font-semibold text-teal-800 underline">
                صفحة التسجيل الرسمية
              </NavLink>
              .
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const fieldLabel = 'text-base font-semibold text-slate-800';
  const fieldInput =
    'h-11 border-slate-300 bg-white text-base text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-600';

  return (
    <div className="relative">
      <section className="border-b border-white/10 bg-gradient-to-b from-amber-400/15 via-transparent to-transparent py-10 md:py-14">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/50 bg-amber-400/20 px-4 py-2 text-base font-bold text-amber-100">
            <Sparkles className="h-4 w-4" />
            تجربة برونزي 30 يوماً — خاضعة للتقييم
          </div>
          <h1 className="text-balance text-3xl font-extrabold text-white md:text-4xl [text-shadow:0_1px_18px_rgba(0,0,0,0.35)]">
            طلب فترة تجريبية
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-200 md:text-lg">
            هذه الصفحة <strong className="text-white">لا تُنشئ حساباً ولا رخصة</strong> وليست تسجيلاً رسمياً.
            بعد المراجعة (3–5 أيام عمل) وإرسال كود التفعيل، تكمل التسجيل من الصفحة الرسمية ثم تدخل الكود في صفحة
            الدفع البرونزي.
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-3xl space-y-6 px-4 py-10">
        <Alert className="border-amber-300/60 bg-amber-50 text-amber-950 shadow-md">
          <ShieldAlert className="h-5 w-5 text-amber-800" />
          <AlertDescription className="text-base leading-relaxed text-amber-950">
            للتسجيل الرسمي:{' '}
            <Link to={ROUTE_PATHS.REGISTER} className="font-bold text-teal-800 underline underline-offset-2">
              {ROUTE_PATHS.REGISTER}
            </Link>
            . بريد طلب التجربة يجب أن يكون لاحقاً نفس بريد التسجيل وإلا يُرفض الكود.
          </AlertDescription>
        </Alert>

        <Card
          className="border-slate-200 bg-white text-slate-900 shadow-xl shadow-black/25"
          style={{ colorScheme: 'light' }}
        >
          <CardHeader className="space-y-2 border-b border-slate-100 pb-5">
            <CardTitle className="text-2xl font-extrabold text-slate-900">بيانات الطلب</CardTitle>
            <CardDescription className="text-base text-slate-600">
              جميع الحقول إلزامية ما عدا الملاحظات
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form className="space-y-6" onSubmit={(e) => void onSubmit(e)}>
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className={fieldLabel}>اسم الصالون</Label>
                  <Input
                    className={fieldInput}
                    value={salonName}
                    onChange={(e) => setSalonName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className={fieldLabel}>اسم المنشأة</Label>
                  <Input
                    className={fieldInput}
                    value={establishmentName}
                    onChange={(e) => setEstablishmentName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className={fieldLabel}>البريد (سيُرسل عليه الكود)</Label>
                  <Input
                    type="email"
                    className={fieldInput}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label className={fieldLabel}>الجوال</Label>
                  <Input
                    className={fieldInput}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label className={fieldLabel}>واتساب</Label>
                  <Input
                    className={fieldInput}
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    required
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="bronze-trial-geo rounded-xl border border-slate-200 bg-slate-50 p-1 text-slate-900 [&_.text-muted-foreground]:!text-slate-700 [&_button]:!h-11 [&_button]:!border-slate-300 [&_button]:!bg-white [&_button]:!text-base [&_button]:!text-slate-900 [&_input]:!h-11 [&_input]:!border-slate-300 [&_input]:!bg-white [&_input]:!text-base [&_input]:!text-slate-900 [&_label]:!text-base [&_label]:!font-semibold [&_label]:!text-slate-800 [&_p]:!text-base [&_p]:!leading-relaxed [&_strong]:!text-slate-950">
                <SaudiRegionCityDistrictFields value={geo} onChange={setGeo} disabled={loading} />
              </div>

              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label className={`flex items-center gap-2 ${fieldLabel}`}>
                    <MapPin className="h-5 w-5 text-teal-700" />
                    الإحداثيات (إلزامي)
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
                    onClick={locateMe}
                    disabled={locating || loading}
                  >
                    {locating ? 'جاري التحديد…' : 'حدد موقعي'}
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className={fieldLabel}>خط العرض</Label>
                    <Input
                      className={fieldInput}
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      dir="ltr"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className={fieldLabel}>خط الطول</Label>
                    <Input
                      className={fieldInput}
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      dir="ltr"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className={fieldLabel}>صور المحل (حد 5 ميغابايت لكل صورة)</Label>
                {(Object.keys(PHOTO_LABELS) as PhotoKey[]).map((key) => (
                  <div key={key} className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-base font-medium text-slate-800">{PHOTO_LABELS[key]}</p>
                    <Input
                      type="file"
                      accept="image/*"
                      disabled={loading}
                      className="h-11 cursor-pointer border-slate-300 bg-white text-slate-800 file:me-3 file:rounded-md file:border-0 file:bg-teal-700 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
                      onChange={(e) => onFile(key, e.target.files?.[0] ?? null)}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label className={fieldLabel}>ملاحظات إضافية (اختياري)</Label>
                <Textarea
                  className="min-h-[7rem] border-slate-300 bg-white text-base text-slate-900 placeholder:text-slate-400"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  placeholder="أي توضيح يساعد فريق المراجعة…"
                />
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <Checkbox
                  id="trial-ack"
                  checked={ack}
                  onCheckedChange={(c) => setAck(c === true)}
                  className="mt-1 border-slate-400 data-[state=checked]:bg-teal-700 data-[state=checked]:text-white"
                />
                <Label
                  htmlFor="trial-ack"
                  className="cursor-pointer text-base font-normal leading-relaxed text-slate-800"
                >
                  أقرّ أن هذا الطلب <strong className="text-slate-950">للتقييم فقط</strong> وليس تسجيلاً رسمياً، وأن
                  التسجيل الرسمي يتم عبر{' '}
                  <NavLink to={ROUTE_PATHS.REGISTER} className="font-semibold text-teal-800 underline">
                    صفحة التسجيل
                  </NavLink>
                  ، وأن المراجعة تستغرق 3–5 أيام عمل، وأن كود التفعيل (إن وُوفق) يُستخدم بعد التسجيل في صفحة الدفع
                  البرونزي بنفس هذا البريد.
                </Label>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full bg-teal-700 text-base font-bold text-white hover:bg-teal-800 sm:w-auto"
              >
                {loading ? 'جاري الإرسال…' : 'إرسال طلب التجربة'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
