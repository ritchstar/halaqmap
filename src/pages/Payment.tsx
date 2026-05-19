import { useEffect, useMemo, useRef, useState } from 'react';
import { usePlatformVatSettings } from '@/hooks/usePlatformVatSettings';
import { calcVatBreakdown } from '@/lib/platformVatSettings';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ROUTE_PATHS, SubscriptionTier } from '@/lib';
import { IMAGES } from '@/assets/images';
import { resolvePaymentGateway } from '@/config/paymentGateway';
import {
  clampListingLicenseQuantity,
  computeListingLicenseTotalSar,
  isDigitalShiftAddonAllowed,
  parseDigitalShiftAddonParam,
} from '@/config/listingLicenseQuantity';
import { DIGITAL_SHIFT_MONTHLY_ADDON_SAR, DIGITAL_SHIFT_PRICING_ADDON_LABEL_AR } from '@/config/subscriptionPricing';
import { fetchPublicPaymentPageConfig, type PublicPaymentPageConfig } from '@/lib/publicPaymentPageConfigRemote';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { getUnifiedPaymentProvider } from '@/lib/payment/providers';
import { verifyMoyasarPaymentRemote } from '@/lib/moyasarPaymentVerifyRemote';
import { getMoyasarGlobal, loadMoyasarFormScript } from '@/lib/moyasarFormLoader';
import { toast } from 'sonner';

