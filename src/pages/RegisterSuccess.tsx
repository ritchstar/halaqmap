import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Copy, Download, Mail, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTE_PATHS, SubscriptionTier } from '@/lib/index';
import {
  loadLastOrderConfirmation,
  clearLastOrderConfirmation,
  type RegisterOrderConfirmation,
} from '@/lib/subscriptionRequestStorage';

const tierLabel: Record<SubscriptionTier, string> = {
  [SubscriptionTier.BRONZE]: 'برونزي',
  [SubscriptionTier.GOLD]: 'ذهبي',
  [SubscriptionTier.DIAMOND]: 'ماسي',
};

export default function RegisterSuccess() {
  const navigate = useNavigate();
  const [data, setData] = useState<RegisterOrderConfirmation | null>(null);

  useEffect(() => {
    const o = loadLastOrderConfirmation();
    if (!o) {
      navigate(ROUTE_PATHS.REGISTER, { replace: true });
      return;
    }
    setData(o);
  }, [navigate]);

  const mailtoHref = useMemo(() => {
    if (!data) return '#';
    const subject = encodeURIComponent(`حلاق ماب — نسخة طلب الاشتراك ${data.orderId}`);
    const body = encodeURIComponent(data.mailtoBodyShort);
    return `mailto:${data.email}?subject=${subject}&body=${body}`;
  }, [data]);

  const downloadSummary = () => {
    if (!data) return;
    const blob = new Blob([`\uFEFF${data.summaryForDownload}`], {
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
    } catch {
      /* ignore */
    }
  };

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
                قيد المراجعة النظامية
              </Badge>
            </div>
            <CardTitle className="text-2xl">تم استلام طلبك</CardTitle>
            <CardDescription className="text-center leading-relaxed">
              تم استلام طلبك ضمن <strong>مراجعة نظامية لحظية</strong>؛ لا حاجة لانتظار رفع ملفات حكومية ثقيلة على
              خوادمنا. <strong>لم تُخزَّن مستنداتك الحكومية على خوادمنا</strong> ولن نطلب منك إعادة تقديمها لاحقاً ضمن
              هذا المسار. ستتواصل الإدارة عند الحاجة — واحتفظ برقم الطلب للمتابعة.
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
                  {data.paymentMethod === 'bank_transfer' ? 'تحويل بنكي (6 أشهر)' : 'اشتراك شهري'}
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

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                يمكنك تحميل ملف نصي يحتوي تفاصيل طلبك، أو فتح بريدك لإرسال نسخة لنفسك. إرفاق الملفات
                تلقائياً بالبريد يتطلب خادماً (مثل Supabase أو خدمة بريد) وسيُضاف لاحقاً في الإصدار
                المرتبط بالخادم.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex-1 gap-2" onClick={downloadSummary}>
                  <Download className="w-4 h-4" />
                  تحميل ملخص الطلب (.txt)
                </Button>
                <Button variant="outline" className="flex-1 gap-2" asChild>
                  <a href={mailtoHref}>
                    <Mail className="w-4 h-4" />
                    إرسال نسخة للبريد
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button variant="secondary" className="w-full gap-2" asChild>
                <Link
                  to={ROUTE_PATHS.HOME}
                  onClick={() => clearLastOrderConfirmation()}
                >
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
