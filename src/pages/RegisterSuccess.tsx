import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Copy, CreditCard, Download, Home, Loader2, Mail, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTE_PATHS, SubscriptionTier } from '@/lib/index';
import { buildAbsolutePartnerPaymentUrl } from '@/config/siteOrigin';
import { paymentActivateNowCtaAr } from '@/config/softwareLicenseTerminology';
import {
  loadLastOrderConfirmation,
  clearLastOrderConfirmation,
  type RegisterOrderConfirmation,
} from '@/lib/subscriptionRequestStorage';
import { sendRegistrationPaymentSummaryRemote } from '@/lib/sendRegistrationPaymentSummaryRemote';
import { PlatformGrowthProgramsPanel } from '@/components/partner/PlatformGrowthProgramsPanel';
import { PLATFORM_GROWTH_REGISTER_SUCCESS_NOTE_AR } from '@/config/platformGrowthPrograms';
import { redeemBronzeTrialRemote, bronzeTrialErrorMessageAr } from '@/lib/bronzeTrialRedeemRemote';

const tierLabel: Record<SubscriptionTier, string> = {
  [SubscriptionTier.BRONZE]: 'برونزي',
  [SubscriptionTier.GOLD]: 'ذهبي',
  [SubscriptionTier.DIAMOND]: 'ماسي',
};