export default function Payment() {
  const navigate = useNavigate();
  const vatSettings = usePlatformVatSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const tierRaw = (searchParams.get('tier') ?? '').trim().toLowerCase();
  const tier: SubscriptionTier =
    tierRaw === SubscriptionTier.GOLD
      ? SubscriptionTier.GOLD
      : tierRaw === SubscriptionTier.DIAMOND
        ? SubscriptionTier.DIAMOND
        : SubscriptionTier.BRONZE;
  const licenseQuantity = useMemo(
    () => clampListingLicenseQuantity(searchParams.get('qty')),
    [searchParams],
  );
  const digitalShiftAddonSelected = useMemo(
    () => isDigitalShiftAddonAllowed(tier, parseDigitalShiftAddonParam(searchParams.get('aiAddon'))),
    [tier, searchParams],
  );
  const listingPricingOptions = useMemo(
    () => (digitalShiftAddonSelected ? { digitalShiftAddon: true as const } : undefined),
    [digitalShiftAddonSelected],
  );
  const requestIdParam = searchParams.get('requestId') ?? '';
  /** مطابق لطلب التسجيل (HM-...) — يُمرَّر في metadata.request_id للـ webhook؛ يُفضّل عدم تركه فارغاً */
  const requestId = useMemo(() => requestIdParam.trim(), [requestIdParam]);
  /** يُمرَّر في metadata.linked_barber_id بعد اعتماد الإدارة أو عبر الرابط ?linkedBarberId= */
  const linkedBarberId = useMemo(() => searchParams.get('linkedBarberId')?.trim() ?? '', [searchParams]);
  const barberName = useMemo(() => searchParams.get('barberName')?.trim() ?? '', [searchParams]);
  const [pubPayConfig, setPubPayConfig] = useState<PublicPaymentPageConfig | null>(null);

  useEffect(() => {
    void fetchPublicPaymentPageConfig().then(setPubPayConfig);
  }, []);

  const selectedGateway = useMemo(() => {
    if (pubPayConfig === null) return resolvePaymentGateway();
    if (pubPayConfig.ok) return pubPayConfig.preferredGateway;
    return resolvePaymentGateway();
  }, [pubPayConfig]);

  const enableMoyasarCard = pubPayConfig === null || !pubPayConfig.ok || pubPayConfig.enableMoyasarCard !== false;
  const enableSabGateway = Boolean(pubPayConfig?.ok && pubPayConfig.enableSabGateway);

  const paymentProvider = useMemo(() => getUnifiedPaymentProvider(selectedGateway), [selectedGateway]);
  const isMoyasarGateway = selectedGateway === 'MOYASAR';
  const showMoyasarCheckout = enableMoyasarCard && isMoyasarGateway;

  const [paymentMethod, setPaymentMethod] = useState<'moyasar' | 'card'>('moyasar');
  /** إقرار بقراءة شروط ميسر كبوابة دفع — مطلوب قبل متابعة الدفع عبر ميسر (المادة الخامسة من الشروط). */
  const [moyasarTermsAccepted, setMoyasarTermsAccepted] = useState(false);
  /** بعد العودة من ميسر بـ ?id= — التحقق من الخادم */
  const [moyasarReturnVerify, setMoyasarReturnVerify] = useState<
    'idle' | 'loading' | 'paid' | 'unpaid' | 'error'
  >('idle');
  const [moyasarVerifyMessage, setMoyasarVerifyMessage] = useState<string | null>(null);
  /** يُعرض مع تنبيه النجاح بعد التحقق من ميسر عند paid */
  const [moyasarPaidAmountFormat, setMoyasarPaidAmountFormat] = useState<string | null>(null);
  const moyasarHostRef = useRef<HTMLDivElement>(null);
  const [moyasarFormError, setMoyasarFormError] = useState<string | null>(null);

  const moyasarPublishableKey = useMemo(() => {
    // Production key source (frontend env):
    // - VITE_PAYMENT_ENV=live
    // - VITE_MOYSAR_PUBLISHABLE_LIVE_API_KEY=pk_live_...
    // Sandbox:
    // - VITE_PAYMENT_ENV=test
    // - VITE_MOYSAR_PUBLISHABLE_TEST_API_KEY=pk_test_...
    const mode = String(import.meta.env.VITE_PAYMENT_ENV || 'test').trim().toLowerCase();
    const testKey = String(import.meta.env.VITE_MOYSAR_PUBLISHABLE_TEST_API_KEY || '').trim();
    const liveKey = String(import.meta.env.VITE_MOYSAR_PUBLISHABLE_LIVE_API_KEY || '').trim();
    const legacy = String(import.meta.env.VITE_MOYSAR_PUBLISHABLE_API_KEY || '').trim();
    if (mode === 'live') return liveKey || legacy;
    return testKey || legacy;
  }, []);
  const moyasarKeyOk = moyasarPublishableKey.startsWith('pk_');

  // Subscription prices
  const prices = {
    [SubscriptionTier.BRONZE]: 100,
    [SubscriptionTier.GOLD]: 150,
    [SubscriptionTier.DIAMOND]: 200,
  };

  const tierNames = {
    [SubscriptionTier.BRONZE]: 'برونزي',
    [SubscriptionTier.GOLD]: 'ذهبي',
    [SubscriptionTier.DIAMOND]: 'ماسي',
  };

  const tierColors = {
    [SubscriptionTier.BRONZE]: 'from-amber-700 to-amber-900',
    [SubscriptionTier.GOLD]: 'from-accent to-yellow-600',
    [SubscriptionTier.DIAMOND]: 'from-primary to-cyan-600',
  };

  const price = computeListingLicenseTotalSar(tier, licenseQuantity, listingPricingOptions);
  const tierName = tierNames[tier];
  const tierColor = tierColors[tier];

  const licenseBreakdown = useMemo(
    () => calcVatBreakdown(price, vatSettings),
    [price, vatSettings],
  );

  /** قيمة الحزمة البرمجية الرقمية بالهللات (ميسر تستخدم أصغر وحدة نقدية). */
  const monthlyAmountHalalas = useMemo(
    () => Math.max(100, Math.round(licenseBreakdown.total * 100)),
    [licenseBreakdown.total],
  );
  const unifiedPaymentInit = useMemo(
    () =>
      paymentProvider.buildInitPayload({
        tier,
        amountHalalas: monthlyAmountHalalas,
        licenseQuantity,
        digitalShiftAddonSelected,
        barberName,
        requestId,
        linkedBarberId,
      }),
    [
      paymentProvider,
      tier,
      monthlyAmountHalalas,
      licenseQuantity,
      digitalShiftAddonSelected,
      barberName,
      requestId,
      linkedBarberId,
    ],
  );

  const moyasarPaymentIdFromUrl = searchParams.get('id')?.trim() || '';

  useEffect(() => {
    if (pubPayConfig === null) return;
    if (!enableMoyasarCard && !isMoyasarGateway && enableSabGateway) {
      setPaymentMethod('card');
    } else if (enableMoyasarCard && isMoyasarGateway) {
      setPaymentMethod('moyasar');
    }
  }, [pubPayConfig, enableMoyasarCard, enableSabGateway, isMoyasarGateway]);

  useEffect(() => {
    if (selectedGateway !== 'MOYASAR') return;
    if (!moyasarPaymentIdFromUrl) return;
    let cancelled = false;
    setMoyasarReturnVerify('loading');
    setMoyasarVerifyMessage(null);
    setMoyasarPaidAmountFormat(null);

    void verifyMoyasarPaymentRemote(moyasarPaymentIdFromUrl, {
      expectedAmountHalalas: monthlyAmountHalalas,
      expectedCurrency: 'SAR',
    }).then((result) => {
      if (cancelled) return;
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('id');
          return next;
        },
        { replace: true },
      );

      if (!result.ok) {
        setMoyasarReturnVerify('error');
        if (result.error === 'moyasar_disabled') {
          setMoyasarVerifyMessage(
            'التحقق من الدفع غير مفعّل على الخادم. أضف MOYSAR_SECRET_API_KEY على Vercel ثم أعد المحاولة.',
          );
          toast.message('تنبيه', { description: 'خادم التحقق من ميسر غير مهيأ بعد.' });
        } else if (result.error === 'amount_mismatch') {
          setMoyasarVerifyMessage('المبلغ لا يطابق قيمة الحزمة البرمجية الرقمية للباقة المعروضة. راجع الإدارة قبل اعتماد الدفع.');
          toast.error('تباين في المبلغ');
        } else {
          setMoyasarVerifyMessage(result.hint || result.message || result.error || 'تعذر التحقق من الدفع');
          toast.error('فشل التحقق من الدفع');
        }
        return;
      }

      if (result.paid && paymentProvider.isSuccessStatus(result.status || 'paid')) {
        setMoyasarReturnVerify('paid');
        setMoyasarVerifyMessage(null);
        setMoyasarPaidAmountFormat(result.amount_format != null ? String(result.amount_format) : null);
        toast.success('تم تفعيل حسابك بنجاح', {
          description:
            'تم تأكيد الدفع عبر ميسر، وحسابك مفعّل الآن ويمكنك البدء باستقبال الطلبات من لوحة التحكم. لا حاجة لإعادة الدفع.',
          duration: 11000,
        });
      } else {
        setMoyasarReturnVerify('unpaid');
        setMoyasarVerifyMessage(
          `حالة الدفع من ميسر: ${result.status || 'غير مكتمل'}. إن كانت العملية قيد 3DS أكمل الخطوات ثم أعد فتح الرابط.`,
        );
        toast.message('الدفع غير مكتمل', { description: 'راجع حالة العملية في لوحة ميسر.' });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [moyasarPaymentIdFromUrl, monthlyAmountHalalas, paymentProvider, selectedGateway, setSearchParams]);

  /** تهيئة نموذج ميسر داخل الصفحة بعد الإقرار بالشروط. */
  useEffect(() => {
    if (selectedGateway !== 'MOYASAR' || !showMoyasarCheckout) return;
    if (paymentMethod !== 'moyasar' || !moyasarTermsAccepted || !moyasarKeyOk) {
      setMoyasarFormError(null);
      if (moyasarHostRef.current) moyasarHostRef.current.innerHTML = '';
      return;
    }

    const el = moyasarHostRef.current;
    if (!el) return;

    let cancelled = false;
    setMoyasarFormError(null);

    const explicit = String(import.meta.env.VITE_MOYSAR_CALLBACK_URL || '').trim();
    let callbackUrl: string;
    const paymentQuery = [
      `tier=${encodeURIComponent(tier)}`,
      `qty=${encodeURIComponent(String(licenseQuantity))}`,
      ...(digitalShiftAddonSelected ? ['aiAddon=1'] : []),
      `requestId=${encodeURIComponent(requestId)}`,
      ...(linkedBarberId ? [`linkedBarberId=${encodeURIComponent(linkedBarberId)}`] : []),
    ].join('&');
    if (explicit) {
      try {
        const u = new URL(explicit);
        u.searchParams.set('tier', tier);
        u.searchParams.set('qty', String(licenseQuantity));
        if (digitalShiftAddonSelected) u.searchParams.set('aiAddon', '1');
        else u.searchParams.delete('aiAddon');
        u.searchParams.set('requestId', requestId);
        if (linkedBarberId) u.searchParams.set('linkedBarberId', linkedBarberId);
        callbackUrl = u.toString();
      } catch {
        const origin = window.location.origin;
        const path = window.location.pathname.replace(/\/$/, '');
        callbackUrl = `${origin}${path}/#${ROUTE_PATHS.PAYMENT}?${paymentQuery}`;
      }
    } else {
      const origin = window.location.origin;
      const path = window.location.pathname.replace(/\/$/, '');
      callbackUrl = `${origin}${path}/#${ROUTE_PATHS.PAYMENT}?${paymentQuery}`;
    }

    void loadMoyasarFormScript()
      .then(() => {
        if (cancelled) return;
        const host = moyasarHostRef.current;
        if (!host) return;
        host.innerHTML = '';
        const Moyasar = getMoyasarGlobal();
        if (!Moyasar?.init) {
          setMoyasarFormError('تعذر تهيئة مكتبة ميسر.');
          return;
        }
        try {
          Moyasar.init({
            element: host,
            amount: monthlyAmountHalalas,
            currency: 'SAR',
            description: unifiedPaymentInit.description,
            publishable_api_key: moyasarPublishableKey,
            callback_url: callbackUrl,
            supported_networks: ['mada', 'visa', 'mastercard'],
            methods: ['creditcard'],
            language: 'ar',
            fixed_width: false,
            metadata: unifiedPaymentInit.metadata,
            on_failure: (msg: unknown) => {
              toast.error(typeof msg === 'string' ? msg : 'فشل الدفع');
            },
          });
        } catch (e) {
          setMoyasarFormError(e instanceof Error ? e.message : 'تعذر تشغيل نموذج ميسر');
        }
      })
      .catch(() => {
        if (!cancelled) setMoyasarFormError('تعذر تحميل سكربت ميسر من CDN.');
      });

    return () => {
      cancelled = true;
      if (moyasarHostRef.current) moyasarHostRef.current.innerHTML = '';
    };
  }, [
    paymentMethod,
    moyasarTermsAccepted,
    moyasarKeyOk,
    monthlyAmountHalalas,
    tier,
    licenseQuantity,
    digitalShiftAddonSelected,
    requestId,
    linkedBarberId,
    selectedGateway,
    showMoyasarCheckout,
    moyasarPublishableKey,
    unifiedPaymentInit.description,
    unifiedPaymentInit.metadata,
  ]);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(13,148,136,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(212,175,55,0.1),transparent_50%)]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 relative z-10"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-6"
            >
              <CreditCard className="w-10 h-10 text-primary" />
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-snug">
              شراء حزمة برمجية لخدمات الإدراج البرمجية
            </h1>
            <p className="text-lg text-muted-foreground">
              منصة حلاق ماب — اختر طريقة السداد المناسبة لإتمام شراء الحزمة البرمجية
            </p>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {moyasarReturnVerify === 'loading' && (
            <Alert className="mb-6 border-primary/30 bg-primary/5">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <AlertDescription>جاري التحقق من عملية الدفع مع ميسر…</AlertDescription>
            </Alert>
          )}
          {moyasarReturnVerify === 'paid' && (
            <Alert className="mb-6 border-emerald-600/45 bg-gradient-to-l from-emerald-500/12 to-background shadow-sm">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div className="space-y-2 pr-1">
                <AlertTitle className="text-base font-semibold text-emerald-950 dark:text-emerald-50">
                  تم الدفع وتفعيل حسابك
                </AlertTitle>
                <AlertDescription className="text-sm leading-relaxed text-foreground/90">
                  <p>
                    تم استلام قيمة <strong>الحزمة البرمجية الرقمية</strong> عبر ميسر بشكل صحيح، و<strong>تم تفعيل صلاحية الإدراج على المنصة</strong>. يمكنك
                    الآن تسجيل الدخول إلى لوحة التحكم والبدء باستقبال الطلبات.
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    تحقق من بريدك لرسالة الترحيب وروابط لوحة التحكم. لا حاجة لإعادة الدفع.
                  </p>
                  {moyasarPaidAmountFormat ? (
                    <p className="mt-2 text-xs font-medium text-muted-foreground" dir="ltr">
                      المبلغ المؤكد من ميسر: {moyasarPaidAmountFormat}
                    </p>
                  ) : null}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {(moyasarReturnVerify === 'unpaid' || moyasarReturnVerify === 'error') && moyasarVerifyMessage && (
            <Alert
              className={`mb-6 ${
                moyasarReturnVerify === 'unpaid'
                  ? 'border-amber-600/40 bg-amber-500/10'
                  : 'border-destructive/40 bg-destructive/10'
              }`}
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm leading-relaxed">{moyasarVerifyMessage}</AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Methods */}
            <div className="lg:col-span-2 space-y-6">
              {/* Subscription Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>ملخص الحزمة البرمجية الرقمية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tierColor} flex items-center justify-center text-white font-bold`}>
                        {tierName === 'برونزي' && '🥉'}
                        {tierName === 'ذهبي' && '🥇'}
                        {tierName === 'ماسي' && '💎'}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">باقة {tierName}</h3>
                        <p className="text-sm text-muted-foreground">حزمة إدراج برمجية (30 يوماً)</p>
                        {digitalShiftAddonSelected ? (
                          <p className="mt-1 text-xs font-medium text-primary">
                            + {DIGITAL_SHIFT_PRICING_ADDON_LABEL_AR} ({DIGITAL_SHIFT_MONTHLY_ADDON_SAR} ر.س ×{' '}
                            {licenseQuantity} بطاقة)
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="text-left space-y-1">
                      {vatSettings.enabled && licenseBreakdown.vat > 0 ? (
                        <>
                          <p className="text-xs text-muted-foreground">
                            قيمة الحزمة البرمجية الرقمية الموحد ({licenseQuantity} بطاقة): {licenseBreakdown.subtotal} ر.س
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ضريبة القيمة المضافة ({vatSettings.ratePercent}%): {licenseBreakdown.vat} ر.س
                          </p>
                          <p className="text-2xl font-bold text-primary">{licenseBreakdown.total} ر.س</p>
                          <p className="text-xs text-muted-foreground">إجمالي قيمة الحزمة البرمجية</p>
                        </>
                      ) : (
                        <>
                          <p className="text-2xl font-bold text-primary">{price} ر.س</p>
                          <p className="text-xs text-muted-foreground">للحزمة البرمجية (دون ضريبة قيمة مضافة)</p>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle>اختر طريقة الدفع</CardTitle>
                  <CardDescription>جميع المعاملات آمنة ومشفرة</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value: 'moyasar' | 'card') => {
                      setPaymentMethod(value);
                      if (value !== 'moyasar') setMoyasarTermsAccepted(false);
                    }}
                  >
                    {/* بطاقة — ميسر أو مسار البنك حسب إعدادات المنصة */}
                    {(isMoyasarGateway ? enableMoyasarCard : true) && (
                    <label
                      className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'moyasar'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      } ${!isMoyasarGateway && !enableSabGateway ? 'opacity-60' : ''}`}
                    >
                      <RadioGroupItem
                        value="moyasar"
                        id="moyasar"
                        disabled={!isMoyasarGateway && !enableSabGateway}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold">
                            {isMoyasarGateway ? 'ميسر (Moyasar)' : 'بنك الأول — دفع بالبطاقة'}
                          </h3>
                          {isMoyasarGateway ? (
                            <Badge variant="secondary" className="text-xs">موصى به</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">SAB</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {isMoyasarGateway
                            ? 'بوابة دفع سعودية آمنة - دعم جميع البطاقات (مدى، فيزا، ماستركارد)'
                            : enableSabGateway
                              ? 'مسار البطاقة عبر بنك الأول — يُكمل بعد ربط البوابة والتحقق من الـ webhook.'
                              : 'مسار البنك غير مفعّل حالياً من لوحة الإدارة.'}
                        </p>
                        {isMoyasarGateway && (
                          <div className="flex gap-2 mt-2">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Mastercard_2019_logo.svg/200px-Mastercard_2019_logo.svg.png" alt="Mastercard" className="h-6" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" className="h-6" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Mada_Logo.svg/200px-Mada_Logo.svg.png" alt="Mada" className="h-6" />
                          </div>
                        )}
                      </div>
                    </label>
                    )}
                  </RadioGroup>

                  {pubPayConfig?.ok && (
                    <p className="text-xs text-muted-foreground">
                      وضع الدفع المعروض للمنصة:{' '}
                      <strong>{pubPayConfig.displayPaymentMode === 'live' ? 'إنتاج' : 'اختبار'}</strong>
                    </p>
                  )}

                  {paymentMethod === 'moyasar' && showMoyasarCheckout && (
                    <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
                      <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertDescription className="space-y-2 text-sm leading-relaxed">
                          <p>
                            الدفع عبر <strong>ميسر (شركة مُيسر المالية)</strong> يخضع لـ{' '}
                            <a
                              href="https://moyasar.com/ar/resources/terms/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-primary underline-offset-2 hover:underline"
                            >
                              الشروط والأحكام الرسمية للتاجر
                            </a>{' '}
                            وللوائح التقنية في{' '}
                            <a
                              href="https://docs.mysr.dev/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-primary underline-offset-2 hover:underline"
                            >
                              وثائق التكامل (mysr.dev)
                            </a>
                            . يلتزم التاجر بـ SSL، والتحقق من الدفع في الخادم، وعدم تخزين بيانات البطاقة،
                            وإظهار هوية التاجر وسياسة الاسترداد للعميل — راجع أيضاً{' '}
                            <Link to={ROUTE_PATHS.SUBSCRIPTION_POLICY} className="font-medium text-primary underline-offset-2 hover:underline">
                              سياسة الحزم البرمجية الرقمية
                            </Link>
                            .
                          </p>
                        </AlertDescription>
                      </Alert>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="moyasar-merchant-terms"
                          checked={moyasarTermsAccepted}
                          onCheckedChange={(c) => setMoyasarTermsAccepted(c === true)}
                          className="mt-1"
                        />
                        <Label htmlFor="moyasar-merchant-terms" className="cursor-pointer text-sm font-normal leading-relaxed">
                          <span className="font-semibold text-foreground">أقر</span> بأنني اطلعت على{' '}
                          <strong>شروط وأحكام بوابة الدفع الإلكتروني لشركة مُيسر المالية</strong> بصفتنا تاجراً أمام
                          بوابة الدفع، وأوافق على المتابعة ضمن هذا الإطار.
                        </Label>
                      </div>

                      {!moyasarKeyOk && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            لإظهار نموذج الدفع أضف <code className="rounded bg-muted px-1">VITE_MOYSAR_PUBLISHABLE_API_KEY</code>{' '}
                            في البيئة (مفتاح يبدأ بـ <span dir="ltr">pk_test_</span> أو <span dir="ltr">pk_live_</span>) ثم
                            أعد بناء الواجهة.
                          </AlertDescription>
                        </Alert>
                      )}

                      {moyasarKeyOk && !moyasarTermsAccepted && (
                        <p className="text-sm text-muted-foreground">فعّل الإقرار أعلاه لعرض نموذج ميسر.</p>
                      )}

                      {moyasarKeyOk && moyasarTermsAccepted && (
                        <Card className="border-primary/20">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">نموذج الدفع — ميسر</CardTitle>
                            <CardDescription>
                              المبلغ المعروض بالهللة وفق الباقة والضريبة الحالية. بعد إتمام العملية يعيد ميسر التوجيه
                              مع <span dir="ltr">?id=</span> ثم يُتحقق من الخادم تلقائياً.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {moyasarFormError && (
                              <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{moyasarFormError}</AlertDescription>
                              </Alert>
                            )}
                            <div
                              ref={moyasarHostRef}
                              className="min-h-[280px] w-full max-w-full overflow-x-auto rounded-md border border-border bg-background p-2"
                              dir="ltr"
                            />
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              إن لم يظهر النموذج، تأكد من أن الموقع يعمل على <strong>HTTPS</strong> في الإنتاج (مطلوب
                              للمفاتيح الحية)، وأن النطاق مسجّل في لوحة ميسر.
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  {paymentMethod === 'moyasar' && !showMoyasarCheckout && isMoyasarGateway && (
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription className="text-sm leading-relaxed">
                        تم إيقاف أو إخفاء دفع ميسر من <strong>لوحة إدارة المنصة</strong>. فعّل القناة من قسم بوابات الدفع في الإدارة.
                      </AlertDescription>
                    </Alert>
                  )}

                  {paymentMethod === 'moyasar' && !isMoyasarGateway && (
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription className="text-sm leading-relaxed">
                        البوابة المختارة هي <strong>بنك الأول (SAB)</strong>. نفس نظام الأتمتة (تفعيل الحساب والإشعارات)
                        يعمل عند وصول حالة نجاح موثوقة من webhook البنك. {enableSabGateway ? 'أكمل إعداد مفاتيح SAB والربط الفني.' : 'فعّل مسار SAB من لوحة الإدارة عند الجاهزية.'}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Security Badge */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">دفع آمن ومشفر</h3>
                      <p className="text-sm text-muted-foreground">
                        جميع المعاملات محمية بتشفير SSL 256-bit
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="w-4 h-4" />
                    <span>معلوماتك محمية بالكامل</span>
                  </div>
                </CardContent>
              </Card>

              {/* Support */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">هل تحتاج مساعدة؟</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    فريق الدعم متاح للإجابة على استفساراتك
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">📧</span>
                      <span dir="ltr">admin@halaqmap.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">📱</span>
                      <span dir="ltr">0559602685</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Info */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">معلومات الدفع</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>حزمة برمجية مسبقة الدفع — دون تجديد تلقائي أو خصم دوري</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>صلاحية الإدراج محددة بمدة الحزمة البرمجية المشتراة</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>فاتورة رسمية بعد كل دفعة</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>دعم فني على مدار الساعة</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}
