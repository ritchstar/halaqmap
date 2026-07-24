import { Component, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Star, CheckCircle2, AlertTriangle, Home, Loader2, Share2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTE_PATHS, SubscriptionTier } from '@/lib/index';
import type { Barber } from '@/lib/index';
import { mockBarbers } from '@/data/index';
import { validateRatingInviteToken } from '@/lib/ratingInvite';
import { submitBarberQrReviewRemote } from '@/lib/barberQrReviewsRemote';
import {
  RATING_QR_ALREADY_SUBMITTED_BODY,
  RATING_QR_ALREADY_SUBMITTED_TITLE,
  RATING_QR_CUSTOMER_HINT,
  RATING_QR_CUSTOMER_RULES,
} from '@/config/ratingQrInvite';
import { PLATFORM_VOLUNTARY_ENGAGEMENT } from '@/config/platformVoluntaryEngagement';
import { ShareEngagementModal } from '@/components/platformEngagement/PlatformEngagementModals';
import { toast } from 'sonner';
import { fetchPublicRateBarberContext } from '@/lib/publicRateBarberRemote';
import {
  getOrCreateQrRaterInstanceId,
  hasLocalQrRatedMark,
  markLocalQrRated,
} from '@/lib/qrRaterIdentity';

type LoadPhase =
  | 'loading'
  | 'ready'
  | 'already_submitted'
  | 'invalid_id'
  | 'missing_token'
  | 'invite_failed'
  | 'load_error';

type RateBarberErrorBoundaryState = { hasError: boolean };

/** يمنع شاشة بيضاء عند أي خطأ غير متوقّد داخل صفحة التقييم */
class RateBarberErrorBoundary extends Component<{ children: React.ReactNode }, RateBarberErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): RateBarberErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Layout>
          <div className="min-h-[70vh] bg-background py-12 px-4" dir="rtl">
            <div className="container mx-auto max-w-lg">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    حدث خطأ في الصفحة
                  </CardTitle>
                  <CardDescription>جرّب إعادة التحميل أو افتح الرابط من جديد من ملصق QR.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Button type="button" variant="default" onClick={() => window.location.reload()}>
                    إعادة التحميل
                  </Button>
                  <Button asChild variant="outline" className="gap-2">
                    <Link to={ROUTE_PATHS.HOME}>
                      <Home className="w-4 h-4" />
                      الرئيسية
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </Layout>
      );
    }
    return this.props.children;
  }
}