export default function RegisterSuccess() {
  const navigate = useNavigate();
  const [data, setData] = useState<RegisterOrderConfirmation | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [trialCode, setTrialCode] = useState('');
  const [trialEmail, setTrialEmail] = useState('');
  const [trialLoading, setTrialLoading] = useState(false);
  const [trialSuccess, setTrialSuccess] = useState<{
    barberId: string;
    validUntil: string;
    messageAr: string;
  } | null>(null);

  useEffect(() => {
    const o = loadLastOrderConfirmation();
    if (!o) {
      navigate(ROUTE_PATHS.REGISTER, { replace: true });
      return;
    }
    setData(o);
    setTrialEmail(String(o.email ?? '').trim());
  }, [navigate]);

  const redeemTrialOnSuccessPage = useCallback(async () => {
    if (!data) return;
    const code = trialCode.trim();
    if (!code) {
      toast.error('أدخل رمز التجربة الذي وصلك بالبريد');
      return;
    }
    setTrialLoading(true);
    const res = await redeemBronzeTrialRemote({
      code,
      requestId: data.orderId,
      email: trialEmail.trim() || data.email,
    });
    setTrialLoading(false);
    if (!res.ok) {
      toast.error(bronzeTrialErrorMessageAr(res.error));
      return;
    }
    setTrialSuccess({
      barberId: res.barberId,
      validUntil: res.validUntil,
      messageAr: res.messageAr,
    });
    toast.success(res.messageAr);
  }, [data, trialCode, trialEmail]);

  const paymentTo = useMemo(() => {
    if (!data) return ROUTE_PATHS.PAYMENT;
    const q = new URLSearchParams({
      tier: data.tier,
      requestId: data.orderId,
      qty: String(data.licenseQuantity ?? 1),
    });
    if (data.digitalShiftAddonSelected) q.set('aiAddon', '1');
    return `${ROUTE_PATHS.PAYMENT}?${q.toString()}`;
  }, [data]);

  const absolutePaymentUrl = useMemo(
    () =>
      data
        ? buildAbsolutePartnerPaymentUrl({
            tier: data.tier,
            requestId: data.orderId,
            qty: data.licenseQuantity,
            aiAddon: data.digitalShiftAddonSelected,
          })
        : '',
    [data],
  );

  const mailtoHref = useMemo(() => {
    if (!data) return '#';
    const subject = encodeURIComponent(`حلاق ماب — نسخة طلب حزمة إدراج برمجية ${data.orderId}`);
    const body = encodeURIComponent(
      `${data.mailtoBodyShort}\n\nرابط إتمام الدفع:\n${absolutePaymentUrl}\n`,
    );
    return `mailto:${data.email}?subject=${subject}&body=${body}`;
  }, [data, absolutePaymentUrl]);

  const downloadSummary = () => {
    if (!data) return;
    const blob = new Blob([`\uFEFF${data.summaryForDownload}\n\nرابط إتمام الدفع:\n${absolutePaymentUrl}\n`], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `halaqmap-order-${data.orderId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyOrderId = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.orderId);
      toast.success('تم نسخ رقم الطلب');
    } catch {
      /* ignore */
    }
  };

  const handleSendSummaryEmail = useCallback(async () => {
    if (!data) return;
    setSendingEmail(true);
    try {
      const r = await sendRegistrationPaymentSummaryRemote({
        orderId: data.orderId,
        email: data.email,
        shopName: data.shopName,
        tier: data.tier,
        paymentMethod: data.paymentMethod,
      });
      if (!r.ok) {
        const errorText = 'error' in r ? r.error : 'unknown';
        const detailText = 'detail' in r ? r.detail : undefined;
        const hint = detailText ? `${errorText}: ${detailText}` : errorText;
        toast.error('تعذر إرسال البريد', { description: hint });
        return;
      }
      toast.success('تم إرسال الملخص إلى بريدك', {
        description: r.messageId ? `معرّف الرسالة: ${r.messageId}` : undefined,
      });
    } finally {
      setSendingEmail(false);
    }
  }, [data]);

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-[100dvh] min-h-screen overflow-x-hidden bg-background px-3 py-8 sm:px-4 sm:py-16" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto"
      >
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="text-center">
            <div className="mb-3 flex justify-center">
              <Badge variant="secondary" className="border-primary/40 bg-primary/10 px-4 py-1 text-sm font-semibold">
                طلبك مُسجَّل — انتقل للدفع
              </Badge>
            </div>
            <CardTitle className="text-2xl">خطوة الدفع والتفعيل</CardTitle>
            <CardDescription className="text-center leading-relaxed">
              طلبك مسجَّل — <strong>أكمل الدفع لتبدأ معالجة التفعيل</strong> وفق حالة الطلب الحالية داخل النظام.
              بعد نجاح السداد يُستكمل مسار التفعيل وفق الحالة المعتمدة للطلب دون الحاجة إلى إعادة إدخال بياناتك.
              {data.tier === SubscriptionTier.DIAMOND && (
                <span className="mt-2 block rounded-lg border border-violet-500/30 bg-violet-950/30 px-3 py-1.5 text-sm text-violet-300 font-semibold">
                  🏛️ إضافة المكتب الخاص تدخل في مسار التفعيل مع باقتك الماسية بعد اكتمال الدفع وفق الحالة الحالية.
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-xl bg-muted/50 border border-border p-4 space-y-3 text-center">
              <p className="text-sm text-muted-foreground">رقم الطلب</p>
              <p className="text-2xl font-mono font-bold tracking-wide" dir="ltr">
                {data.orderId}
              </p>
              <Button variant="outline" size="sm" className="gap-2" onClick={copyOrderId}>
                <Copy className="w-4 h-4" />
                نسخ الرقم
              </Button>
            </div>

            <div className="space-y-1 text-sm text-center">
              <p className="text-muted-foreground">تاريخ ووقت التقديم</p>
              <p className="font-medium text-foreground">{data.submittedAtLabel}</p>
            </div>

            <div className="rounded-lg border border-border p-4 text-sm space-y-2">
              <p>
                <span className="text-muted-foreground">اسم المحل:</span>{' '}
                <span className="font-medium">{data.shopName}</span>
              </p>
              <p>
                <span className="text-muted-foreground">الباقة:</span>{' '}
                <span className="font-medium">{tierLabel[data.tier]}</span>
              </p>
              <p>
                <span className="text-muted-foreground">طريقة الدفع:</span>{' '}
                <span className="font-medium">
                  حزمة رخصة (ميسر)
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">عدد الحزم:</span>{' '}
                <span className="font-medium">{data.licenseQuantity}</span>
              </p>
              {data.receiptFileName && (
                <p>
                  <span className="text-muted-foreground">مرفق الإيصال:</span>{' '}
                  <span className="font-medium inline-block" dir="ltr">
                    {data.receiptFileName}
                  </span>
                </p>
              )}
            </div>

            {data.tier === SubscriptionTier.BRONZE && !trialSuccess ? (
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-relaxed text-right space-y-3">
                <div>
                  <p className="font-semibold text-foreground mb-1">لديك كود تجربة برونزي؟</p>
                  <p className="text-muted-foreground">
                    إن وصلك بالبريد رمز يبدأ بـ <span dir="ltr" className="font-mono">HM-TRY-</span> أدخله هنا
                    للتفعيل دون دفع. مسار ميسر أدناه يبقى متاحاً إن لم يكن لديك رمز.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-success-trial-code">رمز التجربة</Label>
                  <Input
                    id="register-success-trial-code"
                    value={trialCode}
                    onChange={(e) => setTrialCode(e.target.value)}
                    placeholder="HM-TRY-XXXX-XXXX-XXXX"
                    dir="ltr"
                    className="font-mono"
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-success-trial-email">البريد المسجّل عليه الكود</Label>
                  <Input
                    id="register-success-trial-email"
                    type="email"
                    value={trialEmail}
                    onChange={(e) => setTrialEmail(e.target.value)}
                    placeholder="نفس بريد طلب التجربة والتسجيل"
                    dir="ltr"
                    autoComplete="email"
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full gap-2 font-semibold"
                  disabled={trialLoading || !trialCode.trim()}
                  onClick={() => void redeemTrialOnSuccessPage()}
                >
                  {trialLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      جاري التفعيل…
                    </>
                  ) : (
                    'تفعيل التجربة المجانية'
                  )}
                </Button>
              </div>
            ) : null}

            {trialSuccess ? (
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm leading-relaxed text-right space-y-3">
                <p className="font-semibold text-emerald-700 dark:text-emerald-300">{trialSuccess.messageAr}</p>
                <p className="text-muted-foreground">
                  صالح حتى:{' '}
                  <span dir="ltr" className="font-mono">
                    {trialSuccess.validUntil}
                  </span>
                </p>
                <Button className="w-full gap-2 font-semibold" asChild>
                  <Link to={ROUTE_PATHS.BARBER_LOGIN} onClick={() => clearLastOrderConfirmation()}>
                    الدخول للوحة الشريك
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-right">
                <p className="font-semibold text-foreground mb-1">إتمام الدفع وتفعيل حزمة رخصة النفاذ الرقمية</p>
                <p className="text-muted-foreground mb-3">
                  {data.tier === SubscriptionTier.BRONZE
                    ? 'إن لم يكن لديك كود تجربة، انتقل إلى صفحة الدفع برقم طلبك — لن تحتاج لإعادة إدخال بياناتك. يُمرَّر رقم الطلب تلقائياً إلى ميسر لربط العملية بطلبك.'
                    : 'إن لم تُكمل الدفع بعد، انتقل إلى صفحة الدفع برقم طلبك والباقة التي اخترتها — لن تحتاج لإعادة إدخال بياناتك. يُمرَّر رقم الطلب تلقائياً إلى ميسر مع الدفع لربط العملية بطلبك في النظام.'}
                </p>
                <Button className="w-full gap-2 font-semibold" asChild>
                  <Link to={paymentTo}>
                    <CreditCard className="w-4 h-4" />
                    {paymentActivateNowCtaAr()}
                  </Link>
                </Button>
              </div>
            )}

            <div className="rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground break-all" dir="ltr">
              {absolutePaymentUrl}
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-right">
              <p className="font-semibold text-foreground mb-1">ظهورك يبدأ بعد اكتمال التفعيل</p>
              <p className="text-muted-foreground">
                بعد اكتمال الدفع يُستكمل تفعيل حزمة الرخصة وفق حالة الطلب المرتبطة بها داخل النظام. يبدأ ظهور صالونك عند
                اكتمال التفعيل الفعلي، وتُتاح لك أدوات التحكم المناسبة بحسب حالة الحزمة والباقة.
              </p>
              <p className="mt-3 text-muted-foreground">{PLATFORM_GROWTH_REGISTER_SUCCESS_NOTE_AR}</p>
            </div>

            <PlatformGrowthProgramsPanel
              variant="compact"
              activationState="pre_activation"
              showCompliance={false}
              showPulsePhase1={false}
              className="rounded-lg border border-border bg-muted/20 p-3"
            />

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                يمكنك إرسال نسخة إلى بريدك الآن أو تحميل ملف نصي أو فتح تطبيق البريد يدويًا. لا تعتمد على البريد وحده
                ما دام رابط الدفع الظاهر أمامك متاحًا مباشرة.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex-1 gap-2" onClick={downloadSummary}>
                  <Download className="w-4 h-4" />
                  تحميل ملخص الطلب (.txt)
                </Button>
                <Button
                  variant="default"
                  className="flex-1 gap-2"
                  onClick={() => void handleSendSummaryEmail()}
                  disabled={sendingEmail}
                >
                  {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  إرسال نسخة للبريد
                </Button>
              </div>
              <Button variant="outline" className="w-full gap-2" asChild>
                <a href={mailtoHref}>
                  <Mail className="w-4 h-4" />
                  فتح تطبيق البريد (بديل)
                </a>
              </Button>
            </div>

            {/* دليل المكتب الخاص — للماسي فقط */}
            {data.tier === SubscriptionTier.DIAMOND && (
              <div className="rounded-xl border border-violet-500/40 bg-gradient-to-br from-violet-950/50 to-violet-900/20 p-4 text-right"
                style={{ boxShadow: '0 0 20px rgba(139,92,246,0.08)' }}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-lg">🏛️</span>
                  <p className="font-black text-violet-200 text-sm">دليل إضافة المكتب الخاص</p>
                </div>
                <p className="mb-3 text-xs leading-relaxed text-slate-400">
                  مرفق مع حزمة رخصتك الماسية — تعلّم كيف تكتب <strong className="text-violet-300">«تعليمة:»</strong> كرمز توجيه يُباشر مناوبك تلقائياً مع كل زبون.
                </p>
                <Button className="w-full gap-2 bg-violet-700 hover:bg-violet-600 text-white font-bold" asChild>
                  <Link to={ROUTE_PATHS.PRIVATE_OFFICE_GUIDE} target="_blank">
                    <BookOpen className="w-4 h-4" />
                    افتح دليل المكتب الخاص
                  </Link>
                </Button>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <Button variant="secondary" className="w-full gap-2" asChild>
                <Link to={ROUTE_PATHS.HOME} onClick={() => clearLastOrderConfirmation()}>
                  <Home className="w-4 h-4" />
                  العودة للرئيسية
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
