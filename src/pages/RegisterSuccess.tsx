import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Copy, CreditCard, Download, Home, Loader2, Mail, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTE_PATHS, SubscriptionTier } from '@/lib/index';
import { buildAbsolutePartnerPaymentUrl } from '@/config/siteOrigin';
import { paymentActivateNowCtaAr } from '@/config/softwareLicenseTerminology';
import {
  loadLastOrderConfirmation,
  clearLastOrderConfirmation,
  type RegisterOrderConfirmation,
} from '@/lib/subscriptionRequestStorage';
import { sendRegistrationPaymentSummaryRemote } from '@/lib/sendRegistrationPaymentSummaryRemote';

const tierLabel: Record<SubscriptionTier, string> = {
  [SubscriptionTier.BRONZE]: 'برونزي',
  [SubscriptionTier.GOLD]: 'ذهبي',
  [SubscriptionTier.DIAMOND]: 'ماسي',
};

export default function RegisterSuccess() {
  const navigate = useNavigate();
  const [data, setData] = useState<RegisterOrderConfirmation | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    const o = loadLastOrderConfirmation();
    if (!o) {
      navigate(ROUTE_PATHS.REGISTER, { replace: true });
      return;
    }
    setData(o);
  }, [navigate]);

  const paymentTo = useMemo(() => {
    if (!data) return ROUTE_PATHS.PAYMENT;
    const q = new URLSearchParams({
      tier: data.tier,
      requestId: data.orderId,
    });
    return `${ROUTE_PATHS.PAYMENT}?${q.toString()}`;
  }, [data]);

  const absolutePaymentUrl = useMemo(
    () => (data ? buildAbsolutePartnerPaymentUrl({ tier: data.tier, requestId: data.orderId }) : ''),
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
    <div className="min-h-[100dvh] min-h-screen bg-background py-8 sm:py-16 px-3 sm:px-4" dir="rtl">
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
              يبدأ التفعيل بعد نجاح السداد بحسب المسار المعتمد دون الحاجة إلى إعادة إدخال بياناتك.
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
              {data.receiptFileName && (
                <p>
                  <span className="text-muted-foreground">مرفق الإيصال:</span>{' '}
                  <span className="font-medium inline-block" dir="ltr">
                    {data.receiptFileName}
                  </span>
                </p>
              )}
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-right">
              <p className="font-semibold text-foreground mb-1">إتمام الدفع وتفعيل حزمة رخصة النفاذ الرقمية</p>
              <p className="text-muted-foreground mb-3">
                إن لم تُكمل الدفع بعد، انتقل إلى صفحة الدفع برقم طلبك والباقة التي اخترتها — لن تحتاج لإعادة إدخال
                بياناتك. يُمرَّر رقم الطلب تلقائياً إلى ميسر مع الدفع لربط العملية بطلبك في النظام.
              </p>
              <Button className="w-full gap-2 font-semibold" asChild>
                <Link to={paymentTo}>
                  <CreditCard className="w-4 h-4" />
                  {paymentActivateNowCtaAr()}
                </Link>
              </Button>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground break-all" dir="ltr">
              {absolutePaymentUrl}
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-right">
              <p className="font-semibold text-foreground mb-1">ظهورك يبدأ فور التفعيل</p>
              <p className="text-muted-foreground">
                بمجرد نجاح الدفع يُفعَّل ظهور صالونك آلياً ضمن نظام الاستجابة الذكية. ستحصل على رابط سري لتحديث حالة «مفتوح / مغلق» لحظياً من جوّالك — والباقات الذهبية والماسية تتيح تحكّماً كاملاً من لوحة التحكم.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                أرسلنا لبريدك ملخصاً يضم رابط الدفع المباشر (عبر خادمنا وResend). يمكنك أيضاً تحميل ملف نصي أو فتح
                تطبيق البريد يدوياً.
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
                  مرفق مع اشتراكك الماسي — تعلّم كيف تكتب <strong className="text-violet-300">«تعليمة:»</strong> كرمز توجيه يُباشر مناوبك تلقائياً مع كل زبون.
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
