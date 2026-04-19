import { useEffect, useMemo, useRef, useState } from 'react';
import { usePlatformVatSettings } from '@/hooks/usePlatformVatSettings';
import { calcVatBreakdown } from '@/lib/platformVatSettings';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Building2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Loader2,
  ArrowRight,
  Shield,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ROUTE_PATHS, SubscriptionTier } from '@/lib';
import { IMAGES } from '@/assets/images';
import { BANK_TRANSFER } from '@/config/bankTransfer';
import {
  getBankTransferPayableAmountSar,
  getBankTransferCoveredMonths,
  getSixMonthGrossSar,
  isBankTransferPromoActive,
} from '@/config/subscriptionPricing';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { verifyMoyasarPaymentRemote } from '@/lib/moyasarPaymentVerifyRemote';
import { getMoyasarGlobal, loadMoyasarFormScript } from '@/lib/moyasarFormLoader';
import { toast } from 'sonner';

export default function Payment() {
  const navigate = useNavigate();
  const vatSettings = usePlatformVatSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const tier = searchParams.get('tier') as SubscriptionTier || SubscriptionTier.BRONZE;
  const requestIdParam = searchParams.get('requestId') ?? '';
  const requestId = useMemo(() => {
    const t = requestIdParam.trim();
    return t.length > 0 ? t : `REQ-${Date.now()}`;
  }, [requestIdParam]);

  const [paymentMethod, setPaymentMethod] = useState<'moyasar' | 'card' | 'bank_transfer'>('moyasar');
  /** إقرار بقراءة شروط ميسر كبوابة دفع — مطلوب قبل متابعة الدفع عبر ميسر (المادة الخامسة من الشروط). */
  const [moyasarTermsAccepted, setMoyasarTermsAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [ibanCopied, setIbanCopied] = useState(false);
  /** بعد العودة من ميسر بـ ?id= — التحقق من الخادم */
  const [moyasarReturnVerify, setMoyasarReturnVerify] = useState<
    'idle' | 'loading' | 'paid' | 'unpaid' | 'error'
  >('idle');
  const [moyasarVerifyMessage, setMoyasarVerifyMessage] = useState<string | null>(null);
  const moyasarHostRef = useRef<HTMLDivElement>(null);
  const [moyasarFormError, setMoyasarFormError] = useState<string | null>(null);

  const moyasarPublishableKey = useMemo(
    () => String(import.meta.env.VITE_MOYSAR_PUBLISHABLE_API_KEY || '').trim(),
    [],
  );
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

  const price = prices[tier];
  const tierName = tierNames[tier];
  const tierColor = tierColors[tier];

  const monthlyBreakdown = calcVatBreakdown(price, vatSettings);

  /** مبلغ الاشتراك الشهري بالهللات (ميسر تستخدم أصغر وحدة نقدية). */
  const monthlyAmountHalalas = useMemo(
    () => Math.max(100, Math.round(monthlyBreakdown.total * 100)),
    [monthlyBreakdown.total],
  );

  const moyasarPaymentIdFromUrl = searchParams.get('id')?.trim() || '';

  useEffect(() => {
    if (!moyasarPaymentIdFromUrl) return;
    let cancelled = false;
    setMoyasarReturnVerify('loading');
    setMoyasarVerifyMessage(null);

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
          setMoyasarVerifyMessage('المبلغ لا يطابق اشتراك الباقة المعروضة. راجع الإدارة قبل اعتماد الدفع.');
          toast.error('تباين في المبلغ');
        } else {
          setMoyasarVerifyMessage(result.hint || result.message || result.error || 'تعذر التحقق من الدفع');
          toast.error('فشل التحقق من الدفع');
        }
        return;
      }

      if (result.paid) {
        setMoyasarReturnVerify('paid');
        setMoyasarVerifyMessage(
          result.amount_format
            ? `حالة الدفع: مدفوع — ${result.amount_format}`
            : 'حالة الدفع: مدفوع — تم التحقق من ميسر.',
        );
        toast.success('تم التحقق من الدفع');
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
  }, [moyasarPaymentIdFromUrl, monthlyAmountHalalas, setSearchParams]);

  /** تهيئة نموذج ميسر داخل الصفحة بعد الإقرار بالشروط. */
  useEffect(() => {
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
    if (explicit) {
      try {
        const u = new URL(explicit);
        u.searchParams.set('tier', tier);
        u.searchParams.set('requestId', requestId);
        callbackUrl = u.toString();
      } catch {
        const origin = window.location.origin;
        const path = window.location.pathname.replace(/\/$/, '');
        callbackUrl = `${origin}${path}/#${ROUTE_PATHS.PAYMENT}?tier=${encodeURIComponent(tier)}&requestId=${encodeURIComponent(requestId)}`;
      }
    } else {
      const origin = window.location.origin;
      const path = window.location.pathname.replace(/\/$/, '');
      callbackUrl = `${origin}${path}/#${ROUTE_PATHS.PAYMENT}?tier=${encodeURIComponent(tier)}&requestId=${encodeURIComponent(requestId)}`;
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
            description: `Halaqmap subscription ${tier} / ${requestId}`,
            publishable_api_key: moyasarPublishableKey,
            callback_url: callbackUrl,
            supported_networks: ['mada', 'visa', 'mastercard'],
            methods: ['creditcard'],
            language: 'ar',
            fixed_width: false,
            metadata: {
              tier: String(tier),
              request_id: String(requestId),
              product: 'subscription_monthly',
            },
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
    requestId,
    moyasarPublishableKey,
  ]);

  const bankTransferDue = getBankTransferPayableAmountSar(tier);
  const bankTransferBreakdown = calcVatBreakdown(bankTransferDue, vatSettings);
  const bankTransferMonths = getBankTransferCoveredMonths();
  const bankTransferGrossSix = getSixMonthGrossSar(tier);
  const bankPromoOn = isBankTransferPromoActive();

  const IBAN = BANK_TRANSFER.iban;
  const BANK_NAME = BANK_TRANSFER.bankDisplayAr;
  const ACCOUNT_NAME = BANK_TRANSFER.beneficiaryDisplay;

  const handleCopyIban = () => {
    navigator.clipboard.writeText(IBAN);
    setIbanCopied(true);
    setTimeout(() => setIbanCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handlePayment = async () => {
    if (paymentMethod === 'moyasar') {
      return;
    }

    setIsProcessing(true);

    if (paymentMethod === 'card') {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert('سيتم توجيهك إلى بوابة الدفع الإلكتروني...');
      setIsProcessing(false);
      return;
    }
    if (paymentMethod === 'bank_transfer') {
      if (!receiptFile) {
        alert('يرجى رفع إيصال التحويل البنكي');
        setIsProcessing(false);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 800));
      alert('تم إرسال إيصال التحويل بنجاح! سيتم مراجعته خلال 24 ساعة.');
    }

    setIsProcessing(false);
    navigate(ROUTE_PATHS.HOME);
  };

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

            <h1 className="text-4xl md:text-5xl font-bold mb-4">إتمام الدفع</h1>
            <p className="text-lg text-muted-foreground">
              اختر طريقة الدفع المناسبة لإتمام اشتراكك
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
          {(moyasarReturnVerify === 'paid' || moyasarReturnVerify === 'unpaid' || moyasarReturnVerify === 'error') &&
            moyasarVerifyMessage && (
              <Alert
                className={`mb-6 ${
                  moyasarReturnVerify === 'paid'
                    ? 'border-green-600/40 bg-green-500/10'
                    : moyasarReturnVerify === 'unpaid'
                      ? 'border-amber-600/40 bg-amber-500/10'
                      : 'border-destructive/40 bg-destructive/10'
                }`}
              >
                {moyasarReturnVerify === 'paid' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription className="text-sm leading-relaxed">{moyasarVerifyMessage}</AlertDescription>
              </Alert>
            )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Methods */}
            <div className="lg:col-span-2 space-y-6">
              {/* Subscription Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>ملخص الاشتراك</CardTitle>
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
                        <p className="text-sm text-muted-foreground">اشتراك شهري</p>
                      </div>
                    </div>
                    <div className="text-left space-y-1">
                      {vatSettings.enabled && monthlyBreakdown.vat > 0 ? (
                        <>
                          <p className="text-xs text-muted-foreground">
                            أتعاب الاشتراك: {monthlyBreakdown.subtotal} ر.س
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ضريبة القيمة المضافة ({vatSettings.ratePercent}%): {monthlyBreakdown.vat} ر.س
                          </p>
                          <p className="text-2xl font-bold text-primary">{monthlyBreakdown.total} ر.س</p>
                          <p className="text-xs text-muted-foreground">الإجمالي شهرياً</p>
                        </>
                      ) : (
                        <>
                          <p className="text-2xl font-bold text-primary">{price} ر.س</p>
                          <p className="text-xs text-muted-foreground">شهرياً (دون ضريبة قيمة مضافة)</p>
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
                    onValueChange={(value: 'moyasar' | 'card' | 'bank_transfer') => {
                      setPaymentMethod(value);
                      if (value !== 'moyasar') setMoyasarTermsAccepted(false);
                    }}
                  >
                    {/* Moyasar */}
                    <label
                      className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'moyasar'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value="moyasar" id="moyasar" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold">ميسر (Moyasar)</h3>
                          <Badge variant="secondary" className="text-xs">موصى به</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          بوابة دفع سعودية آمنة - دعم جميع البطاقات (مدى، فيزا، ماستركارد)
                        </p>
                        <div className="flex gap-2 mt-2">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Mastercard_2019_logo.svg/200px-Mastercard_2019_logo.svg.png" alt="Mastercard" className="h-6" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" className="h-6" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Mada_Logo.svg/200px-Mada_Logo.svg.png" alt="Mada" className="h-6" />
                        </div>
                      </div>
                    </label>

                    {/* Credit/Debit Card */}
                    <label
                      className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'card'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value="card" id="card" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold">بطاقة ائتمانية / مدى</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ادفع باستخدام بطاقتك الائتمانية أو بطاقة مدى
                        </p>
                      </div>
                    </label>

                    {/* Bank Transfer */}
                    <label
                      className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'bank_transfer'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold">تحويل بنكي</h3>
                          <Badge variant="outline" className="text-xs">
                            {bankPromoOn ? '6 أشهر + عرض' : '6 أشهر مقدماً'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          حوّل المبلغ إلى حسابنا البنكي وارفع الإيصال
                        </p>
                      </div>
                    </label>
                  </RadioGroup>

                  {paymentMethod === 'moyasar' && (
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
                              سياسة الاشتراك
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

                  {/* Bank Transfer Details */}
                  {paymentMethod === 'bank_transfer' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 pt-4"
                    >
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>ملاحظة:</strong>{' '}
                          {bankPromoOn ? (
                            <>
                              فترة العرض: حوّل <strong>{bankTransferDue} ر.س</strong> (خصم 10% على إجمالي{' '}
                              {bankTransferGrossSix} ر.س لستة أشهر) لتحصل على صلاحية{' '}
                              <strong>{bankTransferMonths} أشهر</strong> (6 مدفوعة + شهران إضافيان). بعد انتهاء
                              فترة العرض ينطبق سعر 6 أشهر كاملة ({bankTransferGrossSix} ر.س).
                            </>
                          ) : (
                            <>
                              التحويل البنكي: دفع مقدم لـ <strong>6 أشهر</strong> — المبلغ{' '}
                              <strong>{bankTransferDue} ر.س</strong> (برونزي 600، ذهبي 900، ماسي 1200 حسب الباقة).
                            </>
                          )}
                        </AlertDescription>
                      </Alert>

                      <Card className="bg-muted/50">
                        <CardHeader>
                          <CardTitle className="text-lg">معلومات الحساب البنكي</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label className="text-sm text-muted-foreground">اسم البنك</Label>
                            <p className="text-base font-semibold">{BANK_NAME}</p>
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">اسم الحساب</Label>
                            <p className="text-base font-semibold">{ACCOUNT_NAME}</p>
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">رقم الآيبان (IBAN)</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Input
                                value={IBAN}
                                readOnly
                                dir="ltr"
                                className="font-mono text-base"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleCopyIban}
                                className="flex-shrink-0"
                              >
                                {ibanCopied ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                            {ibanCopied && (
                              <p className="text-xs text-green-600 mt-1">تم النسخ!</p>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">المبلغ المطلوب</Label>
                            {vatSettings.enabled && bankTransferBreakdown.vat > 0 ? (
                              <div className="space-y-1 mt-1">
                                <p className="text-sm text-muted-foreground">
                                  أتعاب الاشتراك: {bankTransferBreakdown.subtotal} ر.س
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  ضريبة القيمة المضافة ({vatSettings.ratePercent}%):{' '}
                                  {bankTransferBreakdown.vat} ر.س
                                </p>
                                <p className="text-2xl font-bold text-primary">
                                  {bankTransferBreakdown.total} ر.س
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  الإجمالي للتحويل — لمدة {bankTransferMonths} أشهر
                                  {bankPromoOn
                                    ? ` (عرض: خصم 10% على ${bankTransferGrossSix} ر.س + شهران هدية)`
                                    : ' (سعر 6 أشهر كامل)'}
                                </p>
                              </div>
                            ) : (
                              <>
                                <p className="text-2xl font-bold text-primary">{bankTransferDue} ر.س</p>
                                <p className="text-xs text-muted-foreground">
                                  لمدة {bankTransferMonths} أشهر
                                  {bankPromoOn
                                    ? ` (عرض: خصم 10% على ${bankTransferGrossSix} ر.س + شهران هدية)`
                                    : ' (سعر 6 أشهر كامل)'}
                                </p>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <div className="space-y-2">
                        <Label htmlFor="receipt">رفع إيصال التحويل *</Label>
                        <div
                          onClick={() => document.getElementById('receipt')?.click()}
                          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                        >
                          <input
                            id="receipt"
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <Upload className="w-6 h-6 text-primary" />
                            </div>
                            {receiptFile ? (
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-medium">{receiptFile.name}</span>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm font-medium">اضغط لرفع إيصال التحويل</p>
                                <p className="text-xs text-muted-foreground">
                                  PNG, JPG, PDF حتى 10MB
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Button */}
              <Button
                onClick={handlePayment}
                disabled={
                  isProcessing ||
                  (paymentMethod === 'bank_transfer' && !receiptFile) ||
                  paymentMethod === 'moyasar'
                }
                className="w-full h-14 text-lg font-semibold"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    جاري المعالجة...
                  </>
                ) : (
                  <>
                    {paymentMethod === 'moyasar'
                      ? 'أكمل الدفع عبر نموذج ميسر أعلاه'
                      : paymentMethod === 'bank_transfer'
                        ? 'إرسال الإيصال'
                        : 'متابعة الدفع'}
                    {paymentMethod !== 'moyasar' ? <ArrowRight className="w-5 h-5 mr-2" /> : null}
                  </>
                )}
              </Button>
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
                      <span>تجديد تلقائي شهرياً</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>إمكانية الإلغاء في أي وقت</span>
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