function RateBarberInner() {
  const { barberId: barberIdParam } = useParams<{ barberId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('t');

  const barberId = String(barberIdParam ?? '').trim();

  const [phase, setPhase] = useState<LoadPhase>('loading');
  const [remoteName, setRemoteName] = useState<string | null>(null);
  const [loadErrorDetail, setLoadErrorDetail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!barberId) {
        setPhase('invalid_id');
        return;
      }
      const tok = token != null ? String(token).trim() : '';
      if (!tok) {
        setPhase('missing_token');
        return;
      }

      setPhase('loading');
      setLoadErrorDetail(null);

      if (hasLocalQrRatedMark(barberId)) {
        if (!cancelled) setPhase('already_submitted');
        return;
      }

      const mock = mockBarbers.find((b) => b.id === barberId);
      if (mock && validateRatingInviteToken(mock, token)) {
        if (!cancelled) {
          setRemoteName(mock.name);
          setPhase('ready');
        }
        return;
      }

      const res = await fetchPublicRateBarberContext(barberId, token);
      if (cancelled) return;

      if (res.ok) {
        setRemoteName(res.name);
        if (res.alreadySubmitted) {
          markLocalQrRated(barberId);
          setPhase('already_submitted');
          return;
        }
        setPhase('ready');
        return;
      }

      const reason = 'reason' in res ? res.reason : 'server';

      if (reason === 'missing_params') {
        setPhase('missing_token');
        return;
      }
      if (reason === 'invalid_token') {
        setPhase('invite_failed');
        return;
      }
      if (reason === 'not_found') {
        setPhase('invalid_id');
        return;
      }
      if (reason === 'rate_limited') {
        setLoadErrorDetail('طلبات كثيرة من نفس الجهاز. انتظر قليلاً ثم أعد المحاولة.');
        setPhase('load_error');
        return;
      }
      setLoadErrorDetail(
        reason === 'network'
          ? 'تعذّر الاتصال بالخادم. تحقق من الإنترنت وحاول مرة أخرى.'
          : 'تعذّر تحميل بيانات الصالون.',
      );
      setPhase('load_error');
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [barberId, token]);

  const barber: Barber | undefined = useMemo(() => {
    if (phase !== 'ready' || !barberId) return undefined;
    const mock = mockBarbers.find((b) => b.id === barberId);
    if (mock) return mock;
    const tok = String(token ?? '').trim();
    if (!tok || !remoteName) return undefined;
    return {
      id: barberId,
      name: remoteName,
      phone: '',
      whatsapp: '',
      location: { lat: 0, lng: 0, address: '' },
      subscription: SubscriptionTier.GOLD,
      rating: 0,
      reviewCount: 0,
      images: [],
      services: [],
      workingHours: [],
      isOpen: true,
      verified: true,
      categories: [],
      ratingInviteToken: tok,
    };
  }, [phase, barberId, token, remoteName]);

  const valid = Boolean(barber && validateRatingInviteToken(barber, token));

  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barber || !valid || !token) return;
    const name = customerName.trim();
    if (name.length < 2) {
      toast.error('يرجى إدخال الاسم (حرفان على الأقل).');
      return;
    }
    setBusy(true);
    void (async () => {
      const result = await submitBarberQrReviewRemote({
        barberId: barber.id,
        token: String(token).trim(),
        customerName: name,
        rating,
        comment: comment.trim(),
        clientInstanceId: getOrCreateQrRaterInstanceId(),
      });
      setBusy(false);
      if (!result.ok) {
        if (result.error === 'already_submitted') {
          markLocalQrRated(barber.id);
          setPhase('already_submitted');
          toast.message(RATING_QR_ALREADY_SUBMITTED_TITLE);
          return;
        }
        toast.error(
          result.error === 'invalid_token'
            ? 'رمز الدعوة غير صالح — اطلب رابطاً محدّثاً من الصالون.'
            : result.error === 'tier_not_eligible'
              ? 'هذه الباقة لا تتضمن تقييمات QR حالياً.'
              : result.error === 'rate_limited_ip'
                ? 'تم تجاوز حد الإرسال من هذه الشبكة. حاول لاحقاً.'
                : result.error === 'invalid_client_key'
                  ? 'تعذّر التحقق من المتصفح. حدّث الصفحة وحاول مرة أخرى.'
                  : result.error === 'anti_abuse_unavailable'
                    ? 'نظام الحماية غير جاهز بعد. أبلغ الإدارة.'
                    : result.error === 'insert_failed'
                      ? 'تعذّر حفظ التقييم في قاعدة البيانات. أبلغ الصالون أو الإدارة.'
                      : 'تعذّر حفظ التقييم. تحقق من الاتصال وحاول مرة أخرى.',
        );
        return;
      }
      markLocalQrRated(barber.id);
      setSubmitted(true);
      toast.success('شكراً لتقييمك!');
      window.dispatchEvent(new CustomEvent('halaqmap-qr-reviews'));
    })();
  };

  if (phase === 'loading') {
    return (
      <Layout>
        <div className="min-h-[70vh] bg-background py-12 px-4 flex items-center justify-center" dir="rtl">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
            <p className="text-sm text-foreground/80">جاري تحميل صفحة التقييم…</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (phase === 'already_submitted') {
    return (
      <Layout>
        <div className="min-h-[70vh] bg-background py-12 px-4" dir="rtl">
          <motion.div className="container mx-auto max-w-lg" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-5 h-5" />
                  {RATING_QR_ALREADY_SUBMITTED_TITLE}
                </CardTitle>
                <CardDescription>{RATING_QR_ALREADY_SUBMITTED_BODY}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="gap-2">
                  <Link to={ROUTE_PATHS.HOME}>
                    <Home className="w-4 h-4" />
                    العودة للرئيسية
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (phase === 'invalid_id') {
    return (
      <Layout>
        <div className="min-h-[70vh] bg-background py-12 px-4" dir="rtl">
          <motion.div className="container mx-auto max-w-lg" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  رابط غير صالح
                </CardTitle>
                <CardDescription>لم يُعثر على هذا الصالون أو المعرف غير صحيح.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="gap-2">
                  <Link to={ROUTE_PATHS.HOME}>
                    <Home className="w-4 h-4" />
                    العودة للرئيسية
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (phase === 'missing_token') {
    return (
      <Layout>
        <div className="min-h-[70vh] bg-background py-12 px-4" dir="rtl">
          <motion.div className="container mx-auto max-w-lg" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  الرابط ناقص
                </CardTitle>
                <CardDescription>
                  رابط التقييم يجب أن يتضمّن رمز الدعوة (?t=…). استخدم الرابط الكامل من ملصق QR أو من الحلاق.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">
                  التطبيق يعمل بمسارات بعد الرمز # (مثل: /#/rate/المعرف?t=الرمز). إذا فتحت الرابط بدون # قد لا تُحمّل الصفحة بشكل صحيح على بعض الأجهزة.
                </p>
                <Button asChild variant="outline" className="gap-2">
                  <Link to={ROUTE_PATHS.HOME}>
                    <Home className="w-4 h-4" />
                    العودة للرئيسية
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (phase === 'invite_failed') {
    return (
      <Layout>
        <div className="min-h-[70vh] bg-background py-12 px-4" dir="rtl">
          <motion.div className="container mx-auto max-w-lg" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  رمز الدعوة غير صحيح أو منتهٍ
                </CardTitle>
                <CardDescription>
                  استخدم الرمز الظاهر على ملصق QR في الصالون، أو اطلب من الحلاق رابط التقييم المحدّث.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="gap-2">
                  <Link to={ROUTE_PATHS.HOME}>
                    <Home className="w-4 h-4" />
                    العودة للرئيسية
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (phase === 'load_error') {
    return (
      <Layout>
        <div className="min-h-[70vh] bg-background py-12 px-4" dir="rtl">
          <motion.div className="container mx-auto max-w-lg" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  تعذّر التحميل
                </CardTitle>
                <CardDescription>{loadErrorDetail || 'حدث خطأ أثناء جلب بيانات الصالون.'}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => window.location.reload()}>
                  إعادة المحاولة
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <Link to={ROUTE_PATHS.HOME}>
                    <Home className="w-4 h-4" />
                    الرئيسية
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (!barber || !valid) {
    return (
      <Layout>
        <div className="min-h-[70vh] bg-background py-12 px-4" dir="rtl">
          <motion.div className="container mx-auto max-w-lg" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  رابط غير صالح
                </CardTitle>
                <CardDescription>تعذّر التحقق من رابط التقييم.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="gap-2">
                  <Link to={ROUTE_PATHS.HOME}>
                    <Home className="w-4 h-4" />
                    العودة للرئيسية
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <AnimatePresence>
        {shareOpen && <ShareEngagementModal onClose={() => setShareOpen(false)} />}
      </AnimatePresence>
      <div className="min-h-[70vh] bg-background py-12 px-4" dir="rtl">
        <motion.div
          className="container mx-auto max-w-lg"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {submitted ? (
            <Card className="border-primary/40">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <CardTitle>تم إرسال تقييمك</CardTitle>
                <CardDescription>
                  شكراً لك! يمكن للصالون إدارة ظهور التقييمات وإبرازها من لوحة التحكم.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button asChild>
                    <Link to={ROUTE_PATHS.HOME}>العودة لحلاق ماب</Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={() => setShareOpen(true)}
                  >
                    <Share2 className="w-4 h-4" aria-hidden />
                    {PLATFORM_VOLUNTARY_ENGAGEMENT.actions.share.label}
                  </Button>
                </div>
                <p className="text-center text-[10px] text-muted-foreground leading-relaxed">
                  {PLATFORM_VOLUNTARY_ENGAGEMENT.actions.share.hint} — لا يؤثر على تقييمك.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>تقييم {barber.name}</CardTitle>
                <CardDescription className="space-y-2 pt-1">
                  <span className="block">تقييم عبر رمز QR — يُسجَّل كزيارة مرتبطة بدعوتك الرسمية.</span>
                  <span className="block text-sm text-foreground/80">{RATING_QR_CUSTOMER_RULES}</span>
                  <span className="block text-xs text-muted-foreground">{RATING_QR_CUSTOMER_HINT}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="nm">اسمك أو اسمك المستعار</Label>
                    <Input
                      id="nm"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="مثال: أحمد"
                      required
                      minLength={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>التقييم</Label>
                    <div className="flex flex-row-reverse justify-end gap-1">
                      {[5, 4, 3, 2, 1].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setRating(n)}
                          className="p-1 rounded-md hover:bg-muted transition-colors"
                          aria-label={`${n} من 5`}
                        >
                          <Star
                            className={`w-9 h-9 ${
                              n <= rating ? 'fill-amber-400 text-amber-500' : 'text-muted-foreground/35'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cm">تعليق (اختياري)</Label>
                    <Textarea
                      id="cm"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                      placeholder="كيف كانت تجربتك؟"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    إرسال التقييم
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}

export default function RateBarber() {
  return (
    <RateBarberErrorBoundary>
      <RateBarberInner />
    </RateBarberErrorBoundary>
  );
}
