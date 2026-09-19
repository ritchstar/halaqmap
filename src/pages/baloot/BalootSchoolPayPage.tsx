/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * دفع مدرسة البلوت — Moyasar حقيقي مباشر (199 ر.س، دفعة واحدة). يُفعَّل فقط
 * بعد تأكيد البريد — لا يُقفَز إليه بلا تسجيل فعلي. بعد النجاح هنا الصفحة
 * الخاصة الدائمة مفتوحة فوراً (وليست "قيد التجهيز") لأن منهجها الأساسي مبني
 * بالفعل. مطابقة بنيوياً لـ ChessSchoolPayPage.tsx.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Crown, Loader2, ShieldCheck, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BalootSchoolMotifBackground } from '@/components/baloot/BalootSchoolMotifBackground';
import { MoyasarOfficialTrustChip } from '@/components/billing/MoyasarOfficialTrustChip';
import { LEGAL_ECOMMERCE_STORE_NAME } from '@/config/partnerLegal';
import { BALOOT_SCHOOL_PAY_COPY, BALOOT_SCHOOL_PRICE_HALALAS, BALOOT_SCHOOL_PRODUCT } from '@/config/balootSchoolPay';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getMoyasarGlobal, loadMoyasarFormScript, MOYASAR_APPLE_PAY_VALIDATE_URL } from '@/lib/moyasarFormLoader';
import { persistMoyasarLastPaymentId } from '@/lib/moyasarPaymentReturn';
import { trackGoogleAdsStorePurchase } from '@/lib/googleAdsTag';
import {
  buildBalootSchoolCallbackUrl,
  balootSchoolLivePaymentsEnabled,
  isBalootSchoolPaymentReturn,
  readBalootSchoolReturnPaymentId,
  resolveBalootSchoolPublishableKey,
} from '@/lib/balootSchoolMoyasar';
import { activateBalootSchoolPay, fetchBalootSchoolPay } from '@/lib/balootSchoolPayRemote';
import { ROUTE_PATHS } from '@/lib';

function payErrorAr(raw: unknown): string {
  const s = typeof raw === 'string' ? raw.trim() : '';
  return s || 'تعذر التحقق من الدفع. أكمل من النموذج أدناه أو أعد المحاولة.';
}

