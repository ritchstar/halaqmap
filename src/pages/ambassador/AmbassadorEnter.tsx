import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Handshake, Presentation } from 'lucide-react';
import { AmbassadorMarketingKitPanel } from '@/components/ambassador/AmbassadorMarketingKitPanel';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AMBASSADOR_PROGRAM_NAME_AR,
  AMBASSADOR_RULES_VERSION,
} from '@/config/ambassadorFieldRulesPolicy';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib';
import {
  readAmbassadorPortal,
  submitAmbassadorApplication,
} from '@/lib/ambassadorPortalStore';
import {
  ambassadorApplyErrorAr,
  submitAmbassadorApplicationRemoteApi,
} from '@/lib/ambassadorApplicationsRemote';
import { toast } from '@/components/ui/sonner';

export default function AmbassadorEnter() {
  useDocumentTitle('طلب انضمام سفير · حلاق ماب');
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [existing, setExisting] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [coverageArea, setCoverageArea] = useState('');
  const [salesExperience, setSalesExperience] = useState('');
  const [socialProofUrl, setSocialProofUrl] = useState('');
  const [socialProofLabel, setSocialProofLabel] = useState('');
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    const portal = readAmbassadorPortal();
    setExisting(!!portal);
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07070a] text-sm text-slate-400" dir="rtl">
        جاري التحميل…
      </div>
    );
  }

  if (existing) {
    return <Navigate to={ROUTE_PATHS.AMBASSADOR_DASHBOARD} replace />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || displayName.trim().length < 2) {
      toast.error('أدخل الاسم الظاهر (حرفان على الأقل).');
      return;
    }
    if (!phone.trim() || phone.trim().length < 9) {
      toast.error('أدخل رقم جوال صالحاً.');
      return;
    }
    if (coverageArea.trim().length < 8) {
      toast.error('اكتب الحي أو النطاق الجغرافي الذي تستطيع تغطيته (بجدية).');
      return;
    }
    if (salesExperience.trim().length < 20) {
      toast.error('اشرح خبرتك أو استعدادك للمبيعات الميدانية بجملة واضحة (20 حرفاً على الأقل).');
      return;
    }
    if (!acceptedRules) {
      toast.error('يجب الموافقة على وثيقة قواعد السفراء.');
      return;
    }

    setSubmitting(true);
    const remote = await submitAmbassadorApplicationRemoteApi({
      displayName,
      phone,
      coverageArea,
      salesExperience,
      socialProofUrl,
      socialProofLabel,
    });
    setSubmitting(false);

    if (!remote.ok) {
      toast.error(ambassadorApplyErrorAr(remote.error));
      return;
    }

    const portal = submitAmbassadorApplication({
      displayName,
      phone,
      coverageArea,
      salesExperience,
      socialProofUrl,
      socialProofLabel,
      serverId: remote.id,
      serverCode: remote.code,
    });
    void import('@/lib/analytics/productAnalytics').then(({ ProductEvents, identifyAnalyticsUser }) => {
      if (portal.profile?.code) {
        identifyAnalyticsUser(`amb:${portal.profile.code}`, { persona: 'ambassador' });
      }
      ProductEvents.ambassadorApplicationSubmitted();
    });
    toast.success('تم إرسال طلب الانضمام — حالتك الآن: قيد المراجعة من الإدارة.');
    navigate(ROUTE_PATHS.AMBASSADOR_DASHBOARD);
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100" dir="rtl">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(20,184,166,0.14),transparent_55%)]" />

      <header className="relative z-10 border-b border-white/8 bg-black/40 backdrop-blur-md">
        <div className="container mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link
            to={ROUTE_PATHS.HOME}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-teal-200"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            حلاق ماب
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to={ROUTE_PATHS.AMBASSADOR_TRAINING}
              className="text-xs font-semibold text-teal-300 hover:underline"
            >
              التدريب
            </Link>
            <Link to={ROUTE_PATHS.AMBASSADOR_RULES} className="text-xs text-teal-300/80 hover:underline">
              وثيقة القواعد
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto max-w-3xl space-y-10 px-4 py-10 pb-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-lg">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-400/30 bg-teal-500/10">
              <Handshake className="h-7 w-7 text-teal-300" aria-hidden />
            </div>
            <h1 className="mb-2 text-3xl font-black text-white">طلب الانضمام والمقابلة الرقمية</h1>
            <p className="text-sm leading-relaxed text-slate-400">{AMBASSADOR_PROGRAM_NAME_AR}</p>
            <p className="mt-3 text-xs leading-relaxed text-amber-200/90">
              لا تفعيل فوري. بعد الإرسال تكون حالتك <strong>قيد المراجعة</strong>. التفعيل المؤقت ثم الاعتماد الرسمي
              يأتيان بعد قبول الطلب ثم أول إغلاق صالون ناجح.
            </p>
            <p className="mt-2 text-xs text-slate-500">نسخة القواعد: {AMBASSADOR_RULES_VERSION}</p>
            <Button
              asChild
              variant="outline"
              className="mt-5 border-teal-400/35 bg-teal-500/10 text-teal-100 hover:bg-teal-500/20"
            >
              <Link to={ROUTE_PATHS.AMBASSADOR_TRAINING}>
                <Presentation className="ml-2 h-4 w-4" aria-hidden />
                ابدأ التدريب الميداني
              </Link>
            </Button>
          </div>

          <form
            onSubmit={(e) => void onSubmit(e)}
            className="space-y-5 rounded-2xl border border-white/10 bg-[#0f0f14]/95 p-6"
          >
            <div className="space-y-2">
              <Label htmlFor="amb-name" className="text-slate-200">
                الاسم الظاهر
              </Label>
              <Input
                id="amb-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={80}
                placeholder="مثال: أحمد"
                className="border-white/15 bg-black/30 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amb-phone" className="text-slate-200">
                الجوال
              </Label>
              <Input
                id="amb-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={20}
                placeholder="05xxxxxxxx"
                inputMode="tel"
                className="border-white/15 bg-black/30 text-white"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amb-coverage" className="text-slate-200">
                الحي أو النطاق الجغرافي الذي تستطيع تغطيته ميدانياً؟
              </Label>
              <Textarea
                id="amb-coverage"
                value={coverageArea}
                onChange={(e) => setCoverageArea(e.target.value)}
                rows={2}
                maxLength={300}
                placeholder="مثال: جدة — أبحر، الشاطئ، الحمراء · زيارات ميدانية أسبوعية"
                className="border-white/15 bg-black/30 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amb-exp" className="text-slate-200">
                هل لديك خبرة سابقة في المبيعات أو التسويق الميداني؟
              </Label>
              <Textarea
                id="amb-exp"
                value={salesExperience}
                onChange={(e) => setSalesExperience(e.target.value)}
                rows={3}
                maxLength={600}
                placeholder="اكتب بجدية: خبرتك، أو لماذا أنت مناسب للعمل الميداني مع الصالونات حتى لو كانت أول تجربة."
                className="border-white/15 bg-black/30 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amb-social-url" className="text-slate-200">
                رابط حسابك على X أو LinkedIn (اختياري)
              </Label>
              <Input
                id="amb-social-url"
                value={socialProofUrl}
                onChange={(e) => setSocialProofUrl(e.target.value)}
                placeholder="https://x.com/… أو LinkedIn"
                className="border-white/15 bg-black/30 text-white"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amb-social-file" className="text-slate-200">
                لقطة شاشة للحساب (اختياري)
              </Label>
              <Input
                id="amb-social-file"
                type="file"
                accept="image/*"
                onChange={(e) => setSocialProofLabel(e.target.files?.[0]?.name ?? '')}
                className="border-white/15 bg-black/30 text-slate-300 file:bg-teal-500/20 file:text-teal-100"
              />
              {socialProofLabel ? (
                <p className="text-xs text-slate-500">تم اختيار: {socialProofLabel}</p>
              ) : null}
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-teal-400/25 bg-teal-500/5 p-4">
              <Checkbox
                id="amb-rules"
                checked={acceptedRules}
                onCheckedChange={(v) => setAcceptedRules(v === true)}
                className="mt-0.5 border-teal-400/40 data-[state=checked]:bg-teal-500"
              />
              <Label htmlFor="amb-rules" className="cursor-pointer text-sm leading-relaxed text-slate-200">
                قرأت وأوافق على{' '}
                <Link to={ROUTE_PATHS.AMBASSADOR_RULES} className="font-semibold text-teal-300 underline">
                  وثيقة قواعد السفراء
                </Link>
                ، وأفهم أن الطلب يمر بمراجعة، وأن الاعتماد الرسمي ومسار فنادق وشقق مخدومة وصرف المحفظة بعد أول إغلاق صالون ناجح.
              </Label>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="w-full rounded-xl bg-teal-500 font-bold text-black hover:bg-teal-400"
            >
              {submitting ? 'جاري الإرسال…' : 'إرسال طلب الانضمام للمراجعة'}
            </Button>
            <p className="text-center text-[11px] leading-relaxed text-slate-500">
              المستعجل عن الأزرار السريعة سينسحب هنا — الجاد يكتب ويجيب. لا لوحة استهداف قبل قبول المراجعة.
            </p>
          </form>
        </motion.div>

        <AmbassadorMarketingKitPanel />
      </main>
    </div>
  );
}