export default function BalootSchoolPayPage() {
  useDocumentTitle('دفع مدرسة البلوت — halaqmap');
  const { rid = '' } = useParams<{ rid: string }>();
  const activateOnceRef = useRef(false);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState('loading');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [activating, setActivating] = useState(false);

  const publishableKey = useMemo(() => resolveBalootSchoolPublishableKey(), []);
  const liveMoney = balootSchoolLivePaymentsEnabled();
  const payable = status === 'email_confirmed';
  const studentPath = rid ? ROUTE_PATHS.BALOOT_SCHOOL_STUDENT.replace(':rid', encodeURIComponent(rid)) : '';

  useEffect(() => {
    let cancelled = false;
    void fetchBalootSchoolPay(rid).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setStatus('missing');
        setError(String(result.error || ''));
        return;
      }
      setStatus(String(result.status || ''));
      setFullName(String(result.fullName || ''));
    });
    return () => {
      cancelled = true;
    };
  }, [rid]);

  // عودة من ميسر (3-D Secure / Apple Pay) عبر رابط الاسترجاع — نفعّل تلقائياً.
  useEffect(() => {
    if (!rid || !payable || activateOnceRef.current) return;
    if (!isBalootSchoolPaymentReturn()) return;
    const paymentId = readBalootSchoolReturnPaymentId();
    if (!paymentId) return;
    let cancelled = false;
    setActivating(true);
    void activateBalootSchoolPay(rid, paymentId).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        activateOnceRef.current = true;
        trackGoogleAdsStorePurchase({
          transactionId: paymentId,
          valueHalalas: BALOOT_SCHOOL_PRICE_HALALAS,
          product: BALOOT_SCHOOL_PRODUCT,
        });
        setStatus('paid');
        setFullName((prev) => String(result.fullName || prev));
        setActivating(false);
        return;
      }
      setActivating(false);
      setError(payErrorAr(result.error));
    });
    return () => {
      cancelled = true;
    };
  }, [rid, payable]);

  useEffect(() => {
    if (!BALOOT_SCHOOL_PAY_COPY || !payable || activating || !publishableKey.startsWith('pk_')) return;
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    host.innerHTML = '';
    void loadMoyasarFormScript()
      .then(() => {
        if (cancelled) return;
        const Moyasar = getMoyasarGlobal();
        if (!Moyasar?.init) {
          setError('تعذر تجهيز بوابة الدفع.');
          return;
        }
        const applePaySupported = (() => {
          try {
            const AP = (window as unknown as { ApplePaySession?: { canMakePayments?: () => boolean } })
              .ApplePaySession;
            return !!AP && typeof AP.canMakePayments === 'function' && AP.canMakePayments();
          } catch {
            return false;
          }
        })();
        Moyasar.init({
          element: host,
          amount: BALOOT_SCHOOL_PRICE_HALALAS,
          currency: 'SAR',
          description: 'halaqmap — مدرسة البلوت',
          publishable_api_key: publishableKey,
          callback_url: buildBalootSchoolCallbackUrl(rid),
          supported_networks: ['visa', 'mastercard'],
          methods: applePaySupported ? ['creditcard', 'applepay'] : ['creditcard'],
          ...(applePaySupported
            ? {
                apple_pay: {
                  country: 'SA',
                  label: LEGAL_ECOMMERCE_STORE_NAME,
                  validate_merchant_url: MOYASAR_APPLE_PAY_VALIDATE_URL,
                },
              }
            : {}),
          language: 'ar',
          fixed_width: false,
          metadata: {
            product: BALOOT_SCHOOL_PRODUCT,
            product_type: BALOOT_SCHOOL_PRODUCT,
            baloot_school_registration_id: rid,
          },
          on_completed: (payment: unknown) => {
            const id =
              typeof payment === 'object' && payment != null && 'id' in payment
                ? String((payment as { id?: unknown }).id ?? '').trim()
                : '';
            if (!id) return;
            persistMoyasarLastPaymentId(id);
            if (activateOnceRef.current) return;
            activateOnceRef.current = true;
            setActivating(true);
            void activateBalootSchoolPay(rid, id).then((result) => {
              if (result.ok) {
                trackGoogleAdsStorePurchase({
                  transactionId: id,
                  valueHalalas: BALOOT_SCHOOL_PRICE_HALALAS,
                  product: BALOOT_SCHOOL_PRODUCT,
                });
                setStatus('paid');
                setFullName((prev) => String(result.fullName || prev));
                setActivating(false);
                return;
              }
              setActivating(false);
              activateOnceRef.current = false;
              setError(payErrorAr(result.error));
            });
          },
        });
      })
      .catch(() => {
        if (!cancelled) setError('تعذر تحميل بوابة الدفع.');
      });
    return () => {
      cancelled = true;
      if (hostRef.current) hostRef.current.innerHTML = '';
    };
  }, [payable, activating, publishableKey, rid]);

  return (
    <div dir="rtl" className="relative min-h-screen overflow-hidden bg-background">
      <BalootSchoolMotifBackground />
      <div className="relative z-10 container mx-auto max-w-xl px-4 py-16">
        <div className="mb-8 flex items-center justify-center gap-2 text-primary">
          <Crown className="h-6 w-6" />
          <span className="text-sm font-bold">مدرسة البلوت</span>
        </div>

        {status === 'loading' ? (
          <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            جاري تجهيز الدفع…
          </div>
        ) : null}

        {status === 'missing' ? (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>الرابط غير صالح</AlertTitle>
            <AlertDescription className="space-y-3 text-sm">
              <p>{error || 'لم نعثر على هذا التسجيل.'}</p>
              <Button asChild variant="outline">
                <Link to={ROUTE_PATHS.BALOOT_SCHOOL_LANDING}>العودة لصفحة التسجيل</Link>
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}

        {status === 'pending_email' ? (
          <Alert>
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle>أكّد بريدك أولاً</AlertTitle>
            <AlertDescription className="space-y-3 text-sm leading-relaxed">
              <p>لم نتحقق من بريدك بعد. افتح رسالة التأكيد التي أرسلناها لك ثم عد لهذا الرابط لإتمام الدفع.</p>
              <Button asChild variant="outline">
                <Link to={ROUTE_PATHS.BALOOT_SCHOOL_LANDING}>العودة لصفحة المدرسة</Link>
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}

        {status === 'paid' ? (
          <Alert className="border-emerald-600/40 bg-emerald-500/10">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <AlertTitle>{fullName ? `تم تفعيل اشتراكك، ${fullName}!` : 'تم الدفع بنجاح'}</AlertTitle>
            <AlertDescription className="space-y-3 text-sm leading-relaxed">
              <p>{BALOOT_SCHOOL_PAY_COPY.paidAr}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {studentPath ? (
                  <Button asChild>
                    <Link to={studentPath}>افتح صفحتك الخاصة الآن</Link>
                  </Button>
                ) : null}
                <Button asChild variant="outline">
                  <Link to={ROUTE_PATHS.BALOOT_ARENA}>جرّب ساحة بلوت المجانية</Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : null}

        {payable ? (
          <Card>
            <CardHeader>
              <CardTitle>{BALOOT_SCHOOL_PAY_COPY.titleAr}</CardTitle>
              <CardDescription>
                {fullName ? `${fullName} — ` : ''}
                {BALOOT_SCHOOL_PAY_COPY.priceLabelAr}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!liveMoney ? (
                <p className="mb-4 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs leading-6">
                  {BALOOT_SCHOOL_PAY_COPY.testCheckoutHintAr}
                </p>
              ) : null}
              {activating ? (
                <p className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {BALOOT_SCHOOL_PAY_COPY.activatingAr}
                </p>
              ) : null}
              {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
              {!activating && !publishableKey.startsWith('pk_') ? (
                <p className="text-sm text-destructive">
                  {liveMoney ? 'بوابة الدفع غير جاهزة حالياً.' : 'بوابة الدفع التجريبية غير جاهزة حالياً.'}
                </p>
              ) : null}
              {!activating && publishableKey.startsWith('pk_') ? (
                <>
                  <div className="mb-4">
                    <MoyasarOfficialTrustChip variant="banner" />
                  </div>
                  <div ref={hostRef} className="min-h-[220px]" />
                </>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        <div className="mt-8 text-center">
          <Link to={ROUTE_PATHS.BALOOT_SCHOOL_LANDING} className="text-sm text-muted-foreground underline">
            مدرسة البلوت
          </Link>
        </div>
      </div>
    </div>
  );
}
